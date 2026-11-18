// Уникализатор: таблица приглашений. Создаём руками, а НЕ через prisma db push: база общая.
//
//   node scripts/uniq-referrals-migrate.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const statements = [
  `CREATE TABLE IF NOT EXISTS "uniq_referrals" (
    "friend_id" BIGINT NOT NULL,
    "referrer_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credited_at" TIMESTAMP(3),
    CONSTRAINT "uniq_referrals_pkey" PRIMARY KEY ("friend_id")
  )`,
  `CREATE INDEX IF NOT EXISTS "uniq_referrals_referrer_id_idx" ON "uniq_referrals" ("referrer_id")`,
];

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const s of statements) await c.query(s);
console.log('готово');
await c.end();
