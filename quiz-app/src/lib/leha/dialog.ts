/**
 * Лёха ведёт весь диалог до продажи в чатах из LEHA_DIALOG_CHATS.
 *
 * На каждую реплику человека ставится задача через паузу (как у первого
 * сообщения). Задача собирает ответ по анкете и всей переписке промптом
 * помощника в продажах плюс правилами диалога, проверяет текст и дальше:
 * live шлёт сам и кидает Саше копию, shadow отдаёт карточку с кнопками.
 * Модель позвала Сашу или текст с изъяном: человеку ничего, Саше карточка,
 * Лёха в этом чате ждёт его решения.
 *
 * Саша написал в чат сам: Лёха замолкает в этом чате насовсем, пока его не
 * включат снова скриптом scripts/leha-dialog-kick.mjs --resume.
 *
 * Правила «когда можно» в ./dialog-rules, здесь база и телеграм.
 */
import type { LehaDialog } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { prices } from '@/content/prices';
import { scheduleLehaDialog } from '@/lib/qstash';
import { editAdminMarkup } from '@/lib/telegram';
import { suggestFromThread, type SalesStep } from '@/lib/sales/answer';
import { describeAccess, describeLead, leadOfChat, sendAs } from '@/lib/sales/tg';
import { threadOf } from '@/lib/sales/dialogs';
import { awaitingPayment, describePayment, theirMove } from '@/lib/sales/payment';
import { almatyDayStart, lehaMode } from './rules';
import {
  cleanDialogReply,
  decideDialogRun,
  dialogDelivery,
  dialogDueAt,
  isDialogChat,
  sashaTookOver,
  sentToday,
} from './dialog-rules';
import { dialogRules } from './dialog-prompt';
import { done, esc, isLehaAdmin, lehaChatId, tg } from './bot';

/** Диалог дороже первого сообщения по ошибке: берём свежий Sonnet. */
const MODEL = 'claude-sonnet-5-5';

export const DCB = { send: 'lds:', edit: 'lde:', skip: 'ldx:', mine: 'ldm:' } as const;

const who = (d: Pick<LehaDialog, 'username' | 'name'>) => (d.username ? `@${d.username}` : d.name || 'человек');

/**
 * Хук из onLehaMessage для чатов из списка. Реплика человека ставит ответ
 * через паузу, Сашина реплика останавливает Лёху в этом чате.
 */
export async function onDialogMessage(m: {
  chatId: string;
  side: string;
  text: string;
  username: string | null;
  name: string | null;
  leadId: number | null;
}): Promise<void> {
  let d = await prisma.lehaDialog.findUnique({ where: { chatId: m.chatId } });

  if (m.side !== 'client') {
    if (!d || d.status === 'stopped') return;
    // Эхо Лёхиного же сообщения: телеграм присылает его апдейтом, иногда
    // раньше, чем sendAs успеет записать его с меткой.
    if (d.lastSentText && m.text.trim() === d.lastSentText.trim()) return;
    await stopDialog(d, 'sasha_wrote', 'ты написал в чат сам');
    return;
  }

  if (lehaMode() === 'off') return;
  if (!d) {
    d = await prisma.lehaDialog
      .create({ data: { chatId: m.chatId, leadId: m.leadId, username: m.username, name: m.name } })
      .catch(() => prisma.lehaDialog.findUnique({ where: { chatId: m.chatId } }));
    if (!d) return;
  }
  // Ждём Сашу: он либо отправит из карточки, либо ведёт сам.
  if (d.status === 'stopped' || d.status === 'escalated') return;

  const now = new Date();
  const dueAt = dialogDueAt(now);
  // Человек дописал, пока висела карточка shadow: она устарела, собираем заново.
  const stalePending = d.status === 'pending';
  await prisma.lehaDialog.update({
    where: { chatId: m.chatId },
    data: {
      dueAt,
      leadId: m.leadId ?? d.leadId,
      username: m.username ?? d.username,
      name: m.name ?? d.name,
      ...(stalePending ? { status: 'active', draft: null, note: null } : {}),
    },
  });
  if (stalePending && d.adminChatId && d.adminMsgId) {
    await editAdminMarkup({ chatId: d.adminChatId, messageId: d.adminMsgId }, done('⏭ человек дописал, пересобираю'));
  }
  await scheduleLehaDialog(m.chatId, (dueAt.getTime() - now.getTime()) / 1000);
}

