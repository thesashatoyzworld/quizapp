// Seeds «Студия»: 12 trial reels from the 08.11 brief (4 edits × 3 copies)
// and the «Что работает» rules. Idempotent: fixed ids, existing rows are left
// as they are (Danya may have moved them on already).
//
// Run: node scripts/studio-seed.mjs [path to brief html]
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import pg from 'pg';

const BRIEF = process.argv[2] ||
  '/Users/sashatoyz/Documents/ClaudeCode/Projects/GSD-BRAND/clients/sasha/reels-trial-2026-10-20/semya-2026-11-07/TZ-Danya-rodnye-12-2026-11-08.html';
const html = fs.readFileSync(BRIEF, 'utf8');

const VARIANTS = [
  { variant: 'mama-vyrez', title: 'Мама: вырез 13,3–25,0', base: 'DfPdRztO_E7',
    text: 'Основа DfPdRztO_E7. Вырезать 13,3–25,0 с, плашку и призыв оставить. Копии уникализировать без нового начала и рамки.' },
  { variant: 'ded-plashka', title: 'Дед: плашка „У каждого есть дед, которого невозможно впечатлить"', base: 'DfKTYs8OMed',
    text: 'Основа DfKTYs8OMed. Монтаж не трогаем, меняем только плашку в начале.' },
  { variant: 'semya-celye-frazy', title: 'Вся семья: целые фразы, призыв после денег', base: 'Dfcqv_OuC4N',
    text: 'Пересборка из Dfcqv_OuC4N: каждый договаривает фразу на своём лице, призыв после денег.' },
  { variant: 'babushka-v5', title: 'Бабушка v5: перезалив', base: 'DfAegdQOoxt',
    text: 'Перезалив DfAegdQOoxt.', copies: ['сабы без зеркала', 'другие сабы', 'зеркало + фильтр'] },
];

const RULES = [
  ['Новое начало при перезаливе не делать', '0 и 555 просмотров в двух заливках, 24-26.10'],
  ['Рамку на фоне не делать', '5 из 5 заливок ниже обычных копий, 28-29.10'],
  ['Работает уникализация: новые сабы без зеркала, зеркало + фильтр, вырез куска', 'v3 44 тыс., De9iQf7uP-i 19 тыс., v5 70 тыс.'],
  ['Призыв с кодовым словом голосом не резать', 'без него 0-5 комментариев и 1-4 подписки, 21.10'],
  ['Призыв после денег даёт больше подписок, до денег больше охвата', '7,8 против 4,8 подписки на 1000, 27.10'],
  ['Судить правку по группе копий, не по одной заливке', 'та же открывашка дала 141 и 3,3 тыс.; v3 22,8 тыс. против v4 2,3 тыс.'],
  ['В одной правке менять одну вещь', 'решение Саши 08.11'],
];

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

let items = 0;
for (const v of VARIANTS) {
  for (let n = 1; n <= 3; n++) {
    const copy = v.copies?.[n - 1];
    const r = await client.query(
      `INSERT INTO studio_items (id, kind, title, variant, copy_no, stage, brief_text, brief_html, author, updated_at)
       VALUES ($1, 'reel', $2, $3, $4, 'edit', $5, $6, 'sasha', CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`,
      [`seed-${v.variant}-${n}`, v.title, v.variant, n, copy ? `${v.text} Копия ${n}: ${copy}.` : v.text, html],
    );
    items += r.rowCount;
  }
}

let rules = 0;
for (const [i, [text, evidence]] of RULES.entries()) {
  const r = await client.query(
    `INSERT INTO studio_rules (id, kind, text, evidence, "order", updated_at)
     VALUES ($1, 'reel', $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING`,
    [`seed-rule-${i + 1}`, text, evidence, i + 1],
  );
  rules += r.rowCount;
}

const total = await client.query(`SELECT (SELECT count(*) FROM studio_items) AS items, (SELECT count(*) FROM studio_rules) AS rules`);
console.log(`добавлено: карточек ${items}, правил ${rules}; всего:`, total.rows[0]);
await client.end();
