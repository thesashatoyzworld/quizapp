// Чем кончился разговор: человек думает или ушёл.
//
// Запуск: node scripts/sales-outcome-create-table.mjs
//
// Оплату отмечать руками не нужно — она видна по выданному доступу. Руками
// ставится только то, чего в базе нет: «думает, вернуться такого-то числа» и
// «слился». Пока пометки не было, ушедший навсегда оставался в очереди
// ждущих ответа и мозолил глаза наравне с живыми.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`
  CREATE TABLE IF NOT EXISTS sales_outcome (
    chat_id   text PRIMARY KEY,
    outcome   text NOT NULL,
    reason    text,
    wake_at   timestamp,
    marked_at timestamp NOT NULL DEFAULT now(),
    marked_by text
  )
`);
await db.query(`CREATE INDEX IF NOT EXISTS sales_outcome_marked_idx ON sales_outcome (marked_at DESC)`);

console.log('sales_outcome готова');
await db.end();
