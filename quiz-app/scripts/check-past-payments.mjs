import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const main = async () => {
  await c.connect();

  const purch = await c.query(
    `SELECT count(*)::int AS n, max(created_at) AS last FROM purchases`
  );
  console.log('Purchases всего:', purch.rows[0].n, '| последняя:', purch.rows[0].last);

  const recent = await c.query(
    `SELECT amount, source, prodamus_order_id, created_at FROM purchases
     ORDER BY created_at DESC LIMIT 8`
  );
  console.log('\nПоследние покупки:');
  recent.rows.forEach((r) =>
    console.log(` ${r.created_at?.toISOString?.()?.slice(0,10)} | ${r.amount}₽ | src=${r.source} | order=${r.prodamus_order_id}`)
  );

  const evs = await c.query(
    `SELECT type, count(*)::int AS n, max(created_at) AS last FROM events
     WHERE type IN ('payment_success','mk_web_paid') GROUP BY type`
  );
  console.log('\nСобытия оплат:');
  evs.rows.forEach((r) => console.log(` ${r.type}: ${r.n} | последнее ${r.last?.toISOString?.()?.slice(0,16)}`));

  await c.end();
};
main().catch((e) => { console.error(e.message); process.exit(1); });
