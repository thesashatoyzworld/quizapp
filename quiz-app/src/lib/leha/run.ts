/**
 * Лёха в работе: заводит черновик на первое сообщение после анкеты, собирает
 * текст, отдаёт Саше на кнопки (shadow) или шлёт сам (live).
 *
 * Правила «когда можно» живут в ./rules, здесь только база и телеграм.
 */
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { formatFollowers } from '@/content/dwy';
import { scheduleLehaDraft } from '@/lib/qstash';
import { editAdminMarkup } from '@/lib/telegram';
import { sendAs } from '@/lib/sales/tg';
import {
  LOOKBACK_MS,
  almatyDayStart,
  decideRun,
  decideTrigger,
  deliveryOf,
  lehaMode,
  plannedDueAt,
  type SkipReason,
} from './rules';
import { cleanReply, renderLead, systemWithExamples } from './prompt';
import { done, esc, isLehaAdmin, lehaChatId, tg } from './bot';
import { isDialogChat } from './dialog-rules';
import { catchDialogEdit, onDialogMessage } from './dialog';

export { isLehaAdmin, lehaChatId };

const MODEL = 'claude-sonnet-5';
const anthropic = new Anthropic();

export const CB = { send: 'lhs:', edit: 'lhe:', skip: 'lhx:' } as const;

/** Анкета пишется до первого сообщения, но часы у телеграма и базы разные. */
const CLOCK_SLACK_MS = 60 * 1000;

async function countSince(chatId: string, side: 'us' | 'client', since: Date): Promise<number> {
  return prisma.tgBusinessMsg.count({ where: { chatId, side, createdAt: { gte: since } } });
}

async function ourSince(chatId: string, leadCreatedAt: Date): Promise<number> {
  return countSince(chatId, 'us', new Date(leadCreatedAt.getTime() - LOOKBACK_MS));
}

/**
 * Хук из handleBusinessMessage: каждое сообщение рабочего аккаунта после записи.
 * Наше сообщение закрывает висящий черновик, сообщение человека может его завести.
 * Никогда не бросает: переписка важнее Лёхи.
 */
export async function onLehaMessage(m: {
  chatId: string;
  side: string;
  text: string;
  username: string | null;
  name: string | null;
  leadId: number | null;
}): Promise<SkipReason | 'queued' | 'closed' | 'dialog' | null> {
  try {
    // Чат, где Лёха ведёт весь разговор: первое сообщение тоже его забота.
    if (isDialogChat(m.chatId)) {
      if (m.side !== 'client') await closeAnswered(m.chatId);
      await onDialogMessage(m);
      return 'dialog';
    }
    if (m.side !== 'client') {
      await closeAnswered(m.chatId);
      return 'closed';
    }

    const mode = lehaMode();
    const lead = m.leadId ? await prisma.dwyLead.findUnique({ where: { id: m.leadId } }) : null;
    const now = new Date();
    const since = lead ? new Date(lead.createdAt.getTime() - CLOCK_SLACK_MS) : now;
    const dueDay = almatyDayStart(plannedDueAt(now));

    const verdict = decideTrigger({
      mode,
      lead: lead && { id: lead.id, username: lead.username, telegramId: lead.telegramId, createdAt: lead.createdAt },
      clientMsgsSinceLead: lead ? await countSince(m.chatId, 'client', since) : 0,
      ourMsgsSinceLead: lead ? await ourSince(m.chatId, lead.createdAt) : 0,
      hasDraft: lead ? (await prisma.lehaDraft.count({ where: { leadId: lead.id } })) > 0 : false,
      draftsOnDueDay: await prisma.lehaDraft.count({
        where: { dueAt: { gte: dueDay, lt: new Date(dueDay.getTime() + 24 * 60 * 60 * 1000) } },
      }),
      now,
    });
    if (!verdict.go || !lead) return verdict.go ? null : verdict.reason;

    // Уникальный lead_id гасит гонку двух апдейтов подряд.
    const draft = await prisma.lehaDraft
      .create({
        data: {
          leadId: lead.id,
          chatId: m.chatId,
          username: m.username,
          name: m.name,
          dueAt: verdict.dueAt,
          mode,
        },
      })
      .catch(() => null);
    if (!draft) return 'already_drafted';

    await scheduleLehaDraft(draft.id, (verdict.dueAt.getTime() - now.getTime()) / 1000);
    return 'queued';
  } catch (e) {
    console.error('[leha] хук упал', e);
    return null;
  }
}

