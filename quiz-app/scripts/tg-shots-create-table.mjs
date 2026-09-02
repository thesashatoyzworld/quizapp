// Таблица под скриншоты переписок: телеграм шлёт альбом по одному апдейту
// на картинку, и собрать их обратно можно только через общее хранилище.
// prisma db push на этой базе нельзя: она общая с другими проектами.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS tg_shot (
  id         TEXT PRIMARY KEY,
  group_id   TEXT,
  chat_id    TEXT NOT NULL,
  file_id    TEXT NOT NULL,
  caption    TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS tg_shot_group_idx ON tg_shot(group_id, created_at);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'tg_shot' ORDER BY ordinal_position`,
);
console.log('tg_shot:', rows.map((r) => r.column_name).join(', '));
await client.end();
