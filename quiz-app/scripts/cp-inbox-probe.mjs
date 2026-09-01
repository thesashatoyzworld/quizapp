// Разведка: сколько людей в инста-директе написали и остались без ответа.
// Читает чаты ChatPlace и по каждому смотрит, кто написал последним.
import fs from 'node:fs';

const ENV = 'C:/Users/OTVAJE/Documents/ClaudeCode/Projects/TheSasha/quiz-app/.env.local';
const KEY = fs.readFileSync(ENV, 'utf8').split(/\r?\n/)
  .find((l) => l.startsWith('CHATPLACE_API_KEY='))
  ?.slice('CHATPLACE_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
if (!KEY) { console.error('нет CHATPLACE_API_KEY в ' + ENV); process.exit(1); }

const URL_MCP = 'https://mcp.chatplace.io/mcp';
let rpcId = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(tool, args = {}, attempt = 1) {
  try {
    const res = await fetch(URL_MCP, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method: 'tools/call', params: { name: tool, arguments: args } }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    // ответ может прийти как SSE
    const line = raw.split('\n').find((l) => l.startsWith('data:')) ;
    const env = JSON.parse(line ? line.slice(5).trim() : raw);
    if (env.error) throw new Error(env.error.message || 'rpc error');
    return JSON.parse(env.result.content[0].text);
  } catch (e) {
    if (attempt >= 4) throw e;
    await sleep(attempt * attempt * 800);
    return call(tool, args, attempt + 1);
  }
}

const LIMIT_CHATS = Number(process.argv[2] || 250);

// 1. чаты
const chats = [];
let cursor = null;
while (chats.length < LIMIT_CHATS) {
  const args = { limit: 50 };
  if (cursor) { args.lastItemId = cursor.id; args.lastItemTimestamp = Number(cursor.ts); }
  const page = await call('chats_list', args);
  if (!page.items?.length) break;
  chats.push(...page.items);
  cursor = { id: page.lastItemId, ts: page.lastItemTimestamp };
  process.stderr.write(`\rчатов: ${chats.length}`);
  if (!page.hasNextItems) break;
  await sleep(150);
}
process.stderr.write('\n');

const now = Math.floor(Date.now() / 1000);
const DAY = 86400;
const rows = [];

for (const [i, c] of chats.slice(0, LIMIT_CHATS).entries()) {
  let msgs;
  try { msgs = await call('chats_messages', { chatId: c.id, limit: 20 }); }
  catch { continue; }
  const items = (msgs.items || msgs).filter((m) => m.messageType !== 2);
  if (!items.length) continue;
  items.sort((a, b) => a.createdAt - b.createdAt);
  const last = items[items.length - 1];
  const fromClient = items.filter((m) => m.side === 'client');
  const fromUs = items.filter((m) => m.side === 'bot');
  rows.push({
    name: c.clientName,
    lastSide: last.side,
    ageDays: (now - last.createdAt) / DAY,
    clientMsgs: fromClient.length,
    usMsgs: fromUs.length,
    lastText: (last.message || '').slice(0, 60).replace(/\s+/g, ' '),
  });
  if (i % 10 === 0) process.stderr.write(`\rразобрано: ${rows.length}/${LIMIT_CHATS}`);
  await sleep(150);
}
process.stderr.write('\n');

fs.writeFileSync(new URL('./cp-stats.json', import.meta.url), JSON.stringify(rows, null, 1), 'utf8');

// ─── сводка ───
// «содержательным» считаем сообщение, где есть буквы и оно длиннее пары слов:
// реакции на сторис, эмодзи и «спасибо» в продажи не превращаются.
const EMOJI_ONLY = (t) => !/[a-zA-Zа-яА-ЯёЁ]{3}/.test(t);
const SHORT_THANKS = /^(спасибо|благодарю|круто|класс|огонь|супер|топ|да|ок|окей|понял|поняла|ахаха+|хаха+|пока что|вы кайф|крутой)\b/i;
const meaningful = (t) => t && t.length >= 25 && !EMOJI_ONLY(t) && !SHORT_THANKS.test(t.trim());

const waiting = rows.filter((r) => r.lastSide === 'client');
const hot = waiting.filter((r) => meaningful(r.lastText));
const bucket = (arr, lo, hi) => arr.filter((r) => r.ageDays >= lo && r.ageDays < hi).length;
const oneWay = rows.filter((r) => r.clientMsgs > 0 && r.usMsgs <= 2);

console.log(`\nчатов разобрано: ${rows.length}`);
console.log(`период выборки: ${Math.round(Math.max(...rows.map((r) => r.ageDays)))} дней`);
console.log(`\nпоследнее слово за человеком: ${waiting.length}`);
console.log(`из них по существу (не эмодзи и не «спасибо»): ${hot.length}`);
console.log(`  меньше суток:   ${bucket(hot, 0, 1)}`);
console.log(`  1-3 дня:        ${bucket(hot, 1, 3)}`);
console.log(`  3-7 дней:       ${bucket(hot, 3, 7)}`);
console.log(`  больше недели:  ${bucket(hot, 7, 1e9)}`);
console.log(`\nчеловек писал, а от нас максимум 2 сообщения (автоответ без живого): ${oneWay.length}`);
console.log(`диалогов, где от нас было больше 2 сообщений (живая переписка): ${rows.filter((r) => r.usMsgs > 2).length}`);

console.log('\n— по существу и без ответа, самые давние —');
for (const r of hot.sort((a, b) => b.ageDays - a.ageDays).slice(0, 25)) {
  console.log(`${String(Math.round(r.ageDays)).padStart(3)} дн · ${(r.name || '?').slice(0, 30).padEnd(30)} · ${r.lastText}`);
}
