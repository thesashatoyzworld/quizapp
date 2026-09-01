# Разбор входящих в инста-директе: план

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ассистент открывает вкладку «Ждут ответа» и сверху видит человека,
который вчера спросил цену, а не того, кто прислал огонёк.

**Architecture:** Скан чатов ChatPlace идёт фоном и складывает разбор в таблицу
`ig_inbox`: кто написал последним, о чём, насколько это похоже на заявку.
Мусор (эмодзи, «спасибо») отсеивается правилами до модели, оставшееся
классифицирует Haiku. Страница только читает готовую таблицу, поэтому
открывается мгновенно.

**Tech Stack:** Next.js 15 (App Router), Prisma 7, Postgres (общий Supabase),
ChatPlace MCP через `src/lib/chatplace.ts`, Anthropic SDK (Haiku 4.5).

**Spec:** `docs/superpowers/specs/2026-09-01-sales-assistant-bot-design.md`

## Global Constraints

- ⛔ **`prisma db push` на этой базе запрещён.** База общая с другими проектами,
  push сносит чужие таблицы. Новая таблица создаётся отдельным скриптом на
  чистом SQL, модель в `schema.prisma` добавляется только ради типов, после
  чего `npx prisma generate`.
- **Работа ведётся в новом worktree от `origin/master`.** Локальный master
  отстаёт на 13 коммитов, а в рабочем дереве 74 незакоммиченных файла.
  В worktree ставить `npm install`, а не линковать `node_modules` джанкшеном:
  джанкшен роняет Turbopack.
- **ChatPlace отдаёт 500 на страницах подряд.** Между запросами пауза 150 мс,
  повтор с растущей задержкой. В `src/lib/chatplace.ts` это уже сделано,
  своего клиента не писать.
- **Тестового раннера в проекте нет.** Проверка — прогонный скрипт на живых
  данных плюс `npm run build`. Скрипты запускаются как `node scripts/<имя>.mjs`.
- **Кириллицу не передавать через `node -e` и `curl -d`** — получится mojibake.
  Писать в файл и запускать файл.
- **Модель для классификации: `claude-haiku-4-5`.** Ключ `ANTHROPIC_API_KEY`
  уже в `.env.local` и в Vercel.
- **Критерий приёмки всего этапа:** в списке наверху оказываются
  ANNA NEZHALSKAYA («Подскажите пожалуйста стоимость личной работы»,
  чат `b968fc7d-e433-46ff-b805-cfd574fa05b4`) и @julieshafran («Мне почему-то
  не пришла ссылка»), а не реакции вида «🔥🔥🔥» и «Спасибо».

---

### Task 1: Таблица `ig_inbox`

**Files:**
- Modify: `prisma/schema.prisma` (добавить модель в конец файла)
- Create: `scripts/ig-inbox-create-tables.mjs`

**Interfaces:**
- Consumes: ничего
- Produces: таблица `ig_inbox` и модель `prisma.igInbox` со следующими полями:
  `chatId` (PK), `clientId`, `username`, `name`, `lastSide`, `lastText`,
  `lastAt`, `clientMsgs`, `ourMsgs`, `kind`, `priority`, `reason`, `scannedAt`.

- [ ] **Step 1: Добавить модель в схему**

В конец `prisma/schema.prisma`:

```prisma
// Разбор входящих в инста-директе: кто написал последним и насколько это
// похоже на заявку. Наполняется скриптом scripts/ig-inbox-scan.mjs, страница
// только читает. Таблица заведена руками (ig-inbox-create-tables.mjs),
// prisma db push на этой базе запрещён.
model IgInbox {
  chatId   String  @id @map("chat_id")
  clientId String  @map("client_id")
  username String?
  name     String?

  lastSide String   @map("last_side")  // client | bot
  lastText String?  @map("last_text")
  lastAt   DateTime @map("last_at")

  clientMsgs Int @default(0) @map("client_msgs")
  ourMsgs    Int @default(0) @map("our_msgs")

  // price      — спросил цену или как попасть в работу
  // substantive— написал по существу: про себя, свою ситуацию, вопрос
  // reaction   — реакция на контент, эмодзи, «спасибо»
  // ours       — последнее слово за нами, отвечать нечего
  kind     String
  priority Int    @default(0) // чем больше, тем выше в списке
  reason   String?            // одной строкой, почему так решили

  scannedAt DateTime @updatedAt @map("scanned_at")

  @@index([kind, lastAt])
  @@map("ig_inbox")
}
```

