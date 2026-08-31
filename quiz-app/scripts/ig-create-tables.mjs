// Заводит таблицу ig_posts руками.
//
// НЕ `prisma db push`: база общая с другими проектами, push сносит чужие
// таблицы, которых нет в этой схеме.
//
// Запуск: node scripts/ig-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`
  CREATE TABLE IF NOT EXISTS ig_posts (
    id          TEXT PRIMARY KEY,
    handle      TEXT NOT NULL,
    slug        TEXT,
    shortcode   TEXT NOT NULL UNIQUE,
    url         TEXT NOT NULL,
    type        TEXT NOT NULL,
    posted_at   TIMESTAMP(3) NOT NULL,
    caption     TEXT,
    speech      TEXT,
    plays       INTEGER,
    likes       INTEGER,
    comments    INTEGER,
    theme       TEXT,
    format      TEXT,
    purpose     TEXT,
    hook        TEXT,
    cta         TEXT,
    leads_to    TEXT,
    on_route    BOOLEAN,
    why         TEXT,
    created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
await db.query('CREATE INDEX IF NOT EXISTS ig_posts_handle_posted_at_idx ON ig_posts (handle, posted_at);');
await db.query('CREATE INDEX IF NOT EXISTS ig_posts_slug_posted_at_idx ON ig_posts (slug, posted_at);');

const { rows } = await db.query('SELECT count(*)::int AS n FROM ig_posts');
console.log(`ig_posts готова, записей: ${rows[0].n}`);

await db.end();
