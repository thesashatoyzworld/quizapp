/**
 * Черновик у Саши в личке бота и три кнопки под ним:
 * «отправить» кладёт текст в группу ответом на вопрос, «поправить» ждёт его
 * вариант ответом на сообщение бота, «пропустить» закрывает.
 */
import { prisma } from '@/lib/prisma';
import { editAdminMarkup } from '@/lib/telegram';

const BOT_TOKEN = process.env.BOT_TOKEN;

export const CB = { send: 'gds:', edit: 'gde:', skip: 'gdx:' } as const;

/** Куда слать черновики. По умолчанию рабочий аккаунт, туда уже идут уведомления. */
export function draftChatId(): string {
  return (
    process.env.GROUP_DRAFT_CHAT_ID ||
    process.env.ADMIN_CHAT_ID_WORK ||
    process.env.ADMIN_CHAT_ID ||
    ''
  ).trim();
}

export function isDraftAdmin(chatId: number | string): boolean {
  const id = String(chatId);
  return [draftChatId(), process.env.ADMIN_CHAT_ID, process.env.ADMIN_CHAT_ID_WORK]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .includes(id);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function clip(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

async function tg(method: string, body: object): Promise<{ ok: boolean; result?: { message_id?: number }; description?: string }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) console.error(`[group-draft] ${method}: ${data.error_code} ${data.description}`);
    return data;
  } catch (e) {
    console.error(`[group-draft] ${method} упал`, e);
    return { ok: false };
  }
}

const keyboard = (id: string, hasDraft: boolean) => ({
  inline_keyboard: [
    [
      ...(hasDraft ? [{ text: '✅ Отправить', callback_data: CB.send + id }] : []),
      { text: hasDraft ? '✏️ Поправить' : '✏️ Ответить', callback_data: CB.edit + id },
      { text: '✖️ Пропустить', callback_data: CB.skip + id },
    ],
  ],
});

const done = (label: string) => ({ inline_keyboard: [[{ text: label, callback_data: 'noop' }]] });

export async function sendDraftToAdmin(
  id: string,
  d: { who: string; name: string | null; link: string; question: string; draft: string | null; note: string },
): Promise<void> {
  const chatId = draftChatId();
  if (!chatId) return;

  const lines = [
    `💬 <b>Коннекторы</b> · ${esc(d.who)}${d.name ? ` (${esc(d.name)})` : ''} · <a href="${d.link}">к вопросу</a>`,
    '',
    `<i>${esc(clip(d.question, 900))}</i>`,
    '',
    d.draft ? `<b>Черновик:</b>\n<code>${esc(d.draft)}</code>` : '<b>Черновика нет</b>',
  ];
  if (d.note) lines.push('', `📝 ${esc(clip(d.note, 500))}`);

  const res = await tg('sendMessage', {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: keyboard(id, !!d.draft),
  });
  if (res.ok && res.result?.message_id) {
    await prisma.groupDraft.update({
      where: { id },
      data: { adminChatId: chatId, adminMsgId: res.result.message_id },
    });
  }
}

/** Текст уходит в группу ответом на последнее сообщение пачки, в ту же тему. */
async function postToGroup(d: { chatId: string; threadId: number | null; lastMessageId: number }, text: string) {
  return tg('sendMessage', {
    chat_id: d.chatId,
    text,
    ...(d.threadId ? { message_thread_id: d.threadId } : {}),
    reply_parameters: { message_id: d.lastMessageId, allow_sending_without_reply: true },
    link_preview_options: { is_disabled: true },
  });
}

/**
 * Нажатие кнопки под черновиком. Статус меняется условно (только из pending),
 * чтобы двойное нажатие не отправило ответ в группу дважды.
 */
