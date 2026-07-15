// Разовое создание таблицы dwy_leads. Идемпотентно (IF NOT EXISTS).
// Запуск: node --env-file=.env.local scripts/dwy-create-table.mjs
//
// Не через `prisma db push`: в репо нет истории миграций, а schema.prisma может
// расходиться с живой базой — push попытался бы привести к схеме ВСЮ базу и мог
// задеть чужие таблицы на проде. Создаём ровно одну таблицу явным SQL.
import pg from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('DIRECT_URL / DATABASE_URL не заданы');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

const SQL = `
CREATE TABLE IF NOT EXISTS dwy_leads (
  id           SERIAL PRIMARY KEY,
  telegram_id  TEXT,
  username     TEXT,
  first_name   TEXT,
  who          TEXT NOT NULL,
  has_product  TEXT NOT NULL,
  product      TEXT,
  level        INTEGER NOT NULL,
  tried        TEXT NOT NULL,
  want         TEXT NOT NULL,
  income       TEXT NOT NULL,
  hours        TEXT NOT NULL,
  contact      TEXT,
  source       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'dwy_leads' ORDER BY ordinal_position`
);
console.table(rows);
await client.end();
console.log('dwy_leads готова');
