// ─────────────────────────────────────────────────────────────
// График платежей по прайс-ссылке: даты, напоминания человеку, отметка оплаты.
//
// Зачем. Прайс-ссылка — всегда разовый платёж на N дней, автосписания нет
// (см. deals.ts). Когда договорились «50 000 × 3 помесячно», второй и третий
// платёж держались только в голове: человеку никто не напоминал, а Саша узнавал
// о них из сводки по концам доступов, когда доступ уже закрывался.
//
// Строка графика = один ожидаемый платёж. Крон пишет человеку в бота за
// REMIND_BEFORE_DAYS дня и в сам день, с кнопкой оплаты по его прайс-ссылке.
// Вебхук Продамуса закрывает ближайшую ждущую строку сам, когда приходит оплата
// по этой ссылке с этого телеграма. Оплатил раньше — напоминаний не будет.
// ─────────────────────────────────────────────────────────────

import { prisma } from './prisma';
import { formatPrice } from './deals';
import { sendBotMessage, notifyAdmin } from './telegram';

/** За сколько дней до даты приходит первое напоминание. */
export const REMIND_BEFORE_DAYS = 3;
/** Сколько дней после даты просрочка ещё висит в сводке Саше. */
const OVERDUE_WINDOW_DAYS = 14;

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 86400_000;

const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quizapp-ivory-delta.vercel.app';

/** Номер календарного дня по Москве: разница двух таких чисел = разница в днях. */
function mskDay(date: Date): number {
  return Math.floor((date.getTime() + MSK_OFFSET_MS) / DAY_MS);
}

/** «07.10» по Москве. */
export function mskDate(date: Date): string {
  const d = new Date(date.getTime() + MSK_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}`;
}

/** Кнопка ведёт сразу в форму Продамуса с телеграмом внутри order_id. */
function payUrl(dealId: string, telegramId: bigint): string {
  return `${WEBAPP_URL}/pay/deal/${dealId}?u=${telegramId}`;
}

/**
 * Оплата по прайс-ссылке пришла — закрыть ближайший ждущий платёж этого
 * человека по этой ссылке. Графика нет — ничего не делаем.
 */
export async function markDuePaid(telegramId: number, dealId: string, orderId: string) {
  const due = await prisma.paymentDue.findFirst({
    where: { telegramId: BigInt(telegramId), dealId, status: 'pending' },
    orderBy: { dueAt: 'asc' },
  });
  if (!due) return null;
  return prisma.paymentDue.update({
    where: { id: due.id },
    data: { status: 'paid', paidAt: new Date(), orderId },
  });
}

type Due = Awaited<ReturnType<typeof prisma.paymentDue.findMany>>[number];

function what(d: Due): string {
  return [d.label, formatPrice(d.amount)].filter(Boolean).join(', ');
}

function beforeText(d: Due): string {
  return `напоминаю про оплату ⚡

${mskDate(d.dueAt)} следующий платёж: ${what(d)}.

можно оплатить заранее по кнопке ниже. доступ продлится от текущей даты окончания, дни не сгорят.`;
}

function dueText(d: Due): string {
  return `сегодня день оплаты ⚡

${what(d)}, кнопка ниже.

если по срокам что-то поменялось, напиши мне.`;
}

export interface RemindersResult {
  before: string[];
  due: string[];
  overdue: string[];
  failed: string[];
  adminText: string | null;
}

/**
 * Один проход крона. dryRun — только посчитать, кому и что ушло бы:
 * никому не пишет и отметок в базе не ставит.
 */
export async function runPaymentReminders(now = new Date(), dryRun = false): Promise<RemindersResult> {
  const today = mskDay(now);
  const rows = await prisma.paymentDue.findMany({
    where: {
      status: 'pending',
      dueAt: {
        gte: new Date(now.getTime() - (OVERDUE_WINDOW_DAYS + 1) * DAY_MS),
        lte: new Date(now.getTime() + (REMIND_BEFORE_DAYS + 1) * DAY_MS),
      },
    },
    orderBy: { dueAt: 'asc' },
  });

  const res: RemindersResult = { before: [], due: [], overdue: [], failed: [], adminText: null };

  for (const d of rows) {
    const left = mskDay(d.dueAt) - today;
    const who = d.who || String(d.telegramId);
    const line = `• ${who}: ${what(d)}, ${mskDate(d.dueAt)}`;

    let kind: 'before' | 'due' | null = null;
    if (left >= 1 && left <= REMIND_BEFORE_DAYS && !d.remindedBeforeAt) kind = 'before';
    // В день оплаты. Если крон в тот день не отработал, догоняем на следующий.
    else if (left <= 0 && left >= -1 && !d.remindedDueAt) kind = 'due';
    else if (left < 0) res.overdue.push(`${line} (просрочка ${-left} дн.)`);

    // Без телеграма или без прайс-ссылки человеку писать некуда или нечем:
    // строка живёт только в разделе «Деньги на столе».
    if (!kind || !d.telegramId || !d.dealId) continue;
    const button = { inline_keyboard: [[{ text: `💳 Оплатить ${formatPrice(d.amount)}`, url: payUrl(d.dealId, d.telegramId) }]] };
    if (dryRun) {
      res[kind].push(line);
      continue;
    }

    const sent = await sendBotMessage(
      Number(d.telegramId),
      kind === 'before' ? beforeText(d) : dueText(d),
      button,
      null,
    );
    if (!sent.ok) {
      res.failed.push(`${line}${sent.blocked ? ' (бот заблокирован)' : ''}`);
      continue;
    }
    await prisma.paymentDue.update({
      where: { id: d.id },
      data: kind === 'before' ? { remindedBeforeAt: now } : { remindedDueAt: now },
    });
    res[kind].push(line);
  }

  const parts: string[] = [];
  if (res.before.length) parts.push('', `Напомнил за ${REMIND_BEFORE_DAYS} дня:`, ...res.before);
  if (res.due.length) parts.push('', 'Напомнил, что сегодня день оплаты:', ...res.due);
  if (res.failed.length) parts.push('', 'Не дошло, напиши сам:', ...res.failed);
  if (res.overdue.length) parts.push('', 'Не оплачено после даты:', ...res.overdue);

  // Тишина, когда ничего не происходит.
  if (parts.length) {
    res.adminText = ['💳 Платежи по графику', ...parts].join('\n');
    if (!dryRun) await notifyAdmin(res.adminText, { alsoWork: true, parseMode: null });
  }

  return res;
}
