// Первое наполнение реестра выручки: сентябрь 2026, сверено с кабинетом
// Продамуса и уточнено Сашей. Дальше оплаты вносятся на /admin/revenue.
//
// Идемпотентно: order_id уникален, повторный запуск ничего не задвоит.
// Ручные оплаты без order_id узнаются по паре «дата + сумма + кто».
//
//   node scripts/revenue-seed-september.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { randomUUID } from 'crypto';

const TARGET = 1_500_000;
const MONTH = '2026-09';

// Даты — как в кабинете Продамуса (он показывает время в UTC+8).
const ROWS = [
  ['2026-09-02', 5450, 5242.90, 'lantrat.r@mail.ru', 'тариф 1', 'prodamus', 'uroven_t1_829104633', ''],
  ['2026-09-03', 5450, 5242.90, 'adelyaaa123@mail.ru', 'тариф 1', 'prodamus', 'uroven_t1_1004554518', ''],
  ['2026-09-03', 130000, 125060, 'Даниэл Осипов', 'групповой', 'prodamus', '48371724', 'danielosipov8@gmail.com'],
  ['2026-09-03', 10000, 10000, 'Дмитрий Субботин', 'тариф 1', 'manual', null, 'оплата мимо Продамуса'],
  ['2026-09-04', 5450, 5242.90, 'anpopov2006@gmail.com', 'тариф 1', 'prodamus', 'uroven_t1_1046440125', ''],
  ['2026-09-04', 5450, 5242.90, 'akovalevaa96@gmail.com', 'тариф 1', 'prodamus', 'paid_mtmytlapjvrimk', ''],
  ['2026-09-05', 130000, 125060, 'Даниэл Осипов', 'переход на индивидуальную персоналку', 'prodamus', '48454748', 'вторая сделка, не дубль'],
  ['2026-09-05', 10000, 9000, 'Карина Грайлер-Калина', 'предоплата', 'prodamus', 'paid_f2ace709e7bd97056b75', 'валютный платёж, комиссия 10%'],
  ['2026-09-05', 130000, 117000, 'Дмитрий Пошин', 'тариф 3 групповой', 'prodamus', '48454887', 'валютный платёж, комиссия 10%'],
  ['2026-09-05', 7500, 7140, 'katerinaivanova1488@gmail.com', 'тариф 2', 'prodamus', '48455883', 'старая цена подписки'],
];

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

await c.query(
  `INSERT INTO revenue_goals (month, target, updated_at) VALUES ($1, $2, NOW())
   ON CONFLICT (month) DO UPDATE SET target = EXCLUDED.target, updated_at = NOW()`,
  [MONTH, TARGET]
);

let added = 0;
for (const [paidAt, amount, payout, who, product, channel, orderId, note] of ROWS) {
  if (orderId) {
    const r = await c.query(
      `INSERT INTO revenue_entries (id, paid_at, amount, payout, who, product, channel, order_id, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (order_id) WHERE order_id IS NOT NULL DO NOTHING`,
      [randomUUID(), paidAt, amount, payout, who, product, channel, orderId, note]
    );
    added += r.rowCount;
  } else {
    const dup = await c.query(
      `SELECT 1 FROM revenue_entries WHERE paid_at = $1 AND amount = $2 AND who = $3`,
      [paidAt, amount, who]
    );
    if (dup.rowCount) continue;
    await c.query(
      `INSERT INTO revenue_entries (id, paid_at, amount, payout, who, product, channel, order_id, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8)`,
      [randomUUID(), paidAt, amount, payout, who, product, channel, note]
    );
    added += 1;
  }
}

const sum = await c.query(
  `SELECT count(*)::int n, sum(amount)::numeric gross, sum(coalesce(payout, amount))::numeric net
     FROM revenue_entries WHERE paid_at >= '2026-09-01' AND paid_at < '2026-10-01'`
);
console.log('добавлено:', added);
console.log('в реестре сентября:', sum.rows[0].n, '| вал', sum.rows[0].gross, '| на счёт', sum.rows[0].net);
console.log('цель:', TARGET);
await c.end();
