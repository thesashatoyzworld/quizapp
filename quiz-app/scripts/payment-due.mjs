// График платежей по прайс-ссылке (см. src/lib/payment-dues.ts).
//
//   node scripts/payment-due.mjs list [tgId]
//   node scripts/payment-due.mjs add <tgId> <dealId> <сумма> <ДД.ММ.ГГГГ> "<платёж 2 из 3>" ["<кто>"]
//   node scripts/payment-due.mjs paid <id> [orderId]   — оплатил мимо ссылки
//   node scripts/payment-due.mjs cancel <id>           — договорились иначе
//
// Дата платежа хранится как 12:00 по Москве этого дня.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { randomUUID } from 'crypto';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();

const [cmd, ...a] = process.argv.slice(2);

async function list(tg) {
  const r = await c.query(
    `SELECT id, telegram_id, who, deal_id, amount, to_char(due_at + interval '3 hour', 'DD.MM.YYYY') due,
            label, status, to_char(paid_at + interval '3 hour', 'DD.MM.YYYY') paid,
            reminded_before_at IS NOT NULL rem_before, reminded_due_at IS NOT NULL rem_due
       FROM payment_dues ${tg ? 'WHERE telegram_id = $1' : ''} ORDER BY due_at`,
    tg ? [tg] : [],
  );
  console.table(r.rows);
}

if (cmd === 'add') {
  const [tg, deal, amount, date, label, who] = a;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date || '');
  if (!tg || !deal || !amount || !m) { console.error('add <tgId> <dealId> <сумма> <ДД.ММ.ГГГГ> "<метка>" ["<кто>"]'); process.exit(1); }
  const d = await c.query('SELECT id FROM deals WHERE id = $1', [deal]);
  if (!d.rowCount) { console.error('нет такой прайс-ссылки', deal); process.exit(1); }
  const dueAt = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 9, 0, 0)); // 12:00 МСК
  await c.query(
    `INSERT INTO payment_dues (id, telegram_id, who, deal_id, amount, due_at, label, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7, now())`,
    [randomUUID(), tg, who || null, deal, parseInt(amount, 10), dueAt, label || null],
  );
  await list(tg);
} else if (cmd === 'paid' || cmd === 'cancel') {
  const [id, orderId] = a;
  const r = await c.query(
    cmd === 'paid'
      ? `UPDATE payment_dues SET status='paid', paid_at=now(), order_id=COALESCE($2, order_id), updated_at=now() WHERE id=$1 RETURNING telegram_id`
      : `UPDATE payment_dues SET status='cancelled', updated_at=now() WHERE id=$1 RETURNING telegram_id`,
    cmd === 'paid' ? [id, orderId || null] : [id],
  );
  if (!r.rowCount) { console.error('нет такой строки', id); process.exit(1); }
  await list(r.rows[0].telegram_id);
} else {
  await list(a[0]);
}
await c.end();
