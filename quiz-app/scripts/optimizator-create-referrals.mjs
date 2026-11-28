// Free optimizer referrals (src/lib/optimizator/free.ts). Idempotent: node scripts/optimizator-create-referrals.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query(`
  CREATE TABLE IF NOT EXISTS optimizator_referrals (
    friend_id   BIGINT PRIMARY KEY,
    referrer_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    credited_at TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS optimizator_referrals_referrer_idx ON optimizator_referrals (referrer_id);
`);
console.log('optimizator_referrals ready');
await client.end();
