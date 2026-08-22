// Добавляет анкете колонку track: 't2' (маршрут по материалам) или 't3' (досье
// к созвону 1-1). Всё, что заведено до появления треков, менторское, поэтому
// дефолт 't3'.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/intake-add-track.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
ALTER TABLE intakes ADD COLUMN IF NOT EXISTS track TEXT NOT NULL DEFAULT 't3';
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);

const { rows } = await client.query(
  `SELECT track, count(*)::int AS n FROM intakes GROUP BY track ORDER BY track`,
);
console.log('готово, анкеты по трекам:', rows);

await client.end();
