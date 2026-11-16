// Announce the reels optimizator (test mode) to tier 2-3 students of «Новый уровень».
// Each send is recorded as an `optimizator_announce_sent` event, and anyone with that event
// is skipped, so a rerun never messages a person twice.
//
// Usage (from quiz-app, needs .env.local with DIRECT_URL and BOT_TOKEN):
//   node scripts/optimizator-announce.mjs          # dry run: who would get it
//   node scripts/optimizator-announce.mjs --test   # only to Sasha (788334680)
//   node scripts/optimizator-announce.mjs --send   # everyone, ~1 message per second
//
// ⚠️ --send only after Sasha approves TEXT.

import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local' });

// DRAFT: needs Sasha's approval before --send.
const TEXT = `запустили оптимизатор рилсов, пока в тестовом режиме

вставляешь текст ролика до съёмки и получаешь разбор: есть ли спрос на тему, остановится ли зритель, досмотрит ли и сохранит, 3 главные правки и пример, как это может звучать

если укажешь свой ник в инсте, он сравнит сценарий с твоими прошлыми рилсами

на т2 30 разборов в месяц, на т3 100

разбор можно переслать ссылкой, а если что-то не так, внизу есть форма «пожелания и баги», мне приходит лично

открывай по кнопке ниже`;

const BUTTON = { inline_keyboard: [[{ text: 'Открыть оптимизатор', web_app: { url: 'https://world.thesashatoyz.com/optimizator' } }]] };
const SASHA = 788334680;
const ADMINS = new Set([788334680, 6013902004]);
const has = (name) => process.argv.includes(`--${name}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const db = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function audience() {
  const { rows } = await db.query(`
    SELECT a.telegram_id::text AS id, max(substring(a.product_slug from '-t([23])$')) AS tier,
           max(u.first_name) AS name, max(u.username) AS username
    FROM product_access a
    LEFT JOIN users u ON u.telegram_id = a.telegram_id
    WHERE a.role = 'uroven' AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > now())
      AND a.product_slug ~ '-t[23]$' AND a.telegram_id > 0
      AND NOT EXISTS (SELECT 1 FROM events e WHERE e.telegram_id = a.telegram_id AND e.type = 'optimizator_announce_sent')
    GROUP BY a.telegram_id ORDER BY 1`);
  return rows.filter((r) => !ADMINS.has(Number(r.id)));
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
  if (has('test')) {
    const r = await send(SASHA);
    console.log(r.ok ? 'test sent to Sasha' : `test failed: ${r.description}`);
    return;
  }
  await db.connect();
  try {
    const people = await audience();
    console.log(`audience: ${people.length} (t2 ${people.filter((p) => p.tier === '2').length}, t3 ${people.filter((p) => p.tier === '3').length})`);
    for (const p of people) console.log(`  t${p.tier} ${p.id} ${p.name || ''} ${p.username ? '@' + p.username : ''}`);
    if (!has('send')) { console.log('dry run, nothing sent. Add --test or --send.'); return; }
    let sent = 0, failed = 0;
    for (const p of people) {
      const r = await send(Number(p.id)).catch((e) => ({ ok: false, description: e.message }));
      if (r.ok) {
        sent++;
        await db.query(`INSERT INTO events (id, telegram_id, type, source, metadata, created_at) VALUES (gen_random_uuid(), $1, 'optimizator_announce_sent', 'optimizator', $2, now())`, [p.id, { tier: p.tier }]);
      } else {
        failed++;
        console.log(`  failed ${p.id}: ${r.description}`);
      }
      await sleep(1100);
    }
    console.log(`DONE sent=${sent} failed=${failed}`);
  } finally {
    await db.end();
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
