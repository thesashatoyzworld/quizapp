// Корпус «вопрос → ответ Саши» из всей истории «Коннекторов»: ручные выгрузки
// с 27.07 по 20.09 плюс база tg_group_msg. Пишет src/content/group-voice/pairs.json,
// его черновики читают как примеры голоса.
//
// npx tsx --env-file=.env.local scripts/group-voice-build.mts <папка с выгрузками>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '@/lib/prisma';
import { buildPairs, type Msg } from '@/lib/group-draft/pairs';

const dir = process.argv[2];
if (!dir) throw new Error('нужна папка с выгрузками');

const OWNER = '788334680';
const msgs = new Map<number, Msg>();
const put = (m: Msg) => {
  if (m.text.trim()) msgs.set(m.id, m);
};

// 27.07–15.08: выгрузка Telegram Desktop, дата «27.07.2026 10:20:29 UTC+07:00».
const early = JSON.parse(readFileSync(join(dir, 'konnektory.json'), 'utf8')) as {
  id: number; date: string | null; from: string; text: string; replyTo: number | null; type: string;
}[];
for (const m of early) {
  if (m.type === 'service' || !m.date) continue;
  const [d, t, tz] = m.date.split(' ');
  const [dd, mm, yyyy] = d.split('.');
  put({
    id: m.id,
    at: new Date(`${yyyy}-${mm}-${dd}T${t}${tz.replace('UTC', '')}`),
    owner: m.from === 'SASHA TOYZ',
    who: m.from,
    text: m.text || '',
    replyTo: m.replyTo,
    thread: null,
  });
}

// 17–30.08: форварды ботом.
const aug = JSON.parse(readFileSync(join(dir, 'konnektory-2026-08-17_30.json'), 'utf8')) as {
  id: number; date: string; from: string; username?: string; userId?: number; text: string;
}[];
for (const m of aug) {
  put({
    id: m.id,
    at: new Date(m.date),
    owner: String(m.userId) === OWNER,
    who: m.username ? '@' + m.username : m.from,
    text: m.text || '',
    replyTo: null,
    thread: null,
  });
}

// 25.08–20.09: текстом, блоки «[id] ISO @user (id)\nтекст».
for (const f of ['konnektory-2026-08-31_09-14.txt', 'konnektory-2026-09-17_20.txt']) {
  const p = join(dir, f);
  if (!existsSync(p)) continue;
  const blocks = readFileSync(p, 'utf8').split(/\n(?=\[\d+\] \d{4}-)/);
  for (const b of blocks) {
    const head = b.match(/^\[(\d+)\] (\S+) (.+)$/m);
    if (!head) continue;
    const [, id, iso, author] = head;
    const text = b.slice(b.indexOf('\n') + 1).trim();
    put({
      id: Number(id),
      at: new Date(iso),
      owner: author.includes(`(${OWNER})`),
      who: author.replace(/\s*\(\d+\)$/, ''),
      text,
      replyTo: null,
      thread: null,
    });
  }
}

// С 20.09: база.
const rows = await prisma.tgGroupMsg.findMany({ where: { chatId: '-1002115856669' } });
for (const r of rows) {
  put({
    id: Number(r.id.split(':').pop()),
    at: r.createdAt,
    owner: r.userId === OWNER,
    who: r.username ? '@' + r.username : r.name || '?',
    text: r.text,
    replyTo: r.replyToId,
    thread: r.threadId,
  });
}

const all = [...msgs.values()].sort((a, b) => a.id - b.id);
const pairs = buildPairs(all);
mkdirSync('src/content/group-voice', { recursive: true });
writeFileSync('src/content/group-voice/pairs.json', JSON.stringify(pairs, null, 1));
console.log(`сообщений ${all.length}, ответов Саши ${all.filter((m) => m.owner).length}, пар ${pairs.length}, символов ${JSON.stringify(pairs).length}`);
await prisma.$disconnect();
