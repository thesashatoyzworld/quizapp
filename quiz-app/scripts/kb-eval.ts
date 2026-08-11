// Прогон базы знаний на реальных вопросах, без бота и без сети Telegram.
//
//   npx tsx scripts/kb-eval.ts            # весь набор
//   npx tsx scripts/kb-eval.ts --map      # только карта, без обращений к модели
//   npx tsx scripts/kb-eval.ts --window   # ловится ли нарезка по блокам
//   npx tsx scripts/kb-eval.ts "вопрос"   # один свой вопрос
//
// Набор проверяет ровно то, что обещано в спеке: попадание в нужный урок,
// уважение к тарифу, честное «не знаю» и отсутствие чужих имён в ответе.

import { config } from 'dotenv';
config({ path: '.env.local' });

import { buildMap, visibleTo, renderMap, materialText, isOpen, textAround } from '../src/lib/kb/map';
import { answerQuestion, usdOf, ZERO_USAGE, type KbUsage } from '../src/lib/kb/answer';

const T1 = { uroven: 1 };
const T2 = { uroven: 2 };
const SYNC = { sync: 0 };

interface Case {
  q: string;
  tiers: Record<string, number>;
  expect: string;
}

const CASES: Case[] = [
  { q: 'как понять, про что снимать рилсы?', tiers: T2, expect: 'смыслы или упаковка из курса' },
  { q: 'у меня не получается начать снимать, страшно', tiers: T2, expect: 'урок 02, шесть замков' },
  { q: 'что делать, если я забросил блог на месяц?', tiers: T2, expect: 'урок 03, делал но бросил' },
  { q: 'сколько раз в неделю выкладывать?', tiers: T2, expect: 'частота из курса, либо честное «нет»' },
  { q: 'как масштабироваться и нанять команду?', tiers: T1, expect: 'НЕ должен звать в разборы или созвоны' },
  { q: 'когда следующий групповой созвон?', tiers: T2, expect: 'ответа нет — дат бот не знает' },
  { q: 'что писать человеку, который пропал и не отвечает?', tiers: T2, expect: 'созвон 10.08, без имён и цифр' },
  { q: 'как продавать в переписке, чтобы не отпугнуть?', tiers: T2, expect: 'созвон, приём без имён' },
  { q: 'какой рецепт борща?', tiers: T2, expect: 'ответа нет' },
  // Воркшопы: премиум открыт с тарифа 2 и по «Синхронизации», тарифу 1 — нет.
  { q: 'как собрать лид-магнит, который приводит заявки?', tiers: T2, expect: 'воркшоп «Кэш Магниты»' },
  { q: 'как сделать запуск продукта и собрать первых клиентов?', tiers: T2, expect: 'воркшоп «Солдаут»' },
  { q: 'как собрать лид-магнит, который приводит заявки?', tiers: T1, expect: 'воркшопы тарифу 1 закрыты' },
  // Делегируется монтаж и обложки, а не съёмка — вопрос сформулирован по материалу.
  { q: 'как найти монтажёра и что ему делегировать?', tiers: SYNC, expect: 'воркшоп «Контент чужими руками» по «Синхронизации»' },
];

const NAMES = ['даш', 'азамат', 'марат', 'евген', 'костя', 'вася', 'сев', 'наташ', 'инна', 'лилит'];

function showMap() {
  const all = buildMap();
  const bySection = new Map<string, number>();
  for (const e of all) bySection.set(e.section, (bySection.get(e.section) ?? 0) + 1);

  console.log('КАРТА\n');
  for (const [section, n] of bySection) console.log(`  ${section.padEnd(10)} ${n}`);
  console.log(`  ${'ВСЕГО'.padEnd(10)} ${all.length}\n`);

  const t1 = renderMap(visibleTo(T1));
  const t2 = renderMap(visibleTo(T2));
  console.log(`Оглавление тарифа 1: ${t1.length} знаков, ≈${Math.round(t1.length / 3)} токенов`);
  console.log(`Оглавление тарифа 2: ${t2.length} знаков, ≈${Math.round(t2.length / 3)} токенов`);
  console.log('  (минимум для prompt caching на Haiku 4.5 — 4096 токенов)\n');

  const empty = all.filter((e) => !materialText(e).trim());
  console.log(empty.length ? `⚠ пустой текст: ${empty.map((e) => e.slug).join(', ')}` : '✓ у всех записей есть текст');

  const lengths = all.map((e) => materialText(e).length).sort((a, b) => b - a);
  const avg = Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length);
  const longest = [...all].sort((a, b) => materialText(b).length - materialText(a).length)[0];
  console.log(`Самый длинный материал: ${longest.slug} — ${lengths[0]} знаков`);
  console.log(`Средний материал: ${avg} знаков ≈ ${Math.round(avg / 3)} токенов (это второе обращение)\n`);
}

