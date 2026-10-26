// Создаёт таблицы раздела «Штаб» напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/shtab-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS shtab_task (
  id             TEXT PRIMARY KEY,
  section        TEXT NOT NULL,
  section_order  INTEGER NOT NULL,
  grp            TEXT,
  position       INTEGER NOT NULL,
  text           TEXT NOT NULL,
  detail         TEXT,
  status         TEXT NOT NULL,
  line_date      DATE,
  done_at        TIMESTAMP(3),
  synced_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS shtab_task_section_order_position_idx ON shtab_task(section_order, position);

CREATE TABLE IF NOT EXISTS shtab_report (
  id              TEXT PRIMARY KEY,
  shift_date      DATE NOT NULL,
  title           TEXT NOT NULL,
  for_sasha       TEXT NOT NULL,
  for_strategist  TEXT,
  brief           TEXT,
  links           JSONB NOT NULL DEFAULT '[]',
  synced_at       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shtab_file (
  id          TEXT PRIMARY KEY,
  path        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  kind        TEXT NOT NULL,
  body        TEXT NOT NULL,
  aliases     TEXT[] NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMP(3) NOT NULL,
  synced_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
console.log('shtab_task, shtab_report, shtab_file готовы');
await client.end();
