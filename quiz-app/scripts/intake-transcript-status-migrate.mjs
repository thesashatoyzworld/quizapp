// Колонка transcript_status в intake_answers: видно, что расшифровка сорвалась,
// а не просто ещё не пришла.
//
// Идемпотентно, без prisma db push: база общая с другими проектами, push сносит
// чужие таблицы.
//
// Запуск: node scripts/intake-transcript-status-migrate.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('нет DIRECT_URL/DATABASE_URL');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

await client.query(`ALTER TABLE "intake_answers" ADD COLUMN IF NOT EXISTS "transcript_status" TEXT`);

// Прошлые ответы: где текст есть, там расшифровка прошла. Где голосовое без
// текста, там она не дошла, и это уже видно по самой колонке.
const filled = await client.query(
  `UPDATE "intake_answers" SET "transcript_status" = 'ok'
   WHERE "transcript_status" IS NULL AND "transcript" IS NOT NULL`,
);

const { rows } = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_name='intake_answers' AND column_name='transcript_status'`,
);

console.log(rows.length ? 'transcript_status на месте' : 'колонки нет, что-то пошло не так');
console.log(`проставлено ok у ${filled.rowCount} прошлых ответов`);
await client.end();
