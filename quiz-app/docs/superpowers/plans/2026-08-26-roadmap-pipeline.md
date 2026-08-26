# Конвейер маршрутной карты: план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести маршрутную карту до состояния, когда человек платит, наговаривает анкету и получает карту, а Саша только читает превью и говорит «отправляй» или наговаривает правку голосом.

**Architecture:** Всё живёт в `quiz-app` на ветке `roadmap-autogen`. Расшифровка выносится в отдельный модуль с провайдерами (ElevenLabs, OpenAI). Диагностика в промпте переезжает с одной контент-лестницы на шесть веток. Правки Саши применяются точечным патчем по ключам, а не пересборкой, и копятся правилами для следующих карт.

**Tech Stack:** Next.js 15 (App Router), Prisma + Postgres (Supabase, база общая), QStash (очередь), Anthropic SDK (`claude-opus-5`), ElevenLabs Scribe v2, Telegram Bot API, `tsx` для скриптов.

**Spec:** `docs/superpowers/specs/2026-08-26-roadmap-pipeline-design.md`

## Global Constraints

- **Ветка:** вся работа на `roadmap-autogen`, ответвлена от `master`. PR #47.
- **Тестового фреймворка в проекте нет.** Проверка каждой задачи это скрипт в
  `scripts/`, запускаемый `npx tsx`, на реальных данных из базы. Образцы:
  `scripts/roadmap-build-test.ts`, `scripts/verify-intake.mjs`.
- **Никакого `prisma db push`.** База общая с другими проектами, push сносит чужие
  таблицы. Колонки и таблицы заводятся скриптом с `IF NOT EXISTS`, как
  `scripts/roadmap-create-tables.mjs`. Схема в `prisma/schema.prisma` правится следом,
  чтобы клиент знал про новые поля.
- **Копирайт:** длинное тире не ставить нигде, ни в коде, ни в текстах бота, ни в
  промптах. У Саши его нет.
- **Тексты человеку** живут в `src/content/`, не в коде роутов.
- **Секреты** не коммитить. `ELEVENLABS_API_KEY` берётся из
  `Projects/agent-hub/zoom-drainer/.env` и кладётся в Vercel env проекта `quizapp`
  (`vercel env add`), локально в `.env.local`.
- **Коммит после каждой задачи**, сообщение на английском, тело по-русски не писать.

---

### Task 1: Модуль расшифровки с провайдерами ✅ сделано 26.08

**Files:**
- Create: `src/lib/transcribe/index.ts`
- Create: `src/lib/transcribe/elevenlabs.ts`
- Create: `src/lib/transcribe/openai.ts`
- Modify: `src/lib/whisper.ts`
- Create: `scripts/transcribe-test.mts`

**Interfaces:**
- Consumes: ничего из предыдущих задач.
- Produces: `transcribeAudio(buffer: Buffer, fileName: string): Promise<string>` из
  `@/lib/transcribe`. `src/lib/whisper.ts` сохраняет экспорты `transcribeTgVoice(fileId: string): Promise<string>`
  и `TG_FILE_LIMIT_BYTES: number`, вызывающие не меняются.

- [x] **Step 1: Написать проверочный скрипт**

Создать `scripts/transcribe-test.mts`:

```ts
// Прогон расшифровки на локальном файле. Ничего никуда не отправляет.
// npx tsx scripts/transcribe-test.mts <путь к файлу> [провайдер]
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('нужен путь к аудиофайлу');
  if (process.argv[3]) process.env.TRANSCRIBE_PROVIDER = process.argv[3];

  const { transcribeAudio } = await import('../src/lib/transcribe');
  const buffer = fs.readFileSync(file);

  const t0 = Date.now();
  const text = await transcribeAudio(buffer, path.basename(file));
  console.log(`провайдер: ${process.env.TRANSCRIBE_PROVIDER || 'elevenlabs'}`);
  console.log(`${Math.round((Date.now() - t0) / 1000)} c, ${text.length} символов\n`);
  console.log(text);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [x] **Step 2: Запустить и убедиться, что падает**

Run: `npx tsx scripts/transcribe-test.mts "C:/Users/OTVAJE/Documents/ClaudeCode/Projects/GSD-BRAND/clients/mikhail-korobitsyn/intake/voices/step3.oga"`
Expected: FAIL, `Cannot find module '../src/lib/transcribe'`

- [x] **Step 3: Написать провайдер ElevenLabs**

Создать `src/lib/transcribe/elevenlabs.ts`:

```ts
// Расшифровка через ElevenLabs Scribe. Тот же движок, что у зум-пайплайна.
const API = 'https://api.elevenlabs.io/v1/speech-to-text';
const MODEL = process.env.ELEVENLABS_STT_MODEL || 'scribe_v2';

export async function transcribeElevenLabs(buffer: Buffer, fileName: string): Promise<string> {
  const key = (process.env.ELEVENLABS_API_KEY || '').trim();
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buffer)]), fileName);
  form.append('model_id', MODEL);
  form.append('language_code', 'rus');

  const res = await fetch(API, { method: 'POST', headers: { 'xi-api-key': key }, body: form });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text || '').trim();
}
```

- [x] **Step 4: Перенести код OpenAI в провайдер**

Создать `src/lib/transcribe/openai.ts`, забрав тело нынешнего `transcribeTgVoice` из
`src/lib/whisper.ts` начиная с формы и до разбора ответа:

```ts
// Запасной провайдер. Работает, только пока на аккаунте есть кредиты:
// 26.08.2026 ключ живой, а квота нулевая (credit_balance_exhausted).
const API = 'https://api.openai.com/v1/audio/transcriptions';

export async function transcribeOpenAI(buffer: Buffer, fileName: string): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY is not set');

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buffer)], { type: 'audio/ogg' }), fileName);
  form.append('model', 'whisper-1');
  form.append('language', 'ru');

  const res = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Whisper error: ${(err as any)?.error?.message || res.status}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text || '').trim();
}
```

- [x] **Step 5: Написать выбор провайдера**

Создать `src/lib/transcribe/index.ts`:

```ts
// Один вход для расшифровки: и анкета в боте, и зум-пайплайн зовут отсюда.
// Провайдер меняется переменной, чтобы переезд не требовал правок вызывающих.
import { transcribeElevenLabs } from './elevenlabs';
import { transcribeOpenAI } from './openai';

export type TranscribeProvider = 'elevenlabs' | 'openai';

export function currentProvider(): TranscribeProvider {
  const raw = (process.env.TRANSCRIBE_PROVIDER || 'elevenlabs').trim().toLowerCase();
  return raw === 'openai' ? 'openai' : 'elevenlabs';
}

export async function transcribeAudio(buffer: Buffer, fileName: string): Promise<string> {
  return currentProvider() === 'openai'
    ? transcribeOpenAI(buffer, fileName)
    : transcribeElevenLabs(buffer, fileName);
}
```

- [x] **Step 6: Обрезать whisper.ts до телеграм-части**

`src/lib/whisper.ts` оставляет только загрузку файла из Telegram и зовёт модуль:

```ts
import { transcribeAudio } from '@/lib/transcribe';

export const TG_FILE_LIMIT_BYTES = 20 * 1024 * 1024;

// getTelegramFilePath и downloadTelegramFile остаются как были.

