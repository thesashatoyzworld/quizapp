// Корпус ответов Саши вне «Коннекторов» для черновиков в группу: личка с
// клиентами (рабочий и личный аккаунты), личные группы клиентов, разборы
// созвонов. Пишет в таблицу sasha_voice_item, не в репозиторий: репозиторий
// публичный, а тут переписка клиентов.
//
// npx tsx --env-file=.env.local scripts/sasha-voice-build.mts [--calls <папка>]
//
// Группы клиентов лежат в базе agent-hub: строка подключения в
// AGENT_HUB_DATABASE_URL. Без неё этот источник пропускается.
// --calls: папка с index.json ([{i, src}]) и out/<i>.json ([{situation, answer, topic}]),
// то есть разбор расшифровок моделью. Без флага созвоны в базе не трогаются.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { prisma } from '@/lib/prisma';
import { buildPairs, type Msg } from '@/lib/group-draft/pairs';

type Item = { source: string; ref: string; at: Date | null; topic: string | null; question: string; answer: string };

/** Клиенты: участники «Коннекторов» и все, у кого был доступ к «Уровню». */
async function clientIds(): Promise<Set<string>> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    select distinct user_id as id from tg_group_msg where chat_id = '-1002115856669' and user_id is not null
    union
    select distinct telegram_id::text from product_access where role = 'uroven' and telegram_id is not null`;
  return new Set(rows.map((r) => r.id));
}

function pairsOf(source: string, ref: string, msgs: Omit<Msg, 'id' | 'replyTo' | 'thread'>[]): Item[] {
  const sorted = msgs.filter((m) => m.text.trim()).sort((a, b) => a.at.getTime() - b.at.getTime());
  const all: Msg[] = sorted.map((m, i) => ({ ...m, id: i + 1, replyTo: null, thread: null }));
  return buildPairs(all, 700, 1200).map((p) => ({
    source,
    ref,
    at: null,
    topic: null,
    question: p.question,
    answer: p.answer,
  }));
}

async function dms(clients: Set<string>): Promise<Item[]> {
  const out: Item[] = [];
  const business = await prisma.tgBusinessMsg.findMany({ where: { chatId: { in: [...clients] } } });
  const personal = await prisma.tgPersonalMsg.findMany({ where: { chatId: { in: [...clients] } } });
  const rows = [
    ...business.map((r) => ({ ...r, acc: 'work' })),
    ...personal.map((r) => ({ ...r, acc: 'personal' })),
  ];
  const byChat = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = `${r.acc}:${r.chatId}`;
    byChat.set(key, [...(byChat.get(key) ?? []), r]);
  }
  for (const [key, list] of byChat) {
    out.push(
      ...pairsOf(
        'lichka',
        key,
        list.map((r) => ({ at: r.createdAt, owner: r.side === 'us', who: 'клиент', text: r.text })),
      ),
    );
  }
  return out;
}

const OWNER_USERNAMES = new Set(['thesashatoyz', 'sashatoyzwork']);

async function clientGroups(): Promise<Item[] | null> {
  const url = process.env.AGENT_HUB_DATABASE_URL;
  if (!url) return null;
  const db = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await db.connect();
  const { rows } = await db.query<{
    chat_id: string;
    chat_title: string | null;
    from_username: string | null;
    raw_text: string | null;
    voice_transcript: string | null;
    created_at: Date;
  }>(`select chat_id::text, chat_title, from_username, raw_text, voice_transcript, created_at
      from feedback_incoming
      where chat_title is not null and chat_title <> 'ИДЕИ' and coalesce(from_username, '') <> 'GroupAnonymousBot'`);
  await db.end();
  const byChat = new Map<string, typeof rows>();
  for (const r of rows) byChat.set(r.chat_id, [...(byChat.get(r.chat_id) ?? []), r]);
  const out: Item[] = [];
  for (const [chat, list] of byChat) {
    out.push(
      ...pairsOf(
        'klient-gruppa',
        chat,
        list.map((r) => ({
          at: r.created_at,
          owner: OWNER_USERNAMES.has((r.from_username || '').toLowerCase()),
          who: 'клиент',
          text: (r.raw_text || r.voice_transcript || '').trim(),
        })),
      ),
    );
  }
  return out;
}

const TOPICS = new Set([
  'оффер', 'карусель', 'контент', 'рилсы', 'ютуб', 'лендинг', 'продажи', 'переписка',
  'воронка', 'цены', 'кейсы', 'позиционирование', 'мышление', 'нейронки', 'другое',
]);

function calls(dir: string): Item[] {
  const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) as { i: number; src: string }[];
  const out: Item[] = [];
  for (const { i, src } of index) {
    const f = join(dir, 'out', `${i}.json`);
    if (!existsSync(f)) continue;
    const raw = readFileSync(f, 'utf8');
    let list: { situation?: string; answer?: string; topic?: string }[];
    try {
      list = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
    } catch {
      console.warn('битый разбор', f);
      continue;
    }
    const date = src.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
    for (const x of list) {
      if (!x.situation?.trim() || !x.answer?.trim()) continue;
      // Цены Саша в черновиках не называет, такие позиции туда не нужны.
      if (x.topic === 'цены') continue;
      out.push({
        source: 'sozvon',
        ref: src,
        at: date ? new Date(date) : null,
        topic: x.topic && TOPICS.has(x.topic) ? x.topic : 'другое',
        question: x.situation.trim().slice(0, 700),
        answer: x.answer.trim().slice(0, 1500),
      });
    }
  }
  return out;
}

async function replace(source: string, items: Item[]) {
  await prisma.$transaction([
    prisma.sashaVoiceItem.deleteMany({ where: { source } }),
    prisma.sashaVoiceItem.createMany({ data: items }),
  ]);
  console.log(`${source}: ${items.length} пар, ${items.reduce((a, b) => a + b.question.length + b.answer.length, 0)} символов`);
}

const clients = await clientIds();
await replace('lichka', await dms(clients));
const groups = await clientGroups();
if (groups) await replace('klient-gruppa', groups);
else console.log('klient-gruppa: пропуск, нет AGENT_HUB_DATABASE_URL');
const callsDir = process.argv.includes('--calls') ? process.argv[process.argv.indexOf('--calls') + 1] : null;
if (callsDir) await replace('sozvon', calls(callsDir));
await prisma.$disconnect();
