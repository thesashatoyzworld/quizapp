// Разово: записям листа ожидания без Телеграма ставим telegram_id из базы бота по нику,
// чтобы об открытии набора бот написал им сам. Новые записи связываются при приёме анкеты.
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const r = await c.query(`
  UPDATE dwy_leads d SET telegram_id = u.telegram_id::text
  FROM users u
  WHERE d.kind IN ('360', 't2', 't3') AND coalesce(d.telegram_id, '') = ''
    AND coalesce(d.username, '') <> '' AND lower(u.username) = lower(d.username)
  RETURNING d.id, d.kind`);
console.log(
  'привязано:',
  r.rowCount,
  r.rows.reduce((a, x) => ({ ...a, [x.kind]: (a[x.kind] ?? 0) + 1 }), {}),
);
const left = await c.query(
  `SELECT count(*) FILTER (WHERE coalesce(telegram_id,'') = '') n, count(*) total FROM dwy_leads WHERE kind = '360'`,
);
console.log('360 без Телеграма:', left.rows[0]);
await c.end();
