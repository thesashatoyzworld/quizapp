// ─────────────────────────────────────────────────────────────
// Режим продаж «Нового уровня контента» — по тарифу, не по странице.
//
//   'sale'     — тариф покупается как обычно
//   'waitlist' — покупка закрыта, человека ведём в лист ожидания
//
// Первый поток набран, тарифы 2 и 3 закрыты до сентября. Тариф 1 не требует
// Сашиного времени, поэтому продаётся дальше.
//
// ⚠️ Тот же файл есть в репозитории лендинга (TheSashaToyz/src/app/uroven/sales.ts)
// и инлайном в public/uroven/checkout.html: страница оффера живёт в двух местах,
// и рассинхрон между ними уже ронял цену.
// Переключать только скриптом: GSD-BRAND/scripts/sales-mode.mjs <тариф> open|close
// ─────────────────────────────────────────────────────────────

export type Tier = 't1' | 't2' | 't3';
export type SaleMode = 'sale' | 'waitlist';

export const SALES: Record<Tier, SaleMode> = {
  t1: 'sale',
  t2: 'waitlist',
  t3: 'waitlist',
};

export const BOT = 'https://t.me/testtoyzbot';

export const isOnSale = (tier: string): boolean => SALES[tier as Tier] === 'sale';

/** Ссылка записи. Тариф едет в метке, чтобы знать, кого звать на открытии. */
export const waitlistLink = (tier: string): string => `${BOT}?start=waitlist_${tier}`;

/** Что бот отвечает на запись. */
export const WAITLIST_REPLY =
  'Записал. Когда открою набор, ты узнаешь первым — напишу сюда до того, как это увидит канал.';

/** Что бот отвечает, если человек пришёл по старой ссылке на закрытый тариф. */
export const WAITLIST_OFFER: Record<Tier, string> = {
  t1: '',
  t2: 'Тариф 2 сейчас закрыт, набор в сентябре — 20 мест.',
  t3: 'Тариф 3 сейчас закрыт — на нём будет 5 мест.',
};