- [ ] **Step 2: Написать скрипт создания таблицы**

Создать `scripts/ig-inbox-create-tables.mjs` по образцу существующего
`scripts/ig-leads-create-tables.mjs`:

```js
// Заводит таблицу ig_inbox. prisma db push на этой базе нельзя: она общая
// с другими проектами, push сносит чужие таблицы.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS ig_inbox (
  chat_id     TEXT PRIMARY KEY,
  client_id   TEXT NOT NULL,
  username    TEXT,
  name        TEXT,
  last_side   TEXT NOT NULL,
  last_text   TEXT,
  last_at     TIMESTAMP(3) NOT NULL,
  client_msgs INTEGER NOT NULL DEFAULT 0,
  our_msgs    INTEGER NOT NULL DEFAULT 0,
  kind        TEXT NOT NULL,
  priority    INTEGER NOT NULL DEFAULT 0,
  reason      TEXT,
  scanned_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ig_inbox_kind_last_at_idx ON ig_inbox(kind, last_at DESC);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'ig_inbox' ORDER BY ordinal_position`
);
console.log('ig_inbox готова, колонки:', rows.map((r) => r.column_name).join(', '));
await client.end();
```

- [ ] **Step 3: Создать таблицу и убедиться, что она есть**

Run: `node scripts/ig-inbox-create-tables.mjs`
Expected: `ig_inbox готова, колонки: chat_id, client_id, username, name, last_side, last_text, last_at, client_msgs, our_msgs, kind, priority, reason, scanned_at`

- [ ] **Step 4: Сгенерировать клиент Prisma**

Run: `npx prisma generate`
Expected: `Generated Prisma Client`. Команду `prisma db push` не запускать.

- [ ] **Step 5: Коммит**

```bash
git add prisma/schema.prisma scripts/ig-inbox-create-tables.mjs
git commit -m "ig-inbox: table for triaged direct messages"
```

---

### Task 2: Отсев мусора правилами

Правила снимают с модели то, что и так очевидно: огоньки, «спасибо», реакции
на сторис. По разведке это две трети всех входящих, и платить за них не за что.

**Files:**
- Create: `src/lib/ig-inbox/filter.ts`
- Create: `scripts/ig-inbox-filter-check.mjs`

**Interfaces:**
- Consumes: ничего
- Produces:
  - `type PreKind = 'reaction' | 'maybe'`
  - `function preClassify(text: string | null): PreKind` — `reaction` значит
    «мусор, к модели не отправлять», `maybe` значит «пусть смотрит модель»

- [ ] **Step 1: Написать проверочный скрипт с примерами из живых чатов**

Создать `scripts/ig-inbox-filter-check.mjs`. Строки взяты из настоящих
переписок, кириллицу пишем в файл, а не в командную строку:

```js
// Проверка отсева: слева ожидание, справа живой текст из инста-директа.
import { preClassify } from '../src/lib/ig-inbox/filter.ts';

const CASES = [
  ['reaction', '🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥'],
  ['reaction', 'Спасибо'],
  ['reaction', 'Вы кайф'],
  ['reaction', 'Крутой👌😊'],
  ['reaction', 'Ахахах'],
  ['reaction', 'Пока что'],
  ['reaction', ''],
  ['maybe', 'Добрый вечер. Подскажите пожалуйста стоимость личной работы. Надо раскачать личный бренд фитнес-тренера)'],
  ['maybe', 'Привет 👋 Интересно узнать о стоимости услуг'],
  ['maybe', 'Здравствуйте! Мне почему-то не пришла ссылка. Не могли бы вы'],
  ['maybe', 'Здравствуйте! Я музыкой занимаюсь. Можете посмотреть акк, том'],
  ['maybe', 'Я сейчас в свободном падении. Или полёте, ещё не решила. С ч'],
  ['maybe', 'Перешла на аккаунты ваших кейсов. Контент, конечно хороший,'],
];

