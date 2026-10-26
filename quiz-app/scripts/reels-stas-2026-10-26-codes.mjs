// Ссылки на пробные ролики Стаса, найденные на вкладке «Reels» профиля (26.10).
// Заменяет угаданное по скриншотам: у этих версий не было code, и ежедневный
// сбор завёл бы их второй раз. «Найм» выложен 15.10, это монтаж v2, а не v3.
//
// Запуск: node scripts/reels-stas-2026-10-26-codes.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const TG = '204608959';
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const codes = [
  ['1709-6', 'DeR5NZCNPT2', '2026-10-09'],
  ['1709-4-r2', 'DeY-rtHtAAE', '2026-10-12'],
  ['v3-07-short-broll', 'De1Hxn0tBxj', '2026-10-23'],
  ['v3-06-short-gg', 'De4F2otNoB4', '2026-10-24'],
];
for (const [id, code, day] of codes) {
  await client.query(
    `UPDATE reel_versions SET code = $2, uploaded_at = $3::date, note = NULL, updated_at = now() WHERE id = $1 AND telegram_id = $4`,
    [id, code, day, TG],
  );
}

// «Найм»: v3-04-short-broll не выкладывался, вернуть в смонтированные; выложен монтаж v2.
await client.query(
  `UPDATE reel_versions SET stage = 'done', code = NULL, uploaded_at = NULL, plays = NULL, likes = NULL, comments = NULL,
          stats_at = NULL, note = NULL, updated_at = now() WHERE id = 'v3-04-short-broll' AND telegram_id = $1`,
  [TG],
);
await client.query(
  `INSERT INTO reel_versions (id, telegram_id, brief_id, reel, title, version, "order", stage, code, uploaded_at)
   VALUES ('v2-04', $1, 't2509v2', '04', 'Всегда считал, что в найме не заработать', 'начало в машине', 302, 'up', 'DehXXa5N0AS', '2026-10-15')
   ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, stage = 'up', uploaded_at = EXCLUDED.uploaded_at, updated_at = now()`,
  [TG],
);

const r = await client.query(`SELECT id, title, code FROM reel_versions WHERE telegram_id = $1 AND stage = 'up' ORDER BY uploaded_at`, [TG]);
console.table(r.rows);
await client.end();
