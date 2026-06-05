// Безопасное создание ТОЛЬКО таблицы product_access на проде.
// НЕ используем prisma db push — он дропнул бы dfv_leads (дрейф схемы).
// Идемпотентно: IF NOT EXISTS везде, FK через guard.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) { console.error('No DIRECT_URL/DATABASE_URL'); process.exit(1); }

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const statements = [
  `CREATE TABLE IF NOT EXISTS "product_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "telegram_id" BIGINT,
    "product_slug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT,
    "period" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_access_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "product_access_telegram_id_idx" ON "product_access"("telegram_id")`,
  `CREATE INDEX IF NOT EXISTS "product_access_product_slug_idx" ON "product_access"("product_slug")`,
  `CREATE INDEX IF NOT EXISTS "product_access_status_idx" ON "product_access"("status")`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = 'product_access_user_id_fkey'
     ) THEN
       ALTER TABLE "product_access"
         ADD CONSTRAINT "product_access_user_id_fkey"
         FOREIGN KEY ("user_id") REFERENCES "users"("id")
         ON DELETE SET NULL ON UPDATE CASCADE;
     END IF;
   END $$`,
];

const main = async () => {
  await client.connect();
  for (const sql of statements) {
    await client.query(sql);
    console.log('OK:', sql.split('\n')[0].slice(0, 60));
  }
  const r = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_name = 'product_access' ORDER BY ordinal_position`
  );
  console.log('\nproduct_access columns:', r.rows.length);
  r.rows.forEach((c) => console.log(' -', c.column_name, c.data_type));
  // Контроль: dfv_leads на месте?
  const d = await client.query(
    `SELECT to_regclass('public.dfv_leads') IS NOT NULL AS exists`
  );
  console.log('\ndfv_leads still exists:', d.rows[0].exists);
  await client.end();
};

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
