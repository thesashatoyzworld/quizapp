// Кто открывал кейсы по ссылкам, отправленным руками в директ.
//
//   node scripts/case-clicks.mjs [дней, по умолчанию 14]
//
// Ссылки вида /cases/<кейс>?utm_source=instagram&utm_medium=dm&u=<ник>.
// Ничего доделывать в сайте не нужно: трекер в layout пишет page_view вместе
// с полным адресом, поэтому и метка канала, и ник лежат в событии.
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
          metadata->>'path' AS path,
          metadata->>'u'    AS handle
     FROM events
    WHERE created_at > now() - ($1 || ' days')::interval
      AND type = 'page_view'
      AND metadata->>'tag' = 'case'
    ORDER BY created_at DESC`,
  [days]
);

// ник берём из metadata, а если его там нет — из адреса страницы
const handleOf = (r) => r.handle || (r.path || '').match(/[?&]u=([^&]+)/)?.[1] || null;
const caseOf = (r) => (r.path || '').match(/\/cases\/([a-z0-9-]+)/)?.[1] || '?';
const isDm = (r) => r.utm_medium === 'dm' || /utm_medium=dm/.test(r.path || '');

const named = rows.filter((r) => handleOf(r));
const dm = rows.filter(isDm);

console.log(`\nза ${days} дней: ${rows.length} просмотров кейсов`);
console.log(`из директа: ${dm.length}`);
console.log(`именных (ссылка отправлена конкретному человеку): ${named.length}\n`);

if (named.length) {
  const byHandle = new Map();
  for (const r of named) {
    const k = handleOf(r);
    if (!byHandle.has(k)) byHandle.set(k, []);
    byHandle.get(k).push(r);
  }
  console.log('— кто открыл —');
  for (const [handle, list] of [...byHandle].sort((a, b) => b[1].length - a[1].length)) {
    const when = new Date(Math.max(...list.map((r) => +new Date(r.created_at))));
    const cases = [...new Set(list.map(caseOf))].join(', ');
    console.log(
      `  @${handle.padEnd(24)} ${String(list.length).padStart(2)} просм · ${cases.padEnd(12)} · ${when.toISOString().slice(0, 16).replace('T', ' ')}`
    );
  }
} else {
  console.log('именных переходов пока нет');
}

const byCase = new Map();
for (const r of rows) {
  const k = caseOf(r);
  byCase.set(k, (byCase.get(k) || 0) + 1);
}
console.log('\n— по кейсам, все источники —');
for (const [slug, n] of [...byCase].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${slug}`);
}

await client.end();
