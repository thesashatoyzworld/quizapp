// Создаёт таблицы раздела «Сообщество» напрямую в Postgres.
//
// ⚠ НЕ использовать `prisma db push` на этой базе: она общая для нескольких
// приложений, и push сносит таблицы, которых нет в schema.prisma.
//
// Запуск: node scripts/forum-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS forum_post (
  id               TEXT PRIMARY KEY,
  author_tg        BIGINT NOT NULL,
  category         TEXT NOT NULL,
  title            TEXT NOT NULL,
  body             TEXT NOT NULL,
  images           TEXT[] NOT NULL DEFAULT '{}',
  pinned           BOOLEAN NOT NULL DEFAULT false,
  solved           BOOLEAN NOT NULL DEFAULT false,
  deleted          BOOLEAN NOT NULL DEFAULT false,
  comment_count    INTEGER NOT NULL DEFAULT 0,
  last_author_tg   BIGINT NOT NULL,
  last_activity_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS forum_post_feed_idx ON forum_post(deleted, pinned, last_activity_at);
CREATE INDEX IF NOT EXISTS forum_post_author_idx ON forum_post(author_tg);

CREATE TABLE IF NOT EXISTS forum_comment (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL,
  parent_id  TEXT,
  author_tg  BIGINT NOT NULL,
  body       TEXT NOT NULL,
  images     TEXT[] NOT NULL DEFAULT '{}',
  deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS forum_comment_post_idx ON forum_comment(post_id, created_at);

CREATE TABLE IF NOT EXISTS forum_member (
  telegram_id BIGINT PRIMARY KEY,
  name        TEXT NOT NULL,
  username    TEXT,
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_image (
  id         TEXT PRIMARY KEY,
  owner_tg   BIGINT NOT NULL,
  mime       TEXT NOT NULL,
  data       BYTEA NOT NULL,
  width      INTEGER NOT NULL,
  height     INTEGER NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(SQL);
const r = await client.query(
  "select table_name from information_schema.tables where table_name like 'forum_%' order by 1",
);
console.log('ok:', r.rows.map((x) => x.table_name).join(', '));
await client.end();
