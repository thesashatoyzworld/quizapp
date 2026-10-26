// Переносит доску роликов Стаса из артефакта (seed.json) в кабинет.
//
// Запуск:
//   node scripts/reels-seed-stas.mjs <путь к seed.json> <папка с HTML ТЗ>
//
// Идемпотентно: id берутся из doc_id артефакта, повторный запуск перезаписывает
// те же строки (и этапы версий тоже, так что после живых отметок не гонять).
// Файл ТЗ 'tz/X.html' ищется как <папка>/X.html.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { readFileSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';

const TELEGRAM_ID = '204608959';
const CLIENT_NAME = 'Стас';
const IG_HANDLE = 'stasskozin';

const [seedPath, briefsDir] = process.argv.slice(2);
if (!seedPath || !briefsDir) {
  console.error('нужно: node scripts/reels-seed-stas.mjs <seed.json> <папка с HTML ТЗ>');
  process.exit(1);
}

const docs = JSON.parse(readFileSync(seedPath, 'utf8'));
const briefs = docs.filter((d) => d.collection === 'tz');
const versions = docs.filter((d) => d.collection === 'versions');

// «17.10» → 2026-10-17: год берём из даты выкладки.
function statsAt(v) {
  if (!v.statsAt) return null;
  const [dd, mm] = v.statsAt.split('.');
  const year = (v.uploadedAt || '2026').slice(0, 4);
  return `${year}-${mm}-${dd}T00:00:00Z`;
}

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

await client.query(
  `INSERT INTO reel_spaces (telegram_id, client_name, ig_handle) VALUES ($1, $2, $3)
   ON CONFLICT (telegram_id) DO UPDATE SET client_name = EXCLUDED.client_name, ig_handle = EXCLUDED.ig_handle, updated_at = now()`,
  [TELEGRAM_ID, CLIENT_NAME, IG_HANDLE],
);

for (const { doc_id: id, data: b } of briefs) {
  const file = b.file ? join(briefsDir, basename(b.file)) : null;
  const html = file && existsSync(file) ? readFileSync(file, 'utf8') : null;
  if (file && !html) console.warn(`нет файла ТЗ: ${file}`);
  const label = versions.find((v) => v.data.tz === id)?.data.tzLabel ?? null;
  await client.query(
    `INSERT INTO reel_briefs (id, telegram_id, "order", title, label, summary, state, state_label, html)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET "order" = EXCLUDED."order", title = EXCLUDED.title, label = EXCLUDED.label,
       summary = EXCLUDED.summary, state = EXCLUDED.state, state_label = EXCLUDED.state_label,
       html = COALESCE(EXCLUDED.html, reel_briefs.html), updated_at = now()`,
    [id, TELEGRAM_ID, b.order ?? 0, b.title, label, b.summary ?? null, b.state ?? 'wait', b.stateLabel ?? null, html],
  );
}

for (const { doc_id: id, data: v } of versions) {
  await client.query(
    `INSERT INTO reel_versions (id, telegram_id, brief_id, reel, title, version, "order", stage, plan_date,
                                code, uploaded_at, plays, likes, comments, stats_at, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     ON CONFLICT (id) DO UPDATE SET brief_id = EXCLUDED.brief_id, reel = EXCLUDED.reel, title = EXCLUDED.title,
       version = EXCLUDED.version, "order" = EXCLUDED."order", stage = EXCLUDED.stage, plan_date = EXCLUDED.plan_date,
       code = EXCLUDED.code, uploaded_at = EXCLUDED.uploaded_at, plays = EXCLUDED.plays, likes = EXCLUDED.likes,
       comments = EXCLUDED.comments, stats_at = EXCLUDED.stats_at, note = EXCLUDED.note, updated_at = now()`,
    [id, TELEGRAM_ID, v.tz, String(v.reel), v.title, v.version ?? null, v.order ?? 0, v.stage ?? 'tz', v.planDate ?? null,
      v.code ?? null, v.uploadedAt ?? null, v.plays ?? null, v.likes ?? null, v.comments ?? null, statsAt(v), v.note ?? null],
  );
}

const check = await client.query(
  `SELECT (SELECT count(*) FROM reel_briefs WHERE telegram_id = $1) AS briefs,
          (SELECT count(*) FROM reel_briefs WHERE telegram_id = $1 AND html IS NOT NULL) AS with_html,
          (SELECT count(*) FROM reel_versions WHERE telegram_id = $1) AS versions,
          (SELECT count(*) FROM reel_versions WHERE telegram_id = $1 AND stage = 'up') AS up,
          (SELECT count(*) FROM reel_versions WHERE telegram_id = $1 AND stats_at IS NOT NULL) AS with_stats`,
  [TELEGRAM_ID],
);
console.log('готово:');
console.table(check.rows);
await client.end();
