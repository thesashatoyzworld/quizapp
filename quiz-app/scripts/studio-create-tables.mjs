// Creates the «Студия» tables directly in Postgres (additive only).
//
// ⚠ Never run `prisma db push` on this database: it is shared between apps
// and push drops tables that are missing from schema.prisma.
//
// Run: node scripts/studio-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
CREATE TABLE IF NOT EXISTS studio_items (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL DEFAULT 'reel',
  title         TEXT NOT NULL,
  variant       TEXT,
  copy_no       INTEGER,
  stage         TEXT NOT NULL DEFAULT 'text',
  plan_date     DATE,
  brief_url     TEXT,
  brief_text    TEXT,
  brief_html    TEXT,
  shortcode     TEXT UNIQUE,
  media_id      TEXT,
  permalink     TEXT,
  published_at  TIMESTAMP(3),
  author        TEXT NOT NULL DEFAULT 'sasha',
  created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS studio_items_plan_date_idx ON studio_items(plan_date);
CREATE INDEX IF NOT EXISTS studio_items_variant_idx ON studio_items(variant);

CREATE TABLE IF NOT EXISTS studio_comments (
  id          TEXT PRIMARY KEY,
  item_id     TEXT NOT NULL REFERENCES studio_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
  author      TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS studio_comments_item_id_idx ON studio_comments(item_id);

CREATE TABLE IF NOT EXISTS studio_rules (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL DEFAULT 'all',
  text        TEXT NOT NULL,
  evidence    TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A brief sent to Danya, stored once and shared by its items.
CREATE TABLE IF NOT EXISTS studio_briefs (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  html        TEXT NOT NULL,
  sent_at     DATE,
  tg_ref      TEXT,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE studio_items ADD COLUMN IF NOT EXISTS brief_id TEXT REFERENCES studio_briefs(id) ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS studio_items_brief_id_idx ON studio_items(brief_id);

-- Fresh thumbnail URL per Instagram media (IG CDN links are signed and expire).
CREATE TABLE IF NOT EXISTS studio_thumbs (
  media_id    TEXT PRIMARY KEY,
  url         TEXT NOT NULL,
  fetched_at  TIMESTAMP(3) NOT NULL
);

-- One snapshot per media per UTC day; a second sync the same day overwrites it.
CREATE TABLE IF NOT EXISTS studio_stats (
  id              TEXT PRIMARY KEY,
  media_id        TEXT NOT NULL,
  shortcode       TEXT NOT NULL,
  taken_at        TIMESTAMP(3) NOT NULL,
  age_hours       DOUBLE PRECISION NOT NULL,
  views           INTEGER,
  reach           INTEGER,
  likes           INTEGER,
  comments        INTEGER,
  shares          INTEGER,
  saved           INTEGER,
  skip_rate       DOUBLE PRECISION,
  avg_watch_ms    INTEGER,
  follows         INTEGER,
  profile_visits  INTEGER
);
CREATE INDEX IF NOT EXISTS studio_stats_shortcode_idx ON studio_stats(shortcode);
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
  WHERE table_schema = 'public' AND table_name LIKE 'studio_%'
  ORDER BY table_name`);
console.log('готово:');
console.table(check.rows);
await client.end();
