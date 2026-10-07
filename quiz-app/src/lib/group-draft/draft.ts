/**
 * Черновик ответа Саши на вопрос в «Коннекторах».
 *
 * Ставится задачей на каждое сообщение ученика. Задача ждёт, пока человек
 * замолчит, собирает его пачку, смотрит картинки, pdf и ссылки, и пишет
 * черновик Саше в личку бота. В группу сама ничего не отправляет.
 */
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { buildMap } from '@/lib/kb/map';
import { tgMessageLink } from '@/lib/ideas/batch';
import {
  MAX_AGE_MS,
  answeredByOwner,
  isQuiet,
  messageIdOf,
  parseBatchKey,
  type BatchRow,
} from './batch';
import { SYSTEM, leaksMeta, parseReply, renderExamples, type Correction, type ShotPair } from './prompt';
import { fileBlocks, linkBlocks, type ContentBlock } from './sources';
import { sendDraftToAdmin } from './admin';
import { buildPairs, type Msg } from './pairs';
import corpus from '@/content/group-voice/pairs.json';

const anthropic = new Anthropic();

/** Ответ через инструмент: так модель не вернёт текст мимо формата. */
const DRAFT_TOOL: Anthropic.Tool = {
  name: 'draft_reply',
  description: 'Черновик ответа Саши ученику',
  input_schema: {
    type: 'object',
    properties: {
      reply: {
        type: ['string', 'null'],
        description: 'текст ответа как он уйдёт в чат, или null, если отвечать не надо',
      },
      note: { type: 'string', description: 'заметка для Саши, пусто если нечего сказать' },
    },
    required: ['reply', 'note'],
  },
};

/** Одно место на файл: по этой строке считается цена вызова. */
const MODEL = 'claude-sonnet-5';

/** Аккаунты Саши: их сообщения в группе считаются ответами, а не вопросами. */
export function ownerIds(): string[] {
  return [process.env.ADMIN_CHAT_ID, process.env.ADMIN_CHAT_ID_WORK]
    .map((v) => (v || '').trim())
    .filter(Boolean);
}

export function isOwner(userId: string | number | null | undefined): boolean {
  return userId !== null && userId !== undefined && ownerIds().includes(String(userId));
}

type Row = Awaited<ReturnType<typeof prisma.tgGroupMsg.findMany>>[number];

const toBatch = (r: Row): BatchRow => ({
  messageId: messageIdOf(r.id),
  userId: r.userId,
  text: r.text,
  replyToId: r.replyToId,
  createdAt: r.createdAt,
});

const who = (r: Row) => (r.username ? '@' + r.username : r.name || 'кто-то');

/**
 * Свежие пары из базы, которых ещё нет в корпусе: после сборки pairs.json.
 * Корпус пересобирается скриптом scripts/group-voice-build.mts.
 */
async function shotPairs(chatId: string): Promise<ShotPair[]> {
  const rows = await prisma.tgGroupMsg.findMany({
    where: { chatId, createdAt: { gt: CORPUS_UNTIL } },
    orderBy: { createdAt: 'asc' },
    take: 400,
  });
  const msgs: Msg[] = rows.map((r) => ({
    id: messageIdOf(r.id),
    at: r.createdAt,
    owner: isOwner(r.userId),
    who: r.username ? '@' + r.username : r.name || '?',
    text: r.text,
    replyTo: r.replyToId,
    thread: r.threadId,
  }));
  return buildPairs(msgs).slice(-20);
}

/** Корпус собран по базе до этого момента. */
const CORPUS_UNTIL = new Date('2026-10-07T07:30:00Z');

/** Вся история ответов Саши в группе с 27.07: голос и подход, кэшируется. */
function corpusText(): string {
  return (
    '## Как Саша отвечал в группе с 27.07 (все пары)\n\n' +
    'Пары собраны по соседству сообщений: иногда ответ адресован другому ученику. ' +
    'Бери из них голос, длину и подход, а не факты про конкретного человека.\n\n' +
    (corpus as ShotPair[]).map((p) => `ученик: ${p.question}\nСаша: ${p.answer}`).join('\n\n')
  );
}

/** Черновики, которые Саша переписал: самое ценное, что есть для стиля. */
async function corrections(): Promise<Correction[]> {
  const rows = await prisma.groupDraft.findMany({
    where: { status: 'edited', draft: { not: null }, sentText: { not: null } },
    orderBy: { decidedAt: 'desc' },
    take: 12,
  });
  return rows.map((r) => ({
    question: r.question.slice(0, 500),
    draft: (r.draft || '').slice(0, 700),
    sent: (r.sentText || '').slice(0, 700),
  }));
}

