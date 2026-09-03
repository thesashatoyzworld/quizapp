// Правки Саши как учебный материал.
//
// Запуск: node scripts/sales-corrections-create-table.mjs
//
// Когда перед отправкой текст правят руками, разница между предложенным и
// отправленным — самый честный сигнал, что не так с промптом. Складываем пары
// и подмешиваем свежие в следующий разбор.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`
  CREATE TABLE IF NOT EXISTS sales_correction (
    id         text PRIMARY KEY,
    chat_id    text NOT NULL,
    suggested  text NOT NULL,
    sent       text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )
`);
await db.query(`CREATE INDEX IF NOT EXISTS sales_correction_created_idx ON sales_correction (created_at DESC)`);

console.log('sales_correction готова');
await db.end();
