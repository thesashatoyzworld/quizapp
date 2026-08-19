// Подарочная именная ссылка на «Новый уровень контента».
// Для авторитетных людей: доступ бесплатно, взамен — обратная связь по курсу.
//
//   node scripts/grant-gift-link.mjs <username> [slug] [note]
//
// Человека может не быть в users (бота не запускал) — telegram_id привяжется
// по клику. uroven-t1 в каталоге one_time → grantAccess ставит expires_at NULL,
// то есть доступ бессрочный сам, руками потом ничего править не надо.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import crypto from 'crypto';

const username = (process.argv[2] || '').replace(/^@/, '');
const slug = process.argv[3] || 'uroven-t1';
const note = process.argv[4] || 'подарочный доступ авторитетному человеку, взамен — обратная связь по курсу';
if (!username) { console.error('usage: node scripts/grant-gift-link.mjs <username> [slug] [note]'); process.exit(1); }

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
    token, email: '', phone: '', amount: 0,
    orderId, consumed: false, manual: true, gift: true, lifetime: true,
    forUsername: username, grantedBy: 'sasha', purpose: 'expert-feedback', note,
  })]
);

console.log('event:', eventId);
console.log('ССЫЛКА: https://t.me/testtoyzbot?start=paid_' + token);
await c.end();
