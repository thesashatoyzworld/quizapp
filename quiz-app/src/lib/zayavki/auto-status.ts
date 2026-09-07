// Статус заявки по фактам: кто кому написал и была ли оплата.
//
// Раздел «Заявки» показывал 132 «новых» при живой переписке с полусотней
// людей: статус ставился руками, а руками его никто не ставил. Здесь машина
// проставляет то, что и так лежит в базе, и не притворяется, будто знает
// больше. «Созвон» и «отказ» из переписки не читаются — это суждение, и они
// остаются за человеком.
//
// Правило одно: только вперёд и только поверх машинных ступеней. Решение
// человека — созвон, клиент, отказ — автомат не отменяет никогда.

import { prisma } from '@/lib/prisma';
import { isLeadStatus, type LeadStatus } from '@/content/lead-status';
import { decideStatus, type LeadFacts } from './decide-status';
import { leadKeyboard } from '@/lib/lead-keyboard';
import { editAdminMarkup, type NotifyRef } from '@/lib/telegram';

export { decideStatus, type LeadFacts } from './decide-status';

/** Чат в личке, где идёт переписка по этой заявке. */
async function chatOfLead(leadId: number): Promise<string | null> {
  const row = await prisma.tgBusinessMsg.findFirst({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
    select: { chatId: true },
  });
  return row?.chatId ?? null;
}

/**
 * Факты по одной заявке.
 *
 * Переписку считаем по чату целиком, а не по сообщениям с этим lead_id:
 * привязка появилась позже самих переписок, и у ранних реплик её нет.
 */
export async function factsForLead(
  leadId: number,
  known?: { chatId?: string | null; username?: string | null },
): Promise<LeadFacts> {
  const chatId = known?.chatId ?? (await chatOfLead(leadId));

  let weWrote = false;
  let theyReplied = false;

  if (chatId) {
    const [ourLast, theirLast] = await Promise.all([
      prisma.tgBusinessMsg.findFirst({
        where: { chatId, side: 'us' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.tgBusinessMsg.findFirst({
        where: { chatId, side: 'client' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);
    weWrote = !!ourLast;
    theyReplied = !!ourLast && !!theirLast && theirLast.createdAt > ourLast.createdAt;
  }

  return { weWrote, theyReplied, paid: await hasPurchase(leadId, known?.username) };
}

/**
 * Покупал ли этот человек.
 *
 * Ищем так же, как раздел «Заявки»: по телеграм-нику через users. Телефон и
 * инстаграм для покупок не годятся — оплата ключуется на пользователя бота.
 */
async function hasPurchase(leadId: number, username?: string | null): Promise<boolean> {
  let name = username;
  if (name === undefined) {
    const lead = await prisma.dwyLead.findUnique({ where: { id: leadId }, select: { username: true } });
    name = lead?.username ?? null;
  }
  if (!name) return false;

  const user = await prisma.user.findFirst({
    where: { username: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });
  if (!user) return false;

  const bought = await prisma.purchase.findFirst({ where: { userId: user.id }, select: { id: true } });
  return !!bought;
}

/**
 * Пересчитать статус заявки и записать, если он изменился.
 *
 * Возвращает новый статус или null, если всё осталось как было. Вызывается из
 * горячих мест (входящее сообщение, выдача доступа), поэтому молчит на любой
 * ошибке: статус заявки не стоит того, чтобы ронять приём сообщения.
 */
export async function refreshLeadStatus(
  leadId: number,
  known?: { chatId?: string | null },
): Promise<LeadStatus | null> {
  try {
    const lead = await prisma.dwyLead.findUnique({
      where: { id: leadId },
      select: { status: true, username: true },
    });
    if (!lead) return null;

    const current = isLeadStatus(lead.status) ? lead.status : 'new';
    const facts = await factsForLead(leadId, { chatId: known?.chatId, username: lead.username });
    const next = decideStatus(current, facts);
    if (!next) return null;

    const row = await prisma.dwyLead.update({
      where: { id: leadId },
      // updatedBy = auto: в списке такой статус помечен точкой, и видно, где
      // решение человека, а где машина.
      data: { status: next, updatedBy: 'auto', updatedAt: new Date() },
    });

    await syncLeadKeyboard(row.id, row.notifyRefs, next);
    return next;
  } catch (e) {
    console.error('[auto-status] не пересчитался статус заявки', leadId, e);
    return null;
  }
}

/**
 * Пересчитать заявки человека после оплаты.
 *
 * Ищем по нику пользователя бота: telegram_id в анкете с сайта нет ни у кого,
 * человек приходит из шапки профиля без Telegram-логина. Одна и та же анкета
 * могла прийти дважды — двигаем обе, это две разные заявки со своей судьбой.
 */
export async function refreshLeadsOfUser(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    if (!user?.username) return;

    const leads = await prisma.dwyLead.findMany({
      where: { username: { equals: user.username, mode: 'insensitive' } },
      select: { id: true },
    });
    for (const lead of leads) await refreshLeadStatus(lead.id);
  } catch (e) {
    console.error('[auto-status] не пересчитались заявки после оплаты', userId, e);
  }
}

/**
 * Куда бот отправил уведомление об этой заявке.
 *
 * Читаем терпимо: jsonb через драйвер приходит массивом, но заявки писались
 * разными версиями кода, и в поле может лежать строка с JSON или мусор. Кривая
 * запись не должна ронять сохранение статуса — она лишь оставляет кнопки в
 * боте неперерисованными.
 */
export function parseNotifyRefs(value: unknown): NotifyRef[] {
  let raw = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) {
    if (raw) console.error('[auto-status] notifyRefs не массив:', typeof raw);
    return [];
  }

  const refs: NotifyRef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { chatId, messageId } = item as { chatId?: unknown; messageId?: unknown };
    if (typeof chatId !== 'string' || typeof messageId !== 'number') continue;
    refs.push({ chatId, messageId });
  }
  return refs;
}

/**
 * Перерисовать кнопки под уведомлением в боте.
 *
 * Иначе в чате останется прежняя галочка и два места будут спорить друг с
 * другом. Возвращает, скольким сообщениям поправили разметку: 0 значит, что
 * заявка старая и кнопок под ней не было.
 */
export async function syncLeadKeyboard(
  leadId: number,
  notifyRefs: unknown,
  status: LeadStatus,
): Promise<number> {
  const refs = parseNotifyRefs(notifyRefs);
  if (!refs.length) return 0;

  const markup = leadKeyboard(leadId, status);
  await Promise.all(refs.map((ref) => editAdminMarkup(ref, markup)));
  return refs.length;
}
