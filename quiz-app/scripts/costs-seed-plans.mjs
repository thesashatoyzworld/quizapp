// Заводит тарифы пяти сервисов. Идемпотентно: повторный запуск обновляет
// ставки, но не трогает суммы, проставленные руками в кабинете.
//
// Ставки Kinescope сверены с реальным счётом за август 2026: по ним вышло
// 1928 ₽ против фактических 1938 ₽.
//
// Запуск: node scripts/costs-seed-plans.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { randomUUID } from 'crypto';

const PLANS = [
  {
    service: 'kinescope',
    title: 'Super, оплата по факту',
    amount: 0,
    currency: 'RUB',
    pricing: { cdn_gb: 1.9, storage_gb: 1.9, encoding_min: 0.8 },
    note: 'Минимум по тарифу 700 ₽/мес. Ставки лесенкой от объёма: трафик 1,9→0,7, хранение 1,9→1,5.',
  },
  {
    service: 'elevenlabs',
    title: 'подписка',
    amount: 0,
    currency: 'USD',
    pricing: {},
    note: 'Сумма и ставка за символы не заведены — ждём цифру из счёта.',
  },
  {
    service: 'anthropic_api',
    title: 'API, оплата по факту',
    amount: 0,
    currency: 'USD',
    pricing: {},
    note: 'Считается из usage вызовов. Биллинг-эндпоинт закрыт без админ-ключа.',
  },
  {
    service: 'claude_sub',
    title: 'подписка Claude',
    amount: 0,
    currency: 'USD',
    pricing: {},
    note: 'Фиксированная, сумма не заведена.',
  },
  {
    service: 'zoom',
    title: 'подписка Zoom',
    amount: 0,
    currency: 'USD',
    pricing: {},
    note: 'Фиксированная, сумма не заведена.',
  },
];

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

for (const plan of PLANS) {
  await db.query(
    `INSERT INTO service_cost_plans (id, service, title, amount, currency, pricing, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (service) DO UPDATE
        SET pricing = EXCLUDED.pricing,
            note = EXCLUDED.note,
            updated_at = CURRENT_TIMESTAMP`,
    [randomUUID(), plan.service, plan.title, plan.amount, plan.currency, JSON.stringify(plan.pricing), plan.note],
  );
}

const { rows } = await db.query(
  'SELECT service, title, amount, currency, pricing FROM service_cost_plans ORDER BY service',
);
for (const r of rows) console.log(`${r.service.padEnd(14)} ${r.amount} ${r.currency}  ${JSON.stringify(r.pricing)}`);
await db.end();
