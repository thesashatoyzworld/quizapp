// Добавляет задачам карты ссылку на материал: воркшоп, разбор, запись созвона.
//
//   link_url   — куда ведём (кабинет или библиотека воркшопов);
//   link_label — подпись кнопки, например «Открыть воркшоп».
//
// Без ссылки задача «посмотри воркшоп» заставляет человека искать материал
// самому, а он там же, в кабинете, в двух кликах.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/roadmap-task-links-migrate.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
ALTER TABLE roadmap_tasks ADD COLUMN IF NOT EXISTS link_url   TEXT;
ALTER TABLE roadmap_tasks ADD COLUMN IF NOT EXISTS link_label TEXT;
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);

const check = await client.query(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'roadmap_tasks'
    AND column_name IN ('link_url', 'link_label')
  ORDER BY column_name
`);

console.table(check.rows);
await client.end();
