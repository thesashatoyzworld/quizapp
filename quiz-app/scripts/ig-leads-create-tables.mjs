// Создаёт таблицу лидов Instagram напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/ig-leads-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS ig_lead (
  id              TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL,
  username        TEXT,
  name            TEXT,
  automation_id   TEXT NOT NULL,
  automation_name TEXT,
  keyword         TEXT,
  first_seen_at   TIMESTAMP(3) NOT NULL,
  last_event_at   TIMESTAMP(3) NOT NULL,
  chat_id         TEXT,
  chat_status     TEXT,
  chat_handler    TEXT,
  status          TEXT NOT NULL DEFAULT 'new',
  note            TEXT,
  updated_by      TEXT,
  synced_at       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ig_lead_client_automation_key ON ig_lead(client_id, automation_id);
CREATE INDEX IF NOT EXISTS ig_lead_automation_idx ON ig_lead(automation_id);
CREATE INDEX IF NOT EXISTS ig_lead_status_idx ON ig_lead(status);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'ig_lead' ORDER BY ordinal_position`
);
console.log('ig_lead:', rows.map((r) => r.column_name).join(', '));
await client.end();
