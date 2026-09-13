// Переписка с клиентами на личном аккаунте. Создаём руками, а НЕ через
// prisma db push: база общая.
//
//   node scripts/tg-personal-create-table.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const statements = [
  `CREATE TABLE IF NOT EXISTS "tg_personal_msg" (
    "id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "text" TEXT NOT NULL,
    "media_type" TEXT,
    "media_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tg_personal_msg_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "tg_personal_msg_chat_id_created_at_idx" ON "tg_personal_msg"("chat_id", "created_at")`,
];

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
for (const s of statements) await c.query(s);
console.log('tg_personal_msg готова');
await c.end();
