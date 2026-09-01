import { config } from "dotenv";
config({ path: ".env.local" });
import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
// Ушли сами, не продлевают (Саша подтвердил 26.08.2026). Сроки и так истекли,
// метка нужна только чтобы строка не выглядела живой в выгрузках.
const ids = [
  "ccce3783-9ce5-446f-9771-df090c16a18f", // diiixsss
  "f7b51fb2-5904-4286-8135-3a3d5811973f", // vioonichael
  "f1c0c176-fed6-4d4f-81e8-13c8361859b8", // anaschmidtt
];
const r = await c.query(`
  UPDATE product_access SET status='expired', updated_at = now() AT TIME ZONE 'UTC'
  WHERE id = ANY($1::text[]) RETURNING id, source, status, expires_at::text`, [ids]);
for (const x of r.rows) console.log(x.source, "|", x.status, "|", x.expires_at);
const left = await c.query(`
  SELECT u.username, pa.expires_at::text AS e FROM product_access pa
  LEFT JOIN users u ON u.telegram_id = pa.telegram_id
  WHERE pa.product_slug='uroven-t2' AND pa.status='active'
    AND (pa.expires_at IS NULL OR pa.expires_at > (now() AT TIME ZONE 'UTC'))
  ORDER BY pa.expires_at NULLS FIRST`);
console.log("АКТИВНЫХ т2:", left.rowCount);
await c.end();
