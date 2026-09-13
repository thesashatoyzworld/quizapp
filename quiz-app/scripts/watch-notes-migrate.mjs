// Раздел «Деньги на столе»: заметки по людям и строки графика без телеграма.
// Создаём руками, а НЕ через prisma db push: база общая.
//
//   node scripts/watch-notes-migrate.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const statements = [
  `ALTER TABLE "payment_dues" ALTER COLUMN "telegram_id" DROP NOT NULL`,
  `ALTER TABLE "payment_dues" ALTER COLUMN "deal_id" DROP NOT NULL`,
  `CREATE TABLE IF NOT EXISTS "watch_notes" (
    "key" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "watch_notes_pkey" PRIMARY KEY ("key")
  )`,
];

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const s of statements) await c.query(s);
console.log('готово');
await c.end();
