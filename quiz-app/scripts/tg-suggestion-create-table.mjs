// Варианты ответа, под которыми стоит кнопка «отправить».
// В callback_data текст не унести — там 64 байта, поэтому вариант живёт
// в таблице, а кнопка несёт только его id.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS tg_suggestion (
  id         TEXT PRIMARY KEY,
  conn_id    TEXT NOT NULL,
  chat_id    TEXT NOT NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at    TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS tg_suggestion_chat_idx ON tg_suggestion(chat_id, created_at);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'tg_suggestion' ORDER BY ordinal_position`,
);
console.log('tg_suggestion:', rows.map((r) => r.column_name).join(', '));
await client.end();
