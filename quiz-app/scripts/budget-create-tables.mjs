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
  // Uploaded bank screenshots waiting for the VPS worker (services/budget-shots).
  `CREATE TABLE IF NOT EXISTS "budget_shots" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "result" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "processed_at" TIMESTAMPTZ,
    CONSTRAINT "budget_shots_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "budget_shots_status_idx" ON "budget_shots"("status", "created_at")`,
];

const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const sql of statements) {
  await c.query(sql);
  console.log('OK:', sql.split('\n')[0].slice(0, 64));
}
for (const t of ['budget_expenses', 'budget_shots']) {
  const r = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [t]);
  const n = await c.query(`SELECT count(*)::int AS n FROM ${t}`);
  console.log(t, r.rows.map((x) => `${x.column_name}:${x.data_type}`).join(', '), 'rows:', n.rows[0].n);
}
await c.end();
