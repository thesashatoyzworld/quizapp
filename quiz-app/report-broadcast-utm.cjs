// Отчёт по воронке рассылки «тест на деньги» (utm_source=bot_broadcast_0609).
// Считает уникальных пользователей на каждом шаге + прирост листа ожидания.
// Шлёт сводку Саше в ЛС. Запуск:  node report-broadcast-utm.cjs
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = 788334680;
const UTM = "bot_broadcast_0609";
// Момент рассылки: 2026-06-09 ~15:27 UTC (разослано вручную вместо отложки 19:00 МСК)
const SINCE = "2026-06-09 15:25:00+00";

(async () => {
  const c = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const uniq = async (type) =>
    (await c.query(
      `SELECT count(DISTINCT telegram_id)::int n FROM events WHERE utm_source=$1 AND type=$2`,
      [UTM, type]
    )).rows[0].n;

  const opened = await uniq("webapp_open");
  const started = await uniq("quiz_start");
  const completed = await uniq("quiz_complete");
  const ctaClicked = await uniq("subscribe_click");

  const waitlistNew = (await c.query(
    `SELECT count(*)::int n FROM money_mk_waitlist WHERE created_at >= $1`,
    [SINCE]
  )).rows[0].n;
  await c.end();

  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const text = `📊 <b>Воронка рассылки «тест на деньги»</b>
метка <code>${UTM}</code>

👁 Открыли квиз: <b>${opened}</b>
▶️ Начали: <b>${started}</b> (${pct(started, opened)}% от открывших)
🏁 Прошли до конца: <b>${completed}</b> (${pct(completed, opened)}% от открывших)
🔥 Нажали «Хочу на МК»: <b>${ctaClicked}</b> (${pct(ctaClicked, completed)}% от прошедших)

📌 Записались в лист ожидания МК (с момента рассылки): <b>${waitlistNew}</b>`;

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: "HTML" }),
  });
  console.log(text.replace(/<\/?b>/g, "").replace(/<code>|<\/code>/g, ""));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
