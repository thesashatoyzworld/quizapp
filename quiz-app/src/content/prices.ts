// Цены и дата их изменения. Одно место на весь проект.
//
// Решение Саши от 04.09.2026: все цены поднимаются на 20% с 13 сентября,
// и это единственный настоящий срок, который есть в продаже. До этого дня
// человеку называется старая цена, после — новая.
//
// Дата вшита в код намеренно, а не выставляется руками в день X. Рычаг
// работает ровно до тех пор, пока обещание держат: объявил и не поднял —
// второй раз никто не поверит. Здесь поднимется само, даже если в этот день
// все заняты.

/** Полночь 13 сентября по Москве. */
const CHANGE_AT = new Date('2026-09-13T00:00:00+03:00');

export type PriceSet = {
  /** Тариф 1 «делаешь сам», разово. */
  t1: number;
  /** Тариф 2 «сам + монетизация», месяц. */
  t2Month: number;
  /** Тариф 2 пакетом на три месяца. */
  t2Pack: number;
  /** Тариф 3 «делаем вместе», месяц. */
  t3Month: number;
  /** Групповой формат, три месяца одним платежом. */
  groupOnce: number;
  /** Групповой формат помесячно, платится трижды. */
  groupMonth: number;
  /** Индивидуальный формат один на один. */
  solo: number;
  dfvFrom: number;
  dfvTo: number;
};

const BEFORE: PriceSet = {
  t1: 5450,
  t2Month: 10000,
  t2Pack: 25000,
  t3Month: 50000,
  groupOnce: 130000,
  groupMonth: 50000,
  solo: 300000,
  dfvFrom: 400000,
  dfvTo: 500000,
};

const AFTER: PriceSet = {
  t1: 6550,
  t2Month: 12000,
  t2Pack: 30000,
  t3Month: 60000,
  groupOnce: 155000,
  groupMonth: 60000,
  solo: 360000,
  dfvFrom: 480000,
  dfvTo: 600000,
};

/** Цены на сейчас. Дата берётся в момент вызова, а не при загрузке модуля. */
export function prices(at: Date = new Date()): PriceSet {
  return at >= CHANGE_AT ? AFTER : BEFORE;
}

export const priceChanged = (at: Date = new Date()): boolean => at >= CHANGE_AT;

/** Цены до подорожания. Нужны сверке оплаты: ссылку могли взять вчера. */
export const oldPrices = (): PriceSet => BEFORE;
export const newPrices = (): PriceSet => AFTER;

/** Сколько дней осталось до новой цены. null, если она уже действует. */
export function daysLeft(at: Date = new Date()): number | null {
  if (at >= CHANGE_AT) return null;
  return Math.ceil((CHANGE_AT.getTime() - at.getTime()) / 86_400_000);
}

/**
 * Сколько после подорожания ещё принимаем старую сумму.
 *
 * Ссылку на оплату человек берёт сегодня, а платит завтра, и 20.08 такое уже
 * стоило клиенту доступа: открылась закэшированная страница со старой ценой,
 * гейт увидел недоплату и доступ не выдал. В день смены цены это случилось бы
 * со всеми сразу, поэтому двое суток старая цена остаётся законной.
 */
const GRACE_HOURS = 48;

/** Минимальная сумма, при которой доступ считается оплаченным. */
export function floorPrice(slug: string, at: Date = new Date()): number | null {
  const key =
    slug === 'uroven-t1' ? 't1'
    : slug === 'uroven-t2' ? 't2Month'
    : slug === 'uroven-t3' ? 't3Month'
    : null;
  if (!key) return null;

  const now = prices(at)[key];
  if (!priceChanged(at)) return now;
  const since = at.getTime() - CHANGE_AT.getTime();
  return since < GRACE_HOURS * 3_600_000 ? BEFORE[key] : now;
}

/** «13 сентября» для текста. */
export const CHANGE_LABEL = '13 сентября';

/** Разряды пробелом: 6 550, 155 000. */
export function rub(n: number): string {
  const parts: string[] = [];
  let rest = String(n);
  while (rest.length > 3) {
    parts.unshift(rest.slice(-3));
    rest = rest.slice(0, -3);
  }
  parts.unshift(rest);
  return parts.join(' ');
}
