// «Личный бренд на 360»: набор с оплатой сейчас, общий старт 30 ноября.
// Кто платит до старта, получает доступ сразу, но оплаченный срок
// (31 или 366 дней) считается от даты старта, чтобы дни до неё не сгорали.
// Сдвиг только для первой покупки: продления текущих клиентов не трогаем.

export const START_360 = new Date('2026-11-30T00:00:00+03:00');

/** Прайс-позиции, которые продаются только с /360: год картой/криптой и месяц криптой/PayPal. */
const DEALS_360 = new Set(['mwblsry39hvk', 'mwbmt1kb7nhq']);

export function startForDeal(dealId: string | null | undefined): Date | null {
  return dealId && DEALS_360.has(dealId) ? START_360 : null;
}

/**
 * Месяц картой с /360 идёт подпиской т2 по старой цене (ключ svoi10, 10 000).
 * Текущая цена т2 выше, поэтому 10 000 по т2 при первой покупке = /360.
 */
export function startForUroven(productSlug: string, amount: number): Date | null {
  return productSlug === 'uroven-t2' && amount === 10000 ? START_360 : null;
}