/** Лёха замолкает в чате до ручного включения. */
async function stopDialog(d: LehaDialog, reason: string, label: string, notify = true): Promise<void> {
  const claimed = await prisma.lehaDialog.updateMany({
    where: { chatId: d.chatId, status: { not: 'stopped' } },
    data: { status: 'stopped', stopReason: reason, dueAt: null },
  });
  if (!claimed.count) return;
  if ((d.status === 'pending' || d.status === 'escalated') && d.adminChatId && d.adminMsgId) {
    await editAdminMarkup({ chatId: d.adminChatId, messageId: d.adminMsgId }, done('💬 ведёшь сам'));
  }
  const chat = lehaChatId();
  if (notify && chat) {
    await tg('sendMessage', {
      chat_id: chat,
      text: `🤖 Лёха замолчал в чате ${who(d)}: ${label}. Дальше ведёшь ты.\nВключить снова: node scripts/leha-dialog-kick.mjs ${d.chatId} --resume`,
    });
  }
}

/** Задача QStash: ответить в диалоге. retryInSec: перепланировать. */
export async function runLehaDialog(chatId: string): Promise<{ done: true; status: string } | { done: false; retryInSec: number }> {
  const d = await prisma.lehaDialog.findUnique({ where: { chatId } });
  if (!d) return { done: true, status: 'missing' };
  const mode = lehaMode();
  const now = new Date();

  const last = await prisma.tgBusinessMsg.findFirst({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, side: true },
  });
  const ours = await prisma.tgBusinessMsg.findMany({
    where: { chatId, side: 'us', createdAt: { gte: d.enabledAt } },
    select: { side: true, mediaRef: true, text: true, createdAt: true },
  });

  const step = decideDialogRun({
    mode,
    inList: isDialogChat(chatId),
    status: d.status,
    dueAt: d.dueAt,
    updatedAt: d.updatedAt,
    lastSide: last ? (last.side === 'client' ? 'client' : 'us') : null,
    sentToday: sentToday(d.dayStart, d.dayCount, now),
    sashaWrote: sashaTookOver(ours, d.enabledAt, d.lastSentText),
    now,
  });
  if (step.kind === 'noop') return { done: true, status: `noop: ${step.why}` };
  if (step.kind === 'wait') return { done: false, retryInSec: (step.until.getTime() - now.getTime()) / 1000 };
  if (step.kind === 'stop') {
    await stopDialog(d, step.reason, 'ты писал в чат сам (с телефона или из кабинета)');
    return { done: true, status: 'stopped' };
  }

  // Две задачи могли проснуться разом: пишет только та, что забрала строку.
  const claimed = await prisma.lehaDialog.updateMany({
    where: { chatId, status: d.status, dueAt: d.dueAt },
    data: { status: 'composing', dueAt: null },
  });
  if (!claimed.count) return { done: true, status: 'raced' };

  const rows = await threadOf(chatId, 60);
  const tail = rows[rows.length - 1];
  let answer: SalesStep;
  try {
    answer = await compose(d, rows);
  } catch (e) {
    console.error('[leha-dialog] модель упала', e);
    await toSasha(d, 'escalated', null, 'модель не ответила, ответь сам', rows);
    return { done: true, status: 'escalated' };
  }

  // Пока модель думала, человек дописал: ответ уже не про то. Новую задачу
  // поставил хук, она соберёт ответ на всё сразу.
  const fresh = await prisma.tgBusinessMsg.findFirst({ where: { chatId }, orderBy: { createdAt: 'desc' }, select: { id: true } });
  if (fresh?.id !== tail?.id) {
    await prisma.lehaDialog.updateMany({ where: { chatId, status: 'composing' }, data: { status: 'active' } });
    return { done: true, status: 'superseded' };
  }

  const p = prices();
  const clean = cleanDialogReply(answer.message, p);
  const delivery = dialogDelivery({
    mode,
    callSasha: answer.callSasha,
    problem: clean.problem,
    personal: clean.personal,
    hasText: Boolean(clean.text),
    now: new Date(),
  });
  const note = [answer.callSasha, clean.problem, clean.personal ? 'личная ссылка на закрытый тариф' : null, answer.sell ? `продаём: ${answer.sell}` : null]
    .filter(Boolean)
    .join(' · ');

  if (delivery === 'send' && clean.text) {
    const res = await deliverDialog(chatId, clean.text, { auto: true, from: ['composing'] });
    if (res.ok) return { done: true, status: 'sent' };
    await toSasha(d, 'escalated', clean.text, `не отправилось: ${res.error}`, rows);
    return { done: true, status: 'escalated' };
  }
  await toSasha(d, delivery === 'review' ? 'pending' : 'escalated', clean.text, note || null, rows);
  return { done: true, status: delivery === 'review' ? 'pending' : 'escalated' };
}

