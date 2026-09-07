// Сквозная проверка прайс-ссылок: ссылка → оплата → доступ на срок → повтор.
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
const TG_AGAIN = 999000103; // платит по той же ссылке следом за первым
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
    products: { 0: { name: 'Проверка прайса', price: String(sum), quantity: '1', sum: String(sum) } },
  };
  const plain = JSON.stringify(sortDeep(body));
  const sign = crypto.createHmac('sha256', PRODAMUS).update(plain).digest('hex');
  return fetch(PAY_HOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Sign: sign },
    body: JSON.stringify(body),
  });
};

// Ссылка на оплату, как её отдаёт бот, и order_id из неё.
const payLink = async (dealId, tg) => {
  const r = await fetch(`${BASE}/pay/deal/${dealId}?u=${tg}`, { redirect: 'manual' });
  const loc = r.headers.get('location') || '';
  const order = decodeURIComponent((loc.match(/order_id=([^&]+)/) || [])[1] || '');
  return { loc, order };
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
for (const tg of [TG_PAYS, TG_AGAIN, TG_UNDER]) await wipe(tg);

// ── 1. Ссылка в боте ────────────────────────────────────────────
const dealId = await newDeal('t2', 25000, 90, 'Проверка: тариф 2 на 90 дней');
const r1 = await start(TG_PAYS, `deal_${dealId}`);
check('бот принял /start deal_<id>', r1.ok, `HTTP ${r1.status}`);

// ── 2. Форма оплаты ─────────────────────────────────────────────
const { loc, order } = await payLink(dealId, TG_PAYS);
check('/pay/deal редиректит на форму Продамуса', loc.startsWith('https://thesashatoyz.payform.ru'), loc.slice(0, 60));
check('order_id несёт позицию и телеграм', order.startsWith(`deal_${dealId}_${TG_PAYS}_`), order);
check('цена приехала из прайса, не из ссылки', loc.includes('products[0][price]=25000'), loc.slice(0, 200));

// ── 3. Оплата ───────────────────────────────────────────────────
const r3 = await pay(order, 25000);
check('вебхук принял оплату', r3.ok, `HTTP ${r3.status}`);

const acc = await accessOf(TG_PAYS);
check('доступ выдан', acc.length === 1, `записей: ${acc.length}`);
check('доступ к тарифу 2', acc[0]?.product_slug === 'uroven-t2', acc[0]?.product_slug);

const days = acc[0] ? Math.round((new Date(acc[0].expires_at) - new Date(acc[0].granted_at)) / 86400000) : 0;
check('срок ровно 90 дней, а не месяц', days === 90, `${days} дн.`);

const pur = await purchasesOf(TG_PAYS);
check('покупка попала в purchases', pur.length === 1 && pur[0].amount === 25000, JSON.stringify(pur.map((p) => p.amount)));
check('оплата посчиталась в прайсе', (await dealRow(dealId)).paid_count === 1, String((await dealRow(dealId)).paid_count));

// ── 4. Повторный вебхук по той же оплате ────────────────────────
const expiresBefore = acc[0]?.expires_at;
await pay(order, 25000);
const acc2 = await accessOf(TG_PAYS);
check('дубль вебхука не продлил доступ', String(acc2[0]?.expires_at) === String(expiresBefore), String(acc2[0]?.expires_at));
check('дубль вебхука не удвоил покупку', (await purchasesOf(TG_PAYS)).length === 1);

// ── 5. Тот же человек продлевается той же ссылкой ───────────────
const second = await payLink(dealId, TG_PAYS);
check('вторая оплата получила свой order_id', second.order !== order, second.order);
await pay(second.order, 25000);
const acc3 = await accessOf(TG_PAYS);
const days3 = acc3[0] ? Math.round((new Date(acc3[0].expires_at) - new Date(acc3[0].granted_at)) / 86400000) : 0;
check('продление добавило ещё 90 дней', days3 === 180, `${days3} дн.`);
check('вторая покупка записана', (await purchasesOf(TG_PAYS)).length === 2);

// ── 6. Та же ссылка, другой человек ─────────────────────────────
await start(TG_AGAIN, `deal_${dealId}`);
const other = await payLink(dealId, TG_AGAIN);
await pay(other.order, 25000);
const accB = await accessOf(TG_AGAIN);
check('ссылка многоразовая: второй человек тоже получил доступ', accB.length === 1, `записей: ${accB.length}`);
check('оплат по позиции стало три', (await dealRow(dealId)).paid_count === 3, String((await dealRow(dealId)).paid_count));

// ── 7. Недоплата ────────────────────────────────────────────────
const underId = await newDeal('t2', 25000, 90, 'Проверка: недоплата');
await start(TG_UNDER, `deal_${underId}`);
const under = await payLink(underId, TG_UNDER);
const r7 = await pay(under.order, 5000);
check('вебхук принял недоплату', r7.ok, `HTTP ${r7.status}`);
check('на недоплату доступ НЕ выдан', (await accessOf(TG_UNDER)).length === 0);
const ev = await db.query("SELECT * FROM events WHERE telegram_id = $1 AND type = 'underpaid'", [TG_UNDER]);
check('недоплата записана событием', ev.rows.length === 1, `событий: ${ev.rows.length}`);

// ── 8. Закрытая позиция ─────────────────────────────────────────
await db.query("UPDATE deals SET status = 'off' WHERE id = $1", [dealId]);
const closed = await payLink(dealId, TG_PAYS);
check('закрытая ссылка не ведёт на форму', !closed.loc.includes('payform'), closed.loc.slice(0, 60));
const r8 = await start(TG_PAYS, `deal_${dealId}`);
check('бот на закрытой позиции не падает', r8.ok, `HTTP ${r8.status}`);

// ── 9. Мусорная ссылка ──────────────────────────────────────────
const r9 = await start(TG_PAYS, 'deal_netakoy');
check('бот не падает на несуществующей позиции', r9.ok, `HTTP ${r9.status}`);

// ── Уборка ──────────────────────────────────────────────────────
await db.query("DELETE FROM deals WHERE id LIKE 'probe%'");
for (const tg of [TG_PAYS, TG_AGAIN, TG_UNDER]) await wipe(tg);
await db.end();

console.log('');
console.log(failed ? `ПРОВАЛОВ: ${failed}` : 'Все проверки прошли');
process.exit(failed ? 1 : 0);
