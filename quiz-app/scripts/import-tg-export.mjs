// Заливает историю личных переписок из выгрузки Telegram Desktop.
//
// Зачем: боту телеграм историю чата не отдаёт — он видит только то, что
// пришло после подключения. Из-за этого помощник предлагал человеку кейс,
// который тот уже смотрел, и торговался о цене, которая уже названа.
//
// Запуск:
//   node scripts/import-tg-export.mjs <папка|файл> [--chat <id>] [--dry]
//
//   result.json   — полная выгрузка (Настройки → Продвинутые → Экспорт данных,
//                   только личные чаты, формат JSON). Чаты и стороны разбирает
//                   сам: в JSON есть id чата и from_id каждого сообщения.
//   messages.html — выгрузка одного чата. Id чата в ней нет вообще, поэтому
//                   нужен --chat; без него скрипт покажет кандидатов из базы.
//
// Повторный запуск дублей не делает: ключ строки — «чат:сообщение», тот же,
// что пишет живой обработчик.
//
// Голосовые и картинки заходят заглушкой («[голосовое 00:38]») с путём к
// файлу в media_ref — расшифровка приедет отдельным шагом.
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const chatArg = (() => {
  const i = args.indexOf('--chat');
  return i >= 0 ? args[i + 1] : null;
})();
const target = args.find((a) => !a.startsWith('--') && a !== chatArg);

if (!target) {
  console.error('Usage: node scripts/import-tg-export.mjs <папка|файл> [--chat <id>] [--dry]');
  process.exit(1);
}

// ── куда пишем ───────────────────────────────────────────────────────────────
const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

const conn = (
  await db.query('SELECT user_id, username FROM tg_business_conn ORDER BY connected_at DESC LIMIT 1')
).rows[0];
if (!conn) {
  console.error('В базе нет подключения (tg_business_conn) — непонятно, чьи сообщения считать нашими.');
  process.exit(1);
}
const ourId = String(conn.user_id);

// Чаты, которые в переписку не входят: помощники и сам бот.
const skipChats = new Set(
  [
    process.env.ADMIN_CHAT_ID,
    process.env.ADMIN_CHAT_ID_WORK,
    ...(process.env.SALES_HELPER_CHAT_IDS || '').split(','),
    (process.env.BOT_TOKEN || '').split(':')[0],
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean),
);

// ── разбор выгрузки ──────────────────────────────────────────────────────────

/** Текст сообщения из JSON: там это либо строка, либо куски со ссылками. */
function plainText(t) {
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) return t.map((x) => (typeof x === 'string' ? x : x.text || '')).join('');
  return '';
}

/** Заглушка вместо медиа: без неё диалог читается как будто человек молчал. */
function mediaStub(kind, seconds) {
  const len =
    Number.isFinite(seconds) && seconds > 0
      ? ` ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.round(seconds % 60)).padStart(2, '0')}`
      : '';
  if (kind === 'voice') return `[голосовое${len}, не расшифровано]`;
  if (kind === 'video') return `[видео${len}]`;
  if (kind === 'photo') return '[фото]';
  return '[файл]';
}

function kindOf(m) {
  if (m.media_type === 'voice_message') return 'voice';
  if (m.media_type === 'video_message' || m.media_type === 'video_file') return 'video';
  if (m.photo) return 'photo';
  if (m.file || m.media_type) return 'file';
  return null;
}

/** Сообщения из JSON-выгрузки: и полной, и одного чата. */
function fromJson(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const chats = data.chats?.list ? data.chats.list : [data];
  const out = [];

  for (const chat of chats) {
    if (chat.type && chat.type !== 'personal_chat') continue;
    const chatId = String(chat.id ?? chatArg ?? '');
    if (!chatId || skipChats.has(chatId)) continue;

    for (const m of chat.messages || []) {
      if (m.type !== 'message') continue;
      const kind = kindOf(m);
      const text = (plainText(m.text).trim() || plainText(m.caption).trim()).trim();
      if (!text && !kind) continue;

      out.push({
        id: `${chatId}:${m.id}`,
        chatId,
        side: String(m.from_id || '') === `user${ourId}` ? 'us' : 'client',
        name: chat.name || m.from || null,
        text: text || mediaStub(kind, m.duration_seconds),
        mediaType: kind,
        mediaRef: kind ? m.file || m.photo || null : null,
        createdAt: new Date(Number(m.date_unixtime) * 1000),
      });
    }
  }
  return out;
}

/** Сообщения из HTML-выгрузки одного чата. */
function fromHtml(file) {
  const html = fs.readFileSync(file, 'utf8');
  const chatName = (html.match(/<div class="text bold">\s*([^<]+)/) || [])[1]?.trim() || null;

  if (!chatArg) return { chatName, rows: null };

  const chatId = String(chatArg);
  const rows = [];
  let lastFrom = null;

  for (const block of html.split('<div class="message ').slice(1)) {
    if (block.startsWith('service')) continue;
    const idm = block.match(/^[^"]*" id="message(-?\d+)"/);
    if (!idm) continue;

    const from = (block.match(/<div class="from_name">\s*([^<]+)/) || [])[1]?.trim();
    // «joined» — продолжение той же серии, имя отправителя в блоке не повторяют.
    if (from) lastFrom = from;

    const when = (block.match(/class="pull_right date details" title="([^"]+)"/) || [])[1];
    if (!when) continue;
    // «02.09.2026 09:50:31 UTC+05:00»
    const w = when.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}:\d{2}:\d{2}) UTC([+-]\d{2}):?(\d{2})/);
    if (!w) continue;
    const createdAt = new Date(`${w[3]}-${w[2]}-${w[1]}T${w[4]}${w[5]}:${w[6]}`);

    const voice = (block.match(/href="(voice_messages\/[^"]+)"/) || [])[1];
    const dur = block.match(/<div class="status details">\s*(\d+):(\d+)/);
    const raw = (block.match(/<div class="text">([\s\S]*?)<\/div>/) || [])[1];
    const text = raw
      ? raw
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, String.fromCharCode(39))
          .replace(/&amp;/g, '&')
          .trim()
      : '';

    const kind = voice ? 'voice' : block.includes('media_photo') ? 'photo' : null;
    if (!text && !kind) continue;

    rows.push({
      id: `${chatId}:${idm[1]}`,
      chatId,
      // Своё имя в шапке чата не стоит: чат назван по собеседнику, значит всё,
      // что подписано иначе, писали мы.
      side: lastFrom && lastFrom !== chatName ? 'us' : 'client',
      name: chatName,
      text: text || mediaStub(kind, dur ? Number(dur[1]) * 60 + Number(dur[2]) : null),
      mediaType: kind,
      mediaRef: voice ? path.join(path.dirname(file), voice).replace(/\\/g, '/') : null,
      createdAt,
    });
  }
  return { chatName, rows };
}

