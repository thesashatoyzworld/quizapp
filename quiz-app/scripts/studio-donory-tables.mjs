// Creates the Studio tables for «Доноры» (bank of donors) directly in Postgres
// (additive only, safe to re-run).
//
// ⚠ Never run `prisma db push` on this database: it is shared between apps
// and push drops tables that are missing from schema.prisma.
//
// Run: node scripts/studio-donory-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
-- Themes ranked by the bank, replaced on every sync.
CREATE TABLE IF NOT EXISTS studio_donor_themes (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  ves          INTEGER NOT NULL DEFAULT 0,
  authors      INTEGER NOT NULL DEFAULT 0,
  sources      TEXT[] NOT NULL DEFAULT '{}',
  hits         INTEGER NOT NULL DEFAULT 0,
  flops        INTEGER NOT NULL DEFAULT 0,
  used         INTEGER NOT NULL DEFAULT 0,
  max_x        DOUBLE PRECISION,
  last         TEXT,
  rank         INTEGER NOT NULL DEFAULT 0,
  exhibit_ids  TEXT[] NOT NULL DEFAULT '{}',
  synced_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Other authors' posts and videos that took off, replaced on every sync.
CREATE TABLE IF NOT EXISTS studio_donor_exhibits (
  id        TEXT PRIMARY KEY,
  source    TEXT NOT NULL,
  author    TEXT NOT NULL,
  hook      TEXT NOT NULL DEFAULT '',
  his       TEXT NOT NULL DEFAULT '',
  move      TEXT NOT NULL DEFAULT '',
  x         DOUBLE PRECISION,
  likes     INTEGER,
  date      TEXT,
  url       TEXT,
  our_code  TEXT,
  our_x     DOUBLE PRECISION
);

-- People's edits to themes, keyed by the bank's stable theme id: survive the sync, go back to the bank.
CREATE TABLE IF NOT EXISTS studio_donor_overrides (
  theme_id     TEXT PRIMARY KEY,
  hidden       BOOLEAN NOT NULL DEFAULT false,
  reason       TEXT,
  name         TEXT,
  merged_into  TEXT,
  updated_by   TEXT NOT NULL,
  updated_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- «Беру»: a theme taken into a carousel (theme + заход), many times per theme.
CREATE TABLE IF NOT EXISTS studio_donor_taken (
  id          SERIAL PRIMARY KEY,
  theme_id    TEXT NOT NULL,
  exhibit_id  TEXT,
  zahod       TEXT NOT NULL,
  karusel     TEXT NOT NULL,
  item_id     TEXT,
  actor       TEXT NOT NULL,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Every edit, for the journal both see.
CREATE TABLE IF NOT EXISTS studio_donor_log (
  id          SERIAL PRIMARY KEY,
  theme_id    TEXT NOT NULL,
  action      TEXT NOT NULL,
  value       TEXT,
  note        TEXT,
  actor       TEXT NOT NULL,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query(SQL);
const r = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'studio_donor_%' ORDER BY 1`);
console.log(r.rows.map((x) => x.table_name).join(', '));
await client.end();
