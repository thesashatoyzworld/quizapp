// Добавляет в dwy_leads телефон, инстаграм и метку потока. Идемпотентно.
// Запуск: node --env-file=.env.local scripts/dwy-add-contact-columns.mjs
//
// Не через `prisma db push`: база общая, истории миграций нет, push привёл бы
// к схеме ВСЮ базу и мог снести чужие таблицы. Добавляем ровно три колонки.
//
// kind: 'mentor' — анкета менторства, 't2'/'t3' — лист ожидания тарифа.
// Старым строкам проставляем 'mentor': до листов ожидания других не было.
import pg from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('DIRECT_URL / DATABASE_URL не заданы');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

// У листа ожидания обязательны только имя и контакт, остальные ответы могут
// не прийти вовсе — снимаем с них NOT NULL. Данные при этом не трогаются,
// операция обратима (ALTER COLUMN ... SET NOT NULL).
const SQL = `
ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS phone     TEXT;
ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE dwy_leads ADD COLUMN IF NOT EXISTS kind      TEXT;
UPDATE dwy_leads SET kind = 'mentor' WHERE kind IS NULL;

ALTER TABLE dwy_leads ALTER COLUMN who         DROP NOT NULL;
ALTER TABLE dwy_leads ALTER COLUMN has_product DROP NOT NULL;
ALTER TABLE dwy_leads ALTER COLUMN level       DROP NOT NULL;
ALTER TABLE dwy_leads ALTER COLUMN tried       DROP NOT NULL;
ALTER TABLE dwy_leads ALTER COLUMN want        DROP NOT NULL;
ALTER TABLE dwy_leads ALTER COLUMN income      DROP NOT NULL;
ALTER TABLE dwy_leads ALTER COLUMN hours       DROP NOT NULL;
`;

await client.connect();
await client.query(SQL);
const { rows } = await client.query(
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'dwy_leads' ORDER BY ordinal_position`
);
console.table(rows);
const { rows: counts } = await client.query(
  `SELECT COALESCE(kind, '—') AS kind, count(*)::int FROM dwy_leads GROUP BY 1 ORDER BY 1`
);
console.table(counts);
await client.end();
console.log('dwy_leads: phone, instagram, kind на месте');
