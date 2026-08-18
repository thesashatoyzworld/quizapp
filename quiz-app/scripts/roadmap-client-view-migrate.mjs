// Добавляет в roadmaps два поля под клиентский вид карты в кабинете.
//
//   client_visible — карта вообще открыта клиенту (по умолчанию нет).
//   client_intro   — строка от Саши сверху карты: зачем он на неё смотрит.
//
// Что именно клиент видит внутри карты, решает visibility на дочерних
// записях (internal | shared) — эти поля уже есть.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/roadmap-client-view-migrate.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS client_visible BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS client_intro TEXT;
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);

const check = await client.query(`
  SELECT column_name, data_type, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'roadmaps'
    AND column_name IN ('client_visible', 'client_intro')
  ORDER BY column_name
`);

console.table(check.rows);
await client.end();
