import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { randomUUID } from 'crypto';

const token = process.argv[2] || 'DEMO123';
const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const main = async () => {
  await c.connect();
  const source = `mkdengi_web_${token}`;
  await c.query('DELETE FROM product_access WHERE source=$1', [source]);
  await c.query(
    `INSERT INTO product_access (id, product_slug, role, source, status, granted_at, created_at, updated_at)
     VALUES ($1, 'mk-dengi', 'mk', $2, 'active', now(), now(), now())`,
    [randomUUID(), source]
  );
  console.log('Демо-доступ создан, токен:', token);
  await c.end();
};
main().catch((e) => { console.error(e.message); process.exit(1); });
