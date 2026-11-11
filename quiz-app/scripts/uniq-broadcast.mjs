// Launch broadcast for the free uniqualizer, sent in waves: the VPS has one processing
// queue, so everyone opening it in the same minute would wait hours for their versions.
//
// Audience: every bot user from `users`, minus tier 2-3 students (they already have it
// unlimited) and admins. Already-sent ids are appended to the log file, so a stopped run
// resumes where it left off and never sends twice.
//
// Usage (from quiz-app, needs .env.local with DATABASE_URL and BOT_TOKEN):
//   node scripts/uniq-broadcast.mjs                       # dry run: audience size and waves
//   node scripts/uniq-broadcast.mjs --test                # send only to Sasha (788334680)
//   node scripts/uniq-broadcast.mjs --send [--batch=100] [--gap=30] [--limit=N]
//        --batch  people per wave, --gap  minutes between waves, --limit  stop after N sends
//   Waves go out only 10:00-21:00 Almaty (UTC+5); outside that the script waits.
//
// ⚠️ Only after Sasha says «открой всем» (UNIQ_OPEN=1 is live) and approves TEXT.

import fs from 'node:fs';
import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

// DRAFT: needs Sasha's approval before --send.
const TEXT = `Сделал бесплатный уникализатор для рилсов.

Загружаешь ролик, получаешь несколько разных версий и выкладываешь их пробными рилсами. Так один удачный ролик получает ещё несколько попыток дойти до новых людей.

Бесплатно для подписчиков канала: ролик в неделю, за каждого приведённого друга +1.

Открывай по кнопке ниже.`;

const BUTTON = { inline_keyboard: [[{ text: 'Открыть уникализатор', web_app: { url: 'https://world.thesashatoyz.com/uniq' } }]] };
const SASHA = 788334680;
const ADMINS = new Set([788334680, 6013902004]);
const LOG = '.uniq-broadcast-sent.txt'; // not committed: one id per line

const arg = (name, def) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? Number(a.split('=')[1]) : def;
};
const has = (name) => process.argv.includes(`--${name}`);
// 10:00-21:00 in Almaty (UTC+5), when people read messages.
const daytime = () => { const h = (new Date().getUTCHours() + 5) % 24; return h >= 10 && h < 21; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function audience() {
  const db = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT u.telegram_id::text AS id
      FROM users u
      WHERE u.telegram_id > 0
        AND NOT EXISTS (
          SELECT 1 FROM product_access a
          WHERE a.telegram_id = u.telegram_id AND a.role = 'uroven' AND a.status = 'active'
            AND (a.expires_at IS NULL OR a.expires_at > now())
            AND a.product_slug ~ '-t[23]$'
        )
      ORDER BY 1`);
    return rows.map((r) => Number(r.id)).filter((id) => !ADMINS.has(id));
  } finally {
    await db.end();
  }
}

async function send(chatId) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: TEXT, reply_markup: BUTTON, disable_web_page_preview: true }),
  });
  return r.json();
}

async function main() {
  if (!process.env.BOT_TOKEN) throw new Error('BOT_TOKEN missing in .env.local');
  const batch = arg('batch', 100);
  const gapMin = arg('gap', 30);
  const limit = arg('limit', Infinity);

  if (has('test')) {
    const r = await send(SASHA);
    console.log(r.ok ? 'test sent to Sasha' : `test failed: ${r.description}`);
    return;
  }

  const done = new Set(fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map(Number) : []);
  const todo = (await audience()).filter((id) => !done.has(id));
  const waves = Math.ceil(Math.min(todo.length, limit) / batch);
  console.log(`audience left: ${todo.length} (already sent: ${done.size}), waves: ${waves} × ${batch}, gap ${gapMin} min, ~${Math.round(((waves - 1) * gapMin) / 60 * 10) / 10} h of daytime`);
  if (!has('send')) { console.log('dry run, nothing sent. Add --test or --send.'); return; }

  let sent = 0, blocked = 0, failed = 0;
  for (let w = 0; w < waves; w++) {
    while (!daytime()) await sleep(10 * 60 * 1000);
    const wave = todo.slice(w * batch, (w + 1) * batch).slice(0, Math.max(0, limit - sent - blocked - failed));
    for (const id of wave) {
      try {
        const r = await send(id);
        if (r.ok) sent++;
        else if (r.error_code === 403 || r.error_code === 400) blocked++;
        else if (r.error_code === 429) { await sleep(((r.parameters?.retry_after ?? 5) + 1) * 1000); failed++; continue; }
        else failed++;
        fs.appendFileSync(LOG, `${id}\n`);
      } catch {
        failed++;
      }
      await sleep(1100);
    }
    console.log(`[wave ${w + 1}/${waves}] sent=${sent} blocked=${blocked} failed=${failed} ${new Date().toISOString()}`);
    if (w < waves - 1) await sleep(gapMin * 60 * 1000);
  }
  console.log(`DONE sent=${sent} blocked=${blocked} failed=${failed}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
