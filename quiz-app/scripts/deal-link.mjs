// Прайс-ссылки: цена и срок вне каталога, одна ссылка на позицию.
//
//   node scripts/deal-link.mjs list
//   node scripts/deal-link.mjs add <t1|t2|t3> <цена> <дней> "<название>" [заметка]
//   node scripts/deal-link.mjs off <id>
//   node scripts/deal-link.mjs on <id>
//
// Ссылка МНОГОРАЗОВАЯ: кидается кому угодно и сколько угодно раз. Человек
// открывает её в боте, видит цену и срок, платит. Доступ, покупка в
// /admin/revenue, приветствие и интервью отрабатывают сами.
//
// Счета руками из кабинета Продамуса больше не выставлять: у них пустой
// order_num, вебхук не понимает, чей платёж, и деньги идут мимо системы.
//
// ⚠️ Автопродления нет: карточка подписки в Продамусе фиксирует сумму,
// произвольную под каждого не выставить. Следующий срок продаётся той же
// ссылкой ещё раз. Помесячный тариф 2 (10 000) и разовый тариф 1 (5 450)
// живут в каталоге со своими ссылками.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const TIERS = { t1: 'Тариф 1', t2: 'Тариф 2', t3: 'Тариф 3' };
const BOT = 'https://t.me/testtoyzbot';

const [cmd, ...args] = process.argv.slice(2);

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

const newId = () => (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).replace(/_/g, '');

if (cmd === 'add') {
  const [tier, priceRaw, daysRaw, title, note] = args;
  const price = parseInt(priceRaw, 10);
  const days = parseInt(daysRaw, 10);
  if (!TIERS[tier] || !price || !days || !title) {
    console.error('usage: node scripts/deal-link.mjs add <t1|t2|t3> <цена> <дней> "<название>" [заметка]');
    process.exit(1);
  }
  const id = newId();
  await db.query(
    'INSERT INTO deals (id, tier, price, days, title, note) VALUES ($1,$2,$3,$4,$5,$6)',
    [id, tier, price, days, title, note || null],
  );
  console.log(`${BOT}?start=deal_${id}  ${title}  ${price.toLocaleString('ru-RU')} ₽`);
} else if (cmd === 'off' || cmd === 'on') {
  const [id] = args;
  const r = await db.query('UPDATE deals SET status = $2, updated_at = now() WHERE id = $1', [
    id,
    cmd === 'off' ? 'off' : 'active',
  ]);
  console.log(r.rowCount ? `${id}: ${cmd === 'off' ? 'закрыта' : 'открыта'}` : `нет такой позиции: ${id}`);
} else {
  const r = await db.query('SELECT * FROM deals ORDER BY tier DESC, price DESC');
  if (!r.rows.length) console.log('прайс пуст');
  for (const d of r.rows) {
    const flag = d.status === 'active' ? ' ' : '×';
    const paid = d.paid_count ? `  оплат: ${d.paid_count}` : '';
    console.log(
      `${flag} ${String(d.price).padStart(7)} ₽  ${String(d.days).padStart(3)} дн.  ${TIERS[d.tier]}  ${d.title}`,
    );
    console.log(`  ${BOT}?start=deal_${d.id}${paid}`);
  }
}

await db.end();
