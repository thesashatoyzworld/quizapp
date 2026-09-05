// Таблицы учёта выручки. Создаём руками, а НЕ через prisma db push:
// база общая, push сносит таблицы, которых нет в схеме (см. dfv_leads).
//
//   node scripts/revenue-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) { console.error('No DIRECT_URL/DATABASE_URL'); process.exit(1); }

const statements = [
  `CREATE TABLE IF NOT EXISTS "revenue_entries" (
    "id" TEXT NOT NULL,
    "paid_at" DATE NOT NULL,
    "amount" NUMERIC(12,2) NOT NULL,
    "payout" NUMERIC(12,2),
    "who" TEXT,
    "product" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'prodamus',
    "order_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "revenue_entries_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "revenue_entries_paid_at_idx" ON "revenue_entries"("paid_at")`,
  // Уникальный order_id защищает от двойного импорта одного платежа.
  // Частичный индекс: у ручных оплат order_id пустой, их может быть сколько угодно.
  `CREATE UNIQUE INDEX IF NOT EXISTS "revenue_entries_order_id_key"
     ON "revenue_entries"("order_id") WHERE "order_id" IS NOT NULL`,
  `CREATE TABLE IF NOT EXISTS "revenue_goals" (
    "month" TEXT NOT NULL,
    "target" NUMERIC(12,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "revenue_goals_pkey" PRIMARY KEY ("month")
  )`,
];

const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const sql of statements) {
  await c.query(sql);
  console.log('OK:', sql.split('\n')[0].slice(0, 64));
}
await c.end();
