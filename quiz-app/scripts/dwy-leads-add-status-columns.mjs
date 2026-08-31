// Добавляет к dwy_leads колонки работы с заявкой: статус, заметка, кто менял.
//
// Своя таблица статусов (lead_status) тут не годится: она ключуется по
// telegram_id, а в анкете с сайта его нет ни у одной из записей — человек
// приходит из шапки профиля, без Telegram-логина.
//
// ⚠ НЕ использовать `prisma db push` на этой базе — она общая.
//
// Запуск: node scripts/dwy-leads-add-status-columns.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'new';
ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS note       TEXT;
ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS dwy_leads_status_idx     ON dwy_leads(status);
CREATE INDEX IF NOT EXISTS dwy_leads_created_at_idx ON dwy_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS dwy_leads_username_idx   ON dwy_leads(lower(username));
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_name = 'dwy_leads' AND column_name IN ('status','note','updated_by','updated_at')
   ORDER BY ordinal_position`
);
console.log('колонки работы с заявкой:', rows.map((r) => r.column_name).join(', '));
await client.end();