// ── что открыли ──────────────────────────────────────────────────────────────
if (!fs.existsSync(target)) {
  console.error(`Нет такого пути: ${target}`);
  process.exit(1);
}
let file = target;
if (fs.statSync(target).isDirectory()) {
  const json = ['result.json', 'messages.json']
    .map((n) => path.join(target, n))
    .find((p) => fs.existsSync(p));
  const html = path.join(target, 'messages.html');
  file = json || (fs.existsSync(html) ? html : null);
  if (!file) {
    console.error(`В папке нет ни result.json, ни messages.html: ${target}`);
    process.exit(1);
  }
}

let rows;
if (file.endsWith('.json')) {
  rows = fromJson(file);
} else {
  const res = fromHtml(file);
  if (!res.rows) {
    console.error(
      `Выгрузка HTML не содержит id чата, а он нужен для ключа строки.\n` +
        `Чат называется «${res.chatName || '?'}». Запусти с --chat <id>.`,
    );
    const like = await db.query(
      'SELECT DISTINCT chat_id, name, username FROM tg_business_msg WHERE name IS NOT NULL ORDER BY name',
    );
    console.error('\nЧаты, которые бот уже знает:');
    for (const r of like.rows) console.error(`  --chat ${r.chat_id}  ${r.name || ''} @${r.username || '-'}`);
    process.exit(1);
  }
  rows = res.rows;
}

if (!rows.length) {
  console.log('В выгрузке не нашлось ни одного сообщения для личек.');
  await db.end();
  process.exit(0);
}

// ── ник и анкета ─────────────────────────────────────────────────────────────
// Ника в выгрузке нет ни в одном формате, а помощник ищет анкету именно по
// нему. Берём тот, что уже известен по этому чату, иначе — по номеру анкеты
// из «привет) анкета на менторство - Имя, #151».
const chatIds = [...new Set(rows.map((r) => r.chatId))];
const known = await db.query(
  `SELECT chat_id, max(username) AS username, max(lead_id) AS lead_id
     FROM tg_business_msg WHERE chat_id = ANY($1) GROUP BY chat_id`,
  [chatIds],
);
const byChat = new Map(known.rows.map((r) => [r.chat_id, r]));

for (const chatId of chatIds) {
  const mine = rows.filter((r) => r.chatId === chatId);
  const marked = mine.map((r) => r.text.match(/#(\d{1,7})\b/)).find(Boolean);
  const hit = byChat.get(chatId);
  let username = hit?.username || null;
  let leadId = hit?.lead_id || null;

  if (!leadId && marked) {
    const lead = await db.query('SELECT id, username FROM dwy_leads WHERE id = $1', [Number(marked[1])]);
    if (lead.rows[0]) {
      leadId = lead.rows[0].id;
      username = username || lead.rows[0].username;
    }
  }
  for (const r of mine) {
    r.username = username;
    r.leadId = leadId;
  }
}

// ── запись ───────────────────────────────────────────────────────────────────
console.log(`Разобрано ${rows.length} сообщений в ${chatIds.length} чат(ах):`);
for (const r of rows.slice(0, 6)) {
  const when = r.createdAt.toISOString().slice(0, 16).replace('T', ' ');
  console.log(`  [${when}] ${r.side === 'us' ? 'МЫ' : 'ЧЕЛОВЕК'}: ${r.text.replace(/\n/g, ' ').slice(0, 90)}`);
}
if (rows.length > 6) console.log(`  … и ещё ${rows.length - 6}`);

if (dry) {
  console.log('\n--dry: ничего не записал.');
  await db.end();
  process.exit(0);
}

let added = 0;
for (const r of rows) {
  const res = await db.query(
    `INSERT INTO tg_business_msg
       (id, chat_id, side, username, name, text, lead_id, media_type, media_ref, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (id) DO NOTHING`,
    [
      r.id,
      r.chatId,
      r.side,
      r.username || null,
      r.name,
      r.text,
      r.leadId || null,
      r.mediaType,
      r.mediaRef,
      // ⚠️ Только строкой в UTC. Колонка timestamp without time zone, и живой
      // обработчик кладёт туда UTC, а pg отдал бы объект Date в зоне машины —
      // на моей это +05, и вся история уехала бы на пять часов вперёд.
      r.createdAt.toISOString(),
    ],
  );
  added += res.rowCount;
}

console.log(`\nДобавлено ${added}, пропущено как уже известные ${rows.length - added}.`);
await db.end();
