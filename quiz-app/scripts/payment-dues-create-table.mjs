// График платежей по прайс-ссылкам. Создаём руками, а НЕ через prisma db push:
// база общая, push сносит таблицы, которых нет в схеме (см. dfv_leads).
//
//   node scripts/payment-dues-create-table.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) { console.error('No DIRECT_URL/DATABASE_URL'); process.exit(1); }

const statements = [
  `CREATE TABLE IF NOT EXISTS "payment_dues" (
    "id" TEXT NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "who" TEXT,
    "deal_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "order_id" TEXT,
    "reminded_before_at" TIMESTAMP(3),
    "reminded_due_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_dues_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "payment_dues_status_due_at_idx" ON "payment_dues"("status", "due_at")`,
  `CREATE INDEX IF NOT EXISTS "payment_dues_telegram_id_deal_id_idx" ON "payment_dues"("telegram_id", "deal_id")`,
];

const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const s of statements) await c.query(s);
console.log('payment_dues готова');
await c.end();