function cabinetIndex(): string {
  return buildMap()
    .map((e) => `${e.section}: ${e.title}`)
    .join('\n');
}

/**
 * Когда Саша последний раз отвечал этому человеку в теме: reply на его
 * сообщение или упоминание по юзернейму.
 */
async function lastOwnerTouch(
  chatId: string,
  threadId: number | null,
  userId: string,
  since: Date,
  now: Date,
): Promise<Date | null> {
  const theirs = await prisma.tgGroupMsg.findMany({
    where: { chatId, threadId, userId, createdAt: { gt: since, lte: now } },
    select: { id: true, username: true },
  });
  if (!theirs.length) return null;
  const ids = theirs.map((r) => messageIdOf(r.id));
  const username = theirs.find((r) => r.username)?.username;
  const touch = await prisma.tgGroupMsg.findFirst({
    where: {
      chatId,
      threadId,
      userId: { in: ownerIds() },
      createdAt: { gt: since, lte: now },
      OR: [
        { replyToId: { in: ids } },
        ...(username ? [{ text: { contains: '@' + username, mode: 'insensitive' as const } }] : []),
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  return touch?.createdAt ?? null;
}

/** Постоянная ссылка на созвоны: Саша кидает её в «Календарь» перед каждым. */
async function callLink(chatId: string): Promise<string | null> {
  const row = await prisma.tgGroupMsg.findFirst({
    where: { chatId, userId: { in: ownerIds() }, text: { contains: 'zoom.us/j/' } },
    orderBy: { createdAt: 'desc' },
  });
  return row?.text.match(/https:\/\/\S*zoom\.us\/j\/\S+/)?.[0] ?? null;
}

export type DraftResult =
  | { done: true; reason: string; draft?: string | null; note?: string }
  | { done: false; retryInSec: number };

/**
 * dry: ничего не пишет в базу и не шлёт Саше, только возвращает черновик.
 * Для прогона на старых вопросах: `now` тогда ставится в момент после вопроса.
 */
export async function runDraft(key: string, now = new Date(), opts: { dry?: boolean } = {}): Promise<DraftResult> {
  const { chatId, threadId, userId } = parseBatchKey(key);

  // Граница пачки: всё, что человек писал после последнего черновика ему
  // в этой теме, но не старше суток.
  const prev = await prisma.groupDraft.findFirst({
    where: { chatId, threadId, userId, lastAt: { lt: now } },
    orderBy: { lastAt: 'desc' },
  });
  const floor = new Date(now.getTime() - MAX_AGE_MS);
  let since = prev && prev.lastAt > floor ? prev.lastAt : floor;

  // Саша мог ответить человеку сам, мимо черновиков. Всё, что было до его
  // последнего ответа этому человеку, уже закрыто и в пачку не идёт.
  const touch = await lastOwnerTouch(chatId, threadId, userId, since, now);
  if (touch && touch > since) since = touch;

  const mine = await prisma.tgGroupMsg.findMany({
    where: { chatId, threadId, userId, createdAt: { gt: since, lte: now } },
    orderBy: { createdAt: 'asc' },
  });
  if (!mine.length) return { done: true, reason: 'пачка пустая' };

  const last = mine[mine.length - 1];
  if (!isQuiet(last.createdAt, now)) return { done: false, retryInSec: 60 };

  const batch = mine.map(toBatch);
  const lastMessageId = messageIdOf(last.id);

  // Тред за последние сутки целиком: кто что спросил и что Саша уже ответил.
  const thread = await prisma.tgGroupMsg.findMany({
    where: { chatId, threadId, createdAt: { gt: floor, lte: now } },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });
  thread.reverse();

  const ownerAfter = thread.filter((r) => isOwner(r.userId) && r.createdAt >= mine[0].createdAt).map(toBatch);
  const answered = answeredByOwner(batch, ownerAfter, last.username);

  const question = mine.map((r) => r.text).join('\n');
  const base = {
    chatId,
    threadId,
    userId,
    username: last.username,
    name: last.name,
    messageIds: batch.map((b) => b.messageId),
    lastMessageId,
    lastAt: last.createdAt,
    question,
  };

  // Ключ (чат, последнее сообщение) уникален: две задачи на одну пачку
  // (по одной на каждое сообщение) создадут черновик один раз.
  if (answered && opts.dry) return { done: true, reason: 'Саша ответил сам' };

  let draftId = 'dry';
  if (!opts.dry) {
    try {
      const row = await prisma.groupDraft.create({
        data: { ...base, status: answered ? 'answered' : 'pending' },
      });
      draftId = row.id;
    } catch {
      return { done: true, reason: 'черновик на эту пачку уже есть' };
    }
    if (answered) return { done: true, reason: 'Саша ответил сам' };
  }

  const files = mine.filter((r) => r.fileId && (r.mediaType === 'photo' || r.mediaType === 'file'));
  const [fb, lb, pairs, fixes, zoom] = await Promise.all([
    fileBlocks(files.map((r) => ({ fileId: r.fileId!, mime: r.fileMime }))),
    linkBlocks(question),
    shotPairs(chatId),
    corrections(),
    callLink(chatId),
  ]);

  const transcript = thread
    .filter((r) => !mine.some((m) => m.id === r.id))
    .map((r) => `[${r.createdAt.toISOString().slice(5, 16).replace('T', ' ')}] ${isOwner(r.userId) ? 'Саша' : who(r)}: ${r.text.slice(0, 700)}`)
    .join('\n');

  const content: ContentBlock[] = [
    {
      type: 'text',
      text:
        `Переписка в этой теме за сутки до вопроса:\n\n${transcript || '(пусто)'}\n\n` +
        `---\nВопрос, на который пишем черновик. Автор ${who(last)}${last.name ? ` (${last.name})` : ''}:\n\n${question}`,
    },
    ...fb.blocks,
    ...lb.blocks,
  ];
  // Старые строки лога писались без file_id: такие вложения не скачать.
  const blind = mine.filter((r) => !r.fileId && (r.mediaType === 'photo' || r.mediaType === 'file')).length;
  const unseen: string[] = [];
  if (fb.missed + blind) unseen.push(`не открылось файлов: ${fb.missed + blind}`);
  if (lb.missed.length) unseen.push(`не открылись ссылки: ${lb.missed.join(', ')}`);
  if (/instagram\.com/.test(question)) unseen.push('инстаграм без входа не открывается, пост не видно');
  if (unseen.length) content.push({ type: 'text', text: `Внимание: ${unseen.join('; ')}.` });

  // Неизменная часть (правила, корпус, оглавление) кэшируется, свежие пары и
  // правки Саши идут следом и кэш не ломают.
  const system = [
    {
      type: 'text' as const,
      text: `${SYSTEM}\n\n## Оглавление кабинета (для вопросов «где найти»)\n\n${cabinetIndex()}\n\n${corpusText()}`,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text:
        `## Факты\n\nСозвоны группы утром и вечером, ссылка всегда одна: ${zoom || 'не найдена'}\n\n` +
        renderExamples(pairs, fixes),
    },
  ];

  let reply: string | null = null;
  let note = '';
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system,
      tools: [DRAFT_TOOL],
      tool_choice: { type: 'tool', name: DRAFT_TOOL.name },
      messages: [{ role: 'user', content: content as Anthropic.ContentBlockParam[] }],
    });
    await recordAnthropicUsage(MODEL, res.usage, 'group');
    const call = res.content.find((b) => b.type === 'tool_use');
    ({ reply, note } = parseReply(call ? JSON.stringify(call.input) : ''));
  } catch (e) {
    console.error('[group-draft] модель упала', e);
    note = 'модель не ответила, черновика нет';
  }
  if (reply && leaksMeta(reply)) {
    note = [note, 'черновик выкинул: в нём было служебное для тебя'].filter(Boolean).join('\n');
    reply = null;
  }
  if (unseen.length) note = [note, unseen.join('; ')].filter(Boolean).join('\n');

  if (opts.dry) return { done: true, reason: 'dry', draft: reply, note };

  // Отвечать не на что: черновик молча закрываем, Сашу не дёргаем. Но если
  // Сашу позвали по имени, модель упала или вложение не открылось, показываем
  // без черновика: пусть решит сам.
  const calledSasha = /@thesashatoyz|саш/i.test(question);
  if (!reply && !calledSasha && !unseen.length && !note.startsWith('модель')) {
    await prisma.groupDraft.update({ where: { id: draftId }, data: { status: 'silent', note } });
    return { done: true, reason: 'отвечать не на что' };
  }

  await prisma.groupDraft.update({ where: { id: draftId }, data: { draft: reply, note } });
  await sendDraftToAdmin(draftId, {
    who: who(last),
    name: last.name,
    link: tgMessageLink(Number(chatId), threadId, messageIdOf(mine[0].id)),
    question,
    draft: reply,
    note,
  });
  return { done: true, reason: 'черновик у Саши' };
}
