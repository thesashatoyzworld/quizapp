// Живой наблюдатель за оплатой МК. Каждые 3 сек смотрит, не появился ли
// новый доступ/событие по МК. Запускать ПЕРЕД тем как Саша жмёт «оплатить».
// Ctrl+C для выхода.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const main = async () => {
  await c.connect();
  const since = new Date(Date.now() - 60 * 1000); // окно: последняя минута и далее
  console.log('👀 Жду платёж МК... (смотрю product_access + events с', since.toISOString().slice(11, 19), 'UTC)');
  const seen = new Set();

  const tick = async () => {
    const acc = await c.query(
      `SELECT id, product_slug, role, source, telegram_id, status, created_at
       FROM product_access WHERE created_at > $1 ORDER BY created_at DESC`, [since]
    );
    for (const r of acc.rows) {
      if (seen.has('a' + r.id)) continue;
      seen.add('a' + r.id);
      console.log(`\n✅ ДОСТУП ВЫДАН: role=${r.role} source=${r.source} tg=${r.telegram_id ?? '—'} (${r.created_at.toISOString().slice(11,19)})`);
      const token = String(r.source).startsWith('mkdengi_web_') ? String(r.source).replace('mkdengi_web_', '') : null;
      if (token) console.log(`   → проверь кабинет: https://world.thesashatoyz.com/dostup?t=${token}`);
    }
    const ev = await c.query(
      `SELECT type, metadata, created_at FROM events
       WHERE type IN ('mk_web_paid','payment_success') AND created_at > $1 ORDER BY created_at DESC`, [since]
    );
    for (const r of ev.rows) {
      const k = 'e' + r.created_at.toISOString() + r.type;
      if (seen.has(k)) continue;
      seen.add(k);
      console.log(`\n📩 СОБЫТИЕ: ${r.type} (${r.created_at.toISOString().slice(11,19)})`, JSON.stringify(r.metadata)?.slice(0, 200));
    }
  };

  await tick();
  setInterval(tick, 3000);
};
main().catch((e) => { console.error(e.message); process.exit(1); });
