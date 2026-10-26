// Создаёт таблицу диалогов Лёхи напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/leha-dialog-create-table.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS leha_dialog (
  chat_id         TEXT PRIMARY KEY,
  lead_id         INTEGER,
  username        TEXT,
  name            TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  due_at          TIMESTAMP(3),
  draft           TEXT,
  note            TEXT,
  last_sent_text  TEXT,
  day_start       TIMESTAMP(3),
  day_count       INTEGER NOT NULL DEFAULT 0,
  admin_chat_id   TEXT,
  admin_msg_id    INTEGER,
  prompt_msg_id   INTEGER,
  stop_reason     TEXT,
  enabled_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS leha_dialog_prompt_msg_id_idx ON leha_dialog(prompt_msg_id);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
console.log('leha_dialog готова');
await client.end();
