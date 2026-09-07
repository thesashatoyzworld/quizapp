// Сквозная проверка сделок: ссылка → оплата → доступ на срок → повтор.
//
// Бьёт по настоящим роутам теми же телами, что шлют Telegram и Продамус,
// и сверяет результат по базе. Сообщения реально уходят, поэтому telegram_id
// берём несуществующие: бот отдаст «chat not found», а логика отработает.
//
// ⚠️ Перед прогоном подменить ADMIN_CHAT_ID в .env.local на несуществующий,
// иначе Саше прилетят уведомления про пробные оплаты.
//
// Запуск (dev-сервер поднят):
//   node --env-file=.env.local scripts/verify-deals.mjs

import pg from 'pg';
import crypto from 'crypto';

const BASE = process.env.DEALS_BASE || 'http://localhost:3010';
const TG_HOOK = `${BASE}/api/telegram-webhook`;
const PAY_HOOK = `${BASE}/api/prodamus-webhook`;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const PRODAMUS = process.env.PRODAMUS_SECRET_KEY || '';

const TG_PAYS = 999000101; // платит полностью
const TG_UNDER = 999000102; // недоплачивает

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let failed = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'OK    ' : 'ПРОВАЛ'} ${name}${ok || !detail ? '' : ' :: ' + detail}`);
};

const from = (id) => ({ id, first_name: 'Проверка', username: `probe_${id}` });
const start = (id, param) =>
  fetch(TG_HOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SECRET ? { 'X-Telegram-Bot-Api-Secret-Token': SECRET } : {}),
    },
    body: JSON.stringify({ message: { chat: { id }, from: from(id), text: `/start ${param}` } }),
  });

function sortDeep(val) {
  if (Array.isArray(val)) return val.map(sortDeep);
  if (val && typeof val === 'object') {
    const out = {};
    for (const k of Object.keys(val).sort()) out[k] = sortDeep(val[k]);
    return out;
  }
  return val;
}

// Тело вебхука Продамуса плюс подпись тем же способом, что проверяет роут.
const pay = (orderId, sum) => {
  const body = {
    date: new Date().toISOString(),
    order_id: '99000001',
    order_num: orderId,
    sum: String(sum),
    payment_status: 'success',
    payment_status_description: 'Успешная оплата',
    payment_init: 'manual',
    customer_email: 'probe@example.com',
    products: { 0: { name: 'Проверка сделки', price: String(sum), quantity: '1', sum: String(sum) } },
  };
  const plain = JSON.stringify(sortDeep(body));
  const sign = crypto.createHmac('sha256', PRODAMUS).update(plain).digest('hex');
  return fetch(PAY_HOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Sign: sign },
    body: JSON.stringify(body),
  });
};

const dealRow = async (id) => (await db.query('SELECT * FROM deals WHERE id = $1', [id])).rows[0] || null;
const accessOf = async (tg) =>
  (await db.query('SELECT * FROM product_access WHERE telegram_id = $1 ORDER BY created_at DESC', [tg])).rows;
const purchasesOf = async (tg) =>
  (await db.query(
    'SELECT p.* FROM purchases p JOIN users u ON u.id = p.user_id WHERE u.telegram_id = $1',
    [tg],
  )).rows;

const newDeal = async (tier, price, days, title) => {
  const id = 'probe' + Math.random().toString(36).slice(2, 8);
  await db.query(
    "INSERT INTO deals (id, tier, price, days, title, note) VALUES ($1,$2,$3,$4,$5,'проверка')",
    [id, tier, price, days, title],
  );
  return id;
};

const wipe = async (tg) => {
  await db.query('DELETE FROM purchases WHERE user_id IN (SELECT id FROM users WHERE telegram_id = $1)', [tg]);
  await db.query('DELETE FROM product_access WHERE telegram_id = $1', [tg]);
  await db.query('DELETE FROM events WHERE telegram_id = $1', [tg]);
  await db.query('DELETE FROM intakes WHERE telegram_id = $1', [tg]).catch(() => {});
  await db.query('DELETE FROM users WHERE telegram_id = $1', [tg]);
};

await db.connect();
await db.query("DELETE FROM deals WHERE id LIKE 'probe%'");
await wipe(TG_PAYS);
await wipe(TG_UNDER);

// ── 1. Ссылка в боте ────────────────────────────────────────────
const dealId = await newDeal('t2', 25000, 90, 'Проверка: тариф 2 на 90 дней');
const r1 = await start(TG_PAYS, `deal_${dealId}`);
check('бот принял /start deal_<id>', r1.ok, `HTTP ${r1.status}`);

let d = await dealRow(dealId);
check('сделка запомнила, кто открыл ссылку', String(d.telegram_id) === String(TG_PAYS), `telegram_id=${d.telegram_id}`);
check('сделка ещё не оплачена', d.status === 'new', d.status);

// ── 2. Форма оплаты ─────────────────────────────────────────────
const r2 = await fetch(`${BASE}/pay/deal/${dealId}?u=${TG_PAYS}`, { redirect: 'manual' });
const loc = r2.headers.get('location') || '';
check('/pay/deal редиректит на форму Продамуса', loc.startsWith('https://thesashatoyz.payform.ru'), loc.slice(0, 60));
check('order_id несёт сделку и телеграм', loc.includes(`order_id=deal_${dealId}_${TG_PAYS}`), loc.slice(0, 200));
// Ключи полей в форму уходят как есть, кодируются только значения — так же,
// как у /pay/<tier>. Ищем ровно то, что реально стоит в ссылке.
check('цена приехала из сделки, не из ссылки', loc.includes('products[0][price]=25000'), loc.slice(0, 200));

// ── 3. Оплата ───────────────────────────────────────────────────
const r3 = await pay(`deal_${dealId}_${TG_PAYS}`, 25000);
check('вебхук принял оплату сделки', r3.ok, `HTTP ${r3.status}`);

d = await dealRow(dealId);
check('сделка помечена оплаченной', d.status === 'paid', d.status);
check('в сделке записана сумма', d.paid_amount === 25000, String(d.paid_amount));

const acc = await accessOf(TG_PAYS);
check('доступ выдан', acc.length === 1, `записей: ${acc.length}`);
check('доступ к тарифу 2', acc[0]?.product_slug === 'uroven-t2', acc[0]?.product_slug);

const days = acc[0] ? Math.round((new Date(acc[0].expires_at) - new Date(acc[0].granted_at)) / 86400000) : 0;
check('срок ровно 90 дней, а не месяц', days === 90, `${days} дн.`);

const pur = await purchasesOf(TG_PAYS);
check('покупка попала в purchases', pur.length === 1 && pur[0].amount === 25000, JSON.stringify(pur.map((p) => p.amount)));

// ── 4. Повторный вебхук ─────────────────────────────────────────
const expiresBefore = acc[0]?.expires_at;
await pay(`deal_${dealId}_${TG_PAYS}`, 25000);
const acc2 = await accessOf(TG_PAYS);
check('повтор не продлил доступ', String(acc2[0]?.expires_at) === String(expiresBefore), String(acc2[0]?.expires_at));
const pur2 = await purchasesOf(TG_PAYS);
check('повтор не удвоил покупку', pur2.length === 1, `записей: ${pur2.length}`);

// ── 5. Оплаченная ссылка ────────────────────────────────────────
const r5 = await fetch(`${BASE}/pay/deal/${dealId}?u=${TG_PAYS}`, { redirect: 'manual' });
const loc5 = r5.headers.get('location') || '';
check('оплаченная ссылка больше не ведёт на форму', !loc5.includes('payform'), loc5.slice(0, 60));

const r5b = await start(TG_PAYS, `deal_${dealId}`);
check('бот на оплаченной сделке не падает', r5b.ok, `HTTP ${r5b.status}`);

// ── 6. Недоплата ────────────────────────────────────────────────
const underId = await newDeal('t2', 25000, 90, 'Проверка: недоплата');
await start(TG_UNDER, `deal_${underId}`);
const r6 = await pay(`deal_${underId}_${TG_UNDER}`, 5000);
check('вебхук принял недоплату', r6.ok, `HTTP ${r6.status}`);

const accU = await accessOf(TG_UNDER);
check('на недоплату доступ НЕ выдан', accU.length === 0, `записей: ${accU.length}`);
const under = await dealRow(underId);
check('сделка осталась неоплаченной', under.status === 'new', under.status);
const ev = await db.query("SELECT * FROM events WHERE telegram_id = $1 AND type = 'underpaid'", [TG_UNDER]);
check('недоплата записана событием', ev.rows.length === 1, `событий: ${ev.rows.length}`);

// ── 7. Мусорная ссылка ──────────────────────────────────────────
const r7 = await start(TG_PAYS, 'deal_netakoy');
check('бот не падает на несуществующей сделке', r7.ok, `HTTP ${r7.status}`);

// ── Уборка ──────────────────────────────────────────────────────
await db.query("DELETE FROM deals WHERE id LIKE 'probe%'");
await wipe(TG_PAYS);
await wipe(TG_UNDER);
await db.end();

console.log('');
console.log(failed ? `ПРОВАЛОВ: ${failed}` : 'Все проверки прошли');
process.exit(failed ? 1 : 0);
