/**
 * Рассылка «Инстаграм это казино» по базе бота @testtoyzbot.
 *
 *   node scripts/broadcast-kazino.mjs --dry-run   → только посчитать сегмент, не слать
 *   node scripts/broadcast-kazino.mjs --test      → отправить только Саше (превью)
 *   node scripts/broadcast-kazino.mjs --send      → реальная рассылка по сегменту
 *
 * Сегмент: вся база users МИНУС те, кто заходил в бота 08.07+ (вчерашние с запуска)
 * и МИНУС exclude (Саша, рабочий аккаунт).
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';

const BOT_TOKEN = process.env.BOT_TOKEN;
const SASHA = 788334680;
const EXCLUDE = new Set([788334680, 6013902004]); // Саша + рабочий аккаунт
const SINCE = '2026-07-08'; // не трогаем заходивших с этой даты

// Текст Саши (авторский голос — не менять). Ссылка вынесена в трекинг-кнопку ниже.
const TEXT =
`Инстаграм - это казино, но вот как его обыграть

в общем я написал большой пост и видео о том, почему у вас нихрена не работает, кто виноват и что с этим делать

у экспертов уже бомбят жопы с этого, а люди в моих сторис сходят с ума

поэтому если вы занимаетесь контентом - 100% это вскроет вам голову`;

// Deep-link В БОТА (не браузерная прокладка!). t.me/<bot>?start=... открывается
// нативно в приложении → бот ловит /start kazino_bc → показывает статью в мини-аппе
// (web_app) и трекает bot_start с utm=kazino_bc. Так человек ИМЕННОЙ (есть telegram_id),
// и дальше воронка оффер→оплата привязана к нему.
// Прокладка /api/bc вела на HTTP-домен → Telegram открывал во встроенном браузере
// и утаскивал на пост канала, обезличивая всех. Больше так не делаем.
const BOT_USERNAME = 'testtoyzbot';
const btnUrl = () => `https://t.me/${BOT_USERNAME}?start=kazino_bc`;

const mode = process.argv.includes('--send') ? 'send'
  : process.argv.includes('--test') ? 'test'
  : 'dry';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function send(chatId) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: TEXT,
      reply_markup: {
        inline_keyboard: [[{ text: '📖 Читать пост + видео', url: btnUrl() }]],
      },
    }),
  });
  return res.json();
}

async function main() {
  if (!BOT_TOKEN) { console.error('нет BOT_TOKEN'); process.exit(1); }
  const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const rows = (await c.query(`
    select telegram_id, coalesce(first_name,'') fn
    from users u
    where u.telegram_id is not null
      and u.id not in (
        select distinct user_id from events
        where type='bot_start' and created_at >= '${SINCE}' and user_id is not null
      )
    order by u.created_at
  `)).rows;
  await c.end();

  const targets = rows
    .map((r) => ({ id: Number(r.telegram_id), fn: r.fn }))
    // реальные Telegram id — 6+ знаков; отсекаем мусорные записи (напр. id=1)
    .filter((u) => u.id > 100000 && !EXCLUDE.has(u.id));

  console.log(`Режим: ${mode.toUpperCase()}`);
  console.log(`Сегмент (база минус вчерашние минус exclude): ${targets.length} чел`);
  console.log(`Текст:\n---\n${TEXT}\n---`);

  if (mode === 'dry') {
    console.log('\n[dry-run] Ничего не отправлено. Первые 5 получателей:');
    targets.slice(0, 5).forEach((u) => console.log(`  ${u.id} ${u.fn}`));
    return;
  }

  if (mode === 'test') {
    console.log('\n[test] Отправляю только Саше (превью)…');
    const r = await send(SASHA);
    console.log(r.ok ? '✅ отправлено Саше' : `❌ ${JSON.stringify(r)}`);
    return;
  }

  // send
  console.log('\n[SEND] Реальная рассылка. Старт через 3с… (Ctrl+C чтобы отменить)');
  await sleep(3000);
  let ok = 0, fail = 0, blocked = 0;
  for (let i = 0; i < targets.length; i++) {
    const u = targets[i];
    try {
      const r = await send(u.id);
      if (r.ok) ok++;
      else if (r.error_code === 403) blocked++; // юзер заблокировал бота
      else if (r.error_code === 429) {
        const wait = (r.parameters?.retry_after || 2) * 1000;
        await sleep(wait);
        const r2 = await send(u.id);
        r2.ok ? ok++ : fail++;
      } else fail++;
    } catch { fail++; }
    if (i % 50 === 0) console.log(`  ${i}/${targets.length} · ok:${ok} blocked:${blocked} fail:${fail}`);
    await sleep(50); // ~20 msg/sec — в пределах лимитов Telegram
  }
  console.log(`\nГотово. Доставлено: ${ok} · заблокировали бота: ${blocked} · ошибки: ${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
