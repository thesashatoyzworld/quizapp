// Канонический отчёт по воронке МК «Разрешение быстрых денег».
// Считает ТОЛЬКО денежный квиз (metadata.quiz='money') — не смешивает со старым
// контентным квизом (metadata.quiz='content' или без маркера).
// Запуск: node report-mk-funnel.cjs [--since=2026-06-09]
const { config } = require('dotenv');
config({ path: '.env.local' });
const pg = require('pg');

const sinceArg = process.argv.find((a) => a.startsWith('--since='));
const since = sinceArg ? sinceArg.split('=')[1] : '2026-01-01';

// Технические события (мои проверки) — не люди
const NOT_HUMAN = "COALESCE(utm_source,'') NOT LIKE 'verify%' AND COALESCE(utm_source,'') NOT LIKE 'test%'";
const UID = "COALESCE(telegram_id::text, user_id::text, metadata->>'session_id', id::text)";

(async () => {
  const c = new pg.Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const q = async (sql, params = []) => (await c.query(sql, params)).rows;

  const uniq = async (where) =>
    (await q(`SELECT count(DISTINCT ${UID}) n FROM events WHERE created_at >= $1 AND ${NOT_HUMAN} AND ${where}`, [since]))[0].n;

  const quizStart = await uniq(`type='quiz_start' AND metadata->>'quiz'='money'`);
  const quizDone = await uniq(`type='quiz_complete' AND metadata->>'quiz'='money'`);
  const ctaClick = await uniq(`type='subscribe_click' AND metadata->>'quiz'='money'`);
  const landingView = await uniq(`type='page_view' AND metadata->>'path'='/mk-dengi'`);
  const payCard = await uniq(`type='payment_click' AND metadata->>'path'='/mk-dengi' AND metadata->>'method'='card'`);
  const payTg = await uniq(`type='payment_click' AND metadata->>'path'='/mk-dengi' AND metadata->>'method'='telegram'`);
  const paid = await q(
    `SELECT count(*) n FROM events WHERE created_at >= $1 AND type='mk_web_paid'
     UNION ALL
     SELECT count(*) FROM purchases WHERE created_at >= $1 AND prodamus_order_id LIKE 'mkdengi%'`,
    [since],
  );
  const access = await q(
    `SELECT count(*) n FROM product_access WHERE created_at >= $1 AND product_slug='mk-dengi' AND status='active' AND source NOT LIKE '%DEMO%'`,
    [since],
  );

  console.log(`\n=== ВОРОНКА МК «Разрешение быстрых денег» (с ${since}, уникальные люди) ===\n`);
  const pct = (a, b) => (Number(b) > 0 ? ` (${Math.round((a / b) * 100)}%)` : '');
  console.log(`Открыли квиз:            ${quizStart}`);
  console.log(`Дошли до результата:     ${quizDone}${pct(quizDone, quizStart)}`);
  console.log(`Кликнули «Хочу на МК»:   ${ctaClick}${pct(ctaClick, quizDone)}`);
  console.log(`Открыли лендинг МК:      ${landingView}  ← трекинг с 12.06, раньше данных нет`);
  console.log(`Клик «Оплатить картой»:  ${payCard}`);
  console.log(`Клик «Через Telegram»:   ${payTg}`);
  console.log(`Оплат (вебхук/purchases): ${paid.map((r) => r.n).join(' / ')}`);
  console.log(`Активных доступов МК:    ${access[0].n}`);

  console.log(`\n--- Квиз по источникам (открыли → дошли) ---`);
  for (const r of await q(
    `SELECT COALESCE(utm_source,'(без метки)') src,
            count(DISTINCT ${UID}) FILTER (WHERE type='quiz_start') s,
            count(DISTINCT ${UID}) FILTER (WHERE type='quiz_complete') d
     FROM events WHERE created_at >= $1 AND ${NOT_HUMAN} AND metadata->>'quiz'='money' GROUP BY 1 ORDER BY 2 DESC`,
    [since],
  ))
    console.log(`${r.src}: ${r.s} → ${r.d}`);

  console.log(`\n--- Кто кликнул «Хочу на МК» ---`);
  for (const r of await q(
    `SELECT e.created_at, e.utm_source, u.username, u.first_name, e.telegram_id
     FROM events e LEFT JOIN users u ON u.id::text = e.user_id
     WHERE e.created_at >= $1 AND e.type='subscribe_click' AND e.metadata->>'quiz'='money' AND ${NOT_HUMAN.replace(/utm_source/g, 'e.utm_source')}
     ORDER BY e.created_at`,
    [since],
  ))
    console.log(
      `${r.created_at.toISOString().slice(0, 16)} | @${r.username || '—'} (${r.first_name || '?'}) | tg:${r.telegram_id} | из: ${r.utm_source || '—'}`,
    );

  console.log(`\n--- Заходы на лендинг по источникам (с 12.06) ---`);
  for (const r of await q(
    `SELECT COALESCE(utm_source, CASE WHEN metadata->>'ref' LIKE '%quiz.thesashatoyz%' THEN '(из квиза, по referer)' ELSE '(прямой/без метки)' END) src,
            count(DISTINCT ${UID}) n
     FROM events WHERE created_at >= $1 AND ${NOT_HUMAN} AND type='page_view' AND metadata->>'path'='/mk-dengi' GROUP BY 1 ORDER BY 2 DESC`,
    [since],
  ))
    console.log(`${r.src}: ${r.n}`);

  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
