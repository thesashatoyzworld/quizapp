// Воронка платного таргета на карусель для фитнес-тренеров.
// Реклама -> ключевое слово -> ChatPlace -> /b/fit -> кейс Васи -> анкета.
//
// Meta эту цепочку не считает: клик уходит в Direct, fbclid до сайта не
// доезжает. Считаем по своей метке utm_campaign, которую подставляет /b/fit.
//   node report-fit-target.cjs [campaign] [interval] [метка from]
//   node report-fit-target.cjs fit-carousel-0909 "14 days"
//   node report-fit-target.cjs case-vasya "30 days" case-vasya   — органика из шапки
const fs = require('fs'), path = require('path'), { Client } = require('pg');
const env = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const dbUrl = env.match(/^DATABASE_URL="(.+?)"/m)?.[1];

const CAMPAIGN = process.argv[2] || 'fit-carousel-0909';
const SINCE = process.argv[3] || '30 days';
// Метка from в ссылке: по ней анкета помечает заявку. Для платного таргета это
// fit-target, у органики из шапки профиля — case-<slug>.
const LEAD_TAG = process.argv[4] || 'fit-target';

(async () => {
  const c = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const q = (s, p = []) => c.query(s, p).then(r => r.rows)
    .catch(e => { console.error('ERR', e.message.slice(0, 200)); return []; });

  // cp — id подписчика ChatPlace, приезжает в query и оседает в metadata.path.
  const cpExpr = `substring(metadata->>'path' from 'cp=([^&]+)')`;

  const [steps] = await q(`
    with ev as (
      select type, metadata, ${cpExpr} as cp,
             metadata->>'session_id' as sid
      from events
      where source = 'web'
        and utm_campaign = $1
        and created_at > now() - interval '${SINCE}'
    )
    select
      count(*) filter (where type = 'page_view')                                     as page_views,
      count(distinct sid) filter (where type = 'page_view')                          as sessions,
      count(distinct cp)  filter (where type = 'page_view' and cp is not null)       as people,
      count(*) filter (where type = 'cta_click' and metadata->>'cta' = 'case-under-video') as cta_clicks,
      count(distinct sid) filter (where type = 'cta_click' and metadata->>'cta' = 'case-under-video') as cta_sessions
    from ev
  `, [CAMPAIGN]);

  // Заявка помечена тем же from, что стоит в ссылке (/b/fit -> from=fit-target).
  const leads = await q(`
    select id, first_name as name, contact, instagram, kind, status, created_at
    from dwy_leads
    where source = $1 and created_at > now() - interval '${SINCE}'
    order by created_at desc
  `, [LEAD_TAG]);

  const s = steps || {};
  const n = v => Number(v || 0);
  const pct = (a, b) => (n(b) ? `${((n(a) / n(b)) * 100).toFixed(1)}%` : '—');

  console.log(`\nКампания ${CAMPAIGN}, за ${SINCE}\n`);
  console.log(`  визитов кейса         ${n(s.page_views)}  (сессий ${n(s.sessions)})`);
  console.log(`  из них с меткой cp    ${n(s.people)} человек`);
  console.log(`  кликов «анкета»       ${n(s.cta_clicks)}  (сессий ${n(s.cta_sessions)}, ${pct(s.cta_sessions, s.sessions)} от визитов)`);
  console.log(`  заявок отправлено     ${leads.length}  (${pct(leads.length, s.cta_sessions)} от кликнувших)\n`);

  if (leads.length) {
    console.log('  Заявки:');
    for (const l of leads) {
      const d = new Date(l.created_at).toISOString().slice(5, 16).replace('T', ' ');
      console.log(`   #${l.id}  ${d}  ${l.name}  ${l.contact || l.instagram || ''}  [${l.status}]`);
    }
    console.log('');
  }

  // Кто дошёл до кейса, но анкету не открыл — этих догревать в Direct руками.
  const stuck = await q(`
    with ev as (
      select ${cpExpr} as cp, type
      from events
      where source = 'web' and utm_campaign = $1
        and created_at > now() - interval '${SINCE}'
    )
    select cp,
           count(*) filter (where type = 'page_view') as views,
           count(*) filter (where type = 'cta_click') as clicks
    from ev where cp is not null
    group by cp having count(*) filter (where type = 'cta_click') = 0
    order by views desc limit 50
  `, [CAMPAIGN]);

  if (stuck.length) {
    console.log(`  Смотрели кейс, анкету не открыли (${stuck.length}):`);
    console.log('  ' + stuck.map(r => r.cp).join(', ') + '\n');
  }

  await c.end();
})();