/** Саша ответил сам: висящие черновики по этому чату больше не нужны. */
async function closeAnswered(chatId: string): Promise<void> {
  const open = await prisma.lehaDraft.findMany({ where: { chatId, status: { in: ['queued', 'pending'] } } });
  for (const d of open) {
    const claimed = await prisma.lehaDraft.updateMany({
      where: { id: d.id, status: d.status },
      data: { status: 'answered', decidedAt: new Date() },
    });
    if (claimed.count && d.adminChatId && d.adminMsgId) {
      await editAdminMarkup({ chatId: d.adminChatId, messageId: d.adminMsgId }, done('💬 ответил сам'));
    }
  }
}

/** Модель пишет черновик по анкете и тому, что человек успел сказать. */
async function compose(leadId: number, chatId: string, since: Date): Promise<{ text: string | null; note: string | null; said: string[] }> {
  const lead = await prisma.dwyLead.findUnique({ where: { id: leadId } });
  const rows = await prisma.tgBusinessMsg.findMany({
    where: { chatId, side: 'client', createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
    take: 10,
    select: { text: true },
  });
  const said = rows.map((r) => r.text);
  if (!lead) return { text: null, note: 'анкета пропала', said };

  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: systemWithExamples(),
      messages: [
        {
          role: 'user',
          content: renderLead(
            { ...lead, followers: lead.followers === null ? null : formatFollowers(lead.followers) },
            said,
          ),
        },
      ],
    });
    await recordAnthropicUsage(MODEL, res.usage, 'sales');
    const raw = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const { text, problem } = cleanReply(raw);
    return { text, note: problem, said };
  } catch (e) {
    console.error('[leha] модель упала', e);
    return { text: null, note: 'модель не ответила', said };
  }
}

/** Черновик Саше в личку бота с тремя кнопками. */
async function sendForReview(id: string, d: { leadId: number; username: string | null; name: string | null }, said: string[], text: string | null, note: string | null) {
  const chatId = lehaChatId();
  if (!chatId) return;
  const who = d.username ? `@${d.username}` : d.name || 'человек';
  const lines = [
    `🤖 <b>Лёха</b> · ${esc(who)}${d.name && d.username ? ` (${esc(d.name)})` : ''} · анкета №${d.leadId}`,
    '',
    `<i>${esc(said.join('\n').slice(0, 700))}</i>`,
    '',
    text ? `<b>Первое сообщение:</b>\n<code>${esc(text)}</code>` : '<b>Черновика нет</b>',
  ];
  if (note) lines.push('', `📝 ${esc(note)}`);

  const res = await tg('sendMessage', {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: {
      inline_keyboard: [
        [
          ...(text ? [{ text: '✅ Отправить', callback_data: CB.send + id }] : []),
          { text: text ? '✏️ Править' : '✏️ Написать', callback_data: CB.edit + id },
          { text: '✖️ Не писать', callback_data: CB.skip + id },
        ],
      ],
    },
  });
  if (res.ok && res.result?.message_id) {
    await prisma.lehaDraft.update({ where: { id }, data: { adminChatId: chatId, adminMsgId: res.result.message_id } });
  }
}

/**
 * Отправить человеку от имени рабочего аккаунта. sendAs сам кладёт сообщение
 * в tg_business_msg стороной us, поэтому кабинет и автостатусы видят ответ.
 * Статус забираем ДО отправки: двойное нажатие не отправит дважды.
 */
async function deliver(id: string, text: string, status: 'sent' | 'edited'): Promise<{ ok: boolean; error?: string }> {
  const d = await prisma.lehaDraft.findUnique({ where: { id } });
  if (!d) return { ok: false, error: 'черновик не найден' };
  const lead = await prisma.dwyLead.findUnique({ where: { id: d.leadId } });
  if (lead && (await ourSince(d.chatId, lead.createdAt)) > 0) {
    await prisma.lehaDraft.updateMany({ where: { id, status: { in: ['queued', 'pending'] } }, data: { status: 'answered', decidedAt: new Date() } });
    return { ok: false, error: 'ты уже ответил сам, не отправил' };
  }
  const claimed = await prisma.lehaDraft.updateMany({
    where: { id, status: { in: ['queued', 'pending'] } },
    data: { status, sentText: text, decidedAt: new Date() },
  });
  if (!claimed.count) return { ok: false, error: 'уже решено' };

  const res = await sendAs(d.chatId, text, 'leha');
  if (!res.ok) {
    await prisma.lehaDraft.update({ where: { id }, data: { status: d.status, sentText: null, decidedAt: null } });
  }
  return res;
}

