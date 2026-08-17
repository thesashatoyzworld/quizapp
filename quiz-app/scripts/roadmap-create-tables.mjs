// Создаёт таблицы маршрутных карт напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma
// (dfv_leads, home_counter, home_guestbook, home_ratings).
//
// Запуск: node scripts/roadmap-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS roadmaps (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  client_name   TEXT NOT NULL,
  telegram_id   BIGINT,
  username      TEXT,
  tier          TEXT,
  paid_amount   INTEGER,
  returned      INTEGER NOT NULL DEFAULT 0,
  started_at    TIMESTAMP(3),
  access_until  TIMESTAMP(3),
  goal          TEXT,
  period_goal   TEXT,
  archived      BOOLEAN NOT NULL DEFAULT false,
  last_touch_at TIMESTAMP(3),
  created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Панель цифр: было на старте / стало сейчас.
CREATE TABLE IF NOT EXISTS roadmap_metrics (
  id            TEXT PRIMARY KEY,
  roadmap_id    TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  key           TEXT NOT NULL,
  label         TEXT NOT NULL,
  start_value   TEXT,
  current_value TEXT,
  unit          TEXT,
  position      INTEGER NOT NULL DEFAULT 0,
  visibility    TEXT NOT NULL DEFAULT 'internal',
  updated_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS roadmap_metrics_roadmap_key_idx
  ON roadmap_metrics(roadmap_id, key);

-- Лестница этапов: где человек стоит.
-- status: done | partial | blocked | todo
CREATE TABLE IF NOT EXISTS roadmap_steps (
  id           TEXT PRIMARY KEY,
  roadmap_id   TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  title        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'todo',
  evidence     TEXT,
  visibility   TEXT NOT NULL DEFAULT 'internal',
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS roadmap_steps_roadmap_position_idx
  ON roadmap_steps(roadmap_id, position);

-- Задачи периода. owner: client | sasha. status: todo | doing | done | dropped
CREATE TABLE IF NOT EXISTS roadmap_tasks (
  id           TEXT PRIMARY KEY,
  roadmap_id   TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,
  title        TEXT NOT NULL,
  why          TEXT,
  owner        TEXT NOT NULL DEFAULT 'client',
  status       TEXT NOT NULL DEFAULT 'todo',
  due_on       DATE,
  done_at      TIMESTAMP(3),
  visibility   TEXT NOT NULL DEFAULT 'internal',
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS roadmap_tasks_roadmap_status_idx
  ON roadmap_tasks(roadmap_id, status);

-- Заметки: blocker | risk | decision | insight | touch
CREATE TABLE IF NOT EXISTS roadmap_notes (
  id           TEXT PRIMARY KEY,
  roadmap_id   TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'insight',
  body         TEXT NOT NULL,
  source       TEXT,
  happened_on  DATE,
  visibility   TEXT NOT NULL DEFAULT 'internal',
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS roadmap_notes_roadmap_kind_idx
  ON roadmap_notes(roadmap_id, kind);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);

const check = await client.query(`
  SELECT t.table_name,
         (SELECT count(*) FROM information_schema.columns c
          WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS columns
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_name IN ('roadmaps', 'roadmap_metrics', 'roadmap_steps', 'roadmap_tasks', 'roadmap_notes')
  ORDER BY t.table_name
`);

console.table(check.rows);
await client.end();
