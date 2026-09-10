// Размечает активные доступы по потоку ведения: 'lichka' (веду один на один),
// 'group' (поток «делаем вместе»), 'service' (мои же и партнёрские доступы —
// в счёт клиентов не идут). Тариф 2 — отдельная категория, ему track не нужен,
// но и его можно пометить 'service', если доступ служебный.
//
// Первичная разметка идёт по строке source, которой выдавался доступ:
//   manual-owner / manual-sasha-browser / partnership → service
//   1na1 / mentorship / personal                      → lichka
//   всё остальное у t3 (group, веб-оплата, deal-ссылка) → group
// Дальше поток правится руками в /admin/clients, скрипт чужую разметку не трёт.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/access-add-track.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`ALTER TABLE product_access ADD COLUMN IF NOT EXISTS track TEXT`);

// Заполняем только пустые: то, что оператор уже поправил в админке, остаётся.
await client.query(`
  UPDATE product_access SET track = CASE
    WHEN source ILIKE '%owner%' OR source ILIKE '%sasha-browser%' OR source ILIKE '%partnership%' THEN 'service'
    WHEN source ILIKE '%1na1%' OR source ILIKE '%mentorship%' OR source ILIKE '%personal%' THEN 'lichka'
    WHEN product_slug = 'uroven-t3' THEN 'group'
    ELSE NULL
  END
  WHERE track IS NULL AND product_slug IN ('uroven-t2', 'uroven-t3')
`);

const { rows } = await client.query(`
  SELECT product_slug, COALESCE(track, '—') AS track, count(*)::int AS n
  FROM product_access WHERE status = 'active' AND product_slug IN ('uroven-t2','uroven-t3')
  GROUP BY 1, 2 ORDER BY 1, 2
`);
console.log('готово, активные доступы по потокам:');
console.table(rows);

await client.end();
