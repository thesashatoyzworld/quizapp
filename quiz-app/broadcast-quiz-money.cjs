// Рассылка квиза «тест на деньги» по всей базе подписчиков @testtoyzbot.
// Шлёт всем из users, кроме теста Саши. utm_source=bot_broadcast_0609 для трекинга.
// Запуск:  node broadcast-quiz-money.cjs
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = 788334680; // Саша — отчёт о рассылке
const SKIP_IDS = new Set([788334680]); // SASHA TOYZ — тест

const TEXT = `<b>почему ты не получаешь деньги?</b>

привет, многим в онлайне трудно продавать и получать за свои продукты / услуги деньги

я собрал тест, который покажет 1 из 7 причин, которая тебя тормозит в деньгах

это прям реально психологический блок

3 минуты, но я уверен тебе будет супер полезно

жми кнопку ниже 👇`;

// Кнопка web_app → квиз открывается как Mini App внутри Telegram (не браузер).
// Метка трекинга зашита в URL (квиз читает ?utm_source).
const QUIZ_URL = "https://quiz.thesashatoyz.com/quiz-money?utm_source=bot_broadcast_0609";
const MARKUP = { inline_keyboard: [[{ text: "🧭 Пройти тест", web_app: { url: QUIZ_URL } }]] };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function send(chatId) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: TEXT,
      parse_mode: "HTML",
      reply_markup: MARKUP,
    }),
  });
  return res.json();
}

(async () => {
  const me = await (await fetch(`https://api.telegram.org/bot${TOKEN}/getMe`)).json();
  console.log(`Бот: @${me.result?.username}\n`);

  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const { rows } = await client.query(
    `SELECT telegram_id, username, first_name FROM users ORDER BY created_at ASC`
  );
  // те, кто уже прошёл квиз до конца — их не бьём повторно
  const doneRows = await client.query(
    `SELECT DISTINCT telegram_id FROM events WHERE type='quiz_complete' AND telegram_id IS NOT NULL`
  );
  await client.end();
  const completed = new Set(doneRows.rows.map((r) => Number(r.telegram_id)));

  const targets = rows.filter(
    (r) => !SKIP_IDS.has(Number(r.telegram_id)) && !completed.has(Number(r.telegram_id))
  );
  console.log(
    `Получателей: ${targets.length} (из ${rows.length}; исключены тест + ${completed.size} уже прошедших квиз)\n`
  );

  let ok = 0, blocked = 0, fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const r = targets[i];
    const out = await send(r.telegram_id);
    if (out.ok) {
      ok++;
    } else if (out.error_code === 403) {
      blocked++; // заблокировал бота / не начинал диалог
    } else {
      fail++;
      console.log(`❌ id:${r.telegram_id} — ${out.error_code}: ${out.description}`);
      // 429 — подождать retry_after
      if (out.error_code === 429 && out.parameters?.retry_after) {
        await sleep((out.parameters.retry_after + 1) * 1000);
      }
    }
    if ((i + 1) % 100 === 0) console.log(`… ${i + 1}/${targets.length} (ok:${ok} blocked:${blocked} fail:${fail})`);
    await sleep(250); // ~4 msg/сек
  }
  console.log(`\nИтого: доставлено ${ok}, заблокировали ${blocked}, прочих ошибок ${fail}`);

  // Отчёт Саше в ЛС
  const report = `📤 <b>Рассылка «тест на деньги» отправлена</b>

✅ Доставлено: <b>${ok}</b>
🚫 Заблокировали бота: ${blocked}
⚠️ Прочих ошибок: ${fail}
👥 Всего в базе: ${rows.length}

Метка: <code>bot_broadcast_0609</code>
Воронку (открыли / прошли / записались) пришлю отдельным отчётом утром.`;
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ADMIN_ID, text: report, parse_mode: "HTML" }),
  }).catch(() => {});
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
