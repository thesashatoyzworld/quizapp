// Добавляет к ig_lead колонки про анкету: кто уже оставил заявку на менторство
// или встал в лист ожидания.
//
// ⚠ НЕ использовать `prisma db push` на этой базе — она общая.
//
// Запуск: node scripts/ig-leads-add-form-columns.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
ALTER TABLE ig_lead ADD COLUMN IF NOT EXISTS form_kind       TEXT;
ALTER TABLE ig_lead ADD COLUMN IF NOT EXISTS form_name       TEXT;
ALTER TABLE ig_lead ADD COLUMN IF NOT EXISTS form_filled_at  TIMESTAMP(3);
ALTER TABLE ig_lead ADD COLUMN IF NOT EXISTS form_matched_by TEXT;
CREATE INDEX IF NOT EXISTS ig_lead_form_kind_idx ON ig_lead(form_kind);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns WHERE table_name = 'ig_lead' AND column_name LIKE 'form%' ORDER BY ordinal_position`
);
console.log('колонки анкеты:', rows.map((r) => r.column_name).join(', '));
await client.end();