export async function handleDraftButton(data: string, chatId: number): Promise<string> {
  const kind = data.slice(0, 4);
  const id = data.slice(4);
  const draft = await prisma.groupDraft.findUnique({ where: { id } });
  if (!draft) return 'черновик не найден';
  if (draft.status !== 'pending') return 'уже решено';
  const ref = draft.adminMsgId ? { chatId: String(chatId), messageId: draft.adminMsgId } : null;

  if (kind === CB.skip) {
    await prisma.groupDraft.updateMany({
      where: { id, status: 'pending' },
      data: { status: 'skipped', decidedAt: new Date() },
    });
    if (ref) await editAdminMarkup(ref, done('✖️ пропущено'));
    return 'пропустил';
  }

  if (kind === CB.edit) {
    const res = await tg('sendMessage', {
      chat_id: chatId,
      text: `Пришли свой вариант ответом на это сообщение, уйдёт ${draft.username ? '@' + draft.username : 'в группу'} от бота`,
      reply_markup: { force_reply: true, input_field_placeholder: 'твой ответ' },
      ...(draft.adminMsgId ? { reply_parameters: { message_id: draft.adminMsgId, allow_sending_without_reply: true } } : {}),
    });
    if (res.ok && res.result?.message_id) {
      await prisma.groupDraft.update({ where: { id }, data: { promptMsgId: res.result.message_id } });
    }
    return 'жду твой вариант';
  }

  if (kind === CB.send) {
    if (!draft.draft) return 'черновика нет';
    const claimed = await prisma.groupDraft.updateMany({
      where: { id, status: 'pending' },
      data: { status: 'sent', sentText: draft.draft, decidedAt: new Date() },
    });
    if (!claimed.count) return 'уже решено';
    const res = await postToGroup(draft, draft.draft);
    if (!res.ok) {
      await prisma.groupDraft.update({ where: { id }, data: { status: 'pending', sentText: null, decidedAt: null } });
      return 'не отправилось: ' + (res.description || 'ошибка телеграма');
    }
    if (ref) await editAdminMarkup(ref, done('✅ отправлено'));
    return 'отправил';
  }

  return 'не понял кнопку';
}

/**
 * Саша прислал свой вариант ответом на «пришли свой вариант». Возвращает true,
 * если сообщение было правкой черновика и обработано: дальше его разбирать не надо.
 */
export async function catchDraftEdit(msg: {
  chat: { id: number };
  text?: string;
  reply_to_message?: { message_id?: number };
}): Promise<boolean> {
  const promptId = msg.reply_to_message?.message_id;
  if (!promptId || !isDraftAdmin(msg.chat.id)) return false;

  const draft = await prisma.groupDraft.findFirst({
    where: { promptMsgId: promptId, adminChatId: String(msg.chat.id) },
  });
  if (!draft) return false;

  const text = (msg.text || '').trim();
  const reply = (t: string) => tg('sendMessage', { chat_id: msg.chat.id, text: t, reply_parameters: { message_id: promptId, allow_sending_without_reply: true } });

  if (draft.status !== 'pending') {
    await reply('этот вопрос уже закрыт, ничего не отправил');
    return true;
  }
  if (!text) {
    await reply('нужен текст, голосовые и картинки сюда пока не умею');
    return true;
  }

  const claimed = await prisma.groupDraft.updateMany({
    where: { id: draft.id, status: 'pending' },
    data: { status: 'edited', sentText: text, decidedAt: new Date() },
  });
  if (!claimed.count) return true;

  const res = await postToGroup(draft, text);
  if (!res.ok) {
    await prisma.groupDraft.update({ where: { id: draft.id }, data: { status: 'pending', sentText: null, decidedAt: null } });
    await reply('не отправилось: ' + (res.description || 'ошибка телеграма'));
    return true;
  }
  if (draft.adminMsgId) {
    await editAdminMarkup({ chatId: String(msg.chat.id), messageId: draft.adminMsgId }, done('✏️ отправлено с правкой'));
  }
  await reply('отправил ✅');
  return true;
}

/**
 * Саша ответил в группе сам, мимо черновика. Висящий черновик закрываем,
 * чтобы потом случайно не отправить второй ответ на тот же вопрос.
 */
export async function closeAnsweredDrafts(chatId: string, replyToId: number | null): Promise<void> {
  if (replyToId === null) return;
  const open = await prisma.groupDraft.findMany({
    where: { chatId, status: 'pending', messageIds: { has: replyToId } },
  });
  for (const d of open) {
    const claimed = await prisma.groupDraft.updateMany({
      where: { id: d.id, status: 'pending' },
      data: { status: 'answered', decidedAt: new Date() },
    });
    if (claimed.count && d.adminChatId && d.adminMsgId) {
      await editAdminMarkup({ chatId: d.adminChatId, messageId: d.adminMsgId }, done('💬 ответил сам'));
    }
  }
}
