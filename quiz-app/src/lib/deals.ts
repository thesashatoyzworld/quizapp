// ─────────────────────────────────────────────────────────────
// Прайс-ссылки: цена и срок вне каталога, одна ссылка на позицию.
//
// Зачем. Цена вне каталога («менторство лично 260 000», «группа 130 000»,
// «тариф 2 на три месяца за 25 000») выставлялась счётом руками из кабинета
// Продамуса. Такой счёт приходит с ПУСТЫМ order_num, вебхук не понимает, чей
// платёж, и молча его пропускает: доступ выдаётся руками, срок правится
// сторожем, в purchases и в выручке платежа нет. За июнь-август 2026 так
// прошло 24 оплаты на 700+ тысяч.
//
// Позиция прайса живёт как ссылка t.me/testtoyzbot?start=deal_<id>. Она
// МНОГОРАЗОВАЯ: одна ссылка на цену, Саша кидает её кому угодно и сколько
// угодно раз. Оплата привязывается к тому, кто пришёл по ссылке.
//
// ⚠️ Всегда РАЗОВЫЙ платёж на N дней: карточка подписки в Продамусе фиксирует
// сумму, произвольную под каждого выставить нельзя. Автопродления нет, следующий
// срок продаётся той же ссылкой ещё раз. Помесячный тариф 2 (10 000) и разовый
// тариф 1 (5 450) остаются в каталоге со своими ссылками.
// ─────────────────────────────────────────────────────────────

import { prisma } from './prisma';
import { CATALOG, CatalogProduct } from './catalog';
import { BOT } from './sales';

export type DealTier = 't1' | 't2' | 't3';

/** Продукт каталога, доступ к которому открывает позиция прайса. */
export function dealProduct(tier: string): CatalogProduct | null {
  const key = `uroven_${tier}` as keyof typeof CATALOG;
  return CATALOG[key] ?? null;
}

export function dealLink(id: string): string {
  return `${BOT}?start=deal_${id}`;
}

export async function getDeal(id: string) {
  if (!id || !/^[a-z0-9]{1,32}$/i.test(id)) return null;
  return prisma.deal.findUnique({ where: { id } });
}

/** Отметить, что по позиции прошла оплата. Только счётчик, ссылка живёт дальше. */
export async function countPayment(id: string) {
  return prisma.deal
    .update({ where: { id }, data: { paidCount: { increment: 1 }, lastPaidAt: new Date() } })
    .catch(() => null);
}

/**
 * order_id для Продамуса: deal_<id>_<tgId>_<хвост>.
 *
 * Телеграм в середине — чтобы вебхук знал, кому открывать доступ (0, если
 * человек пришёл не из бота). Хвост случайный: ссылка многоразовая, и без него
 * повторная покупка по той же ссылке тем же человеком была бы неотличима от
 * повторного вебхука по одной оплате.
 */
export function dealOrderId(id: string, telegramId?: number | null): string {
  const tail = Math.random().toString(36).slice(2, 8);
  return `deal_${id}_${telegramId || 0}_${tail}`;
}

/** Разобрать order_id обратно. Возвращает null, если это не прайс-ссылка. */
export function parseDealOrderId(orderId: string): { id: string; telegramId: number | null } | null {
  if (!orderId.startsWith('deal_')) return null;
  const parts = orderId.split('_'); // ['deal', id, tgId, хвост]
  const id = parts[1] || '';
  if (!id) return null;
  const tg = parts[2] || '';
  const telegramId = /^\d+$/.test(tg) && tg !== '0' ? parseInt(tg, 10) : null;
  return { id, telegramId };
}

/**
 * Этот платёж уже проводили? Продамус умеет прислать вебхук повторно, и без
 * проверки срок доступа уехал бы вперёд на второй такой же период.
 * Ключ — наш order_id: он свой у каждой оплаты, поэтому законная повторная
 * покупка по той же ссылке проходит, а дубль вебхука отсекается.
 */
export async function alreadyProcessed(orderId: string): Promise<boolean> {
  const seen = await prisma.purchase.findFirst({
    where: { prodamusOrderId: orderId },
    select: { id: true },
  });
  return Boolean(seen);
}

/** «25 000 ₽» — одинаково в боте, в уведомлении и в форме оплаты. */
export function formatPrice(rub: number): string {
  return `${rub.toLocaleString('ru-RU')} ₽`;
}

/** «90 дней» / «45 дней» — срок словами для сообщения человеку. */
export function formatDays(days: number): string {
  const last = days % 10;
  const teen = days % 100 >= 11 && days % 100 <= 14;
  const word = teen || last === 0 || last >= 5 ? 'дней' : last === 1 ? 'день' : 'дня';
  return `${days} ${word}`;
}
