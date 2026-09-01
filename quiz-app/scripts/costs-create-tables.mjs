// Заводит таблицы расходов: service_cost_plans, service_usage_daily, fx_rates_daily.
//
// НЕ `prisma db push`: база общая с другими проектами, push сносит чужие
// таблицы, которых нет в этой схеме.
//
// Запуск: node scripts/costs-create-tables.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

// Тариф сервиса. Фиксированная часть плюс ставки сверх пакета в pricing.
await db.query(`
  CREATE TABLE IF NOT EXISTS service_cost_plans (
    id             TEXT PRIMARY KEY,
    service        TEXT NOT NULL UNIQUE,
    title          TEXT NOT NULL,
    amount         DOUBLE PRECISION NOT NULL DEFAULT 0,
    currency       TEXT NOT NULL DEFAULT 'RUB',
    period         TEXT NOT NULL DEFAULT 'month',
    billing_day    INTEGER,
    next_charge_at TIMESTAMP(3),
    pricing        JSONB,
    note           TEXT,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Потребление по дням. Пересборка дня переписывает строку, а не плодит.
await db.query(`
  CREATE TABLE IF NOT EXISTS service_usage_daily (
    id         TEXT PRIMARY KEY,
    service    TEXT NOT NULL,
    date       DATE NOT NULL,
    metric     TEXT NOT NULL,
    value      DOUBLE PRECISION NOT NULL DEFAULT 0,
    cost       DOUBLE PRECISION,
    currency   TEXT,
    source     TEXT NOT NULL DEFAULT 'api',
    meta       JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
await db.query(
  `CREATE UNIQUE INDEX IF NOT EXISTS service_usage_daily_service_date_metric_key
     ON service_usage_daily (service, date, metric);`,
);
await db.query('CREATE INDEX IF NOT EXISTS service_usage_daily_date_idx ON service_usage_daily (date);');

// Курс на день. Без него сумма месяца поедет, если пересчитывать задним числом.
await db.query(`
  CREATE TABLE IF NOT EXISTS fx_rates_daily (
    date       DATE PRIMARY KEY,
    usd_rub    DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const { rows } = await db.query(`
  SELECT table_name FROM information_schema.tables
   WHERE table_name IN ('service_cost_plans', 'service_usage_daily', 'fx_rates_daily')
   ORDER BY table_name;
`);
console.log('на месте:', rows.map((r) => r.table_name).join(', ') || 'ничего');
await db.end();
