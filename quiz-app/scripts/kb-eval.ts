// Прогон базы знаний на реальных вопросах, без бота и без сети Telegram.
//
//   npx tsx scripts/kb-eval.ts            # весь набор
//   npx tsx scripts/kb-eval.ts --map      # только карта, без обращений к модели
//   npx tsx scripts/kb-eval.ts "вопрос"   # один свой вопрос
//
// Набор проверяет ровно то, что обещано в спеке: попадание в нужный урок,
// уважение к тарифу, честное «не знаю» и отсутствие чужих имён в ответе.

import { config } from 'dotenv';
config({ path: '.env.local' });

import { buildMap, visibleTo, renderMap, materialText } from '../src/lib/kb/map';
import { answerQuestion } from '../src/lib/kb/answer';

const T1 = { uroven: 1 };
const T2 = { uroven: 2 };

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

  const longest = [...all].sort((a, b) => materialText(b).length - materialText(a).length)[0];
  console.log(`Самый длинный материал: ${longest.slug} — ${materialText(longest).length} знаков\n`);
}

async function run(cases: Case[]) {
  let ok = 0;
  for (const c of cases) {
    const entries = visibleTo(c.tiers);
    const started = Date.now();
    const res = await answerQuestion(c.q, entries);
    const ms = Date.now() - started;

    console.log(`\n─────────────────────────────────────────────`);
    console.log(`ВОПРОС (тариф ${c.tiers.uroven}): ${c.q}`);
    console.log(`ЖДЁМ: ${c.expect}`);

    if (!res) {
      console.log(`ОТВЕТ: — ответа в материалах нет — (${ms} мс)`);
      continue;
    }

    console.log(`РАЗДЕЛ: ${res.entry.section}/${res.entry.slug}${res.block ? ` → ${res.block}` : ''}`);
    console.log(`ОТВЕТ (${ms} мс): ${res.text}`);

    if (res.entry.minTier > (c.tiers.uroven ?? 0)) {
      console.log('❌ УТЕЧКА: материал закрыт тарифом спрашивающего');
    } else {
      ok++;
    }

    const hit = NAMES.filter((n) => res.text.toLowerCase().includes(n));
    if (hit.length) console.log(`⚠ в ответе имя: ${hit.join(', ')}`);
  }
  console.log(`\n─────────────────────────────────────────────`);
  console.log(`Ответов без нарушения тарифа: ${ok} из ${cases.length}`);
}

async function main() {
  const arg = process.argv[2];
  showMap();
  if (arg === '--map') return;
  await run(arg ? [{ q: arg, tiers: T2, expect: '(свой вопрос)' }] : CASES);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