let bad = 0;
for (const [want, text] of CASES) {
  const got = preClassify(text);
  if (got !== want) {
    bad++;
    console.log(`ХОТЕЛИ ${want}, ПОЛУЧИЛИ ${got}: ${text.slice(0, 60)}`);
  }
}
console.log(bad === 0 ? `все ${CASES.length} примеров разобраны верно` : `ошибок: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx tsx scripts/ig-inbox-filter-check.mjs`
Expected: FAIL, модуля `src/lib/ig-inbox/filter.ts` ещё нет.

- [ ] **Step 3: Написать отсев**

Создать `src/lib/ig-inbox/filter.ts`:

```ts
// Первый проход по входящему сообщению — без модели.
// Задача одна: снять очевидный мусор, чтобы не платить за него.
// Всё сомнительное уходит дальше, к модели: лучше лишний раз посмотреть,
// чем утопить заявку.

export type PreKind = 'reaction' | 'maybe';

// Короткие вежливости и одобрения. Список закрытый: если человек после
// «спасибо» дописал что-то ещё, длина уже вытянет его в maybe.
const SHORT_REPLIES =
  /^(спасибо|благодарю|благодарствую|круто|класс|огонь|супер|топ|отлично|да|нет|ок|окей|понял|поняла|принял|приняла|ахаха+|хаха+|хех|пока что|вы кайф|крутой|красава|молодец|согласен|согласна|верно|точно|это точно|плюсую)[\s!.,)?😊😁🙏👍🔥❤️]*$/i;

export function preClassify(text: string | null): PreKind {
  const t = (text || '').trim();
  if (!t) return 'reaction';

  // Ни одного слова из трёх букв — значит эмодзи, знаки, «)))».
  if (!/[a-zA-Zа-яА-ЯёЁ]{3}/.test(t)) return 'reaction';

  if (SHORT_REPLIES.test(t)) return 'reaction';

  // Совсем короткие реплики без вопроса ничего не двигают.
  if (t.length < 20 && !t.includes('?')) return 'reaction';

  return 'maybe';
}
```

- [ ] **Step 4: Запустить проверку**

Run: `npx tsx scripts/ig-inbox-filter-check.mjs`
Expected: `все 13 примеров разобраны верно`, код возврата 0.

- [ ] **Step 5: Коммит**

```bash
git add src/lib/ig-inbox/filter.ts scripts/ig-inbox-filter-check.mjs
git commit -m "ig-inbox: rule-based filter for reactions and pleasantries"
```

---

### Task 3: Приоритет на модели

**Files:**
- Create: `src/lib/ig-inbox/classify.ts`
- Create: `scripts/ig-inbox-classify-check.mjs`

**Interfaces:**
- Consumes: `preClassify` из Task 2 (для отсева до вызова модели)
- Produces:
  - `type InboxKind = 'price' | 'substantive' | 'reaction' | 'ours'`
  - `type Verdict = { kind: InboxKind; priority: number; reason: string }`
  - `async function classifyBatch(items: { chatId: string; text: string }[]): Promise<Map<string, Verdict>>`
    — до 20 сообщений за один вызов модели

- [ ] **Step 1: Написать проверочный скрипт**

Создать `scripts/ig-inbox-classify-check.mjs`:

```js
// Прогон классификации на живых сообщениях. Тратит немного денег: один
// вызов Haiku на всю пачку.
import { classifyBatch } from '../src/lib/ig-inbox/classify.ts';

const ITEMS = [
  { chatId: 'a', text: 'Добрый вечер. Подскажите пожалуйста стоимость личной работы. Надо раскачать личный бренд фитнес-тренера)' },
  { chatId: 'b', text: 'Привет 👋 Интересно узнать о стоимости услуг' },
  { chatId: 'c', text: 'Здравствуйте! Мне почему-то не пришла ссылка. Не могли бы вы прислать?' },
  { chatId: 'd', text: 'Я сейчас в свободном падении. Или полёте, ещё не решила. С чего начать?' },
  { chatId: 'e', text: 'Роман Трахтенберг так делал.' },
];

const got = await classifyBatch(ITEMS);
for (const it of ITEMS) {
  const v = got.get(it.chatId);
  console.log(`${String(v?.priority).padStart(3)} ${String(v?.kind).padEnd(12)} ${it.text.slice(0, 50)} — ${v?.reason}`);
}

const price = got.get('a');
const chat = got.get('e');
const ok = price?.kind === 'price' && (chat?.kind === 'reaction' || (chat?.priority ?? 0) < (price?.priority ?? 0));
console.log(ok ? 'вопрос про цену стоит выше реплики про контент' : 'ПОРЯДОК НЕВЕРНЫЙ');
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx tsx scripts/ig-inbox-classify-check.mjs`
Expected: FAIL, модуля нет.

- [ ] **Step 3: Написать классификацию**

Создать `src/lib/ig-inbox/classify.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';

// Разбирает входящие пачкой: один вызов модели на два десятка сообщений.
// Задача не «понять человека», а расставить очередь: кому ассистент пишет
// первым. Поэтому ответ короткий и жёстко заданной формы.

export type InboxKind = 'price' | 'substantive' | 'reaction' | 'ours';
export type Verdict = { kind: InboxKind; priority: number; reason: string };

const anthropic = new Anthropic();

const SYSTEM = `Ты разбираешь входящие сообщения в инстаграм-директе эксперта по контенту и продажам.
На каждое сообщение отвечаешь, к чему оно относится и насколько срочно ответить.

kind:
- price — спрашивает цену, условия, как попасть в работу, просит посмотреть его аккаунт
- substantive — рассказывает о своей ситуации, задаёт вопрос по делу, жалуется на результат
- reaction — отклик на контент, эмодзи, «спасибо», реплика в сторону
- ours — отвечать нечего, последнее слово было за нами

priority: 0..100. Вопрос про деньги и просьба о помощи выше, разговор про
контент ниже. Ориентир: price 80-100, substantive 40-70, reaction 0-20.

reason: до восьми слов, по-русски, чем именно это является.`;

const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          kind: { type: 'string', enum: ['price', 'substantive', 'reaction', 'ours'] },
          priority: { type: 'integer' },
          reason: { type: 'string' },
        },
        required: ['id', 'kind', 'priority', 'reason'],
        additionalProperties: false,
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
} as const;

export async function classifyBatch(
  items: { chatId: string; text: string }[],
): Promise<Map<string, Verdict>> {
  const out = new Map<string, Verdict>();
  if (!items.length) return out;

  const listing = items
    .map((it) => `[${it.chatId}] ${it.text.replace(/\s+/g, ' ').slice(0, 400)}`)
    .join('\n');

  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Разбери сообщения:\n\n${listing}` }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  });

  const text = res.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') return out;

  const parsed = JSON.parse(text.text) as {
    items: { id: string; kind: InboxKind; priority: number; reason: string }[];
  };
  for (const r of parsed.items) {
    out.set(r.id, {
      kind: r.kind,
      priority: Math.max(0, Math.min(100, r.priority)),
      reason: r.reason,
    });
  }
  return out;
}
```

- [ ] **Step 4: Запустить проверку**

Run: `npx tsx scripts/ig-inbox-classify-check.mjs`
Expected: пять строк разбора и `вопрос про цену стоит выше реплики про контент`, код 0.

- [ ] **Step 5: Коммит**

```bash
git add src/lib/ig-inbox/classify.ts scripts/ig-inbox-classify-check.mjs
git commit -m "ig-inbox: batch priority classification on Haiku"
```

---

### Task 4: Скан чатов

**Files:**
- Create: `scripts/ig-inbox-scan.mjs`

**Interfaces:**
- Consumes: `listChats`, `listChatMessages` из `src/lib/chatplace.ts`;
  `preClassify` из Task 2; `classifyBatch` из Task 3; таблица из Task 1
- Produces: наполненная `ig_inbox`; запускается как
  `node scripts/ig-inbox-scan.mjs [сколько чатов, по умолчанию 300]`

- [ ] **Step 1: Написать скан**

Создать `scripts/ig-inbox-scan.mjs`:

```js
// Обход свежих чатов ChatPlace: кто написал последним, о чём, насколько
// это похоже на заявку. Результат кладётся в ig_inbox, страница только читает.
//
//   node scripts/ig-inbox-scan.mjs [сколько чатов, по умолчанию 300]
//
// Чат, который не менялся с прошлого скана, второй раз не разбираем: экономит
// и время, и деньги на модели.
import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { listChats, listChatMessages } from '../src/lib/chatplace.ts';
import { preClassify } from '../src/lib/ig-inbox/filter.ts';
import { classifyBatch } from '../src/lib/ig-inbox/classify.ts';

