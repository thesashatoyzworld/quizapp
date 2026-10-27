// Creates the tables for the "Optimizator" cabinet section (reels script analyzer):
// optimizator_usage (monthly counter per student) and optimizator_runs (saved analyses).
//
// NOT `prisma db push`: the database is shared with other projects, push drops
// tables that are not in this schema. Additive only, IF NOT EXISTS.
//
// Run: node scripts/optimizator-create-tables.mjs
//      ENV_FILE=../path/.env.local node scripts/optimizator-create-tables.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

// One row per student per calendar month. The slot is reserved atomically
// before the Claude call and released if the call fails.
await db.query(`
  CREATE TABLE IF NOT EXISTS optimizator_usage (
    id          SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    month       TEXT NOT NULL,
    count       INTEGER NOT NULL DEFAULT 0,
    updated_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
await db.query(
  `CREATE UNIQUE INDEX IF NOT EXISTS optimizator_usage_telegram_id_month_key
     ON optimizator_usage (telegram_id, month);`,
);

// Every paid run is saved, so a reload never loses a result.
await db.query(`
  CREATE TABLE IF NOT EXISTS optimizator_runs (
    id            TEXT PRIMARY KEY,
    telegram_id   BIGINT NOT NULL,
    created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    goal          TEXT NOT NULL,
    niche         TEXT,
    audience      TEXT,
    script        TEXT NOT NULL,
    result        JSONB,
    model         TEXT NOT NULL,
    input_tokens  INTEGER,
    output_tokens INTEGER,
    duration_ms   INTEGER,
    status        TEXT NOT NULL
  );
`);
// v4 prompt: draft (script before filming) or filmed (transcript, rewrite = editing plan).
await db.query(`ALTER TABLE optimizator_runs ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'draft';`);
await db.query(
  `CREATE INDEX IF NOT EXISTS optimizator_runs_telegram_id_created_at_idx
     ON optimizator_runs (telegram_id, created_at DESC);`,
);

const { rows } = await db.query(
  `SELECT table_name, column_name, data_type FROM information_schema.columns
    WHERE table_name IN ('optimizator_usage', 'optimizator_runs')
    ORDER BY table_name, ordinal_position`,
);
for (const r of rows) console.log(`${r.table_name}.${r.column_name} ${r.data_type}`);
await db.end();
