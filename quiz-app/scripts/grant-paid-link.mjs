// Именная ссылка на выдачу доступа при оплате мимо кассы (перевод, крипта, PayPal).
// Вебхука Продамуса нет, поэтому событие web_paid пишем руками, а редим
// /start paid_<token> по клику привяжет telegram, выдаст доступ и пришлёт онбординг.
//
//   node scripts/grant-paid-link.mjs <username> <slug> <amount> [note]
//   node scripts/grant-paid-link.mjs daiana_tankiyeva uroven-t2 10000 "перевод на Каспи"
//
// Отличие от grant-gift-link.mjs: там подарок за обратную связь (amount 0, gift),
// здесь человек заплатил — сумма попадает в purchases, доступ на срок тарифа.
// Подписочные т2/т3 получают месяц: автопродления не будет, следующий платёж
// принимать и продлевать руками.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import crypto from 'crypto';

const username = (process.argv[2] || '').replace(/^@/, '');
const slug = process.argv[3] || '';
const amount = Number(process.argv[4] || 0);
const note = process.argv[5] || 'оплата мимо кассы, доступ выдан ссылкой';
if (!username || !slug || !amount) {
  console.error('usage: node scripts/grant-paid-link.mjs <username> <slug> <amount> [note]');
  process.exit(1);
}

// Токен без «_»: orderId склеивается через _web_ и подчёркивание внутри его ломает.
const token = crypto.randomBytes(10).toString('hex');
const eventId = `evt_${crypto.randomBytes(12).toString('hex')}`;
const orderId = `${slug.replace(/-/g, '_')}_web_${token}`;

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const dup = await c.query(
  `SELECT id, metadata->>'token' AS token, metadata->>'consumed' AS consumed
     FROM events
    WHERE type='web_paid' AND product_slug=$1 AND metadata->>'forUsername' ILIKE $2`,
  [slug, username]
);
if (dup.rows.length) {
  console.log('УЖЕ ВЫДАВАЛОСЬ:', JSON.stringify(dup.rows, null, 2));
  await c.end();
  process.exit(0);
}

await c.query(
  `INSERT INTO events (id, type, source, product_slug, metadata)
   VALUES ($1, 'web_paid', 'manual', $2, $3::jsonb)`,
  [eventId, slug, JSON.stringify({
    token, email: '', phone: '', amount,
    orderId, consumed: false, manual: true, offline: true,
    forUsername: username, grantedBy: 'sasha', note,
  })]
);

console.log('event:', eventId);
console.log('ССЫЛКА: https://t.me/testtoyzbot?start=paid_' + token);
await c.end();
