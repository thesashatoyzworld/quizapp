// Создаёт таблицу черновиков Лёхи напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/leha-create-table.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS leha_draft (
  id             TEXT PRIMARY KEY,
  lead_id        INTEGER NOT NULL UNIQUE,
  chat_id        TEXT NOT NULL,
  username       TEXT,
  name           TEXT,
  status         TEXT NOT NULL DEFAULT 'queued',
  due_at         TIMESTAMP(3) NOT NULL,
  draft          TEXT,
  note           TEXT,
  sent_text      TEXT,
  mode           TEXT NOT NULL DEFAULT 'shadow',
  admin_chat_id  TEXT,
  admin_msg_id   INTEGER,
  prompt_msg_id  INTEGER,
  created_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at     TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS leha_draft_due_at_idx ON leha_draft(due_at);
CREATE INDEX IF NOT EXISTS leha_draft_chat_id_status_idx ON leha_draft(chat_id, status);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
console.log('leha_draft готова');
await client.end();