export async function transcribeTgVoice(fileId: string): Promise<string> {
  const filePath = await getTelegramFilePath(fileId);
  const buffer = await downloadTelegramFile(filePath);
  const fileName = filePath.split('/').pop() || 'voice.ogg';
  return transcribeAudio(buffer, fileName);
}
```

- [x] **Step 7: Положить ключ и прогнать**

```bash
# ключ из Projects/agent-hub/zoom-drainer/.env
echo 'ELEVENLABS_API_KEY=sk_...' >> .env.local
echo 'TRANSCRIBE_PROVIDER=elevenlabs' >> .env.local
npx tsx scripts/transcribe-test.mts "C:/Users/OTVAJE/Documents/ClaudeCode/Projects/GSD-BRAND/clients/mikhail-korobitsyn/intake/voices/step3.oga"
```

Expected: PASS. Файл на 26 секунд, в тексте должно быть про рилсы с апреля и «до тысячи
просмотров»: локальная расшифровка того же файла дала «так снимаю релсы с апреля месяца
ничего пока не заходит нигде ни в ютубе ни в тик токе». Дословного совпадения не ждём,
смысл должен совпасть.

- [x] **Step 8: Прогнать длинный файл**

Run: `npx tsx scripts/transcribe-test.mts "C:/Users/OTVAJE/Documents/ClaudeCode/Projects/GSD-BRAND/clients/mikhail-korobitsyn/intake/voices/step10.oga"`
Expected: PASS, 3.5 минуты аудио, текст про «шута-проводника» и талант.

- [x] **Step 9: Проверить сборку**

Run: `npm run build`
Expected: PASS без ошибок типов.

- [x] **Step 10: Положить ключ в прод и закоммитить**

```bash
vercel env add ELEVENLABS_API_KEY production
vercel env add TRANSCRIBE_PROVIDER production   # elevenlabs
git add src/lib/transcribe src/lib/whisper.ts scripts/transcribe-test.mts
git commit -m "transcribe: one module, two providers, ElevenLabs by default"
```

---

### Task 2: Сбой расшифровки перестаёт быть тихим ✅ сделано 26.08

**Files:**
- Create: `scripts/intake-transcript-status-migrate.mjs`
- Modify: `prisma/schema.prisma` (модель `IntakeAnswer`)
- Modify: `src/lib/intake.ts` (`transcribePending`)
- Modify: `src/lib/roadmap/source.ts` (`buildSource`)
- Create: `scripts/intake-transcripts-check.mts`

**Interfaces:**
- Consumes: `transcribeAudio` из Task 1, `transcribeTgVoice` из `@/lib/whisper`.
- Produces: `fillMissingTranscripts(intakeId: string): Promise<{ filled: number; failed: number }>`
  экспортируется из `src/lib/roadmap/source.ts` и зовётся внутри `buildSource`.

- [x] **Step 1: Завести колонку скриптом**

Создать `scripts/intake-transcript-status-migrate.mjs`:

```js
// Колонка transcript_status в intake_answers. Идемпотентно, без prisma db push:
// база общая, push сносит чужие таблицы (см. lessons_prisma-db-push-shared-database).
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(`ALTER TABLE "intake_answers" ADD COLUMN IF NOT EXISTS "transcript_status" TEXT`);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_name='intake_answers' AND column_name='transcript_status'`,
);
console.log(rows.length ? 'transcript_status на месте' : 'колонки нет, что-то пошло не так');
await client.end();
```

- [x] **Step 2: Запустить миграцию**

Run: `node scripts/intake-transcript-status-migrate.mjs`
Expected: `transcript_status на месте`

- [x] **Step 3: Дописать поле в схему Prisma**

В `prisma/schema.prisma`, модель `IntakeAnswer`, рядом с `transcript`:

```prisma
  transcriptStatus String? @map("transcript_status")
```

Run: `npx prisma generate`
Expected: клиент пересобран без ошибок.

- [x] **Step 4: Написать уведомление Саше при сбое**

В `src/lib/intake.ts` заменить `transcribePending`:

```ts
/**
 * Расшифровка голосового. Запускается в after() после ответа Telegram.
 * Упала — ответ не теряется: остаётся fileId, Саша послушает сам. Но молчать
 * об этом нельзя: у Михаила 26.08 сорвались все девять, и узнали об этом
 * только на сборке карты, через день.
 */
export async function transcribePending(answerId: string, chatId: number): Promise<void> {
  const answer = await prisma.intakeAnswer.findUnique({ where: { id: answerId } });
  if (!answer?.fileId) return;

  try {
    const text = await transcribeTgVoice(answer.fileId);
    await prisma.intakeAnswer.update({
      where: { id: answerId },
      data: { transcript: text, transcriptStatus: 'ok' },
    });
  } catch (error) {
    console.error('intake: transcription failed', answerId, error);
    await prisma.intakeAnswer.update({
      where: { id: answerId },
      data: { transcriptStatus: 'failed' },
    });
    await sendBotMessage(chatId, INTAKE_TEXTS.voiceFailed);
    await warnAdminOnce(answer.intakeId);
  }
}

/**
 * Одно сообщение Саше на анкету, а не на каждый сорвавшийся ответ: иначе
 * на девяти голосовых он получит девять одинаковых сообщений.
 */
async function warnAdminOnce(intakeId: string): Promise<void> {
  const admin = await getAdminChatId();
  if (!admin) return;

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const already = await prisma.event.findFirst({
    where: { type: 'intake_transcribe_warned', createdAt: { gt: hourAgo },
             metadata: { path: ['intakeId'], equals: intakeId } },
    select: { id: true },
  });
  if (already) return;

  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: { username: true, firstName: true, telegramId: true },
  });
  const failed = await prisma.intakeAnswer.count({ where: { intakeId, transcriptStatus: 'failed' } });
  const who = intake?.username ? '@' + intake.username : intake?.firstName || String(intake?.telegramId ?? '');

  await sendBotMessage(
    admin,
    `⚠️ расшифровка не идёт\n\nу ${who} ${failed} голосовых без текста, анкета придёт неполной.\nпроверь TRANSCRIBE_PROVIDER и ключ.`,
  );
  await prisma.event.create({
    data: { type: 'intake_transcribe_warned', source: 'thesasha', metadata: { intakeId } },
  }).catch(() => {});
}
```

Импорт `getAdminChatId` из `@/lib/notion` (так же, как в `src/lib/roadmap/review.ts`).

- [x] **Step 5: Написать добор перед сборкой**

В `src/lib/roadmap/source.ts` добавить экспорт и вызвать его первой строкой `buildSource`:

```ts
/**
 * Добор расшифровок перед сборкой. Бот мог не справиться в момент ответа
 * (кончились кредиты, сеть), и тогда карта собралась бы из пустоты.
 */
export async function fillMissingTranscripts(intakeId: string): Promise<{ filled: number; failed: number }> {
  const pending = await prisma.intakeAnswer.findMany({
    where: { intakeId, kind: 'voice', transcript: null, fileId: { not: null }, skipped: false },
    orderBy: { step: 'asc' },
    take: 20,
    select: { id: true, fileId: true },
  });

  let filled = 0;
  let failed = 0;
  for (const answer of pending) {
    try {
      const text = await transcribeTgVoice(answer.fileId as string);
      await prisma.intakeAnswer.update({
        where: { id: answer.id },
        data: { transcript: text, transcriptStatus: 'ok' },
      });
      filled += 1;
    } catch (error) {
      console.error('roadmap: retry transcription failed', answer.id, error);
      await prisma.intakeAnswer.update({ where: { id: answer.id }, data: { transcriptStatus: 'failed' } });
      failed += 1;
    }
  }
  return { filled, failed };
}
```

В `buildSource` первой строкой:

```ts
  const retried = await fillMissingTranscripts(intakeId);
  if (retried.failed) console.warn(`roadmap: ${retried.failed} голосовых остались без расшифровки`);
```

Импорт `transcribeTgVoice` из `@/lib/whisper`.

- [x] **Step 6: Написать проверочный скрипт**

Создать `scripts/intake-transcripts-check.mts`:

