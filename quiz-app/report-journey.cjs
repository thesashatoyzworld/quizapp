// Per-person funnel journey: kazino reel -> bot -> article -> /uroven -> checkout -> paid.
// Stitches events + purchases + users by telegram id. Run from quiz-app (DATABASE_URL in .env.local).
//   node report-journey.cjs [interval]     e.g. "14 days" (default 30 days)
const fs = require('fs'), path = require('path'), { Client } = require('pg');
const env = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const dbUrl = env.match(/^DATABASE_URL="(.+?)"/m)?.[1];
const SINCE = process.argv[2] || '30 days';

(async () => {
  const c = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const q = s => c.query(s).then(r => r.rows).catch(e => { console.error('ERR', e.message.slice(0, 160)); return []; });

  // normalized tg = telegram_id column, else metadata->>'tg'
  const tgExpr = `coalesce(telegram_id, case when (metadata->>'tg') ~ '^[0-9]+$' then (metadata->>'tg')::bigint end)`;

  const rows = await q(`
    with ev as (
      select ${tgExpr} as tg, type, utm_source, metadata, created_at
      from events
      where created_at > now() - interval '${SINCE}'
        and (telegram_id is not null or (metadata->>'tg') ~ '^[0-9]+$')
    ),
    paid as (
      select case when (regexp_replace(prodamus_order_id,'^uroven_t\\d+_','')) ~ '^[0-9]+$'
                  then (regexp_replace(prodamus_order_id,'^uroven_t\\d+_',''))::bigint end as tg,
             amount
      from purchases where source='uroven'
    ),
    agg as (
      select tg,
        max(utm_source) filter (where type='bot_start') as source,
        bool_or(type='bot_start') as entered,
        bool_or(type='page_view' and metadata->>'tag'='article') as opened_article,
        max((metadata->>'pct')::int) filter (where type='scroll_depth') as max_scroll,
        array_to_string(array_agg(distinct metadata->>'from') filter (where type='cta_click' and metadata->>'to'='/uroven'),',') as clicked_from,
        bool_or(type='uroven_view') as reached_landing,
        array_to_string(array_agg(distinct metadata->>'method') filter (where type='checkout_open'),',') as checkout_methods,
        min(created_at) as first_seen, max(created_at) as last_seen
      from ev group by tg
    )
    select a.*, u.username, u.first_name,
           (p.tg is not null) as paid, p.amount
    from agg a
    left join users u on u.telegram_id = a.tg
    left join paid p on p.tg = a.tg
    where a.tg is not null
    order by
      (p.tg is not null)::int * 100
      + (a.checkout_methods is not null)::int * 50
      + (a.reached_landing)::int * 30
      + (a.clicked_from is not null)::int * 20
      + coalesce(a.max_scroll,0)/10
    desc, a.last_seen desc;`);

  // ---- funnel stage summary ----
  const n = f => rows.filter(f).length;
  console.log(`\n=== ВОРОНКА — сводка по ступеням (уник. людей, ${SINCE}) ===\n`);
  console.table([
    { stage: '1. вошёл в бота',        people: n(r => r.entered) },
    { stage: '2. открыл статью',        people: n(r => r.opened_article) },
    { stage: '3. доскроллил >=50%',     people: n(r => (r.max_scroll || 0) >= 50) },
    { stage: '3b. доскроллил >=90%',    people: n(r => (r.max_scroll || 0) >= 90) },
    { stage: '4. кликнул в /uroven',    people: n(r => r.clicked_from) },
    { stage: '5. дошёл до лендинга',    people: n(r => r.reached_landing) },
    { stage: '6. открыл оплату',        people: n(r => r.checkout_methods) },
    { stage: '7. ОПЛАТИЛ',              people: n(r => r.paid) },
    { stage: '⚠ пытался, не купил',     people: n(r => r.checkout_methods && !r.paid) },
  ]);

  // ---- entry source breakdown ----
  console.log('=== источники входа (bot_start utm_source) ===');
  const bySource = {};
  rows.forEach(r => { if (r.source) bySource[r.source] = (bySource[r.source] || 0) + 1; });
  console.table(Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([source, people]) => ({ source, people })));

  // ---- per-person journey (top of funnel first) ----
  console.log(`\n=== ЖУРНАЛ ПО ЧЕЛОВЕКУ (дальше всех прошли — сверху) ===\n`);
  const deep = rows.filter(r => r.clicked_from || r.reached_landing || r.checkout_methods || r.paid || (r.max_scroll || 0) >= 75);
  deep.slice(0, 60).forEach((r, i) => {
    const uname = r.username ? '@' + r.username : '(нет ника)';
    const path = [
      r.source ? r.source : null,
      r.opened_article ? 'статья' : null,
      r.max_scroll ? r.max_scroll + '%' : null,
      r.clicked_from ? 'клик:' + r.clicked_from : null,
      r.reached_landing ? 'лендинг' : null,
      r.checkout_methods ? 'оплата:' + r.checkout_methods : null,
      r.paid ? '💰ОПЛАТИЛ ' + (r.amount || '') : (r.checkout_methods ? '❌не купил' : null),
    ].filter(Boolean).join(' → ');
    console.log(`${String(i + 1).padStart(2)}. ${uname.padEnd(20)} ${(r.first_name || '').slice(0, 18).padEnd(18)} ${path}`);
  });
  console.log(`\n(показано ${Math.min(deep.length, 60)} из ${deep.length} «тёплых»; всего людей с tg: ${rows.length})\n`);

  await c.end();
})();
