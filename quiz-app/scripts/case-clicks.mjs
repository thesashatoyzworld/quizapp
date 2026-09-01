// Сколько кейсов открыли по ссылкам из директа.
//
//   node scripts/case-clicks.mjs [дней, по умолчанию 14]
//
// Ссылки, которые ассистент шлёт руками, выглядят так:
//   https://thesashatoyz.com/cases/vasya?utm_source=instagram&utm_medium=dm
//
// Считаем канал, а не человека: поимённо переходы не отслеживаем. Доделывать
// в сайте ничего не нужно — трекер в layout пишет page_view вместе с полным
// адресом, поэтому метка канала уже лежит в событии.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const days = Number(process.argv[2] || 14);

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows } = await client.query(
  `SELECT created_at,
          utm_medium,
          metadata->>'path' AS path
     FROM events
    WHERE created_at > now() - ($1 || ' days')::interval
      AND type = 'page_view'
      AND metadata->>'tag' = 'case'
    ORDER BY created_at DESC`,
  [days]
);

const caseOf = (r) => (r.path || '').match(/\/cases\/([a-z0-9-]+)/)?.[1] || '?';
const isDm = (r) => r.utm_medium === 'dm' || /utm_medium=dm/.test(r.path || '');

const dm = rows.filter(isDm);

console.log(`\nза ${days} дней: ${rows.length} просмотров кейсов, из них из директа: ${dm.length}\n`);

if (dm.length) {
  const byDay = new Map();
  const byCaseDm = new Map();
  for (const r of dm) {
    const d = new Date(r.created_at).toISOString().slice(0, 10);
    byDay.set(d, (byDay.get(d) || 0) + 1);
    const k = caseOf(r);
    byCaseDm.set(k, (byCaseDm.get(k) || 0) + 1);
  }

  console.log('— из директа по дням —');
  for (const [d, n] of [...byDay].sort()) console.log(`  ${d}  ${n}`);

  console.log('\n— из директа по кейсам —');
  for (const [slug, n] of [...byCaseDm].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${slug}`);
  }
} else {
  console.log('переходов из директа пока нет');
}

const byCase = new Map();
for (const r of rows) {
  const k = caseOf(r);
  byCase.set(k, (byCase.get(k) || 0) + 1);
}
console.log('\n— все источники, по кейсам —');
for (const [slug, n] of [...byCase].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${slug}`);
}

await client.end();
