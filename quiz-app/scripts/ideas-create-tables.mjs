// Создаёт таблицы копилки идей напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/ideas-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS ideas (
  id                TEXT PRIMARY KEY,
  source            TEXT NOT NULL,
  chat_id           TEXT NOT NULL,
  thread_id         INTEGER,
  first_message_id  INTEGER NOT NULL,
  last_message_id   INTEGER NOT NULL,
  author_username   TEXT,
  tg_link           TEXT NOT NULL,
  raw_text          TEXT,
  voice_transcript  TEXT,
  title             TEXT NOT NULL,
  type              TEXT NOT NULL DEFAULT 'other',
  summary           TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  parsed            BOOLEAN NOT NULL DEFAULT false,
  parse_error       TEXT,
  status            TEXT NOT NULL DEFAULT 'raw',
  content_piece_id  TEXT,
  occurred_at       TIMESTAMP(3) NOT NULL,
  created_at        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ideas_status_idx ON ideas(status);
CREATE INDEX IF NOT EXISTS ideas_type_idx ON ideas(type);
CREATE INDEX IF NOT EXISTS ideas_source_idx ON ideas(source);
CREATE INDEX IF NOT EXISTS ideas_occurred_at_idx ON ideas(occurred_at DESC);

CREATE TABLE IF NOT EXISTS idea_refs (
  id            TEXT PRIMARY KEY,
  idea_id       TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  file_id       TEXT,
  thumb_file_id TEXT,
  url           TEXT,
  domain        TEXT,
  caption       TEXT,
  message_id    INTEGER NOT NULL,
  tg_link       TEXT NOT NULL,
  position      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idea_refs_idea_id_idx ON idea_refs(idea_id);

CREATE TABLE IF NOT EXISTS idea_inbox (
  id          TEXT PRIMARY KEY,
  chat_id     TEXT NOT NULL,
  thread_id   INTEGER,
  message_id  INTEGER NOT NULL,
  author_id   TEXT,
  batch_key   TEXT NOT NULL,
  payload     JSONB NOT NULL,
  idea_id     TEXT,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idea_inbox_chat_message_key ON idea_inbox(chat_id, message_id);
CREATE INDEX IF NOT EXISTS idea_inbox_batch_idx ON idea_inbox(batch_key, idea_id);
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
  WHERE table_schema = 'public' AND table_name IN ('ideas', 'idea_refs', 'idea_inbox')
  ORDER BY table_name
`);
console.table(check.rows);
await client.end();
