// Создаёт таблицы раздела «Ролики» напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/reels-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS reel_spaces (
  telegram_id  BIGINT PRIMARY KEY,
  client_name  TEXT,
  ig_handle    TEXT,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reel_briefs (
  id           TEXT PRIMARY KEY,
  telegram_id  BIGINT NOT NULL,
  "order"      INTEGER NOT NULL DEFAULT 0,
  title        TEXT NOT NULL,
  label        TEXT,
  summary      TEXT,
  state        TEXT NOT NULL DEFAULT 'wait',
  state_label  TEXT,
  html         TEXT,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS reel_briefs_telegram_id_idx ON reel_briefs(telegram_id);

CREATE TABLE IF NOT EXISTS reel_versions (
  id           TEXT PRIMARY KEY,
  telegram_id  BIGINT NOT NULL,
  brief_id     TEXT NOT NULL REFERENCES reel_briefs(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  reel         TEXT NOT NULL,
  title        TEXT NOT NULL,
  version      TEXT,
  "order"      INTEGER NOT NULL DEFAULT 0,
  stage        TEXT NOT NULL DEFAULT 'tz',
  plan_date    DATE,
  code         TEXT,
  uploaded_at  DATE,
  plays        INTEGER,
  likes        INTEGER,
  comments     INTEGER,
  stats_at     TIMESTAMP(3),
  note         TEXT,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS reel_versions_telegram_id_idx ON reel_versions(telegram_id);
CREATE INDEX IF NOT EXISTS reel_versions_brief_id_idx ON reel_versions(brief_id);
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
  WHERE table_schema = 'public' AND table_name IN ('reel_spaces', 'reel_briefs', 'reel_versions')
  ORDER BY table_name`);

console.log('готово:');
console.table(check.rows);

await client.end();
