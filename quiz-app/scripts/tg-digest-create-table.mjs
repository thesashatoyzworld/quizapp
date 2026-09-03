// Одно сообщение-сводка в чате помощника вместо ленты подсказок.
//
// Запуск: node scripts/tg-digest-create-table.mjs
//
// Помним, какое сообщение показывает очередь, чтобы обновлять его на месте,
// а не слать новое на каждую входящую реплику.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`
  CREATE TABLE IF NOT EXISTS tg_digest (
    chat_id    text PRIMARY KEY,
    message_id integer NOT NULL,
    sent_at    timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )
`);

console.log('tg_digest готова');
await db.end();
