// Стадии работы с заявкой с сайта.
//
// Отдельным файлом, потому что их читают и таблица в браузере, и сервер.
// В src/lib/zayavki.ts они лежать не могут: тот тянет Prisma, и любой
// клиентский импорт оттуда утаскивал бы клиент базы в браузерный бандл —
// сборка на этом падала.

/** Порядок = порядок движения по воронке. */
export const LEAD_STATUSES = ['new', 'written', 'replied', 'call', 'client', 'rejected'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'новая',
  written: 'написал',
  replied: 'ответил',
  call: 'созвон',
  client: 'клиент',
  rejected: 'отказ',
};

/** Один словарь цветов на список и на карточку, чтобы не разъезжались. */
export const STATUS_COLOR: Record<LeadStatus, string> = {
  new: '#00f0ff',
  written: '#ffd166',
  replied: '#c792ea',
  call: '#7ee787',
  client: '#3fb950',
  rejected: '#8b949e',
};

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === 'string' && (LEAD_STATUSES as readonly string[]).includes(v);
}
