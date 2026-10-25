// ─────────────────────────────────────────────────────────────
// Сообщество: форум кабинета по образцу Skool.
//
// Человек открывает ветку со своим запросом (вопрос, работа на проверку,
// победа, отчёт), обсуждение идёт комментариями под ней. Доступ тот же, что у
// разборов: «Новый уровень контента» тарифа 2-3, плюс Саша.
//
// Опознание строже, чем в разделах «только почитать»: здесь пишут от имени
// человека, поэтому голый ?telegramId не принимаем. В Mini App верим только
// подписанной initData (заголовок x-tg-init-data), в браузере — подписанной
// сессии-cookie после Login Widget.
// ─────────────────────────────────────────────────────────────

import type { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { getActiveAccessByTelegram } from './access';
import { verifyInitData, verifySession, SESSION_COOKIE } from './telegram-login';
import { notifyAdmin } from './telegram';

export const FORUM_ROLE = 'uroven';
export const FORUM_MIN_TIER = 2;

/**
 * Тестеры: пускаем до открытия и показываем им раздел глазами ученика, даже
 * если это аккаунт Саши. Так рабочий аккаунт проверяет, что видит и получает
 * ученик. Список в env FORUM_TESTERS через запятую.
 */
const FORUM_TESTERS = new Set(
  (process.env.FORUM_TESTERS || '').split(',').map((s) => Number(s.trim())).filter(Boolean),
);

/** Саша: личный и рабочий аккаунт (кроме тех, кто сейчас в тестерах). Видят всё, закрепляют, удаляют чужое. */
export const FORUM_ADMINS = new Set([788334680, 6013902004].filter((id) => !FORUM_TESTERS.has(id)));

/**
 * Открыт ли раздел ученикам. Пока FORUM_OPEN не равно 1, внутрь попадают только
 * Саша и тестеры, а ученик с прямой ссылкой видит «скоро откроется».
 */
const FORUM_OPEN = process.env.FORUM_OPEN === '1';

/** Дублировать Саше на рабочий аккаунт, если тот сейчас не играет ученика. */
const ALSO_WORK = !FORUM_TESTERS.has(6013902004);

export const CATEGORIES = [
  { key: 'question', label: 'Вопрос', emoji: '❓' },
  { key: 'review', label: 'На проверку', emoji: '👀' },
  { key: 'win', label: 'Победа', emoji: '🏆' },
  { key: 'report', label: 'Отчёт', emoji: '📈' },
  { key: 'announce', label: 'Анонс', emoji: '📣', adminOnly: true },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]['key'];

export function isCategory(v: unknown): v is CategoryKey {
  return CATEGORIES.some((c) => c.key === v);
}

export const PAGE_URL = 'https://world.thesashatoyz.com/soobshchestvo';

export const LIMITS = { title: 140, body: 8000, comment: 4000, images: 10 };

export interface Viewer {
  telegramId: number;
  isAdmin: boolean;
  tier: number;
  allowed: boolean;
  /** Раздел ещё не открыт ученикам (а у этого человека тариф подходит). */
  soon: boolean;
}

function tierFromSlug(slug: string): number | null {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Кто пришёл. initData заодно освежает имя и ник в forum_member: в браузере их
 * взять неоткуда, а показывать «Участник» вместо имени — некрасиво.
 */
export async function resolveViewer(request: NextRequest): Promise<Viewer | null> {
  const botToken = process.env.BOT_TOKEN || '';
  let telegramId: number | null = null;

  const initData = request.headers.get('x-tg-init-data');
  if (initData) {
    telegramId = verifyInitData(initData, botToken);
    if (telegramId) await rememberMember(telegramId, initData);
  }
  if (!telegramId) {
    const secret = process.env.SESSION_SECRET || botToken;
    telegramId = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
  }
  if (!telegramId) return null;
  return viewerById(telegramId);
}

/** Доступ по уже опознанному id: из запроса кабинета или из апдейта бота. */
export async function viewerById(telegramId: number): Promise<Viewer> {
  const isAdmin = FORUM_ADMINS.has(telegramId);
  const rows = await getActiveAccessByTelegram(telegramId);
  const tier = rows
    .filter((r) => r.role === FORUM_ROLE)
    .reduce((max, r) => Math.max(max, tierFromSlug(r.productSlug) ?? 0), 0);

  const tierOk = tier >= FORUM_MIN_TIER;
  const allowed = isAdmin || FORUM_TESTERS.has(telegramId) || (FORUM_OPEN && tierOk);
  return { telegramId, isAdmin, tier, allowed, soon: !allowed && tierOk };
}

/**
 * Показывать ли вкладку «Сообщество» в кабинете. До открытия её видят только
 * Саша и тестеры; после FORUM_OPEN=1 — все, а замок по тарифу рисует кабинет.
 */
export function forumTabVisible(telegramId: number | null): boolean {
  if (FORUM_OPEN) return true;
  return telegramId != null && (FORUM_ADMINS.has(telegramId) || FORUM_TESTERS.has(telegramId));
}

async function rememberMember(telegramId: number, initData: string) {
  try {
    const user = JSON.parse(new URLSearchParams(initData).get('user') || '{}') as {
      first_name?: string; last_name?: string; username?: string;
    };
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username || '';
    if (!name) return;
    await prisma.forumMember.upsert({
      where: { telegramId: BigInt(telegramId) },
      create: { telegramId: BigInt(telegramId), name, username: user.username ?? null },
      update: { name, username: user.username ?? null },
    });
  } catch (e) {
    console.error('[forum] rememberMember failed:', e);
  }
}

/**
 * Профиль для тех, кто зашёл только из браузера и ни разу не открывал Mini App:
 * спрашиваем имя у Телеграма через бота (getChat работает, если человек писал боту).
 */
export async function ensureMember(telegramId: number) {
  const found = await prisma.forumMember.findUnique({ where: { telegramId: BigInt(telegramId) } });
  if (found) return found;
  let name = 'Участник';
  let username: string | null = null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramId }),
    });
    const data = await res.json();
    if (data.ok) {
      name = [data.result.first_name, data.result.last_name].filter(Boolean).join(' ').trim() || name;
      username = data.result.username ?? null;
    }
  } catch { /* остаёмся на «Участник» */ }
  return prisma.forumMember.create({ data: { telegramId: BigInt(telegramId), name, username } });
}