```ts
// Кто из анкет остался без расшифровок и добираются ли они.
// npx tsx scripts/intake-transcripts-check.mts <username|telegramId> [--fill]
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const arg = process.argv[2];
  if (!arg) throw new Error('нужен username или telegram id');

  const { findIntakeFor } = await import('../src/lib/roadmap/build');
  const { prisma } = await import('../src/lib/prisma');
  const intakeId = await findIntakeFor(arg);
  if (!intakeId) throw new Error(`анкета ${arg} не найдена`);

  const before = await prisma.intakeAnswer.findMany({
    where: { intakeId, kind: 'voice' },
    orderBy: { step: 'asc' },
    select: { step: true, transcript: true, transcriptStatus: true, durationSec: true },
  });
  for (const a of before) {
    console.log(`шаг ${a.step}: ${a.durationSec ?? '?'} c, ${a.transcript ? a.transcript.length + ' символов' : 'ПУСТО'}, статус ${a.transcriptStatus ?? '-'}`);
  }

  if (process.argv.includes('--fill')) {
    const { fillMissingTranscripts } = await import('../src/lib/roadmap/source');
    console.log('\nдобираю…');
    console.log(await fillMissingTranscripts(intakeId));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [x] **Step 7: Прогнать на тестовой анкете**

```bash
npx tsx scripts/intake-transcripts-check.mts probe_999000004
npx tsx scripts/intake-transcripts-check.mts mikhail_korobitcyn
```

Expected: у Михаила все девять с непустым текстом (залиты руками 26.08), пустых нет.
Проверить добор на тестовой анкете: занулить `transcript` у одного ответа тестового
пользователя `probe_999000004`, прогнать с `--fill`, увидеть `{ filled: 1, failed: 0 }`.
**Живых людей не трогать.**

- [x] **Step 8: Проверить сборку и закоммитить**

```bash
npm run build
git add prisma/schema.prisma src/lib/intake.ts src/lib/roadmap/source.ts scripts/intake-transcript-status-migrate.mjs scripts/intake-transcripts-check.mts
git commit -m "intake: a failed transcription now says so, and the build retries it"
```

---

### Task 3: Шесть веток вместо одной лестницы ⬅️ СЛЕДУЮЩАЯ

**Files:**
- Create: `src/lib/roadmap/branches.ts`
- Modify: `src/lib/roadmap/prompt.ts`
- Modify: `src/lib/roadmap/generate.ts` (схема инструмента, поле `branch`)
- Modify: `src/lib/roadmap/store.ts` (`saveDraft` пишет `branch`)
- Modify: `prisma/schema.prisma` (модель `Roadmap`)
- Create: `scripts/roadmap-branch-migrate.mjs`
- Create: `scripts/roadmap-branch-test.mts`

**Interfaces:**
- Consumes: `buildSource` из Task 2.
- Produces: `BRANCHES: Branch[]` и `renderBranches(): string` из
  `@/lib/roadmap/branches`; `Draft` из `generate.ts` получает поле
  `branch: 'golova' | 'pozicionirovanie' | 'produkt' | 'dengi' | 'voronka' | 'kontent'`.

- [ ] **Step 1: Завести колонку**

Создать `scripts/roadmap-branch-migrate.mjs` по образцу
`scripts/intake-transcript-status-migrate.mjs` из Task 2:

```js
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(`ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "branch" TEXT`);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name='roadmaps' AND column_name='branch'`,
);
console.log(rows.length ? 'branch на месте' : 'колонки нет');
await client.end();
```

Run: `node scripts/roadmap-branch-migrate.mjs`
Expected: `branch на месте`

В `prisma/schema.prisma`, модель `Roadmap`: `branch String?`

Run: `npx prisma generate`

- [ ] **Step 2: Описать ветки**

Создать `src/lib/roadmap/branches.ts`. Признаки взяты дословно из 91 анкеты
«делаем вместе», материалы существуют в кабинете и открыты на тарифе 2:

```ts
// Шесть веток диагностики. Цель у людей почти всегда одна (деньги, клиенты),
// а ломается путь к ней в разных местах: ветка это про то, что ломается.
//
// Признаки списаны с живых анкет, не придуманы. Материалы называются так же,
// как в оглавлении кабинета, иначе модель не сошлётся на них идентификатором.

export interface Branch {
  key: 'golova' | 'pozicionirovanie' | 'produkt' | 'dengi' | 'voronka' | 'kontent';
  title: string;
  /** по чему опознаётся, словами людей */
  signs: string;
  /** типовая лестница: от того, что уже пройдено, к тому, куда идём */
  ladder: string;
  /** куда смотреть в кабинете */
  materials: string;
}

export const BRANCHES: Branch[] = [
  {
    key: 'golova',
    title: 'Голова',
    signs: 'не выкладывает или бросает по кругу, стыдно, сравнивает себя с другими. «считаю себя недоэкспертом», «рилсы отсняли, выкладывать лень, стыдно и непонятно как», «начинаю сравнивать и бросаю блог, через время снова и опять по кругу»',
    ladder: 'решил, что блог нужен → понял, что именно останавливает → выложил первую единицу после паузы → выкладывает неделю без торга с собой → перестал сверяться с чужими блогами',
    materials: 'курс «Хочу, но не делаю», курс «Делал, но бросил», курс «Цель и мотивация блога», промпты «Карта жизни», «Собрать антивидение», «Разобрать, почему я вышел из игры», воркшоп «Ссать нельзя продавать»',
  },
  {
    key: 'pozicionirovanie',
    title: 'Позиционирование',
    signs: 'не понимает, про что он и для кого. «делаю обо всём и ни о чём», «не понимаю свою суперсилу или нишу», «три года веду и только сейчас начинаю нащупывать, кто я такая», «найти свой вектор»',
    ladder: 'есть о чём говорить → назвал свою ставку словами → собрал тезисы, из которых снимает → сузил, для кого это → его узнают по теме, а не по лицу',
    materials: 'промпты «Вытащить свою суперсилу», «Вытащить свои тезисы», «Собрать карту смыслов», курс «Делаю, но бесит», воркшоп «Уникальный Формат»',
  },
  {
    key: 'produkt',
    title: 'Продукт',
    signs: 'продавать нечего или продукт не собран. «продукта нет», «не до конца понимаю, как выдать этот продукт», «понимание, какой продукт создать и как продавать», «доделать гайд и воронку»',
    ladder: 'есть опыт, за который платят → продукт назван и оценён → оффер написан на один экран → продан первым троим приватно → оффер держит цену без скидок',
    materials: 'воркшопы «Солдаут вашего продукта», «Кэш Магниты»',
  },
  {
    key: 'dengi',
    title: 'Деньги',
    signs: 'продукт есть, продаж нет, предложения никто не слышал. «всё, что залетает, не приносит ни рубля», «клиентов нет, давно ничего не делала», «люди приходят по сарафану, но эта лавка рано или поздно закроется»',
    ladder: 'продукт есть → оффер отправлен людям руками → пошли ответы и разговоры → первая оплата → оплаты идут каждую неделю',
    materials: 'воркшопы «Солдаут вашего продукта», «Метод Мани Мейкера», «Заявки Каждый День», «Ваши 10 Покупателей»',
  },
  {
    key: 'voronka',
    title: 'Воронка',
    signs: 'продажи есть, но руками и рывками. «нет воронки продаж, системности, стратегии, вроде двигаемся, но непонятно куда», «хочу конвейер, который делаю постоянно», «превращать новых клиентов в постоянников»',
    ladder: 'продажи случаются → путь от читателя до оплаты описан → лид-магнит и точки входа стоят → повторные покупки пошли → поток держится без ручного пуша',
    materials: 'воркшопы «Метод Мани Мейкера», «Кэш Магниты», «Продающий Контент 2.0», «Продающий Контент 3.0», «Продающий Контент План», курс «Всё работает, хочу больше», воркшоп «Продающий Контент Чужими Руками»',
  },
  {
    key: 'kontent',
    title: 'Контент-навык',
    signs: 'снимает, но не смотрят; смотрят, но не покупают; съёмка жрёт время. «больше всего бесит писать сценарии, как будто выжимаю из себя», «выкладывал каждый день, нет отклика совсем», «много сил вкладываю, а на выходе не получаю отдачу»',
    ladder: 'выкладывает регулярно → снимает своё, а не переснятое → единица собрана по формуле смысл, пруф, упаковка → отклик пошёл → контент приводит заявки',
    materials: 'курс с «Делаю, но бесит» до «Всё работает, хочу больше», «Формула вирусного контента», воркшопы «Продающий Контент», промпт «Разобрать свою единицу по формуле»',
  },
];

/** Ветки текстом для промпта. */
export function renderBranches(): string {
  return BRANCHES.map(
    (b) => `### ${b.title} (${b.key})\n\nПризнаки: ${b.signs}\nЛестница: ${b.ladder}\nМатериалы: ${b.materials}`,
  ).join('\n\n');
}
```

- [ ] **Step 3: Переписать диагностику в промпте**

В `src/lib/roadmap/prompt.ts` заменить блок «Как думать». `LEVELS` остаётся как есть,
но становится линейкой одной ветки:

```ts
import { renderBranches } from './branches';