const LIMIT = Number(process.argv[2] || 300);
const prisma = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chats = (await listChats(Math.ceil(LIMIT / 50))).slice(0, LIMIT);
console.log(`чатов получено: ${chats.length}`);

// что уже разобрано и не менялось
const known = new Map(
  (await prisma.igInbox.findMany({ select: { chatId: true, lastAt: true } }))
    .map((r) => [r.chatId, r.lastAt.getTime()])
);

const rows = [];
let skipped = 0;

for (const c of chats) {
  if (known.get(c.id) === c.lastMessageAt * 1000) { skipped++; continue; }

  let msgs;
  try { msgs = await listChatMessages(c.id, 20); }
  catch (e) { console.error(`чат ${c.id}: ${e.message}`); continue; }

  const items = msgs.filter((m) => m.messageType !== 2).sort((a, b) => a.createdAt - b.createdAt);
  if (!items.length) continue;

  const last = items[items.length - 1];
  rows.push({
    chatId: c.id,
    clientId: c.clientId,
    username: null, // ник подтянем из ig_lead при чтении
    name: c.clientName,
    lastSide: last.side,
    lastText: (last.message || '').slice(0, 1000),
    lastAt: new Date(last.createdAt * 1000),
    clientMsgs: items.filter((m) => m.side === 'client').length,
    ourMsgs: items.filter((m) => m.side === 'bot').length,
  });
  await sleep(150);
  if (rows.length % 25 === 0) process.stderr.write(`\rразобрано: ${rows.length}`);
}
process.stderr.write('\n');
console.log(`новых или изменившихся: ${rows.length}, пропущено без изменений: ${skipped}`);

