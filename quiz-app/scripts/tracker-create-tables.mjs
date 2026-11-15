// Создаёт таблицы трекера задач (/admin/treker) напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/tracker-create-tables.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS tracker_task (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  title       TEXT NOT NULL,
  note        TEXT,
  period      TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  archived_at TIMESTAMP(3),
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE tracker_task ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS tracker_task_kind_position_idx ON tracker_task(kind, position);

CREATE TABLE IF NOT EXISTS tracker_step (
  id         TEXT PRIMARY KEY,
  task_id    TEXT NOT NULL REFERENCES tracker_task(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS tracker_step_task_id_position_idx ON tracker_step(task_id, position);

CREATE TABLE IF NOT EXISTS tracker_check (
  task_id    TEXT NOT NULL REFERENCES tracker_task(id) ON DELETE CASCADE,
  step_id    TEXT NOT NULL,
  period_key TEXT NOT NULL,
  done_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_id, step_id, period_key)
);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
const r = await client.query(
  "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'tracker_%' ORDER BY 1",
);
console.log('ok:', r.rows.map((x) => x.table_name).join(', '));
await client.end();