export const SYSTEM = `... (шапка без изменений)

## Как думать

Сначала цель. Что человек хочет получить, его словами из анкеты. Почти всегда это
деньги или клиенты, реже аудитория. Не переформулируй в свою сторону.

Потом ветка. Цель у людей одна, а ломается путь к ней в разных местах. Выбери одну
ведущую ветку из шести: с чего начнётся месяц.

${renderBranches()}

Три правила поверх:

1. Ведущая ветка одна. Вторая может поддержать, но не больше двух задач за месяц.
2. Деньги вперёд. Если цель прямо про деньги, а продаж ноль, ветка «Деньги» (или
   «Продукт», если продавать нечего) идёт в неделю 1 параллельно с ведущей, чем бы та
   ни была. Контент чинится, чтобы масштабировать то, что уже продаётся, а не как
   условие первой продажи.
3. Голова блокирует всё. Если человек не выкладывает вообще из-за страха, ветка
   «Голова» идёт первой, иначе остальное не поедет. Но не больше одной недели: месяц
   в терапии это не маршрут.

Если ведущая ветка «Контент-навык», диагноз ставится по шести уровням:

${LEVELS}

Человек почти никогда не стоит ровно на одном уровне: обычно он на верхнем, но с
незакрытой вещью с нижнего, и маршрут начинается именно с этой дырки.

... (остальное без изменений)

## Что заполняешь

- branch: ключ ведущей ветки, одно слово из списка выше.
- ... (остальные поля без изменений)
`;
```

В описании поля `steps` заменить «лестница из 4-7 ступеней ЕГО пути» на:
«лестница из 4-7 ступеней его пути по ведущей ветке. Образец лестницы дан у каждой
ветки выше, но перепиши его под этого человека и его слова».

- [ ] **Step 4: Добавить branch в схему инструмента**

В `src/lib/roadmap/generate.ts`, в `Draft` и в JSON Schema инструмента `roadmap`:

```ts
export interface Draft {
  branch: 'golova' | 'pozicionirovanie' | 'produkt' | 'dengi' | 'voronka' | 'kontent';
  goal: string;
  // ... остальное как было
}
```

В схеме инструмента, в `properties`:

```ts
branch: {
  type: 'string',
  enum: ['golova', 'pozicionirovanie', 'produkt', 'dengi', 'voronka', 'kontent'],
  description: 'Ключ ведущей ветки: с чего начинается месяц этого человека',
},
```

и `branch` в массив `required`.

**Важно:** strict tool use не принимает `minimum`, `maximum`, `minItems`. Границы
только словами в `description`.

- [ ] **Step 5: Сохранять ветку**

В `src/lib/roadmap/store.ts`, в `saveDraft`, при создании записи `roadmap` добавить
`branch: draft.branch` к остальным полям.

- [ ] **Step 6: Написать проверочный скрипт**

Создать `scripts/roadmap-branch-test.mts`:

```ts
// Какую ветку модель поставит архивным анкетам. Ничего не пишет в базу.
// npx tsx scripts/roadmap-branch-test.mts
import { config } from 'dotenv';
config({ path: '.env.local' });

// Что видно глазами, до всякой модели.
const EXPECTED: Record<string, string> = {
  anna_samoilenko_coach: 'dengi',       // продукт есть, ноль продаж, «не продала ещё ничего»
  mikhail_korobitcyn: 'pozicionirovanie', // снимает пятый месяц по чужим, своя ставка не заведена
  AlexLekomtsev: '?',                    // сверить глазами, ожидание не проставлено
};

