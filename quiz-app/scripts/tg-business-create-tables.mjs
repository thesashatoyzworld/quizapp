// Заводит таблицы под личку рабочего аккаунта: подключение бота и переписку.
// prisma db push на этой базе нельзя: она общая с другими проектами.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS tg_business_conn (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL,
  username     TEXT,
  can_reply    BOOLEAN NOT NULL DEFAULT FALSE,
  is_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  connected_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tg_business_msg (
  id         TEXT PRIMARY KEY,
  chat_id    TEXT NOT NULL,
  side       TEXT NOT NULL,
  username   TEXT,
  name       TEXT,
  text       TEXT NOT NULL,
  lead_id    INTEGER,
  created_at TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS tg_business_msg_chat_idx ON tg_business_msg(chat_id, created_at);
CREATE INDEX IF NOT EXISTS tg_business_msg_username_idx ON tg_business_msg(username);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
for (const t of ['tg_business_conn', 'tg_business_msg']) {
  const { rows } = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
    [t],
  );
  console.log(`${t}:`, rows.map((r) => r.column_name).join(', '));
}
await client.end();
