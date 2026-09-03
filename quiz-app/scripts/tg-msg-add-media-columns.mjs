// Две колонки под медиа в личной переписке.
//
// Запуск: node scripts/tg-msg-add-media-columns.mjs
//
// ⛔ Через prisma db push нельзя: база общая, push сносит чужие таблицы.
//
// media_type — voice | photo | video | file, media_ref — где лежит исходник:
// путь внутри выгрузки Telegram Desktop или file_id, если сообщение пришло
// живым апдейтом. Нужен, чтобы голосовое можно было расшифровать позже:
// в text до расшифровки стоит заглушка вида «[голосовое 00:38]».
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`
  ALTER TABLE tg_business_msg
    ADD COLUMN IF NOT EXISTS media_type text,
    ADD COLUMN IF NOT EXISTS media_ref  text
`);

const cols = await db.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'tg_business_msg' ORDER BY ordinal_position
`);
console.log('колонки:', cols.rows.map((r) => r.column_name).join(', '));
await db.end();