export interface Author { id: string; name: string; username: string | null; isAdmin: boolean; isBot?: boolean }

/**
 * Автор комментариев бота-помощника. Ноль не совпадает ни с одним Telegram id,
 * поэтому строки forum_member для бота нет: имя подставляется здесь.
 */
export const BOT_AUTHOR_TG = BigInt(0);
export const BOT_AUTHOR_NAME = 'Бот-помощник';

/** Авторы пачкой: одна выборка на всю ленту. */
export async function loadAuthors(ids: bigint[]): Promise<Map<string, Author>> {
  const uniq = [...new Set(ids.map(String))];
  const rows = uniq.length
    ? await prisma.forumMember.findMany({ where: { telegramId: { in: uniq.map((x) => BigInt(x)) } } })
    : [];
  const map = new Map<string, Author>();
  for (const id of uniq) {
    if (id === String(BOT_AUTHOR_TG)) {
      map.set(id, { id, name: BOT_AUTHOR_NAME, username: null, isAdmin: false, isBot: true });
      continue;
    }
    const row = rows.find((r) => String(r.telegramId) === id);
    map.set(id, {
      id,
      name: row?.name || 'Участник',
      username: row?.username ?? null,
      isAdmin: FORUM_ADMINS.has(Number(id)),
    });
  }
  return map;
}

/** Чистка пользовательского текста: обрезка и схлопывание лишних пустых строк. */
export function cleanText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.replace(/\r\n/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim().slice(0, max);
}