// Последнее слово за нами — отвечать нечего, модель не зовём.
// Мусор снимаем правилами, остальное отдаём модели пачками по 20.
const toModel = [];
for (const r of rows) {
  if (r.lastSide !== 'client') { r.kind = 'ours'; r.priority = 0; r.reason = 'последнее слово за нами'; continue; }
  if (preClassify(r.lastText) === 'reaction') { r.kind = 'reaction'; r.priority = 5; r.reason = 'реакция на контент'; continue; }
  toModel.push({ chatId: r.chatId, text: r.lastText });
}
console.log(`к модели уходит: ${toModel.length}`);

for (let i = 0; i < toModel.length; i += 20) {
  const chunk = toModel.slice(i, i + 20);
  const verdicts = await classifyBatch(chunk);
  for (const r of rows) {
    const v = verdicts.get(r.chatId);
    if (v) { r.kind = v.kind; r.priority = v.priority; r.reason = v.reason; }
  }
  process.stderr.write(`\rразмечено моделью: ${Math.min(i + 20, toModel.length)}/${toModel.length}`);
}
process.stderr.write('\n');

for (const r of rows) {
  if (!r.kind) { r.kind = 'substantive'; r.priority = 40; r.reason = 'модель не ответила'; }
  await prisma.igInbox.upsert({
    where: { chatId: r.chatId },
    create: r,
    update: r,
  });
}

