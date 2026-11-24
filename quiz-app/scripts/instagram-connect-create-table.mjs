// Creates instagram_connections: the Instagram professional account a t2/t3
// student connected in the cabinet (Meta app "SASHA TOYZ Stats").
//
// NOT `prisma db push`: the database is shared with other projects, push drops
// tables that are not in this schema. Additive only, IF NOT EXISTS.
//
// Run: node scripts/instagram-connect-create-table.mjs
//      ENV_FILE=../path/.env.local node scripts/instagram-connect-create-table.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

await db.query(`
  CREATE TABLE IF NOT EXISTS instagram_connections (
    id           TEXT PRIMARY KEY,
    telegram_id  BIGINT NOT NULL,
    ig_user_id   TEXT NOT NULL,
    username     TEXT,
    fb_user_id   TEXT,
    access_token TEXT NOT NULL,
    token_type   TEXT,
    expires_at   TIMESTAMP(3),
    scopes       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    status       TEXT NOT NULL DEFAULT 'active',
    last_error   TEXT,
    connected_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP(3)
  );
`);
await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS instagram_connections_telegram_id_key ON instagram_connections (telegram_id);`);
await db.query(`CREATE INDEX IF NOT EXISTS instagram_connections_fb_user_id_idx ON instagram_connections (fb_user_id);`);
await db.query(`CREATE INDEX IF NOT EXISTS instagram_connections_ig_user_id_idx ON instagram_connections (ig_user_id);`);

const { rows } = await db.query(
  `SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'instagram_connections' ORDER BY ordinal_position`,
);
for (const r of rows) console.log(`instagram_connections.${r.column_name} ${r.data_type}`);
await db.end();
