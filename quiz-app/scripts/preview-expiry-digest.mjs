import { config } from "dotenv";
config({ path: ".env.local" });
import pg from "pg";
const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const r = await c.query(`
  SELECT COALESCE('@'||u.username, u.first_name, pa.telegram_id::text) who, pa.product_slug slug,
         pa.expires_at::text e,
         ROUND(EXTRACT(EPOCH FROM (pa.expires_at - (now() AT TIME ZONE 'UTC')))/86400.0) d
  FROM product_access pa LEFT JOIN users u ON u.telegram_id = pa.telegram_id
  WHERE pa.status='active' AND pa.expires_at IS NOT NULL
    AND pa.expires_at >= (now() AT TIME ZONE 'UTC') - interval '7 days'
    AND pa.expires_at <= (now() AT TIME ZONE 'UTC') + interval '3 days'
  ORDER BY pa.expires_at`);
const T = {'uroven-t1':'т1','uroven-t2':'т2','uroven-t3':'т3'};
const msk = t => { const d = new Date(t.replace(' ','T')+'Z'); d.setUTCHours(d.getUTCHours()+3);
  const p = n => String(n).padStart(2,'0'); return `${p(d.getUTCDate())}.${p(d.getUTCMonth()+1)} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`; };
const rows = r.rows.map(x => ({...x, line: `• ${x.who} — ${T[x.slug]||x.slug}, ${msk(x.e)}`}));
const past = rows.filter(x => Number(x.d) < 0), today = rows.filter(x => Number(x.d) === 0), soon = rows.filter(x => Number(x.d) > 0);
const out = ['⏰ Доступы'];
if (past.length) out.push('', `Истекли (${past.length}) — доступ уже закрыт:`, ...past.map(x=>x.line));
if (today.length) out.push('', `Истекают сегодня (${today.length}):`, ...today.map(x=>x.line));
if (soon.length) out.push('', `Ближайшие 3 дня (${soon.length}):`, ...soon.map(x=>x.line));
if (rows.length) out.push('', 'Автосписания у этих доступов нет — продлевать руками.');
console.log(rows.length ? out.join('\n') : '(сегодня сводка не ушла бы: никто не горит)');
await c.end();