const waiting = await prisma.igInbox.count({ where: { kind: { in: ['price', 'substantive'] } } });
console.log(`записано: ${rows.length}. Всего ждут ответа: ${waiting}`);
await prisma.$disconnect();
```

- [ ] **Step 2: Прогнать скан на 60 чатах**

Run: `npx tsx scripts/ig-inbox-scan.mjs 60`
Expected: строки `чатов получено: 60`, `к модели уходит: <меньше половины>`,
`записано: ...`. Ошибок ChatPlace быть не должно.

- [ ] **Step 3: Прогнать на 300 чатах**

Run: `npx tsx scripts/ig-inbox-scan.mjs 300`
Expected: проходит целиком, около двух минут. Повторный запуск той же команды
должен показать большое число в `пропущено без изменений`.

- [ ] **Step 4: Проверить критерий приёмки**

Написать разовую проверку `scripts/ig-inbox-top-check.mjs`:

```js
import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const top = await prisma.igInbox.findMany({
  where: { kind: { in: ['price', 'substantive'] } },
  orderBy: [{ priority: 'desc' }, { lastAt: 'asc' }],
  take: 15,
});
for (const r of top) console.log(`${String(r.priority).padStart(3)} ${r.kind.padEnd(12)} ${(r.name || '').slice(0, 28).padEnd(28)} ${(r.lastText || '').slice(0, 55)}`);
const hasAnna = top.some((r) => (r.name || '').includes('NEZHALSKAYA'));
console.log(hasAnna ? 'ОК: вопрос про цену в верхних 15' : 'ПРОВАЛ: заявка про цену не попала наверх');
process.exit(hasAnna ? 0 : 1);
await prisma.$disconnect();
```

Run: `npx tsx scripts/ig-inbox-top-check.mjs`
Expected: `ОК: вопрос про цену в верхних 15`.

- [ ] **Step 5: Коммит**

```bash
git add scripts/ig-inbox-scan.mjs scripts/ig-inbox-top-check.mjs
git commit -m "ig-inbox: scan chats and store the triage"
```

---

### Task 5: Чтение для страницы

**Files:**
- Create: `src/lib/ig-inbox.ts`

**Interfaces:**
- Consumes: таблица из Task 1, `prisma.igLead` (ник и статус человека)
- Produces:
  - `type InboxRow = { chatId, clientId, name, username, lastText, lastAt, waitingHours, kind, priority, reason, leadStatus, formKind, automationName }`
  - `async function getInbox(opts?: { kind?: 'all' | 'hot' }): Promise<InboxRow[]>`
    — `hot` (по умолчанию) отдаёт только `price` и `substantive`

- [ ] **Step 1: Написать модуль**

Создать `src/lib/ig-inbox.ts`:

```ts
import { prisma } from '@/lib/prisma';

// Чтение разбора входящих для страницы. Ничего не считает и никуда не ходит:
// всё уже посчитано сканом, иначе страница открывалась бы две минуты.

export type InboxRow = {
  chatId: string;
  clientId: string;
  name: string | null;
  username: string | null;
  lastText: string | null;
  lastAt: string;
  waitingHours: number;
  kind: string;
  priority: number;
  reason: string | null;
  leadStatus: string | null;
  formKind: string | null;
  automationName: string | null;
};

