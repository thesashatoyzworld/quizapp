// One-off: create money_mk_waitlist table without touching the rest of the schema.
// db push wanted to drop dfv_leads (schema drift), so we create just this table.
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS money_mk_waitlist (
  id          SERIAL PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  username    TEXT,
  first_name  TEXT,
  last_name   TEXT,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS money_mk_waitlist_telegram_id_key
  ON money_mk_waitlist (telegram_id);
`;

(async () => {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(SQL);
  const r = await client.query(
    "SELECT count(*)::int AS n FROM money_mk_waitlist"
  );
  console.log("money_mk_waitlist ready, rows:", r.rows[0].n);
  await client.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
