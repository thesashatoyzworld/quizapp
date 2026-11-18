// Creates the two tables of the optimizator ladder (script vs 8 reels of known outcome):
// optimizator_refs (the student's own past reels, per Instagram username, refreshed weekly)
// and optimizator_anchors (expert reels from the research pool, see optimizator-anchors-build.mjs).
//
// NOT `prisma db push`: the database is shared with other projects. Additive only, IF NOT EXISTS.
//
// Run: node scripts/optimizator-ladder-tables.mjs
//      ENV_FILE=../path/.env.local node scripts/optimizator-ladder-tables.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

// One row per Instagram username. refs: [{code, taken_at, plays, ratio, outcome, text}].
// status: ok | private | not_found | few (under 4 reels with speech) | error.
await db.query(`
  CREATE TABLE IF NOT EXISTS optimizator_refs (
    username     TEXT PRIMARY KEY,
    fetched_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status       TEXT NOT NULL,
    median_plays INTEGER,
    refs         JSONB NOT NULL DEFAULT '[]'::jsonb
  );
`);

// Expert reels with a known outcome (hit / flop vs the author's median likes).
// author is internal only (one anchor per author per ladder), never shown to students.
await db.query(`
  CREATE TABLE IF NOT EXISTS optimizator_anchors (
    id         TEXT PRIMARY KEY,
    text       TEXT NOT NULL,
    class      TEXT NOT NULL,
    ratio      REAL NOT NULL,
    author     TEXT NOT NULL,
    first_line TEXT NOT NULL,
    tsv        TSVECTOR GENERATED ALWAYS AS (to_tsvector('russian', text)) STORED
  );
`);
await db.query(`CREATE INDEX IF NOT EXISTS optimizator_anchors_tsv_idx ON optimizator_anchors USING GIN (tsv);`);

const n = await db.query(`SELECT
  (SELECT count(*) FROM optimizator_refs)::int AS refs,
  (SELECT count(*) FROM optimizator_anchors)::int AS anchors`);
console.log('ok', n.rows[0]);
await db.end();
