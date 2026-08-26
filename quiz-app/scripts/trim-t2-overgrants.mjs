import { config } from "dotenv";
config({ path: ".env.local" });
import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// id -> новый expires_at (UTC), = момент оплаты + 1 месяц
const FIX = {
  "c15fbccf-a527-4e58-9759-d06a498fe9b9": "2026-08-19 14:12:17.37",   // dmk1982
  "f7b51fb2-5904-4286-8135-3a3d5811973f": "2026-08-20 08:53:08.123",  // vioonichael
  "612a0ca0-cf70-4660-a5a4-10bb9b51ec85": "2026-09-06 07:29:06.769",  // Netpregrad
  "e6086a3b-eced-4ef1-ab6f-b77d084bedeb": "2026-09-06 10:23:19.54",   // keepcalmanddoyoga8
  "f55aec11-91e9-40b5-8cc4-df9c06792bf1": "2026-09-07 15:25:11.223",  // unforgettable_inna
  "32882d71-6492-406f-8f57-e4b9a2fb1a07": "2026-09-17 19:07:23.148",  // AlexLekomtsev
};

for (const [id, ts] of Object.entries(FIX)) {
  const before = await c.query(`SELECT expires_at::text AS e, granted_at::text AS g, source FROM product_access WHERE id=$1`, [id]);
  if (!before.rowCount) { console.log("MISSING", id); continue; }
  await c.query(`UPDATE product_access SET expires_at = TIMESTAMP '${ts}', updated_at = now() AT TIME ZONE 'UTC' WHERE id=$1`, [id]);
  const after = await c.query(`SELECT expires_at::text AS e FROM product_access WHERE id=$1`, [id]);
  console.log(before.rows[0].source, "|", before.rows[0].e, "->", after.rows[0].e);
}
await c.end();