async function main() {
  const { findIntakeFor } = await import('../src/lib/roadmap/build');
  const { buildSource } = await import('../src/lib/roadmap/source');
  const { generateRoadmap } = await import('../src/lib/roadmap/generate');

  for (const [who, expected] of Object.entries(EXPECTED)) {
    const intakeId = await findIntakeFor(who);
    if (!intakeId) { console.log(`${who}: анкеты нет`); continue; }

    const source = await buildSource(intakeId);
    const started = new Date();
    const until = new Date(started);
    until.setUTCMonth(until.getUTCMonth() + 1);

    const draft = await generateRoadmap(source, started, until);
    const mark = expected === '?' ? '?' : draft.branch === expected ? 'совпало' : 'РАЗОШЛОСЬ';
    console.log(`${who}: ветка ${draft.branch}, ждали ${expected} — ${mark}`);
    console.log(`  цель: ${draft.goal.slice(0, 120)}…`);
    console.log(`  затык: ${draft.steps.find((s) => s.status === 'blocked')?.title || 'нет blocked!'}\n`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 7: Прогнать на архивных анкетах**

Run: `npx tsx scripts/roadmap-branch-test.mts`
Expected: у Ани `dengi`, у Михаила `pozicionirovanie` или `kontent` (обе защитимы,
смотреть на текст затыка), у Лекомцева ветка сверяется глазами по его анкете.
Ровно одна ступень со статусом blocked у каждого.

Разошлось — править формулировки признаков в `branches.ts`, не в схеме. Прогон стоит
около $0.28 за карту.

- [ ] **Step 8: Проверить сборку и закоммитить**

```bash
npm run build
git add src/lib/roadmap/branches.ts src/lib/roadmap/prompt.ts src/lib/roadmap/generate.ts src/lib/roadmap/store.ts prisma/schema.prisma scripts/roadmap-branch-migrate.mjs scripts/roadmap-branch-test.mts
git commit -m "roadmap: diagnose the branch before the level"
```

---

### Task 4: Сборка запускается по тарифу

**Files:**
- Modify: `src/lib/intake.ts` (около строки 599, где считается `isRoute`)
- Create: `scripts/roadmap-trigger-check.mts`

**Interfaces:**
- Consumes: `tiersForTelegram` из `@/lib/kb/tier`.
- Produces: ничего нового наружу.

- [ ] **Step 1: Написать проверочный скрипт**

Создать `scripts/roadmap-trigger-check.mts`:

```ts
// Соберётся ли карта сама для этого человека. Ничего не запускает.
// npx tsx scripts/roadmap-trigger-check.mts 327482097 848935351
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) throw new Error('нужны telegram id');

  const { tiersForTelegram } = await import('../src/lib/kb/tier');
  for (const id of ids) {
    const tiers = await tiersForTelegram(Number(id));
    const willBuild = (tiers.uroven ?? 0) >= 2;
    console.log(`${id}: тарифы ${JSON.stringify(tiers)} → карта ${willBuild ? 'соберётся' : 'НЕ соберётся'}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Прогнать до правки**

Run: `npx tsx scripts/roadmap-trigger-check.mts 327482097 848935351`
Expected: у Михаила `{ uroven: 2 }` (доступ выдан 26.08), у Ани `{ uroven: 2 }`.
Скрипт показывает состояние доступов, а не старое условие по треку.

- [ ] **Step 3: Заменить условие**

В `src/lib/intake.ts` рядом со строкой 599:

```ts
  // Карта собирается тем, у кого тариф 2, а не тем, кому кинули анкету t2:
  // Михаил 26.08 пришёл с анкетой t3 на тарифе 2, и сборка бы не запустилась.
  const tiers = intake.telegramId ? await tiersForTelegram(Number(intake.telegramId)) : {};
  const isRoute = (tiers.uroven ?? 0) >= 2;
```

Импорт: `import { tiersForTelegram } from '@/lib/kb/tier';`

Текст уведомления Саше про следующий шаг остаётся прежним, меняется только условие.

- [ ] **Step 4: Проверить, что тариф 3 не начал собирать карты сам**

Run: `npx tsx scripts/roadmap-trigger-check.mts 866228378 309034389`
Expected: Даша и Костя на `uroven-t3`. `tierFromSlug('uroven-t3')` даёт 3, значит
условие `>= 2` сработает и у них. Это осознанно: у тарифа 3 карта тоже полезна, но
там она собирается после созвона. Чтобы не слать им черновик автоматом, условие
уточняется до точного совпадения:

```ts
  const isRoute = (tiers.uroven ?? 0) === 2;
```

Прогнать скрипт снова: у Даши и Кости должно быть «НЕ соберётся», у Михаила и Ани
«соберётся». Скрипт правится под то же условие `=== 2`.

- [ ] **Step 5: Собрать и закоммитить**

```bash
npm run build
git add src/lib/intake.ts scripts/roadmap-trigger-check.mts
git commit -m "roadmap: build the card for the tier the person bought, not the intake track"
```

---

### Task 5: Превью одним сообщением

**Files:**
- Modify: `src/lib/roadmap/review.ts` (`sendPreview`, `reviewKeyboard`)
- Create: `src/content/roadmap-preview.ts`
- Modify: `prisma/schema.prisma` (модель `Roadmap`: `previewMessageId`)
- Create: `scripts/roadmap-preview-message-migrate.mjs`
- Modify: `scripts/roadmap-build-test.ts` (печатать короткое превью тоже)

**Interfaces:**
- Consumes: `Draft.branch` из Task 3.
- Produces: `previewSummary(roadmapId: string): Promise<string>` из
  `@/lib/roadmap/review`; `roadmaps.preview_message_id` для Task 7.

- [ ] **Step 1: Завести колонку под id сообщения**

Создать `scripts/roadmap-preview-message-migrate.mjs` (по образцу Task 3, Step 1),
запрос: `ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "preview_message_id" BIGINT`.

Run: `node scripts/roadmap-preview-message-migrate.mjs`
Expected: колонка на месте.

В `prisma/schema.prisma`, модель `Roadmap`: `previewMessageId BigInt? @map("preview_message_id")`
Run: `npx prisma generate`

- [ ] **Step 2: Написать текст превью**

Создать `src/content/roadmap-preview.ts`:

```ts
// Короткое превью карты для Саши. Полный текст живёт на странице вида клиента,
// сюда идёт только то, по чему принимается решение.
//
// НЕ ставить длинное тире.

export interface PreviewParams {
  who: string;
  branchTitle: string;
  level: string;
  blockedStep: string;
  tasks: number;
  weeks: number;
  steps: number;
  warnings: string[];
  version: number;
}

export function previewText(p: PreviewParams): string {
  const lines = [
    `🗺 <b>Карта ${p.who}</b>${p.version > 1 ? ` · версия ${p.version}` : ''}`,
    '',
    `Ветка: <b>${p.branchTitle}</b>`,
  ];

  if (p.level) lines.push(p.level);
  if (p.blockedStep) lines.push(`Затык: ${p.blockedStep}`);

  lines.push('', `${p.tasks} задач на ${p.weeks} недели · ${p.steps} ступеней`);

  if (p.warnings.length) {
    lines.push('', '⚠️ ' + p.warnings.join('\n⚠️ '));
  }

  lines.push('', 'Ответь голосовым, если надо что-то поменять.');
  return lines.join('\n');
}

export const PREVIEW_BUTTONS = {
  look: '👀 Посмотреть глазами клиента',
  approve: '✅ Одобрить и отправить',
  rebuild: '🔄 Пересобрать',
  admin: '✏️ Править в админке',
};
```

- [ ] **Step 3: Собрать превью из базы**

В `src/lib/roadmap/review.ts` добавить:

```ts
import { BRANCHES } from './branches';
import { previewText, PREVIEW_BUTTONS } from '@/content/roadmap-preview';

/** Короткое превью: то, по чему Саша принимает решение, не открывая карту. */
export async function previewSummary(roadmapId: string): Promise<string> {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: { tasks: true, steps: true, notes: true },
  });
  if (!roadmap) return 'карта не найдена';

  const branch = BRANCHES.find((b) => b.key === roadmap.branch);
  const blocked = roadmap.steps.find((s) => s.status === 'blocked');
  const levelNote = roadmap.notes.find((n) => n.kind === 'insight' && n.body.startsWith('Уровень'));
  const weeks = new Set(
    roadmap.tasks.map((t) => (t.dueOn ? t.dueOn.toISOString().slice(0, 10) : '')),
  ).size;

  return previewText({
    who: roadmap.username ? '@' + roadmap.username : roadmap.clientName,
    branchTitle: branch?.title || roadmap.branch || 'не проставлена',
    level: levelNote ? levelNote.body.split('.')[0] : '',
    blockedStep: blocked?.title || '',
    tasks: roadmap.tasks.length,
    weeks,
    steps: roadmap.steps.length,
    warnings: [],
    version: 1,
  });
}
```

- [ ] **Step 4: Заменить отправку превью**

В `sendPreview` вместо цикла по `previewMessages` отправить одно сообщение и запомнить
его id:

```ts
export async function sendPreview(roadmapId: string, warnings: string[]): Promise<boolean> {
  const admin = await getAdminChatId();
  if (!admin) return false;

  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { slug: true },
  });
  if (!roadmap) return false;

  const text = await previewSummary(roadmapId);
  const sent = await sendBotMessage(admin, text, reviewKeyboard(roadmapId, roadmap.slug), 'HTML');
  if (!sent.ok) return false;

  const messageId = (sent as { result?: { message_id?: number } }).result?.message_id;
  if (messageId) {
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { previewMessageId: BigInt(messageId) },
    });
  }
  return true;
}
```

`reviewKeyboard` получает четвёртую кнопку первой строкой:

```ts
function reviewKeyboard(roadmapId: string, slug: string) {
  return {
    inline_keyboard: [
      [{ text: PREVIEW_BUTTONS.look, url: `${CABINET}/admin/roadmaps/${slug}/preview?mode=defaults` }],
      [{ text: PREVIEW_BUTTONS.approve, callback_data: `karta_ok:${roadmapId}` }],
      [{ text: PREVIEW_BUTTONS.rebuild, callback_data: `karta_redo:${roadmapId}` }],
      [{ text: PREVIEW_BUTTONS.admin, url: `${CABINET}/admin/roadmaps/${slug}` }],
    ],
  };
}
```

`previewMessages` не удалять: он остаётся для `roadmap-build-test.ts`.

- [ ] **Step 5: Проверить, что `sendBotMessage` отдаёт message_id**

Прочитать `src/lib/telegram.ts`. Если функция возвращает только `{ ok }`, дополнить её
так, чтобы наружу шёл разобранный ответ Telegram целиком (`{ ok, result }`), и не
сломать существующих вызывающих: они читают только `ok`.

- [ ] **Step 6: Прогнать сборку с печатью превью**

В `scripts/roadmap-build-test.ts` после записи карты добавить:

```ts
  const { previewSummary } = await import('../src/lib/roadmap/review');
  console.log('\n--- короткое превью ---\n');
  console.log(await previewSummary(roadmapId));
```

Run: `npx tsx scripts/roadmap-build-test.ts mikhail_korobitcyn`
Expected: карта пересобирается **не** будет (у Михаила карта уже открыта, `canRebuild`
вернёт false и скрипт упадёт с понятной ошибкой). Прогонять на тестовой анкете
`probe_999000004` или на Лекомцеве, чья карта закрыта.

- [ ] **Step 7: Собрать и закоммитить**

```bash
npm run build
git add src/lib/roadmap/review.ts src/content/roadmap-preview.ts prisma/schema.prisma scripts/roadmap-preview-message-migrate.mjs scripts/roadmap-build-test.ts src/lib/telegram.ts
git commit -m "roadmap: one preview message with a link to the client view"
```

---

### Task 6: Смёржить PR #47 и проверить кнопки живьём

**Files:**
- Modify: ничего в коде, если предыдущие задачи прошли.

**Interfaces:**
- Consumes: всё из Task 1-5.
- Produces: рабочие кнопки на проде.

- [ ] **Step 1: Убедиться, что ветка собирается**

Run: `npm run build && npm run lint`
Expected: обе команды без ошибок.

- [ ] **Step 2: Проверить переменные на проде**

```bash
vercel env ls production | grep -E "ELEVENLABS|TRANSCRIBE|ANTHROPIC|QSTASH"
```

Expected: `ELEVENLABS_API_KEY`, `TRANSCRIBE_PROVIDER`, `ANTHROPIC_API_KEY`,
`QSTASH_TOKEN` на месте.

- [ ] **Step 3: Смёржить**

```bash
git push origin roadmap-autogen
gh pr checks 47
gh pr merge 47 --squash
```

Expected: проверки Vercel зелёные, мёрж прошёл.

- [ ] **Step 4: Дождаться деплоя и проверить вебхук**

```bash
vercel logs <prod-url> --since 10m
```

Expected: деплой готов, ошибок на старте нет.

- [ ] **Step 5: Живой прогон на тестовом аккаунте**

Завести анкету тестовому пользователю командой `/karta_sobrat` в боте либо
`node scripts/verify-intake.mjs`, ответить двумя голосовыми, дойти до конца.

Expected: расшифровки появились в базе, через пару минут в личку Саше пришло одно
сообщение превью с четырьмя кнопками.

- [ ] **Step 6: Нажать каждую кнопку**

Expected: «Посмотреть глазами клиента» открывает страницу превью; «Пересобрать»
отвечает «пересобираю, новый черновик придёт через пару минут» и черновик приходит;
«Одобрить и отправить» открывает карту тестовому пользователю и шлёт ему сообщение.
Это первая живая проверка кнопки одобрения: до сих пор она гонялась скриптом.

- [ ] **Step 7: Записать результат**

Дописать в `docs/superpowers/specs/2026-08-26-roadmap-pipeline-design.md`, в раздел
«Что уже работает», строку о том, что кнопки проверены живьём и дату.

```bash
git add docs/superpowers/specs/2026-08-26-roadmap-pipeline-design.md
git commit -m "spec: bot buttons verified in production"
```

---

### Task 7: Правки голосом

**Files:**
- Create: `scripts/roadmap-corrections-create-table.mjs`
- Modify: `prisma/schema.prisma` (модель `RoadmapCorrection`, `Roadmap.version`)
- Create: `src/lib/roadmap/patch.ts`
- Create: `src/app/api/roadmap-patch/route.ts`
- Modify: `src/lib/qstash.ts` (`scheduleRoadmapPatch`)
- Modify: `src/app/api/telegram-webhook/route.ts` (приём reply на превью)
- Create: `scripts/roadmap-patch-test.ts`

**Interfaces:**
- Consumes: `previewSummary`, `sendPreview` из Task 5; `roadmaps.preview_message_id`.
- Produces: `applyPatch(roadmapId: string, text: string): Promise<{ applied: number; rebuilt: boolean; rules: number }>`
  из `@/lib/roadmap/patch`; `scheduleRoadmapPatch(roadmapId: string, text: string): Promise<void>`.

- [ ] **Step 1: Завести таблицу правок**

Создать `scripts/roadmap-corrections-create-table.mjs`:

```js
// Таблица правок Саши. Без prisma db push: база общая.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

await client.query(`CREATE TABLE IF NOT EXISTS "roadmap_corrections" (
  "id" TEXT NOT NULL,
  "roadmap_id" TEXT,
  "raw_text" TEXT NOT NULL,
  "operations" JSONB,
  "rule_text" TEXT,
  "scope" TEXT NOT NULL DEFAULT 'once',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "roadmap_corrections_pkey" PRIMARY KEY ("id")
)`);
await client.query(`CREATE INDEX IF NOT EXISTS "roadmap_corrections_scope_idx" ON "roadmap_corrections"("scope", "active")`);
await client.query(`ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1`);

const { rows } = await client.query(
  `SELECT table_name FROM information_schema.tables WHERE table_name='roadmap_corrections'`,
);
console.log(rows.length ? 'roadmap_corrections на месте' : 'таблицы нет');
await client.end();
```

Run: `node scripts/roadmap-corrections-create-table.mjs`
Expected: `roadmap_corrections на месте`

- [ ] **Step 2: Описать модель в схеме**

В `prisma/schema.prisma`:

```prisma
model RoadmapCorrection {
  id         String   @id @default(uuid())
  roadmapId  String?  @map("roadmap_id")
  rawText    String   @map("raw_text")
  operations Json?
  ruleText   String?  @map("rule_text")
  scope      String   @default("once")
  active     Boolean  @default(true)
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([scope, active])
  @@map("roadmap_corrections")
}
```

И в модель `Roadmap`: `version Int @default(1)`

Run: `npx prisma generate`

- [ ] **Step 3: Написать патч-инструмент**

Создать `src/lib/roadmap/patch.ts`. Схема инструмента строгая, границы словами
(strict tool use не принимает `minItems`):

```ts
// Точечная правка карты по словам Саши. Не пересборка: меняется только то,
// про что он сказал, остальное стоит нетронутым.
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { buildSource } from './source';
import { materialUrl } from './source';
import { findIntakeFor } from './build';

const MODEL = process.env.ROADMAP_MODEL || 'claude-opus-5';

export interface PatchOperation {
  op: 'task.update' | 'task.add' | 'task.remove' | 'step.update'
    | 'metric.upsert' | 'metric.remove' | 'text.update' | 'rebuild';
  key?: string;
  title?: string;
  why?: string;
  material?: string | null;
  week?: number;
  position?: number;
  status?: string;
  evidence?: string;
  label?: string;
  startValue?: string;
  currentValue?: string;
  field?: 'goal' | 'periodGoal' | 'clientIntro' | 'takeaway';
  value?: string;
  instruction?: string;
}

export interface PatchRule {
  text: string;
  scope: 'once' | 'always';
}
```

Системный промпт патча в том же файле:

```ts
const PATCH_SYSTEM = `Ты правишь готовую маршрутную карту по словам Саши.

Это НЕ пересборка. Ты меняешь только то, про что он сказал. Всё остальное в карте
стоит нетронутым: он его уже прочитал и оставил.

Правила:

- Задачи, ступени и цифры находишь по ключам из карты ниже. Ключей не выдумываешь.
- Материал называешь идентификатором вида section/slug из оглавления. Материала нет
  в оглавлении, значит его не существует: ссылку не ставишь совсем.
- Тон карты не меняешь: обращение на «ты», от лица Саши, без канцелярита и без
  длинного тире.
- Правка звучит как «переделай весь месяц», «собери заново», «всё не то»: не патчишь,
  а возвращаешь одну операцию rebuild с инструкцией своими словами.
- Правка непонятна или не к чему привязаться: возвращаешь пустой список операций.
  Лучше ничего, чем угаданное.

Отдельно решаешь, разовая это правка или правило на будущее.

Разовая (scope: once): про этого человека. «У Миши в третьей неделе поменяй материал».
Правило (scope: always): про то, как собирать карты вообще. «Услуги не продаются через
воркшопы про инфопродукты». Формулируй правило коротко и так, чтобы оно читалось без
контекста этого человека.

Отвечай вызовом инструмента patch, ничего кроме вызова.`;
```

Схема инструмента. Границы только словами: strict tool use не принимает `minItems`.

```ts
const PATCH_TOOL: Anthropic.Tool = {
  name: 'patch',
  description: 'Правки к карте и правила, вынесенные из слов Саши',
  input_schema: {
    type: 'object',
    properties: {
      operations: {
        type: 'array',
        description: 'Операции правки. Пусто, если правка непонятна. Обычно одна-три.',
        items: {
          type: 'object',
          properties: {
            op: {
              type: 'string',
              enum: ['task.update', 'task.add', 'task.remove', 'step.update',
                     'metric.upsert', 'metric.remove', 'text.update', 'rebuild'],
            },
            key: { type: 'string', description: 'Ключ задачи или метрики из карты' },
            title: { type: 'string' },
            why: { type: 'string', description: 'Зачем это ему, его словами из анкеты' },
            material: { type: 'string', description: 'section/slug из оглавления либо пусто' },
            week: { type: 'number', description: 'Номер недели, от 1 до 4' },
            position: { type: 'number', description: 'Позиция ступени' },
            status: { type: 'string', enum: ['done', 'partial', 'blocked', 'todo'] },
            evidence: { type: 'string' },
            label: { type: 'string' },
            startValue: { type: 'string' },
            currentValue: { type: 'string' },
            field: { type: 'string', enum: ['goal', 'periodGoal', 'clientIntro', 'takeaway'] },
            value: { type: 'string' },
            instruction: { type: 'string', description: 'Только для rebuild: что учесть при пересборке' },
          },
          required: ['op'],
        },
      },
      rules: {
        type: 'array',
        description: 'Что вынести из этой правки на будущее. Обычно одно, может быть пусто.',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Формулировка правила одним предложением' },
            scope: { type: 'string', enum: ['once', 'always'] },
          },
          required: ['text', 'scope'],
        },
      },
    },
    required: ['operations', 'rules'],
  },
};
```

Сбор текущей карты для промпта:

```ts
/** Карта в том виде, в каком её правит модель: ключи, тексты, недели. */
async function cardForModel(roadmapId: string) {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: {
      tasks: { orderBy: { position: 'asc' } },
      steps: { orderBy: { position: 'asc' } },
      metrics: { orderBy: { position: 'asc' } },
    },
  });
  if (!roadmap) throw new Error('карта не найдена');

  const weeks = [...new Set(roadmap.tasks.map((t) => t.dueOn?.toISOString().slice(0, 10) || ''))].sort();

  return {
    branch: roadmap.branch,
    goal: roadmap.goal,
    periodGoal: roadmap.periodGoal,
    clientIntro: roadmap.clientIntro,
    steps: roadmap.steps.map((s) => ({
      position: s.position, title: s.title, status: s.status, evidence: s.evidence,
    })),
    metrics: roadmap.metrics.map((m) => ({
      key: m.key, label: m.label, startValue: m.startValue, currentValue: m.currentValue,
    })),
    tasks: roadmap.tasks.map((t) => ({
      key: t.key,
      week: weeks.indexOf(t.dueOn?.toISOString().slice(0, 10) || '') + 1,
      title: t.title,
      why: t.why,
      owner: t.owner,
      material: t.linkLabel,
    })),
  };
}
```

Вызов модели и запись результата:

```ts
export async function applyPatch(roadmapId: string, text: string) {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { clientVisible: true, telegramId: true, version: true },
  });
  if (!roadmap) throw new Error('карта не найдена');
  if (roadmap.clientVisible) {
    throw new Error('карта уже у человека, правки только в админке: иначе собьются его галочки');
  }

  const card = await cardForModel(roadmapId);
  const intakeId = roadmap.telegramId ? await findIntakeFor(String(roadmap.telegramId)) : null;
  const source = intakeId ? await buildSource(intakeId) : null;

  const client = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: PATCH_SYSTEM,
    tools: [PATCH_TOOL],
    tool_choice: { type: 'tool', name: 'patch' },
    messages: [{
      role: 'user',
      content: [
        '# Карта сейчас',
        JSON.stringify(card, null, 1),
        '# Что открыто человеку',
        source?.catalog || 'оглавление недоступно',
        '# Правка Саши',
        text,
      ].join('\n\n'),
    }],
  });

  const call = res.content.find((c) => c.type === 'tool_use');
  if (!call || call.type !== 'tool_use') throw new Error('модель не вызвала инструмент');
  const input = call.input as { operations: PatchOperation[]; rules: PatchRule[] };

  const rebuild = input.operations.find((o) => o.op === 'rebuild');
  const applied = rebuild ? 0 : await applyOperations(roadmapId, input.operations, source);

  await prisma.roadmapCorrection.create({
    data: {
      roadmapId,
      rawText: text,
      operations: input.operations as unknown as object,
      ruleText: input.rules.find((r) => r.scope === 'always')?.text || null,
      scope: input.rules.some((r) => r.scope === 'always') ? 'always' : 'once',
    },
  });

  if (!rebuild) {
    await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { version: { increment: 1 }, lastTouchAt: new Date() },
    });
  }

  return {
    applied,
    rebuilt: Boolean(rebuild),
    rules: input.rules.length,
    instruction: rebuild?.instruction,
  };
}
```

`applyOperations(roadmapId, operations, source)` пишется рядом и разбирает операции по
одной. Правила применения:
- `task.update` ищет задачу по `key` в пределах карты; нет такой, операция пропускается
  и попадает в отчёт как пропущенная;
- `task.add` получает `key` вида `w<week>-<translit-заголовка>`, `dueOn` берётся у
  соседней задачи той же недели;
- `material` превращается в `linkUrl`/`linkLabel` через `materialUrl` и каталог из
  `buildSource`; материала нет в каталоге, ссылка не ставится;
- `rebuild` не применяется вместе с остальными: если он есть, зовётся пересборка с
  `instruction` в промпте, прочие операции игнорируются.

Открытую карту патч не трогает:

```ts
export async function applyPatch(roadmapId: string, text: string) {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { clientVisible: true },
  });
  if (!roadmap) throw new Error('карта не найдена');
  if (roadmap.clientVisible) {
    throw new Error('карта уже у человека, правки только в админке: иначе собьются его галочки');
  }
  // ... дальше вызов модели и применение
}
```

- [ ] **Step 4: Написать проверочный скрипт**

Создать `scripts/roadmap-patch-test.ts`:

```ts
// Прогон правки без бота: печатает, что изменилось.
// npx tsx scripts/roadmap-patch-test.ts <slug> "текст правки"
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const [slug, text] = process.argv.slice(2);
  if (!slug || !text) throw new Error('нужны slug и текст правки');

  const { prisma } = await import('../src/lib/prisma');
  const { applyPatch } = await import('../src/lib/roadmap/patch');
  const { previewSummary } = await import('../src/lib/roadmap/review');

  const roadmap = await prisma.roadmap.findUnique({ where: { slug }, select: { id: true } });
  if (!roadmap) throw new Error(`карта ${slug} не найдена`);

  const before = await prisma.roadmapTask.findMany({
    where: { roadmapId: roadmap.id }, orderBy: { position: 'asc' },
    select: { key: true, title: true, linkLabel: true },
  });

  const result = await applyPatch(roadmap.id, text);
  console.log(result);

  const after = await prisma.roadmapTask.findMany({
    where: { roadmapId: roadmap.id }, orderBy: { position: 'asc' },
    select: { key: true, title: true, linkLabel: true },
  });

  for (const a of after) {
    const b = before.find((x) => x.key === a.key);
    if (!b) { console.log(`+ ${a.key}: ${a.title}`); continue; }
    if (b.title !== a.title) console.log(`~ ${a.key}: ${b.title}\n         → ${a.title}`);
    if (b.linkLabel !== a.linkLabel) console.log(`~ ${a.key} материал: ${b.linkLabel} → ${a.linkLabel}`);
  }
  for (const b of before) if (!after.find((x) => x.key === b.key)) console.log(`- ${b.key}: ${b.title}`);

  console.log('\n' + (await previewSummary(roadmap.id)));
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 5: Прогнать на закрытой карте**

Взять карту Лекомцева (закрыта) либо собрать новую тестовую.

Run: `npx tsx scripts/roadmap-patch-test.ts <slug> "во второй неделе поменяй материал у задачи про оффер на Метод Мани Мейкера, он продаёт услуги, а не курсы"`
Expected: печатается одна строка `~ w2-offer материал: Воркшоп · Солдаут вашего
продукта → Воркшоп · Метод Мани Мейкера`, остальные задачи не тронуты, версия карты 2.

- [ ] **Step 6: Проверить отказ на открытой карте**

Run: `npx tsx scripts/roadmap-patch-test.ts mikhail-korobitcyn "поменяй что-нибудь"`
Expected: FAIL с текстом «карта уже у человека, правки только в админке».

- [ ] **Step 7: Поставить очередь и роут**

В `src/lib/qstash.ts` по образцу `scheduleRoadmapBuild`:

```ts
/** Правка карты голосом: обращение к модели дольше вебхука, поэтому очередь. */
export async function scheduleRoadmapPatch(roadmapId: string, text: string) {
  if (!WEBAPP_URL) {
    console.error('[QStash] WEBAPP_URL not set, cannot schedule roadmap patch');
    return;
  }
  try {
    await qstash.publishJSON({
      url: `${WEBAPP_URL}/api/roadmap-patch`,
      body: { roadmapId, text },
      retries: 1,
    });
  } catch (error) {
    console.error(`[QStash] Failed to schedule roadmap patch for ${roadmapId}:`, error);
  }
}
```

Создать `src/app/api/roadmap-patch/route.ts` по образцу
`src/app/api/roadmap-generate/route.ts`: та же проверка подписи QStash,
`export const maxDuration = 300`, вызов `applyPatch`, затем `sendPreview` с новой
версией. Ошибку ловить и отправлять Саше текстом, а не молчать.

- [ ] **Step 8: Принять reply в вебхуке**

В `src/app/api/telegram-webhook/route.ts`, в ветке обработки сообщений от Саши, до
обработки анкеты:

```ts
    // Правка карты: Саша отвечает на сообщение превью голосом или текстом.
    const replyTo = update.message?.reply_to_message?.message_id;
    const fromAdmin = String(update.message?.chat?.id) === (process.env.ADMIN_CHAT_ID || '').trim();
    if (fromAdmin && replyTo) {
      const roadmap = await prisma.roadmap.findFirst({
        where: { previewMessageId: BigInt(replyTo) },
        select: { id: true, clientVisible: true },
      });
      if (roadmap) {
        if (roadmap.clientVisible) {
          await sendBotMessage(update.message.chat.id, 'карта уже у человека, правь в админке: иначе собьются его галочки');
          return NextResponse.json({ ok: true });
        }

        const text = update.message.text
          || (update.message.voice ? await transcribeTgVoice(update.message.voice.file_id) : '');
        if (!text) {
          await sendBotMessage(update.message.chat.id, 'не разобрал правку, продиктуй ещё раз или напиши текстом');
          return NextResponse.json({ ok: true });
        }

        await sendBotMessage(update.message.chat.id, 'принял, применяю');
        await scheduleRoadmapPatch(roadmap.id, text);
        return NextResponse.json({ ok: true });
      }
    }
```

Расшифровку звать в `after()`, если она затягивает вебхук: правка Саши обычно
короткая, но лимит вебхука Telegram жёсткий.

- [ ] **Step 9: Живая проверка**

Собрать карту тестовому пользователю, ответить на превью голосовым «поменяй материал
во второй задаче». Expected: приходит «принял, применяю», затем новое превью с
пометкой «версия 2».

- [ ] **Step 10: Собрать и закоммитить**

```bash
npm run build
git add src/lib/roadmap/patch.ts src/app/api/roadmap-patch/route.ts src/lib/qstash.ts src/app/api/telegram-webhook/route.ts prisma/schema.prisma scripts/roadmap-corrections-create-table.mjs scripts/roadmap-patch-test.ts
git commit -m "roadmap: edits by voice, applied as a patch and not a rebuild"
```

---

### Task 8: Память правил

**Files:**
- Modify: `src/lib/roadmap/prompt.ts` (блок правил в SYSTEM)
- Modify: `src/lib/roadmap/generate.ts` (подтягивать правила перед вызовом модели)
- Modify: `src/app/api/telegram-webhook/route.ts` (`/karta_pravila`, `/karta_pravila_stop`)
- Create: `scripts/roadmap-rules-list.mts`

**Interfaces:**
- Consumes: `roadmap_corrections` из Task 7.
- Produces: `activeRules(): Promise<string[]>` из `@/lib/roadmap/patch`.

- [ ] **Step 1: Написать чтение правил**

В `src/lib/roadmap/patch.ts`:

```ts
/** Правила, которые Саша уже проговорил. Подмешиваются в промпт каждой сборки. */
export async function activeRules(): Promise<string[]> {
  const rows = await prisma.roadmapCorrection.findMany({
    where: { scope: 'always', active: true, ruleText: { not: null } },
    orderBy: { createdAt: 'asc' },
    take: 30,
    select: { ruleText: true },
  });
  return rows.map((r) => r.ruleText as string);
}
```

- [ ] **Step 2: Подмешать правила в промпт**

`SYSTEM` в `prompt.ts` становится функцией, чтобы принимать правила:

```ts
export function systemPrompt(rules: string[]): string {
  const block = rules.length
    ? `\n\n## Правила, которые Саша уже проговорил\n\nЭто разборы прошлых карт. Они сильнее общих соображений.\n\n${rules.map((r) => `- ${r}`).join('\n')}`
    : '';
  return SYSTEM_BASE + block;
}
```

`SYSTEM` переименовать в `SYSTEM_BASE`. В `generate.ts` перед вызовом модели:

```ts
  const rules = await activeRules();
  // ... system: systemPrompt(rules)
```

- [ ] **Step 3: Написать список правил скриптом**

Создать `scripts/roadmap-rules-list.mts`:

```ts
// Что система запомнила из правок. npx tsx scripts/roadmap-rules-list.mts
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  const rows = await prisma.roadmapCorrection.findMany({
    where: { scope: 'always' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, ruleText: true, active: true, createdAt: true },
  });
  rows.forEach((r, i) => {
    console.log(`${i + 1}. ${r.active ? '' : '(выключено) '}${r.ruleText}`);
    console.log(`   ${r.createdAt.toISOString().slice(0, 10)} · ${r.id}\n`);
  });
  if (!rows.length) console.log('правил пока нет');
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 4: Добавить команды бота**

В `src/app/api/telegram-webhook/route.ts`, рядом с `/karta_sobrat`:

```ts
    // Что система запомнила из правок. Только Саша.
    if (update.message?.text?.startsWith('/karta_pravila') && isAdminChat(update.message.chat.id)) {
      const stop = update.message.text.match(/^\/karta_pravila_stop\s+(\d+)/);
      const rows = await prisma.roadmapCorrection.findMany({
        where: { scope: 'always' },
        orderBy: { createdAt: 'asc' },
        select: { id: true, ruleText: true, active: true },
      });

      if (stop) {
        const n = Number(stop[1]);
        const target = rows[n - 1];
        if (!target) {
          await sendBotMessage(update.message.chat.id, `правила номер ${n} нет`);
          return NextResponse.json({ ok: true });
        }
        await prisma.roadmapCorrection.update({ where: { id: target.id }, data: { active: false } });
        await sendBotMessage(update.message.chat.id, `выключил: ${target.ruleText}`);
        return NextResponse.json({ ok: true });
      }

      const text = rows.length
        ? rows.map((r, i) => `${i + 1}. ${r.active ? '' : '(выключено) '}${r.ruleText}`).join('\n\n')
          + '\n\nвыключить: /karta_pravila_stop номер'
        : 'правил пока нет: они появятся из твоих голосовых правок';
      await sendBotMessage(update.message.chat.id, text);
      return NextResponse.json({ ok: true });
    }
```

`isAdminChat` это та же проверка `String(chatId) === (process.env.ADMIN_CHAT_ID || '').trim()`,
что уже используется в файле для `/karta_sobrat`; вынести её в маленькую функцию, если
она повторяется больше двух раз.

- [ ] **Step 5: Проверить цикл целиком**

```bash
npx tsx scripts/roadmap-patch-test.ts <slug> "услуги не продаются через воркшопы про инфопродукты, это правило на будущее"
npx tsx scripts/roadmap-rules-list.mts
```

Expected: правило появилось в списке со `scope: always`.

Затем собрать карту заново и убедиться, что правило попало в промпт:

Run: `npx tsx scripts/roadmap-build-test.ts probe_999000004`
Expected: карта собирается, задачи про продажи услуг не ссылаются на инфопродуктовые
воркшопы.

- [ ] **Step 6: Собрать и закоммитить**

```bash
npm run build
git add src/lib/roadmap/patch.ts src/lib/roadmap/prompt.ts src/lib/roadmap/generate.ts src/app/api/telegram-webhook/route.ts scripts/roadmap-rules-list.mts
git commit -m "roadmap: remember the rules Sasha already said"
```

---

## Что разошлось с планом (по ходу работы)

**Task 1.** Scribe вставляет в текст пометки аудио-событий: «[вдох]»,
«[прочищает горло]». Для анкеты это мусор, модель прочитала бы их как содержание
ответа. Добавлены `tag_audio_events: false` и `diarize: false`.

**Task 1.** Тип `Buffer` в плане неверный: `downloadTelegramFile` отдаёт
`ArrayBuffer`. Заведён `src/lib/transcribe/audio.ts` с типом `Audio` и
конвертером `toBlobPart`: Blob в типах Node не берёт `Uint8Array<ArrayBufferLike>`
напрямую.

**Task 2.** Пустые расшифровки оказались не только у Михаила: у Ани все шесть,
у Лекомцева одиннадцать из двенадцати. Их карты собрались только потому, что
раньше расшифровка ложилась **парным текстовым ответом** рядом с голосовым, а не
в поле `transcript`.

Из-за этого добор получил проверку `hasPairedText`: голосовое, у которого в том
же шаге есть текстовый ответ в пределах пяти минут, пропускается. Иначе модель
прочитала бы каждый такой ответ дважды. На анкете Лекомцева это 11 пропусков и
ноль лишних трат. `fillMissingTranscripts` возвращает `{ filled, failed, skipped }`,
а не `{ filled, failed }`, как было в плане.

**Task 2.** Миграция заодно проставила `transcript_status = 'ok'` тридцати шести
прошлым ответам, у которых текст уже был: иначе колонка врала бы про них.

## Проверено живьём 26.08

- Расшифровка ElevenLabs на трёх голосовых Михаила: 26 секунд считаются за 3,
  3.5 минуты за 11. Качество выше локального whisper («про политику» вместо
  «параполитику», «с матюгом» вместо «с мутюгом»).
- Запасной провайдер OpenAI падает с внятной ошибкой про кредиты.
- Добор: занулил расшифровку у восьмого ответа Михаила, вернулась сама
  (было 184 символа, стало 204).
- Уведомление о сбое дошло Саше в бота, вторым разом не продублировалось:
  в `events` ровно одна отметка `intake_transcribe_warned`.

## Порядок и зависимости

Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8.

Task 3 (ветки) можно делать параллельно с Task 4 и 5: они не пересекаются по файлам,
кроме `prisma/schema.prisma`. Task 7 требует `preview_message_id` из Task 5.
Task 6 (мёрж) стоит между: всё до него доводит написанное, всё после это новое.

## Чего в этом плане нет

- Кто оплатил картой на сайте и не зашёл в бота: анкета не стартует. Отдельная задача.
- Автовыдача доступа при ручных апгрейдах (крипта, перевод). Отдельная задача.
- Перевод зум-пайплайна на общий модуль расшифровки: здесь только интерфейс, сам
  переезд делается в `agent-hub/zoom-drainer`.