/** Ответ модели по анкете и всей переписке. */
async function compose(d: LehaDialog, rows: Awaited<ReturnType<typeof threadOf>>): Promise<SalesStep> {
  const tail = rows[rows.length - 1];
  const lead = await leadOfChat(d.chatId, d.username);
  const rendered = rows
    .map((r) => {
      const when = r.createdAt.toISOString().slice(0, 16).replace('T', ' ');
      return `[${when}] ${r.side === 'client' ? 'ЧЕЛОВЕК' : 'МЫ'}: ${r.text}`;
    })
    .join('\n');

  return suggestFromThread({
    about: [
      d.username ? `ник: @${d.username}` : null,
      d.name ? `имя в телеграме: ${d.name}` : null,
      'канал: личка в телеграме, не инстаграм',
      await describeAccess(d.chatId),
      describePayment(await awaitingPayment(d.chatId)),
      describeLead(lead),
    ]
      .filter(Boolean)
      .join('\n'),
    rendered,
    waitingSeconds: tail?.side === 'client' ? Math.round((Date.now() - tail.createdAt.getTime()) / 1000) : null,
    theirMove: tail?.side === 'client' && theirMove(tail.text),
    model: MODEL,
    extraSystem: dialogRules(prices(), d.chatId),
  });
}

/**
 * Отправить человеку от рабочего аккаунта с меткой Лёхи. Статус забираем до
 * отправки: двойное нажатие не отправит дважды. Два сообщения подряд без
 * ответа человека не уходят ни при каком раскладе.
 */
async function deliverDialog(
  chatId: string,
  text: string,
  opts: { auto: boolean; from: string[] },
): Promise<{ ok: boolean; error?: string }> {
  const d = await prisma.lehaDialog.findUnique({ where: { chatId } });
  if (!d) return { ok: false, error: 'диалог не найден' };
  const last = await prisma.tgBusinessMsg.findFirst({ where: { chatId }, orderBy: { createdAt: 'desc' }, select: { side: true } });
  if (last && last.side !== 'client') return { ok: false, error: 'последнее сообщение уже наше, жду человека' };

  const claimed = await prisma.lehaDialog.updateMany({
    where: { chatId, status: { in: opts.from } },
    data: { status: 'composing', lastSentText: text },
  });
  if (!claimed.count) return { ok: false, error: 'уже решено' };

  const res = await sendAs(chatId, text, 'leha');
  if (!res.ok) {
    await prisma.lehaDialog.update({ where: { chatId }, data: { status: d.status, lastSentText: d.lastSentText } });
    return res;
  }

  const now = new Date();
  await prisma.lehaDialog.update({
    where: { chatId },
    data: {
      status: 'active',
      draft: null,
      note: null,
      promptMsgId: null,
      dayStart: almatyDayStart(now),
      dayCount: sentToday(d.dayStart, d.dayCount, now) + 1,
    },
  });

  // Саша видит каждое сообщение, ушедшее без него.
  const chat = lehaChatId();
  if (opts.auto && chat) {
    await tg('sendMessage', {
      chat_id: chat,
      text: `🤖 Лёха → ${who(d)}:\n${text}`,
      link_preview_options: { is_disabled: true },
    });
  }
  return { ok: true };
}

/** Карточка Саше: на проверку (pending) или «нужен ты» (escalated). */
async function toSasha(
  d: LehaDialog,
  status: 'pending' | 'escalated',
  text: string | null,
  note: string | null,
  rows: { side: string; text: string }[],
): Promise<void> {
  await prisma.lehaDialog.updateMany({
    where: { chatId: d.chatId, status: 'composing' },
    data: { status, draft: text, note },
  });
  const chat = lehaChatId();
  if (!chat) return;

  // Что человек сказал после нашего последнего сообщения.
  const lastOurs = rows.map((r) => r.side).lastIndexOf('us');
  const said = rows.slice(lastOurs + 1).map((r) => r.text).join('\n');

  const lines = [
    `🤖 <b>Лёха</b> · диалог · ${esc(who(d))}${d.name && d.username ? ` (${esc(d.name)})` : ''}${d.leadId ? ` · анкета №${d.leadId}` : ''}`,
    status === 'escalated' ? '🙋 <b>нужен ты</b>, человеку ничего не ушло' : '',
    '',
    `<i>${esc(said.slice(0, 700))}</i>`,
    '',
    text ? `<b>Предлагаю:</b>\n<code>${esc(text)}</code>` : '<b>Текста нет</b>',
  ].filter((l, i) => l !== '' || i > 1);
  if (note) lines.push('', `📝 ${esc(note.slice(0, 600))}`);

  const res = await tg('sendMessage', {
    chat_id: chat,
    text: lines.join('\n'),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [
        [
          ...(text ? [{ text: '✅ Отправить', callback_data: DCB.send + d.chatId }] : []),
          { text: text ? '✏️ Править' : '✏️ Написать', callback_data: DCB.edit + d.chatId },
        ],
        [
          ...(status === 'pending' ? [{ text: '✖️ Пропустить', callback_data: DCB.skip + d.chatId }] : []),
          { text: '🙋 Веду сам', callback_data: DCB.mine + d.chatId },
        ],
      ],
    },
  });
  if (res.ok && res.result?.message_id) {
    await prisma.lehaDialog.update({ where: { chatId: d.chatId }, data: { adminChatId: chat, adminMsgId: res.result.message_id } });
  }
}

