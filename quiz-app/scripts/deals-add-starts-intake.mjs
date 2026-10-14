// Колонка deals.starts_intake: запускать ли интервью после оплаты по позиции.
//
// Нужна для предоплат. Предоплата открывает предобучение (тариф 1), а интервью
// до этого висело только на полном тарифе 3, поэтому после брони места человека
// никто ни о чём не спрашивал и анкету запускали руками.
//
// `prisma db push` на этой базе запрещён — она общая с другими приложениями,
// поэтому колонка добавляется отдельным скриптом. Запуск:
//   node --env-file=.env.local scripts/deals-add-starts-intake.mjs

import pg from 'pg';

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

await c.query(`ALTER TABLE deals ADD COLUMN IF NOT EXISTS starts_intake boolean NOT NULL DEFAULT false`);

const cols = await c.query(
  `SELECT column_name, data_type, column_default
     FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'starts_intake'`,
);
console.log(cols.rows[0] || 'колонка не появилась');

await c.end();
