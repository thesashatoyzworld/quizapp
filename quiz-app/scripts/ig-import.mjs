// Заливает разобранный контент клиента в админку.
//
// Источник: GSD-BRAND/scripts/ig-monitor/data/<handle>/classified.json —
// его собирает конвейер pull → analyze → classify.
//
// Запуск: node scripts/ig-import.mjs azamat.gimaev [client-slug]
//         GSD_BRAND_PATH=... node scripts/ig-import.mjs azamat.gimaev
//
// Повторный запуск не плодит дубли: сверка по shortcode, свежие цифры
// просмотров и уточнённый разбор перезаписывают старые.
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const handle = (process.argv[2] || '').replace(/^@/, '');
if (!handle) {
  console.error('Usage: node scripts/ig-import.mjs <handle> [client-slug]');
  process.exit(1);
}

const gsd = process.env.GSD_BRAND_PATH || path.resolve(process.cwd(), '../../GSD-BRAND');
const file = path.join(gsd, 'scripts', 'ig-monitor', 'data', handle, 'classified.json');
if (!fs.existsSync(file)) {
  console.error(`Нет разбора: ${file}\nСначала прогони pull → analyze → classify в GSD-BRAND.`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const slug = process.argv[3] || data.slug || null;

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

let saved = 0;
for (const p of data.posts) {
  const v = p.verdict || {};
  await db.query(
    `INSERT INTO ig_posts (id, handle, slug, shortcode, url, type, posted_at, caption, speech,
       plays, likes, comments, theme, format, purpose, hook, cta, leads_to, on_route, why, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, now())
     ON CONFLICT (shortcode) DO UPDATE SET
       handle=EXCLUDED.handle, slug=COALESCE(EXCLUDED.slug, ig_posts.slug),
       url=EXCLUDED.url, type=EXCLUDED.type, posted_at=EXCLUDED.posted_at,
       caption=EXCLUDED.caption, speech=EXCLUDED.speech,
       plays=EXCLUDED.plays, likes=EXCLUDED.likes, comments=EXCLUDED.comments,
       theme=EXCLUDED.theme, format=EXCLUDED.format, purpose=EXCLUDED.purpose,
       hook=EXCLUDED.hook, cta=EXCLUDED.cta, leads_to=EXCLUDED.leads_to,
       on_route=EXCLUDED.on_route, why=EXCLUDED.why, updated_at=now()`,
    [
      randomUUID(), handle, slug, p.shortcode, p.url, p.type, new Date(p.postedAt),
      p.caption || null, p.speech || null,
      p.plays ?? null, p.likes ?? null, p.comments ?? null,
      v['тема'] || null, v['формат'] || null, v['назначение'] || null,
      v['хук'] || null, v['cta'] || null, v['ведёт'] || null,
      typeof v['по_маршруту'] === 'boolean' ? v['по_маршруту'] : null,
      v['почему'] || null,
    ]
  );
  saved++;
}

const { rows } = await db.query(
  `SELECT count(*)::int AS n, min(posted_at)::date AS c, max(posted_at)::date AS d FROM ig_posts WHERE handle=$1`,
  [handle]
);
console.log(`@${handle}: залито ${saved}, всего в базе ${rows[0].n} (${rows[0].c} — ${rows[0].d})`);
console.log('смотреть: /admin/content');

await db.end();
