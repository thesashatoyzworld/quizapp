// Budget expenses table for /admin/byudzhet. Created by hand, NOT via
// prisma db push: the database is shared and push drops unknown tables.
//
//   node scripts/budget-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) { console.error('No DIRECT_URL/DATABASE_URL'); process.exit(1); }

const statements = [
  `CREATE TABLE IF NOT EXISTS "budget_expenses" (
    "id" TEXT NOT NULL,
    "spent_at" DATE NOT NULL,
    "amount" NUMERIC(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "merchant" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "note" TEXT,
    "fingerprint" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "budget_expenses_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "budget_expenses_spent_at_idx" ON "budget_expenses"("spent_at")`,
  // Same operation seen on two overlapping screenshots must land once.
  `CREATE UNIQUE INDEX IF NOT EXISTS "budget_expenses_fingerprint_key"
     ON "budget_expenses"("fingerprint") WHERE "fingerprint" IS NOT NULL`,
];

const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const sql of statements) {
  await c.query(sql);
  console.log('OK:', sql.split('\n')[0].slice(0, 64));
}
const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'budget_expenses' ORDER BY ordinal_position`);
console.log(r.rows.map((x) => `${x.column_name}:${x.data_type}`).join(', '));
const n = await c.query(`SELECT count(*)::int AS n FROM budget_expenses`);
console.log('rows:', n.rows[0].n);
await c.end();
