// Сделка: продажа вне каталога одной ссылкой в бота.
//
//   node scripts/deal-link.mjs <t1|t2|t3> <цена> <дней> [@username] [заметка]
//   node scripts/deal-link.mjs t2 25000 90 @lyutov_fit "тариф изи"
//   node scripts/deal-link.mjs t3 130000 99 @Dmitrii_Poshin "групповой до 13.12" --title "Менторство, групповой"
//
// Печатает ссылку t.me/testtoyzbot?start=deal_<id>. По ней человек видит свою
// цену, платит, и доступ открывается ровно на указанный срок: покупка попадает
// в purchases и в /admin/revenue, приветствие и интервью запускаются сами.
//
// Раньше такая продажа шла счётом руками из кабинета Продамуса. Такой счёт
// приходит с ПУСТЫМ order_num, вебхук не понимает, чей платёж, и доступ
// открывался руками. Счета руками больше не выставлять.
//
// ⚠️ Автопродления у сделки нет: карточка подписки в Продамусе фиксирует сумму,
// произвольную под каждого выставить нельзя. Следующий срок = новая сделка.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const TIERS = {
  t1: 'Тариф 1 (делаешь сам)',
  t2: 'Тариф 2 (сам + монетизация)',
  t3: 'Тариф 3 (делаем вместе)',
};

const argv = process.argv.slice(2);
const titleIdx = argv.indexOf('--title');
const titleOverride = titleIdx >= 0 ? argv[titleIdx + 1] : null;
const args = titleIdx >= 0 ? argv.filter((_, i) => i !== titleIdx && i !== titleIdx + 1) : argv;

const tier = (args[0] || '').toLowerCase();
const price = parseInt(args[1], 10);
const days = parseInt(args[2], 10);
const forUser = (args[3] || '').startsWith('@') ? args[3] : null;
const note = (forUser ? args[4] : args[3]) || null;

if (!TIERS[tier] || !price || !days) {
  console.error('usage: node scripts/deal-link.mjs <t1|t2|t3> <цена> <дней> [@username] [заметка] [--title "..."]');
  process.exit(1);
}

const title = titleOverride || `Новый уровень контента — ${TIERS[tier]}, ${days} дн.`;

// base36 без «_»: подчёркивание разделяет части order_id (deal_<id>_<tgId>).
const id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).replace(/_/g, '');

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

await c.query(
  `INSERT INTO deals (id, tier, price, days, title, for_user, note)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [id, tier, price, days, title, forUser, note],
);
await c.end();

console.log('');
console.log('  Сделка заведена:', id);
console.log('  ', title);
console.log('  ', `${price.toLocaleString('ru-RU')} ₽ · доступ на ${days} дней`, forUser ? `· ${forUser}` : '');
console.log('');
console.log('  Ссылка человеку:');
console.log(`  https://t.me/testtoyzbot?start=deal_${id}`);
console.log('');