/**
 * Работает ли нарезка по блокам: заголовки из оглавления ищутся в тексте
 * материала. Промахи означают, что длинный материал поедет целиком —
 * не поломка, но втрое дороже. Гонять после правок разметки материалов.
 */
function showWindows() {
  let long = 0;
  let hit = 0;
  let miss = 0;

  for (const e of buildMap()) {
    const text = materialText(e);
    if (text.length <= 8_000) continue;
    long += 1;

    const missed = e.headings.filter((h) => !textAround(text, h));
    const found = e.headings.length - missed.length;
    hit += found;
    miss += missed.length;

    const win = e.headings.length && found ? textAround(text, e.headings.find((h) => textAround(text, h))!)!.length : 0;
    const flag = missed.length ? '⚠' : ' ';
    console.log(
      `${flag} ${`${e.section}/${e.slug}`.padEnd(42)} ${String(text.length).padStart(6)} знаков → окно ${String(win).padStart(5)} · блоков ${found}/${e.headings.length}`,
    );
    if (missed.length) console.log(`   не нашлись: ${missed.slice(0, 4).join(' | ')}`);
  }

  console.log(`\nДлинных материалов: ${long}. Заголовков найдено ${hit}, промахов ${miss}.`);
  console.log('Промах = материал уедет целиком, ответ не пострадает, но вопрос дороже.\n');
}

function sumUsage(a: KbUsage, b: KbUsage): KbUsage {
  return {
    input: a.input + b.input,
    cacheRead: a.cacheRead + b.cacheRead,
    cacheWrite: a.cacheWrite + b.cacheWrite,
    output: a.output + b.output,
  };
}

function usageLine(u: KbUsage): string {
  const cents = (usdOf(u) * 100).toFixed(3);
  return `вход ${u.input} · из кэша ${u.cacheRead} · в кэш ${u.cacheWrite} · выход ${u.output} → ${cents}¢`;
}

async function run(cases: Case[]) {
  let ok = 0;
  let total = ZERO_USAGE;

  for (const c of cases) {
    const entries = visibleTo(c.tiers);
    const started = Date.now();
    const { answer: res, usage } = await answerQuestion(c.q, entries);
    const ms = Date.now() - started;
    total = sumUsage(total, usage);

    console.log(`\n─────────────────────────────────────────────`);
    console.log(`ВОПРОС (доступ ${JSON.stringify(c.tiers)}): ${c.q}`);
    console.log(`ЖДЁМ: ${c.expect}`);
    console.log(`ТОКЕНЫ: ${usageLine(usage)}`);

    if (!res) {
      // Честное «не знаю» — тоже правильный исход, если его и ждали.
      console.log(`ОТВЕТ: — ответа в материалах нет — (${ms} мс)`);
      if (c.expect.includes('нет')) ok++;
      else console.log('⚠ ждали ответ, а бот промолчал');
      continue;
    }

    console.log(`РАЗДЕЛ: ${res.entry.section}/${res.entry.slug}${res.block ? ` → ${res.block}` : ''}`);
    console.log(`ОТВЕТ (${ms} мс): ${res.text}`);

    let clean = true;

    if (!isOpen(res.entry, c.tiers)) {
      console.log('❌ УТЕЧКА: материал закрыт доступом спрашивающего');
      clean = false;
    }

    // Имена ищем и в ответе, и в названии блока — блок уходит человеку вместе с ответом.
    const both = `${res.text} ${res.block ?? ''}`.toLowerCase();
    const hit = NAMES.filter((n) => both.includes(n));
    if (hit.length) {
      console.log(`❌ ИМЯ участника в выдаче: ${hit.join(', ')}`);
      clean = false;
    }

    if (clean) ok++;
  }
  console.log(`\n─────────────────────────────────────────────`);
  console.log(`Чистых исходов: ${ok} из ${cases.length}`);
  console.log(`Токены за прогон: ${usageLine(total)}`);
  const perQuestion = usdOf(total) / cases.length;
  console.log(
    `Средний вопрос: ${(perQuestion * 100).toFixed(3)}¢ → ${(perQuestion * 100 * 30).toFixed(2)} $/мес при сотне вопросов в день`,
  );
}

async function main() {
  const arg = process.argv[2];
  showMap();
  if (arg === '--map') return;
  if (arg === '--window') return showWindows();
  await run(arg ? [{ q: arg, tiers: T2, expect: '(свой вопрос)' }] : CASES);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
