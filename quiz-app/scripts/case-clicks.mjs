// Кто открывал кейсы по ссылкам из директа.
//
//   node scripts/case-clicks.mjs [дней, по умолчанию 14]
//
// Читает events: клики по коротким ссылкам /b/<slug> (case_link_click) и
// просмотры самих страниц кейсов (page_view с tag=case). Именные строки —
// те, где в ссылке был ?u=<ник>.
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
  `SELECT type,
          created_at,
          metadata->>'u'    AS handle,
          metadata->>'case' AS case_slug,
          metadata->>'path' AS path
     FROM events
    WHERE created_at > now() - ($1 || ' days')::interval
      AND (type = 'case_link_click'
           OR (type = 'page_view' AND metadata->>'tag' = 'case'))
    ORDER BY created_at DESC`,
  [days]
);

const caseOf = (r) =>
  r.case_slug || (r.path || '').match(/\/cases\/([a-z0-9-]+)/)?.[1] || '?';

const named = rows.filter((r) => r.handle);
const clicks = rows.filter((r) => r.type === 'case_link_click');
const views = rows.filter((r) => r.type === 'page_view');

console.log(`\nза ${days} дней: ${clicks.length} переходов по ссылкам, ${views.length} просмотров кейсов`);
console.log(`из них именных (ссылка отправлена конкретному человеку): ${named.length}\n`);

if (named.length) {
  console.log('— кому отправляли и кто открыл —');
  const byHandle = new Map();
  for (const r of named) {
    const k = r.handle;
    if (!byHandle.has(k)) byHandle.set(k, []);
    byHandle.get(k).push(r);
  }
  for (const [handle, list] of [...byHandle].sort((a, b) => b[1].length - a[1].length)) {
    const opened = list.some((r) => r.type === 'page_view');
    const when = new Date(Math.max(...list.map((r) => +new Date(r.created_at))));
    const cases = [...new Set(list.map(caseOf))].join(', ');
    console.log(
      `  @${handle.padEnd(24)} ${opened ? 'открыл страницу ' : 'только переход '} · ${cases.padEnd(10)} · ${when.toISOString().slice(0, 16).replace('T', ' ')}`
    );
  }
}

const byCase = new Map();
for (const r of rows) {
  const k = caseOf(r);
  byCase.set(k, (byCase.get(k) || 0) + 1);
}
console.log('\n— по кейсам —');
for (const [slug, n] of [...byCase].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${slug}`);
}

await client.end();
