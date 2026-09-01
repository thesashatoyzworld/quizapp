// Разведка: какие типы событий уже пишутся и не мешает ли ограничение
// добавить новый (case_link_click). Только чтение.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const types = await client.query(
  `SELECT type, count(*) AS n FROM events GROUP BY type ORDER BY n DESC LIMIT 30`
);
console.log('типы событий в таблице:');
for (const r of types.rows) console.log(`  ${String(r.n).padStart(7)}  ${r.type}`);

const cons = await client.query(
  `SELECT conname, pg_get_constraintdef(oid) AS def
     FROM pg_constraint
    WHERE conrelid = 'events'::regclass`
);
console.log('\nограничения на таблице:');
for (const r of cons.rows) console.log(`  ${r.conname}: ${r.def}`);

const cols = await client.query(
  `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
    WHERE table_name = 'events' ORDER BY ordinal_position`
);
console.log('\nколонки:');
for (const r of cols.rows) console.log(`  ${r.column_name.padEnd(16)} ${r.data_type} ${r.is_nullable === 'NO' ? 'NOT NULL' : ''}`);

await client.end();