/** Картинки только свои и только существующие: чужой id в пост не протащить. */
export async function ownImages(ids: unknown, ownerTg: number): Promise<string[]> {
  if (!Array.isArray(ids)) return [];
  const clean = ids.filter((x): x is string => typeof x === 'string' && /^[0-9a-f-]{36}$/.test(x))
    .slice(0, LIMITS.images);
  if (!clean.length) return [];
  const rows = await prisma.forumImage.findMany({
    where: { id: { in: clean }, ownerTg: BigInt(ownerTg) },
    select: { id: true },
  });
  const ok = new Set(rows.map((r) => r.id));
  return clean.filter((id) => ok.has(id));
}

/**
 * Заголовок ветки. Писать его необязательно: пустой берём из первой строки
 * текста, чтобы задать вопрос было не сложнее, чем написать в чат.
 */
export function postTitle(title: unknown, body: string): string {
  const t = cleanText(title, LIMITS.title).replace(/\n+/g, ' ');
  if (t) return t;
  const first = body.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  return first.length > 80 ? `${first.slice(0, 79).trimEnd()}…` : first;
}

/**
 * Комментарий в ветку: из кабинета и из ответа на уведомление бота.
 * null — ветки нет (удалили).
 */
export async function addComment(opts: {
  postId: string; parentId?: string | null; me: number; text: string; images: string[];
}): Promise<string | null> {
  const { postId, me, text, images } = opts;
  const meTg = BigInt(me);
  const post = await prisma.forumPost.findFirst({ where: { id: postId, deleted: false } });
  if (!post) return null;

  // Ответ на ответ вешаем на корневой комментарий: вложенность одна, как в Skool.
  let parentId: string | null = null;
  let parentAuthorTg: bigint | null = null;
  if (opts.parentId) {
    const parent = await prisma.forumComment.findFirst({ where: { id: opts.parentId, postId } });
    if (parent) {
      parentId = parent.parentId ?? parent.id;
      parentAuthorTg = parent.authorTg;
    }
  }

  const member = await ensureMember(me);
  const now = new Date();
  const comment = await prisma.forumComment.create({
    data: { postId, parentId, authorTg: meTg, body: text, images, createdAt: now },
  });
  await prisma.forumPost.update({
    where: { id: postId },
    data: {
      commentCount: { increment: 1 }, lastAuthorTg: meTg, lastActivityAt: now,
      // Автор дописал в закрытую ветку — значит, вопрос снова открыт.
      ...(post.solved && post.authorTg === meTg ? { solved: false } : {}),
    },
  });
  await notifyComment({
    post, commentId: comment.id, body: text || '📷 картинка',
    commenterTg: me, commenterName: member.name, parentAuthorTg,
  });
  return comment.id;
}

/** Ветка и комментарий из кнопки «Открыть ветку» под уведомлением. */
function threadFromMarkup(markup: unknown): { postId: string; commentId: string | null } | null {
  const rows = (markup as { inline_keyboard?: { web_app?: { url?: string }; url?: string }[][] } | undefined)?.inline_keyboard;
  for (const btn of (rows ?? []).flat()) {
    const raw = btn.web_app?.url || btn.url;
    if (!raw || !raw.startsWith(PAGE_URL)) continue;
    const u = new URL(raw);
    const postId = u.searchParams.get('post');
    if (postId && /^[0-9a-f-]{36}$/.test(postId)) {
      const c = u.searchParams.get('c');
      return { postId, commentId: c && /^[0-9a-f-]{36}$/.test(c) ? c : null };
    }
  }
  return null;
}

