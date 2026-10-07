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
import { SYSTEM, parseReply, renderExamples, type Correction, type ShotPair } from './prompt';
import { fileBlocks, linkBlocks, type ContentBlock } from './sources';
import { sendDraftToAdmin } from './admin';

const anthropic = new Anthropic();

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

/** Живые пары «вопрос → ответ Саши» из группы, свежие первыми. */
async function shotPairs(chatId: string): Promise<ShotPair[]> {
  const answers = await prisma.tgGroupMsg.findMany({
    where: { chatId, userId: { in: ownerIds() }, replyToId: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });
  const ids = answers.map((a) => `${chatId}:${a.replyToId}`);
  const questions = await prisma.tgGroupMsg.findMany({ where: { id: { in: ids } } });
  const byId = new Map(questions.map((q) => [q.id, q]));
  const pairs: ShotPair[] = [];
  for (const a of answers) {
    const q = byId.get(`${chatId}:${a.replyToId}`);
    if (!q || isOwner(q.userId) || a.text.length < 15) continue;
    pairs.push({ question: q.text.slice(0, 600), answer: a.text.slice(0, 900) });
    if (pairs.length >= 15) break;
  }
  return pairs;
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
  const since = prev && prev.lastAt > floor ? prev.lastAt : floor;

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
  const [fb, lb, pairs, fixes] = await Promise.all([
    fileBlocks(files.map((r) => ({ fileId: r.fileId!, mime: r.fileMime }))),
    linkBlocks(question),
    shotPairs(chatId),
    corrections(),
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
  const unseen: string[] = [];
  if (fb.missed) unseen.push(`не открылось файлов: ${fb.missed}`);
  if (lb.missed.length) unseen.push(`не открылись ссылки: ${lb.missed.join(', ')}`);
  if (unseen.length) content.push({ type: 'text', text: `Внимание: ${unseen.join('; ')}.` });

  const system = [
    { type: 'text' as const, text: SYSTEM },
    {
      type: 'text' as const,
      text: `## Оглавление кабинета (для вопросов «где найти»)\n\n${cabinetIndex()}\n\n${renderExamples(pairs, fixes)}`,
      cache_control: { type: 'ephemeral' as const },
    },
  ];

  let reply: string | null = null;
  let note = '';
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system,
      messages: [{ role: 'user', content: content as Anthropic.ContentBlockParam[] }],
    });
    await recordAnthropicUsage(MODEL, res.usage, 'group');
    const raw = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    ({ reply, note } = parseReply(raw));
  } catch (e) {
    console.error('[group-draft] модель упала', e);
    note = 'модель не ответила, черновика нет';
  }
  if (unseen.length) note = [note, unseen.join('; ')].filter(Boolean).join('\n');

  if (opts.dry) return { done: true, reason: 'dry', draft: reply, note };

  // Отвечать не на что: черновик молча закрываем, Сашу не дёргаем.
  if (!reply && !note.startsWith('модель')) {
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
