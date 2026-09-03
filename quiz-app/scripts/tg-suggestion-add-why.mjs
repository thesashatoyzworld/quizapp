// «Почему такой шаг» рядом с самим шагом.
//
// Запуск: node scripts/tg-suggestion-add-why.mjs
//
// Подсказки теперь собираются заранее пачкой и лежат до открытия страницы.
// Без этих полей при показе готового ответа терялось объяснение и пометка
// «нужен Саша» — а именно по ним видно, доверять предложенному или нет.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();
await db.query(`
  ALTER TABLE tg_suggestion
    ADD COLUMN IF NOT EXISTS why        text,
    ADD COLUMN IF NOT EXISTS stage      text,
    ADD COLUMN IF NOT EXISTS call_sasha text
`);
console.log('tg_suggestion: поля добавлены');
await db.end();