async function tgFile(fileId: string): Promise<Uint8Array<ArrayBuffer> | null> {
  const token = process.env.BOT_TOKEN;
  const res = await fetch(`https://api.telegram.org/bot${token}/getFile`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = await res.json();
  if (!data.ok || !data.result?.file_path) return null;
  const file = await fetch(`https://api.telegram.org/file/bot${token}/${data.result.file_path}`);
  return file.ok ? new Uint8Array(await file.arrayBuffer()) : null;
}

/**
 * Ответ реплаем на уведомление бота о ветке уходит в неё комментарием. Так и
 * Саше, и ученику не нужно открывать кабинет, чтобы ответить: пишут, как в чате.
 * true — апдейт наш и обработан.
 */
export async function catchForumReply(msg: {
  chat: { id: number; type?: string };
  from?: { id?: number };
  text?: string;
  caption?: string;
  photo?: { file_id: string; width?: number; height?: number }[];
  reply_to_message?: { reply_markup?: unknown };
}): Promise<boolean> {
  if (msg.chat.type && msg.chat.type !== 'private') return false;
  const thread = threadFromMarkup(msg.reply_to_message?.reply_markup);
  if (!thread) return false;

  const me = msg.from?.id ?? msg.chat.id;
  const say = (text: string) => sendDm(msg.chat.id, text, {});
  const viewer = await viewerById(me);
  if (!viewer.allowed) {
    await say('Сообщество пока закрыто, ответ не ушёл.');
    return true;
  }

  const text = cleanText(msg.text ?? msg.caption, LIMITS.comment);
  const images: string[] = [];
  const photo = msg.photo?.[msg.photo.length - 1];
  if (photo) {
    const data = await tgFile(photo.file_id).catch(() => null);
    if (data) {
      const row = await prisma.forumImage.create({
        data: {
          ownerTg: BigInt(me), mime: 'image/jpeg', data,
          width: photo.width ?? 1, height: photo.height ?? 1,
        },
        select: { id: true },
      });
      images.push(row.id);
    }
  }
  if (!text && !images.length) {
    await say('Сюда пока доходят текст и картинки. Голосовое и файлы прикрепи в самой ветке.');
    return true;
  }

  const id = await addComment({ postId: thread.postId, parentId: thread.commentId, me, text, images });
  if (id) await sendDm(msg.chat.id, '✅ Ответ в ветке', openButton(thread.postId, id));
  else await say('Ветку удалили, ответ не ушёл.');
  return true;
}

// ─────────────────────────────────────────────────────────────
// Уведомления. Человеку — в личку бота с кнопкой, которая открывает ветку
// прямо в Mini App. Саше — через notifyAdmin (личный + рабочий аккаунт).
// ─────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function excerpt(s: string, n = 300): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/** Подсказка под уведомлением: отвечать можно, не открывая кабинет. */
const REPLY_HINT = '\n\n<i>Ответь на это сообщение, и ответ уйдёт в ветку.</i>';

function openButton(postId: string, commentId?: string) {
  const url = `${PAGE_URL}?post=${postId}${commentId ? `&c=${commentId}` : ''}`;
  return { inline_keyboard: [[{ text: '💬 Открыть ветку', web_app: { url } }]] };
}

async function sendDm(chatId: number, text: string, replyMarkup: object) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, text, parse_mode: 'HTML',
        link_preview_options: { is_disabled: true }, reply_markup: replyMarkup,
      }),
    });
    const data = await res.json();
    if (!data.ok) console.error('[forum] dm failed', chatId, data.description);
  } catch (e) {
    console.error('[forum] dm error', chatId, e);
  }
}

export async function notifyNewPost(post: { id: string; title: string; body: string; category: string }, authorName: string) {
  const cat = CATEGORIES.find((c) => c.key === post.category);
  const text = `${cat?.emoji ?? '🆕'} <b>Новая ветка в сообществе</b> · ${esc(cat?.label ?? '')}\n`
    + `<b>${esc(authorName)}</b>: «${esc(post.title)}»\n\n${esc(excerpt(post.body))}${REPLY_HINT}`;
  await notifyAdmin(text, { alsoWork: ALSO_WORK, disableLinkPreview: true, replyMarkup: openButton(post.id) });
}

/**
 * Кому сообщить о новом комментарии: автору ветки, автору комментария, на
 * который ответили, и Саше, если написал не он. Сам комментатор — никому.
 */
