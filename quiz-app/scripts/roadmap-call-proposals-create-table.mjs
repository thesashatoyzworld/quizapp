// Creates the table for roadmap proposals from group calls, directly in Postgres.
//
// ⚠ Never run `prisma db push` on this database: it is shared with other apps,
// and push drops tables that are missing from schema.prisma.
//
// Run: node scripts/roadmap-call-proposals-create-table.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const SQL = `
-- One row per group call. The server pipeline posts what it heard for each client,
-- Sasha taps "apply" in the bot, and only then the roadmaps change.
-- status: pending | applying | applied | partial | failed
CREATE TABLE IF NOT EXISTS roadmap_call_proposals (
  id             TEXT PRIMARY KEY,
  job_id         TEXT NOT NULL UNIQUE,
  call_date      DATE NOT NULL,
  sozvon_slug    TEXT,
  title          TEXT,
  payload        JSONB NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  result         JSONB,
  tg_chat_id     TEXT,
  tg_message_id  INTEGER,
  created_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  applied_at     TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS roadmap_call_proposals_status_idx
  ON roadmap_call_proposals(status, created_at);

-- Added after the first run: when the apply button claimed the row. A row stuck
-- in 'applying' longer than 3 minutes can be claimed again.
ALTER TABLE roadmap_call_proposals ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP(3);
`;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(SQL);

const check = await client.query(`
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'roadmap_call_proposals'
  ORDER BY ordinal_position
`);

console.table(check.rows);
await client.end();
