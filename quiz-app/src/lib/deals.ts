// ─────────────────────────────────────────────────────────────
// Сделки: продажа вне каталога одной ссылкой в бота.
//
// Зачем. Цена и срок вне каталога («тариф 2 на три месяца за 25 000»,
// «тариф 3 групповой за 130 000») выставлялись счётом руками из кабинета
// Продамуса. Такой счёт приходит с ПУСТЫМ order_num, вебхук не понимает,
// чей платёж, и молча его пропускает: доступ выдаётся руками, срок правится
// сторожем, в purchases и в выручке платежа нет. За июнь-август 2026 так
// прошло 24 оплаты на 700+ тысяч.
//
// Сделка это строка в БД плюс ссылка t.me/testtoyzbot?start=deal_<id>.
// По ней человек попадает в бота, видит свою цену и платит. order_id несёт
// наш идентификатор, поэтому вебхук открывает доступ ровно на срок сделки.
//
// ⚠️ Сделка всегда РАЗОВЫЙ платёж на N дней: карточка подписки в Продамусе
// фиксирует сумму, произвольную под каждого выставить нельзя. Автопродления
// у сделки нет — следующий срок продаётся новой сделкой.
// ─────────────────────────────────────────────────────────────

import { prisma } from './prisma';
import { CATALOG, CatalogProduct } from './catalog';
import { BOT } from './sales';

export type DealTier = 't1' | 't2' | 't3';

/** Продукт каталога, доступ к которому открывает сделка. */
export function dealProduct(tier: string): CatalogProduct | null {
  const key = `uroven_${tier}` as keyof typeof CATALOG;
  return CATALOG[key] ?? null;
}

/**
 * Идентификатор сделки: 10 символов base36 без «_».
 * Подчёркивание разделяет части order_id (deal_<id>_<tgId>), поэтому внутри
 * идентификатора его быть не должно.
 */
function newDealId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  ).replace(/_/g, '');
}

export interface NewDeal {
  tier: DealTier;
  price: number;
  days: number;
  title: string;
  forUser?: string | null;
  note?: string | null;
}

/** Завести сделку и получить ссылку, которую можно отправить человеку. */
export async function createDeal(input: NewDeal) {
  const deal = await prisma.deal.create({
    data: {
      id: newDealId(),
      tier: input.tier,
      price: input.price,
      days: input.days,
      title: input.title,
      forUser: input.forUser ?? null,
      note: input.note ?? null,
    },
  });
  return { deal, link: dealLink(deal.id) };
}

export function dealLink(id: string): string {
  return `${BOT}?start=deal_${id}`;
}

export async function getDeal(id: string) {
  if (!id || !/^[a-z0-9]{1,32}$/i.test(id)) return null;
  return prisma.deal.findUnique({ where: { id } });
}

/**
 * Запомнить, кто открыл ссылку. Нужно, чтобы после оплаты было кому
 * открывать доступ, даже если человек платит с чужого устройства.
 * Первый открывший не затирается: ссылка именная, и подмена плательщика
 * на полпути — повод разобраться руками, а не молча переписать владельца.
 */
export async function attachTelegram(id: string, telegramId: number) {
  const deal = await getDeal(id);
  if (!deal || deal.telegramId) return deal;
  return prisma.deal.update({
    where: { id },
    data: { telegramId: BigInt(telegramId) },
  });
}

/** Отметить сделку оплаченной. Повторный вебхук ничего не меняет. */
export async function markPaid(id: string, orderId: string, paidAmount: number) {
  return prisma.deal.updateMany({
    where: { id, status: 'new' },
    data: { status: 'paid', orderId, paidAmount, paidAt: new Date() },
  });
}

/** order_id для Продамуса: deal_<id>_<tgId>. Без телеграма — deal_<id>. */
export function dealOrderId(id: string, telegramId?: number | null): string {
  return telegramId ? `deal_${id}_${telegramId}` : `deal_${id}`;
}

/** Разобрать order_id обратно. Возвращает null, если это не сделка. */
export function parseDealOrderId(orderId: string): { id: string; telegramId: number | null } | null {
  if (!orderId.startsWith('deal_')) return null;
  const parts = orderId.split('_'); // ['deal', id, tgId?]
  const id = parts[1] || '';
  if (!id) return null;
  const tail = parts[2] || '';
  const telegramId = /^\d+$/.test(tail) ? parseInt(tail, 10) : null;
  return { id, telegramId };
}

/** Срок доступа: от текущего окончания, если оно ещё не наступило. */
export function dealExpiresAt(days: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/** «25 000 ₽» — одинаково в боте, в уведомлении и в форме оплаты. */
export function formatPrice(rub: number): string {
  return `${rub.toLocaleString('ru-RU')} ₽`;
}