export async function notifyComment(opts: {
  post: { id: string; title: string; authorTg: bigint };
  commentId: string;
  body: string;
  commenterTg: number;
  commenterName: string;
  parentAuthorTg: bigint | null;
}) {
  const { post, commentId, body, commenterTg, commenterName, parentAuthorTg } = opts;
  const commenterIsAdmin = FORUM_ADMINS.has(commenterTg);
  const markup = openButton(post.id, commentId);
  const quote = esc(excerpt(body));
  const jobs: Promise<unknown>[] = [];
  const sent = new Set<number>([commenterTg]);

  const authorTg = Number(post.authorTg);
  if (!sent.has(authorTg) && !FORUM_ADMINS.has(authorTg)) {
    sent.add(authorTg);
    jobs.push(sendDm(authorTg,
      `💬 <b>${esc(commenterName)}</b> ответил в твоей ветке «${esc(post.title)}»:\n\n${quote}${REPLY_HINT}`, markup));
  }
  if (parentAuthorTg) {
    const p = Number(parentAuthorTg);
    if (!sent.has(p) && !FORUM_ADMINS.has(p)) {
      sent.add(p);
      jobs.push(sendDm(p,
        `↩️ <b>${esc(commenterName)}</b> ответил на твой комментарий в ветке «${esc(post.title)}»:\n\n${quote}${REPLY_HINT}`, markup));
    }
  }
  if (!commenterIsAdmin) {
    jobs.push(notifyAdmin(
      `💬 <b>${esc(commenterName)}</b> в ветке «${esc(post.title)}»:\n\n${quote}${REPLY_HINT}`,
      { alsoWork: ALSO_WORK, disableLinkPreview: true, replyMarkup: markup },
    ));
  }
  await Promise.all(jobs);
}

// ─────────────────────────────────────────────────────────────
// Бот-помощник (src/lib/community-bot). Работает только при COMMUNITY_BOT=1.
// ─────────────────────────────────────────────────────────────

/** Ответ бота в ветку: комментарий от его имени и уведомление автору ветки. */
export async function addBotComment(postId: string, text: string): Promise<void> {
  const post = await prisma.forumPost.findFirst({ where: { id: postId, deleted: false } });
  if (!post) return;
  const now = new Date();
  const comment = await prisma.forumComment.create({
    data: { postId, parentId: null, authorTg: BOT_AUTHOR_TG, body: text, images: [], createdAt: now },
  });
  await prisma.forumPost.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 }, lastAuthorTg: BOT_AUTHOR_TG, lastActivityAt: now },
  });
  await sendDm(Number(post.authorTg),
    `🤖 <b>${BOT_AUTHOR_NAME}</b> ответил в твоей ветке «${esc(post.title)}»:

${esc(excerpt(text))}${REPLY_HINT}`,
    openButton(postId, comment.id));
}

const BOT_LABEL: Record<'personal' | 'method' | 'review' | 'social', string> = {
  method: '❓ <b>Вопрос по методу</b>',
  review: '👀 <b>Работа на проверку</b>',
  personal: '🙋 <b>Вопрос к тебе</b> (доступ, оплата, договорённости)',
  social: '🆕 <b>Новая ветка в сообществе</b>',
};

/**
 * Уведомление Саше о новой ветке, когда бот включён: вместо общего «новая
 * ветка» — что бот с ней сделал. Ответил сам — Саша видит ответ и может
 * поправить, ответив на сообщение. Не ответил — сразу видно, что ветка ждёт его.
 */
export async function notifyBotPost(
  post: { id: string; title: string; body: string },
  authorName: string,
  notice: { kind: 'personal' | 'method' | 'review' | 'social' } | { kind: 'answered'; answer: string },
) {
  const head = notice.kind === 'answered'
    ? '🤖 <b>Бот ответил в новой ветке</b>'
    : BOT_LABEL[notice.kind];
  const answer = notice.kind === 'answered' ? `

<b>Ответ бота:</b> ${esc(excerpt(notice.answer))}` : '';
  const text = `${head}
<b>${esc(authorName)}</b>: «${esc(post.title)}»

${esc(excerpt(post.body))}${answer}${REPLY_HINT}`;
  await notifyAdmin(text, { alsoWork: ALSO_WORK, disableLinkPreview: true, replyMarkup: openButton(post.id) });
}
