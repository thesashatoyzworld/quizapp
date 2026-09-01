// Заводит таблицу ig_chat — ники людей из инста-директа.
// prisma db push на этой базе нельзя: она общая с другими проектами.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS ig_chat (
  chat_id         TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL,
  username        TEXT,
  name            TEXT,
  last_message_at TIMESTAMP(3) NOT NULL,
  scanned_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ig_chat_username_idx ON ig_chat(username);
CREATE INDEX IF NOT EXISTS ig_chat_last_message_idx ON ig_chat(last_message_at DESC);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'ig_chat' ORDER BY ordinal_position`
);
console.log('ig_chat готова:', rows.map((r) => r.column_name).join(', '));
await client.end();