/** Задача QStash: собрать черновик и отдать. retryInSec: перепланировать. */
export async function runLeha(draftId: string): Promise<{ done: true; status: string } | { done: false; retryInSec: number }> {
  const d = await prisma.lehaDraft.findUnique({ where: { id: draftId } });
  if (!d) return { done: true, status: 'missing' };
  const lead = await prisma.dwyLead.findUnique({ where: { id: d.leadId } });
  const mode = lehaMode();
  const now = new Date();

  const step = decideRun({
    mode,
    status: d.status,
    ourMsgsSinceLead: lead ? await ourSince(d.chatId, lead.createdAt) : 0,
    now,
  });
  if (step.kind === 'noop') return { done: true, status: d.status };
  if (step.kind === 'wait') {
    await prisma.lehaDraft.update({ where: { id: d.id }, data: { dueAt: step.until } });
    return { done: false, retryInSec: (step.until.getTime() - now.getTime()) / 1000 };
  }
  if (step.kind === 'close') {
    await prisma.lehaDraft.updateMany({ where: { id: d.id, status: 'queued' }, data: { status: step.status, decidedAt: now } });
    return { done: true, status: step.status };
  }

  const since = lead ? new Date(lead.createdAt.getTime() - CLOCK_SLACK_MS) : d.createdAt;
  const { text, note, said } = await compose(d.leadId, d.chatId, since);
  await prisma.lehaDraft.update({ where: { id: d.id }, data: { draft: text, note, mode } });

  // Сам шлёт только чистый текст: с пометкой (нет вопроса) решает Саша.
  if (text && !note && deliveryOf(mode, new Date()) === 'send') {
    const res = await deliver(d.id, text, 'sent');
    if (res.ok) return { done: true, status: 'sent' };
  }
  await prisma.lehaDraft.updateMany({ where: { id: d.id, status: 'queued' }, data: { status: 'pending' } });
  await sendForReview(d.id, d, said, text, note);
  return { done: true, status: 'pending' };
}

/** Кнопка под черновиком. */
export async function handleLehaButton(data: string, chatId: number): Promise<string> {
  const kind = data.slice(0, 4);
  const id = data.slice(4);
  const d = await prisma.lehaDraft.findUnique({ where: { id } });
  if (!d) return 'черновик не найден';
  if (d.status !== 'pending' && d.status !== 'queued') return 'уже решено';
  const ref = d.adminMsgId ? { chatId: String(chatId), messageId: d.adminMsgId } : null;

  if (kind === CB.skip) {
    await prisma.lehaDraft.updateMany({ where: { id, status: d.status }, data: { status: 'skipped', decidedAt: new Date() } });
    if (ref) await editAdminMarkup(ref, done('✖️ не пишем'));
    return 'не пишем';
  }

  if (kind === CB.edit) {
    const res = await tg('sendMessage', {
      chat_id: chatId,
      text: `Пришли свой вариант ответом на это сообщение, уйдёт ${d.username ? '@' + d.username : 'человеку'} с рабочего аккаунта`,
      reply_markup: { force_reply: true, input_field_placeholder: 'твой текст' },
      ...(d.adminMsgId ? { reply_parameters: { message_id: d.adminMsgId, allow_sending_without_reply: true } } : {}),
    });
    if (res.ok && res.result?.message_id) {
      await prisma.lehaDraft.update({ where: { id }, data: { promptMsgId: res.result.message_id } });
    }
    return 'жду твой вариант';
  }

  if (kind === CB.send) {
    if (!d.draft) return 'черновика нет';
    const res = await deliver(id, d.draft, 'sent');
    if (!res.ok) return res.error || 'не отправилось';
    if (ref) await editAdminMarkup(ref, done('✅ отправлено'));
    return 'отправил';
  }

  return 'не понял кнопку';
}

/** Саша прислал свой текст ответом на «пришли свой вариант». true: это была правка. */
export async function catchLehaEdit(msg: {
  chat: { id: number };
  text?: string;
  reply_to_message?: { message_id?: number };
}): Promise<boolean> {
  const promptId = msg.reply_to_message?.message_id;
  if (!promptId || !isLehaAdmin(msg.chat.id)) return false;
  const d = await prisma.lehaDraft.findFirst({ where: { promptMsgId: promptId } });
  if (!d) return catchDialogEdit(msg);

  const reply = (t: string) =>
    tg('sendMessage', { chat_id: msg.chat.id, text: t, reply_parameters: { message_id: promptId, allow_sending_without_reply: true } });
  const text = (msg.text || '').trim();
  if (!text) {
    await reply('нужен текст, голосовые сюда пока не умею');
    return true;
  }
  const res = await deliver(d.id, text, 'edited');
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
