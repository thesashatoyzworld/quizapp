// Именная ссылка на менторство: доступ выдаётся по клику, анкета стартует следом.
//
//   node scripts/grant-mentorship-link.mjs <username> <slug> <amount> [note]
//
// Оплата прошла мимо системы (перевод, крипта, рассрочка) — вебхука Продамуса нет.
// Человека может не быть в users: telegram_id привяжется при переходе по ссылке.
// uroven-t3 в каталоге subscription/month → редим откроет доступ на месяц,
// срок под конкретную сделку правится отдельно.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import crypto from 'crypto';

const username = (process.argv[2] || '').replace(/^@/, '');
const slug = process.argv[3] || 'uroven-t3';
const amount = Number(process.argv[4] || 0);
const note = process.argv[5] || '';
if (!username) {
  console.error('usage: node scripts/grant-mentorship-link.mjs <username> <slug> <amount> [note]');
  process.exit(1);
}

// Токен без «_»: orderId склеивается через _web_ и подчёркивание внутри его ломает.
const token = crypto.randomBytes(10).toString('hex');
const eventId = `evt_${crypto.randomBytes(12).toString('hex')}`;
const orderId = `${slug.replace(/-/g, '_')}_web_${token}`;

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const dup = await c.query(
  `SELECT id, metadata->>'token' AS token, metadata->>'consumed' AS consumed, created_at
     FROM events
    WHERE type='web_paid' AND product_slug=$1 AND metadata->>'forUsername' ILIKE $2`,
  [slug, username]
);
if (dup.rows.length) {
  console.log('УЖЕ ВЫДАВАЛОСЬ:', JSON.stringify(dup.rows, null, 2));
  console.log('ССЫЛКА: https://t.me/testtoyzbot?start=paid_' + dup.rows[0].token);
  await c.end();
  process.exit(0);
}

await c.query(
  `INSERT INTO events (id, type, source, product_slug, metadata)
   VALUES ($1, 'web_paid', 'manual', $2, $3::jsonb)`,
  [eventId, slug, JSON.stringify({
    token, email: '', phone: '', amount,
    orderId, consumed: false, manual: true,
    forUsername: username, grantedBy: 'sasha', purpose: 'mentorship', note,
  })]
);

console.log('event:', eventId);
console.log('ССЫЛКА: https://t.me/testtoyzbot?start=paid_' + token);
await c.end();
