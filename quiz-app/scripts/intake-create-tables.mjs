// Создаёт таблицы анкеты напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma
// (dfv_leads 23 строки, home_counter, home_guestbook, home_ratings).
//
// Запуск: node scripts/intake-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS intakes (
  id            TEXT PRIMARY KEY,
  telegram_id   BIGINT NOT NULL UNIQUE,
  username      TEXT,
  first_name    TEXT,
  status        TEXT NOT NULL DEFAULT 'invited',
  current_step  INTEGER NOT NULL DEFAULT 0,
  invite_token  TEXT UNIQUE,
  invited_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at    TIMESTAMP(3),
  completed_at  TIMESTAMP(3),
  reminded_at   TIMESTAMP(3),
  created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS intakes_status_idx ON intakes(status);

CREATE TABLE IF NOT EXISTS intake_answers (
  id             TEXT PRIMARY KEY,
  intake_id      TEXT NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  step           INTEGER NOT NULL,
  extra_question TEXT,
  kind           TEXT NOT NULL,
  raw_text       TEXT,
  transcript     TEXT,
  file_id        TEXT,
  duration_sec   INTEGER,
  skipped        BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS intake_answers_intake_id_step_idx ON intake_answers(intake_id, step);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);

const check = await client.query(`
  SELECT table_name, (SELECT count(*) FROM information_schema.columns c
                      WHERE c.table_name = t.table_name) AS columns
  FROM information_schema.tables t
  WHERE table_schema = 'public' AND table_name IN ('intakes', 'intake_answers')
  ORDER BY table_name`);

console.log('готово:');
console.table(check.rows);

await client.end();
