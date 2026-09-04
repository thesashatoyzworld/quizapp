// Новые вопросы анкеты: как давно подписан, насколько готов к покупке и
// сколько подписчиков в инстаграме.
//
// Запуск: node scripts/dwy-add-readiness-columns.mjs
//
// НЕ `prisma db push`: база общая с другими проектами, push сносит чужие
// таблицы, которых нет в этой схеме.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS following TEXT`);
await db.query(`ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS readiness TEXT`);
await db.query(`ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS followers INTEGER`);

const { rows } = await db.query(`
  SELECT column_name FROM information_schema.columns
   WHERE table_name = 'dwy_leads' AND column_name IN ('following', 'readiness', 'followers')
   ORDER BY column_name
`);
console.log('на месте:', rows.map((r) => r.column_name).join(', ') || 'ничего');
await db.end();
