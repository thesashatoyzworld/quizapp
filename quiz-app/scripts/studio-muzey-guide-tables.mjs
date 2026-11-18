// Creates the Studio tables for the museum of ideas and the carousel guide
// directly in Postgres (additive only, safe to re-run).
//
// ⚠ Never run `prisma db push` on this database: it is shared between apps
// and push drops tables that are missing from schema.prisma.
//
// Run: node scripts/studio-muzey-guide-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
-- Museum of ideas: points (hot ideas + meanings Sasha repeats), replaced on every sync.
CREATE TABLE IF NOT EXISTS studio_muzey_points (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,
  title        TEXT NOT NULL,
  why          TEXT NOT NULL DEFAULT '',
  ves          INTEGER NOT NULL DEFAULT 0,
  bol          INTEGER NOT NULL DEFAULT 0,
  sozvonov     INTEGER NOT NULL DEFAULT 0,
  posledniy    TEXT,
  rank         INTEGER NOT NULL DEFAULT 0,
  exhibit_ids  TEXT[] NOT NULL DEFAULT '{}',
  synced_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Exhibits (quotes from calls), only the fields Studio needs. Visibility is gated on read.
CREATE TABLE IF NOT EXISTS studio_muzey_exhibits (
  id         TEXT PRIMARY KEY,
  tip        TEXT,
  sut        TEXT NOT NULL DEFAULT '',
  doslovno   TEXT NOT NULL DEFAULT '',
  kto        TEXT,
  taym       TEXT,
  tsifra     TEXT,
  pokazyvat  TEXT,
  istochnik  TEXT,
  data       TEXT,
  smysl      TEXT
);

-- Points taken into a carousel. actor = sasha | danya | repo (imported from pokazano.json).
-- synced_to_repo turns true once the server's pokazano.json has the same entry.
CREATE TABLE IF NOT EXISTS studio_muzey_taken (
  id              SERIAL PRIMARY KEY,
  point_id        TEXT,
  title           TEXT NOT NULL,
  exhibit_ids     TEXT[] NOT NULL DEFAULT '{}',
  karusel         TEXT NOT NULL,
  actor           TEXT NOT NULL,
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  synced_to_repo  BOOLEAN NOT NULL DEFAULT false
);

-- Edits to points by Sasha or Danya, keyed by point id (S0084 or the stable hot id),
-- so they survive the daily sync. title = shown instead of the original formula (NULL = original).
CREATE TABLE IF NOT EXISTS studio_muzey_overrides (
  point_id    TEXT PRIMARY KEY,
  hidden      BOOLEAN NOT NULL DEFAULT false,
  reason      TEXT,
  title       TEXT,
  updated_by  TEXT NOT NULL,
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Every museum edit: hide | unhide | title | title-revert.
CREATE TABLE IF NOT EXISTS studio_muzey_log (
  id          SERIAL PRIMARY KEY,
  point_id    TEXT NOT NULL,
  action      TEXT NOT NULL,
  value       TEXT,
  note        TEXT,
  actor       TEXT NOT NULL,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- «Как пишем карусели»: guide sections, editable by Sasha and Danya, every save versioned.
CREATE TABLE IF NOT EXISTS studio_guide_sections (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  sort        INTEGER NOT NULL DEFAULT 0,
  updated_by  TEXT NOT NULL DEFAULT 'seed',
  updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS studio_guide_versions (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  actor       TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS studio_guide_versions_slug_idx ON studio_guide_versions(slug);
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
  WHERE table_schema = 'public' AND (table_name LIKE 'studio_muzey_%' OR table_name LIKE 'studio_guide_%')
  ORDER BY table_name`);
console.log('готово:');
console.table(check.rows);
await client.end();