export async function getInbox(
  opts: { kind?: 'all' | 'hot' } = {},
): Promise<InboxRow[]> {
  const hot = opts.kind !== 'all';

  const rows = await prisma.igInbox.findMany({
    where: hot ? { kind: { in: ['price', 'substantive'] } } : {},
    orderBy: [{ priority: 'desc' }, { lastAt: 'asc' }],
    take: 300,
  });

  // Ник, статус и воронку берём из ig_lead: там человек уже заведён, если
  // приходил по кодовому слову.
  const leads = await prisma.igLead.findMany({
    where: { clientId: { in: rows.map((r) => r.clientId) } },
    select: {
      clientId: true, username: true, status: true, formKind: true, automationName: true,
    },
  });
  const byClient = new Map(leads.map((l) => [l.clientId, l]));

  const now = Date.now();
  return rows.map((r) => {
    const lead = byClient.get(r.clientId);
    return {
      chatId: r.chatId,
      clientId: r.clientId,
      name: r.name,
      username: r.username || lead?.username || null,
      lastText: r.lastText,
      lastAt: r.lastAt.toISOString(),
      waitingHours: Math.round((now - r.lastAt.getTime()) / 3_600_000),
      kind: r.kind,
      priority: r.priority,
      reason: r.reason,
      leadStatus: lead?.status ?? null,
      formKind: lead?.formKind ?? null,
      automationName: lead?.automationName ?? null,
    };
  });
}
```

- [ ] **Step 2: Проверить на живых данных**

Создать `scripts/ig-inbox-read-check.mjs`:

```js
import { config } from 'dotenv';
config({ path: '.env.local' });
import { getInbox } from '../src/lib/ig-inbox.ts';
const rows = await getInbox();
console.log(`ждут ответа: ${rows.length}`);
for (const r of rows.slice(0, 10)) {
  console.log(`${String(r.priority).padStart(3)} ${String(r.waitingHours).padStart(4)}ч ${(r.username ? '@' + r.username : r.name || '?').slice(0, 26).padEnd(26)} ${r.kind.padEnd(12)} ${(r.lastText || '').slice(0, 45)}`);
}
process.exit(rows.length ? 0 : 1);
```

Run: `npx tsx scripts/ig-inbox-read-check.mjs`
Expected: список с приоритетом, часами ожидания и ником, наверху вопрос про цену.

- [ ] **Step 3: Коммит**

```bash
git add src/lib/ig-inbox.ts scripts/ig-inbox-read-check.mjs
git commit -m "ig-inbox: read the triage for the admin page"
```

---

### Task 6: Вкладка «Ждут ответа»

**Files:**
- Create: `src/app/admin/(protected)/instagram/inbox/page.tsx`
- Create: `src/app/admin/(protected)/instagram/inbox/InboxClient.tsx`
- Modify: `src/app/admin/(protected)/instagram/IgNav.tsx` (добавить вкладку)

**Interfaces:**
- Consumes: `getInbox` из Task 5, `IgNav` из существующего раздела
- Produces: страница `/admin/instagram/inbox`

- [ ] **Step 1: Добавить вкладку в навигацию**

В `IgNav.tsx` заменить массив `TABS`:

```tsx
// Три части раздела «Инстаграм»: кому писать прямо сейчас, все люди из
// воронок ChatPlace и старая авто-ответилка на комментарии.
const TABS = [
  { href: '/admin/instagram/inbox', label: 'Ждут ответа' },
  { href: '/admin/instagram', label: 'Люди' },
  { href: '/admin/instagram/autoreply', label: 'Автоответы' },
];
```

- [ ] **Step 2: Написать страницу**

Создать `src/app/admin/(protected)/instagram/inbox/page.tsx`:

```tsx
import { getInbox } from '@/lib/ig-inbox';
import IgNav from '../IgNav';
import InboxClient from './InboxClient';

