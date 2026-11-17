// Budget until the 360 launch: 16.11.2026 – 15.01.2027.
// Source of truth: GSD-BRAND/clients/sasha/ops/byudzhet-do-zapuska-360.html.
// Limits are plain constants: they change rarely, a table would be overkill.
// No DB code here: this file is imported by client components.

export type Currency = 'KZT' | 'RUB';
export type Source = 'kaspi' | 'tbank' | 'manual';

export const PERIOD = { from: '2026-11-16', to: '2027-01-15' };

export const MONTHS = [
  { key: '2026-11', label: 'Ноябрь', sub: '16–30' },
  { key: '2026-12', label: 'Декабрь', sub: '' },
  { key: '2027-01', label: 'Январь', sub: '1–15' },
] as const;
export type MonthKey = (typeof MONTHS)[number]['key'];

export type Bucket = {
  id: string;
  label: string;
  hint: string;
  currency: Currency;
  /** Limit per month of the period. */
  limits: Record<MonthKey, number>;
  /** Planned items, for the hint under the bucket. */
  items?: string[];
};

export const BUCKETS: Bucket[] = [
  {
    id: 'life',
    label: 'Жизнь',
    hint: 'продукты, кафе, такси, покупки',
    currency: 'KZT',
    limits: { '2026-11': 550_000, '2026-12': 1_100_000, '2027-01': 550_000 },
  },
  {
    id: 'must',
    label: 'Обязательное',
    hint: 'квартира, налоги, коммуналка, собака',
    currency: 'KZT',
    limits: { '2026-11': 162_000, '2026-12': 335_065, '2027-01': 535_065 },
    items: [
      'аренда 200 000 в январе',
      'налоги за Дашу 162 000 каждый месяц',
      'налоги за тебя 123 065 в декабре и январе',
      'коммуналка и интернет 30 000 в декабре и январе',
      'собака 20 000 в декабре и январе',
    ],
  },
  {
    id: 'svc',
    label: 'Сервисы',
    hint: 'списания с карты Kaspi',
    currency: 'KZT',
    limits: { '2026-11': 126_841, '2026-12': 140_831, '2027-01': 13_990 },
    items: [
      'Claude 103 467 (24 числа)',
      'Zoom 9 100',
      'ElevenLabs 9 110',
      'Beeline 7 000',
      'Apple 4 990',
      'ChatGPT 3 390',
      'Spotify 2 284',
      'Telegram Premium, второй аккаунт 1 490',
    ],
  },
  {
    id: 'credit',
    label: 'Кредит',
    hint: 'закрыть разом в ноябре',
    currency: 'KZT',
    limits: { '2026-11': 135_336, '2026-12': 0, '2027-01': 0 },
    items: ['44 735', '30 209', '30 209', '30 183'],
  },
  {
    id: 'other',
    label: 'Вне бюджета',
    hint: 'всё, чего не было в плане',
    currency: 'KZT',
    limits: { '2026-11': 0, '2026-12': 0, '2027-01': 0 },
  },
  {
    id: 'danya',
    label: 'Даня',
    hint: '40 000 два раза в месяц',
    currency: 'RUB',
    limits: { '2026-11': 40_000, '2026-12': 80_000, '2027-01': 40_000 },
    items: ['20.11', '05.12', '20.12', '05.01'],
  },
  {
    id: 'rsvc',
    label: 'Сервисы в рублях',
    hint: 'карта Т-Банка',
    currency: 'RUB',
    limits: { '2026-11': 5_000, '2026-12': 10_000, '2027-01': 5_000 },
    items: ['Timeweb', 'ChatPlace', 'Kinescope', 'HikerAPI', 'reg.ru', 'Telegram'],
  },
  {
    id: 'tax',
    label: 'Налоги и бухгалтер',
    hint: 'на весь период, лимит стоит в ноябре',
    currency: 'RUB',
    limits: { '2026-11': 73_422, '2026-12': 0, '2027-01': 0 },
  },
  {
    id: 'rother',
    label: 'Вне бюджета',
    hint: 'всё, чего не было в плане',
    currency: 'RUB',
    limits: { '2026-11': 0, '2026-12': 0, '2027-01': 0 },
  },
];

export const BUCKET_IDS = BUCKETS.map((b) => b.id);

/** Weekly limits for «Жизнь», weeks start on Monday. */
export const LIFE_WEEKS: { start: string; limit: number }[] = [
  { start: '2026-11-16', limit: 275_000 },
  { start: '2026-11-23', limit: 275_000 },
  { start: '2026-11-30', limit: 250_000 },
  { start: '2026-12-07', limit: 250_000 },
  { start: '2026-12-14', limit: 250_000 },
  { start: '2026-12-21', limit: 250_000 },
  { start: '2026-12-28', limit: 100_000 },
  { start: '2027-01-04', limit: 275_000 },
  { start: '2027-01-11', limit: 275_000 },
];

/** Operations already counted in the starting balance (made before the plan on 16.11). */
export const BEFORE_PLAN: { date: string; amount: number; currency: Currency }[] = [
  { date: '2026-11-16', amount: 200_000, currency: 'KZT' }, // Дарья П., balance 70 904 was after it
];

export const INFO = {
  cushion: 265_115,
  withdrawals: [
    { label: '17.11, выведено по 5,12', amount: 320_000 },
    { label: 'до 01.12', amount: 172_000 },
    { label: 'до 20.12', amount: 215_000 },
  ],
};

/** Default bucket for a currency when nothing better is known. */
export function defaultBucket(currency: Currency): string {
  return currency === 'RUB' ? 'rother' : 'life';
}

export function bucketsFor(currency: Currency): Bucket[] {
  return BUCKETS.filter((b) => b.currency === currency);
}

/** Today in Almaty (UTC+5), YYYY-MM-DD. */
export function almatyToday(now = Date.now()): string {
  return new Date(now + 5 * 3600_000).toISOString().slice(0, 10);
}

/** Month of the period to open by default: current one, clamped to the period. */
export function defaultMonth(today = almatyToday()): MonthKey {
  const m = today.slice(0, 7);
  if (m < MONTHS[0].key) return MONTHS[0].key;
  return MONTHS.find((x) => x.key === m)?.key ?? MONTHS[MONTHS.length - 1].key;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Life week containing `today` (first or last week outside the period). */
export function currentLifeWeek(today = almatyToday()) {
  const found =
    LIFE_WEEKS.find((w) => today >= w.start && today < addDays(w.start, 7)) ??
    (today < LIFE_WEEKS[0].start ? LIFE_WEEKS[0] : LIFE_WEEKS[LIFE_WEEKS.length - 1]);
  return { ...found, end: addDays(found.start, 6) };
}

export function formatMoney(n: number, currency: Currency): string {
  const s = Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  return `${s} ${currency === 'RUB' ? '₽' : '₸'}`;
}

/**
 * One operation = date + amount + currency + merchant. The same line seen on
 * two overlapping screenshots gives the same fingerprint and is saved once.
 */
export function fingerprint(e: { spentAt: string; amount: number; currency: string; merchant: string }): string {
  const m = e.merchant.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  return `${e.spentAt}|${e.amount.toFixed(2)}|${e.currency}|${m}`;
}
