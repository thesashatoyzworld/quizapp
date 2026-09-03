// Что продаём этому человеку и какие ходы до оффера.
//
// Запуск: node scripts/tg-suggestion-add-plan.mjs
//
// Помощник теперь сначала выбирает ступень лестницы по фактам, а потом уже
// пишет сообщение. Без этих полей решение оставалось у модели в голове, и
// Саша не видел, к чему ведёт разговор.
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
    ADD COLUMN IF NOT EXISTS sell text,
    ADD COLUMN IF NOT EXISTS plan text[]
`);
console.log('tg_suggestion: sell и plan добавлены');
await db.end();
