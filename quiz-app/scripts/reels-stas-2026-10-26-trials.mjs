// Пробные ролики Стаса по его скриншотам экрана «Пробное видео Reels» (прислал 24.10).
// Ссылок на новые он не присылал, поэтому code пустой и цифры ручные, statsAt = 24.10.
// Когда Стас отметит «выложил» со ссылкой, дальше цифры обновляет крон.
//
// Запуск: node scripts/reels-stas-2026-10-26-trials.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const TG = '204608959';
const AT = '2026-10-24T00:00:00Z';
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

// Уже выложенные: свежие просмотры со скриншота.
const known = { '1709-2': 24300, '1709-4': 16600, '1709-1': 2245, 'v2-07-old': 4589, 'v2-03': 1642 };
for (const [id, plays] of Object.entries(known)) {
  await client.query(`UPDATE reel_versions SET plays = $2, stats_at = $3, updated_at = now() WHERE id = $1 AND telegram_id = $4`, [id, plays, AT, TG]);
}

// Выложены, но ссылки нет. Версию угадываем по первому кадру на скриншоте.
const posted = [
  ['1709-6', 610, null],
  ['v3-07-short-broll', 1725, 'Первый кадр с бутылкой. Стас 25.10: больше не выкладываем, перезапуск'],
  ['v3-04-short-broll', 1985, 'Первый кадр в машине. Короткая или длинная, по скриншоту не видно'],
  ['v3-06-short-gg', 0, 'Только выложен. Короткая или длинная, по скриншоту не видно'],
];
for (const [id, plays, note] of posted) {
  await client.query(
    `UPDATE reel_versions SET stage = 'up', plays = $2, stats_at = $3, plan_date = NULL,
            uploaded_at = COALESCE(uploaded_at, $6::date), note = COALESCE($5, note), updated_at = now()
      WHERE id = $1 AND telegram_id = $4`,
    [id, plays, AT, TG, note, AT.slice(0, 10)],
  );
}

// Повторная выкладка «Первыми ушли» отдельным пробным роликом.
await client.query(
  `INSERT INTO reel_versions (id, telegram_id, brief_id, reel, title, version, "order", stage, uploaded_at, plays, stats_at, note)
   VALUES ('1709-4-r2', $1, 't1709', '4', 'Первыми ушли те, кто хлопал громче всех', 'повтор', 104, 'up', $3::date, 8115, $2, 'Повторная выкладка')
   ON CONFLICT (id) DO UPDATE SET plays = EXCLUDED.plays, stats_at = EXCLUDED.stats_at, updated_at = now()`,
  [TG, AT, AT.slice(0, 10)],
);

const r = await client.query(
  `SELECT title, version, plays FROM reel_versions WHERE telegram_id = $1 AND stage = 'up' ORDER BY plays DESC NULLS LAST`, [TG]);
console.table(r.rows);
console.log('итого', r.rows.reduce((s, x) => s + (x.plays ?? 0), 0));
await client.end();