export const dynamic = 'force-dynamic';

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  let rows;

  try {
    rows = await getInbox({ kind: kind === 'all' ? 'all' : 'hot' });
  } catch (e) {
    console.error('[Ждут ответа] DB error:', e);
    return (
      <div>
        <IgNav active="/admin/instagram/inbox" />
        <p style={{ color: '#ff4444' }}>
          Разбор входящих недоступен: {String(e)}. Завести таблицу:{' '}
          <code>node scripts/ig-inbox-create-tables.mjs</code>, потом собрать данные:{' '}
          <code>npx tsx scripts/ig-inbox-scan.mjs 300</code>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180 }}>
      <IgNav active="/admin/instagram/inbox" />
      <InboxClient rows={rows} showAll={kind === 'all'} />
    </div>
  );
}
```

- [ ] **Step 3: Написать клиентскую часть**

Создать `src/app/admin/(protected)/instagram/inbox/InboxClient.tsx`:

```tsx
'use client';

import Link from 'next/link';
import type { InboxRow } from '@/lib/ig-inbox';

// Список «кому писать прямо сейчас». Сортировка приходит с сервера:
// сначала важность, внутри неё — кто ждёт дольше.

const KIND_LABEL: Record<string, string> = {
  price: 'спросил цену',
  substantive: 'по делу',
  reaction: 'реакция',
  ours: 'ответили мы',
};

function waitLabel(hours: number): string {
  if (hours < 1) return 'только что';
  if (hours < 24) return `${hours} ч`;
  const days = Math.round(hours / 24);
  return `${days} дн`;
}

export default function InboxClient({ rows, showAll }: { rows: InboxRow[]; showAll: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <h1 style={{ fontSize: '1.1rem', margin: 0 }}>
          Ждут ответа: {rows.length}
        </h1>
        <Link
          href={showAll ? '/admin/instagram/inbox' : '/admin/instagram/inbox?kind=all'}
          style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}
        >
          {showAll ? 'только по делу' : 'показать и реакции'}
        </Link>
      </div>

      {rows.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>
          Никто не ждёт. Если это странно, соберите данные заново:{' '}
          <code>npx tsx scripts/ig-inbox-scan.mjs 300</code>
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r) => (
          <div
            key={r.chatId}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.10)',
              background: r.kind === 'price' ? 'rgba(0,240,255,0.06)' : 'transparent',
            }}
          >
            <div style={{ width: 92, flexShrink: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              {waitLabel(r.waitingHours)}
              <div style={{ opacity: 0.65 }}>{KIND_LABEL[r.kind] || r.kind}</div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <strong style={{ fontSize: '0.9rem' }}>
                  {r.username ? `@${r.username}` : r.name || 'без имени'}
                </strong>
                {r.formKind && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)' }}>
                    анкета, не писать
                  </span>
                )}
                {r.automationName && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {r.automationName}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.84rem', marginTop: 3, opacity: 0.92 }}>
                {r.lastText}
              </div>
              {r.reason && (
                <div style={{ fontSize: '0.72rem', marginTop: 3, color: 'var(--text-secondary)' }}>
                  {r.reason}
                </div>
              )}
            </div>

            {r.username && (
              <a
                href={`https://instagram.com/${r.username}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', flexShrink: 0 }}
              >
                профиль
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Собрать проект**

Run: `npm run build`
Expected: сборка проходит, в списке маршрутов есть `/admin/instagram/inbox`.

- [ ] **Step 5: Посмотреть глазами**

Run: `npm run dev`, открыть `http://localhost:3000/admin/instagram/inbox`
Expected: сверху вопрос про цену от ANNA NEZHALSKAYA, у каждой строки видно,
сколько человек ждёт, вкладки переключаются.

- [ ] **Step 6: Коммит**

```bash
git add "src/app/admin/(protected)/instagram/inbox" "src/app/admin/(protected)/instagram/IgNav.tsx"
git commit -m "ig-inbox: waiting-for-reply tab in the Instagram section"
```

---

## Что остаётся за рамками этапа

- Скан по расписанию. Пока запускается руками; когда станет ясно, что список
  живой, вешается на крон.
- Кнопка «ответить» и смена статуса прямо из списка. Статусы уже есть во
  вкладке «Люди», дублировать до первой живой недели не нужно.
- Суфлёр «что писать дальше». Это этап 1 из спеки, отдельный план.
