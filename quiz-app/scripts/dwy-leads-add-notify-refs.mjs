// Куда бот отправил уведомление об этой заявке: [{ chatId, messageId }].
// Нужно, чтобы нажатие кнопки в одном чате перерисовало кнопки и во втором —
// иначе у Саши на личном и на рабочем аккаунте разные статусы под одной заявкой.
//
// ⚠ НЕ использовать `prisma db push` на этой базе — она общая.
//
// Запуск: node scripts/dwy-leads-add-notify-refs.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS notify_refs JSONB;`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'dwy_leads' AND column_name = 'notify_refs'`
);
console.log('колонка:', rows);
await client.end();
