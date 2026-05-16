// Broadcast: video + caption + Mini App button to all bot users.
// Mirrors /api/admin/broadcast-send so no admin session needed.
// Usage:
//   node scripts/broadcast-urovni.mjs           # dry-run
//   node scripts/broadcast-urovni.mjs --send    # actually send

import { config } from 'dotenv';
import { Client } from '@notionhq/client';

config({ path: '.env.local' });

const BOT_TOKEN = process.env.BOT_TOKEN;
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID;
const FOLLOWUP_DS_ID = process.env.NOTION_FOLLOWUP_DB_ID;

const BROADCAST_ID = '2026_05_16_urovni';
const VIDEO_FILE_ID = 'BAACAgIAAxkDAAISPmoIQrADDo7SXv8XWvK51rpgpCkjAAL2mgACgBFBSOdIoyVtft26OwQ';
const ARTICLE_URL = 'https://thesashatoyz.com/blog/urovni-navyka-kontenta';

const CAPTION = `вытрезвитель по контенту

открываю новый бизнес:

- привожу в чувства инстаграмных пьяниц
- вытаскиваю людей из матрицы
- убиваю вонючих розовых пони
- протираю фары наждачкой, чтоб наверняка
- изгоняю инфобесов

чот последнее время мне так дохера видосов начало попадаться с чушью

одна говорит у неё там ОПЯТЬ очередная формула появилась

второй говорит, что нужно чуть ли не КОД прописывать в описаниях

третья говорит, что выкладывать надо по ГОРОСКОПУ

в общем чем больше я такого контента вижу, тем больше мне хочется поливать этих атеншнсосов смузи из чеснока и святой воды

я написал гайд / статью / священное писание - от чистого сердца

бля, ну не поленитесь вы и потратьте 15 минут своего времени

я деньги готов поставить, что это не только с контентом поможет, но и в целом с другими сферами жизни`;

const REPLY_MARKUP = {
  inline_keyboard: [[{ text: 'читать статью →', web_app: { url: ARTICLE_URL } }]],
};

const DEFAULT_EXCLUDE = new Set([788334680, 6013902004]);

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getAllUsers() {
  const users = new Map();
  const exclude = new Set(DEFAULT_EXCLUDE);

  let cursor = undefined;
  do {
    const r = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const p of r.results) {
      const uid = p.properties.user_id?.number;
      if (!uid || uid <= 0) continue;
      if (!users.has(uid)) {
        users.set(uid, {
          uid,
          username: p.properties.username?.rich_text?.[0]?.plain_text || '',
          first_name: p.properties.first_name?.rich_text?.[0]?.plain_text || '',
        });
      }
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);

  cursor = undefined;
  do {
    const r = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const p of r.results) {
      const uid = p.properties.user_id?.number;
      if (!uid) continue;
      const paid = p.properties.paid?.checkbox;
      if (paid) exclude.add(uid);
      if (!users.has(uid)) {
        users.set(uid, {
          uid,
          username: p.properties.username?.rich_text?.[0]?.plain_text || '',
          first_name: p.properties.first_name?.rich_text?.[0]?.plain_text || '',
        });
      }
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);

  return [...users.values()].filter((u) => !exclude.has(u.uid));
}

async function sendOne(uid) {
  const payload = {
    chat_id: uid,
    video: VIDEO_FILE_ID,
    caption: CAPTION,
    supports_streaming: true,
    reply_markup: REPLY_MARKUP,
  };
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return r.json();
}

async function main() {
  const mode = process.argv.includes('--send') ? 'send' : 'dry';
  if (!BOT_TOKEN || !EVENTS_DB_ID || !FOLLOWUP_DS_ID) {
    console.error('Missing env vars');
    process.exit(1);
  }

  console.log(`[broadcast-urovni] mode=${mode}, id=${BROADCAST_ID}`);
  console.log('Fetching audience...');
  const targets = await getAllUsers();
  console.log(`Targets: ${targets.length}`);

  if (mode === 'dry') {
    targets.slice(0, 10).forEach((u) => console.log(`  ${u.uid}  @${u.username || '—'}`));
    if (targets.length > 10) console.log(`  ... +${targets.length - 10} more`);
    console.log('\nNo messages sent. Re-run with --send.');
    return;
  }

  let sent = 0, failed = 0, blocked = 0;
  const errors = [];
  const started = Date.now();

  console.log('Sending...');
  for (const [i, u] of targets.entries()) {
    try {
      const r = await sendOne(u.uid);
      if (r.ok) sent++;
      else if (r.error_code === 403) blocked++;
      else { failed++; errors.push(`${u.uid}: ${r.description}`); }
    } catch (e) {
      failed++;
      errors.push(`${u.uid}: ${e}`);
    }
    if ((i + 1) % 25 === 0 || i + 1 === targets.length) {
      const elapsed = Math.round((Date.now() - started) / 1000);
      console.log(`[${i + 1}/${targets.length}] sent=${sent} blocked=${blocked} failed=${failed} elapsed=${elapsed}s`);
    }
    await sleep(1100);
  }

  const totalSec = Math.round((Date.now() - started) / 1000);
  console.log(`\nDONE in ${totalSec}s. total=${targets.length} sent=${sent} blocked=${blocked} failed=${failed}`);
  if (errors.length) {
    console.log(`\nFirst 20 errors:`);
    errors.slice(0, 20).forEach((e) => console.log('  ' + e));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