/** Кнопка под карточкой диалога. messageId: чтобы старая карточка не решала за новую. */
export async function handleDialogButton(data: string, chatId: number, messageId: number): Promise<string> {
  const kind = data.slice(0, 4);
  const dialogChat = data.slice(4);
  const d = await prisma.lehaDialog.findUnique({ where: { chatId: dialogChat } });
  if (!d) return 'диалог не найден';
  if (d.adminMsgId !== messageId) return 'карточка устарела';
  if (d.status !== 'pending' && d.status !== 'escalated') return 'уже решено';
  const ref = { chatId: String(chatId), messageId };

  if (kind === DCB.mine) {
    await stopDialog(d, 'sasha_took', 'ведёшь сам', false);
    await editAdminMarkup(ref, done('🙋 ведёшь сам'));
    return 'ок, Лёха молчит в этом чате';
  }

  if (kind === DCB.skip) {
    await prisma.lehaDialog.updateMany({ where: { chatId: dialogChat, status: d.status }, data: { status: 'active', draft: null } });
    await editAdminMarkup(ref, done('✖️ пропустили'));
    return 'пропустил, жду следующего сообщения';
  }

  if (kind === DCB.edit) {
    const res = await tg('sendMessage', {
      chat_id: chatId,
      text: `Пришли свой вариант ответом на это сообщение, уйдёт ${who(d)} с рабочего аккаунта, Лёха продолжит после`,
      reply_markup: { force_reply: true, input_field_placeholder: 'твой текст' },
      reply_parameters: { message_id: messageId, allow_sending_without_reply: true },
    });
    if (res.ok && res.result?.message_id) {
      await prisma.lehaDialog.update({ where: { chatId: dialogChat }, data: { promptMsgId: res.result.message_id } });
    }
    return 'жду твой вариант';
  }

  if (kind === DCB.send) {
    if (!d.draft) return 'текста нет';
    const res = await deliverDialog(dialogChat, d.draft, { auto: false, from: [d.status] });
    if (!res.ok) return res.error || 'не отправилось';
    await editAdminMarkup(ref, done('✅ отправлено'));
    return 'отправил';
  }

  return 'не понял кнопку';
}

/** Саша прислал свой текст вместо Лёхиного. true: это была правка диалога. */
export async function catchDialogEdit(msg: {
  chat: { id: number };
  text?: string;
  reply_to_message?: { message_id?: number };
}): Promise<boolean> {
  const promptId = msg.reply_to_message?.message_id;
  if (!promptId || !isLehaAdmin(msg.chat.id)) return false;
  const d = await prisma.lehaDialog.findFirst({ where: { promptMsgId: promptId } });
  if (!d) return false;

  const reply = (t: string) =>
    tg('sendMessage', { chat_id: msg.chat.id, text: t, reply_parameters: { message_id: promptId, allow_sending_without_reply: true } });
  const text = (msg.text || '').trim();
  if (!text) {
    await reply('нужен текст, голосовые сюда пока не умею');
    return true;
  }
  const res = await deliverDialog(d.chatId, text, { auto: false, from: ['pending', 'escalated'] });
  if (!res.ok) {
    await reply('не отправил: ' + (res.error || 'ошибка телеграма'));
    return true;
  }
  if (d.adminChatId && d.adminMsgId) {
    await editAdminMarkup({ chatId: d.adminChatId, messageId: d.adminMsgId }, done('✏️ отправлено с правкой'));
  }
  await reply('отправил ✅');
  return true;
}
