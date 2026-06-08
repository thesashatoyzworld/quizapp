// Статистика воронки квиза «Разрешение быстрых денег».
// Запуск: node _funnel-stats.cjs
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

(async () => {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const byType = await client.query(
    `SELECT type,
            count(*)::int AS total,
            count(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS today
       FROM events
      WHERE type IN ('webapp_open','quiz_start','quiz_complete','bot_start')
   GROUP BY type
   ORDER BY type`
  );

  const bySource = await client.query(
    `SELECT coalesce(utm_source,'(нет)') AS src,
            count(*) FILTER (WHERE type='bot_start')::int     AS bot_start,
            count(*) FILTER (WHERE type='quiz_start')::int    AS quiz_start,
            count(*) FILTER (WHERE type='quiz_complete')::int AS quiz_complete
       FROM events
      WHERE type IN ('bot_start','quiz_start','quiz_complete')
   GROUP BY utm_source
   ORDER BY quiz_start DESC, bot_start DESC`
  );

  const recent = await client.query(
    `SELECT type, coalesce(utm_source,'(нет)') AS src, created_at
       FROM events
      WHERE created_at::date = CURRENT_DATE
        AND type IN ('bot_start','webapp_open','quiz_start','quiz_complete')
   ORDER BY created_at DESC
      LIMIT 20`
  );

  console.log("\n=== КВИЗ — события (всего / сегодня) ===");
  byType.rows.forEach((r) => console.log(`  ${r.type.padEnd(14)} всего: ${String(r.total).padStart(4)}   сегодня: ${r.today}`));

  console.log("\n=== РАЗБИВКА ПО ИСТОЧНИКУ (utm_source) ===");
  bySource.rows.forEach((r) =>
    console.log(`  ${String(r.src).padEnd(22)} bot_start:${String(r.bot_start).padStart(3)}  quiz_start:${String(r.quiz_start).padStart(3)}  quiz_complete:${String(r.quiz_complete).padStart(3)}`)
  );

  console.log("\n=== СОБЫТИЯ СЕГОДНЯ (последние 20) ===");
  if (!recent.rows.length) console.log("  (за сегодня событий нет)");
  recent.rows.forEach((r) => {
    const when = new Date(r.created_at).toISOString().slice(11, 16);
    console.log(`  ${when}  ${r.type.padEnd(14)} ${r.src}`);
  });
  console.log("");

  await client.end();
})().catch((e) => { console.error(e); process.exit(1); });
