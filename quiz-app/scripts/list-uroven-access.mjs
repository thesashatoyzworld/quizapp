import { config } from "dotenv";
config({ path: ".env.local" });
import pg from "pg";
const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const r = await client.query(`
  SELECT pa.id, pa.telegram_id, u.username, u.first_name, pa.product_slug, pa.status,
         pa.period, pa.source,
         pa.granted_at::text AS granted_at,
         pa.expires_at::text AS expires_at,
         CASE WHEN pa.expires_at IS NULL THEN NULL
              ELSE ROUND(EXTRACT(EPOCH FROM (pa.expires_at - (now() AT TIME ZONE 'UTC')))/86400.0, 1)
         END AS days_left
  FROM product_access pa
  LEFT JOIN users u ON u.telegram_id = pa.telegram_id
  WHERE pa.role = 'uroven'
  ORDER BY pa.product_slug, pa.expires_at NULLS FIRST
`);
console.log(JSON.stringify(r.rows, null, 1));
await client.end();
