// Даёт задачам карты устойчивый ключ.
//
// До этого импорт сверял задачи по тексту: стоило переписать название, как
// в карте появлялась вторая строка вместо правки первой. Ключ задаётся в
// roadmap.json и живёт дольше формулировки.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/roadmap-task-keys-migrate.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
ALTER TABLE roadmap_tasks ADD COLUMN IF NOT EXISTS key TEXT;

-- Частичный индекс: ключ обязателен к уникальности только там, где он задан.
CREATE UNIQUE INDEX IF NOT EXISTS roadmap_tasks_roadmap_key_idx
  ON roadmap_tasks(roadmap_id, key) WHERE key IS NOT NULL;
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);

const check = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'roadmap_tasks' AND column_name = 'key'
`);

console.log(check.rowCount ? 'колонка key на месте' : 'колонки key нет');
await client.end();
