// Creates demand_posts: the "поток спроса" feed for the Optimizator. Rows are
// Instagram outliers (likes ≥ 2× the author's median) from the PackageFounder
// base on the Amsterdam server; package-founder/src/daily/export_demand.py
// fills it every day after the sweep. The cabinet only reads it
// (src/lib/optimizator/demand.ts, raw SQL, no Prisma model: tsvector).
//
// NOT `prisma db push`: the database is shared with other projects, push drops
// tables that are not in this schema. Additive only, IF NOT EXISTS.
//
// Run: node scripts/demand-create-tables.mjs
//      ENV_FILE=../path/.env.local node scripts/demand-create-tables.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`
  CREATE TABLE IF NOT EXISTS demand_posts (
    code          TEXT PRIMARY KEY,
    author        TEXT NOT NULL,
    kind          TEXT NOT NULL,
    likes         INTEGER NOT NULL,
    comments      INTEGER NOT NULL DEFAULT 0,
    author_median REAL NOT NULL,
    ratio         REAL NOT NULL,
    taken_at      TIMESTAMPTZ NOT NULL,
    text          TEXT NOT NULL,
    lang          TEXT NOT NULL,
    tsv           TSVECTOR GENERATED ALWAYS AS (to_tsvector('russian', text)) STORED,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);
await db.query(`CREATE INDEX IF NOT EXISTS demand_posts_tsv_idx ON demand_posts USING GIN (tsv);`);
await db.query(`CREATE INDEX IF NOT EXISTS demand_posts_taken_at_idx ON demand_posts (taken_at DESC);`);

const { rows } = await db.query(
  `SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'demand_posts' ORDER BY ordinal_position`,
);
for (const r of rows) console.log(`demand_posts.${r.column_name} ${r.data_type}`);
await db.end();
