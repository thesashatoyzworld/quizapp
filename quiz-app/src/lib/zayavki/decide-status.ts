// Правило: каким должен стать статус заявки при таких фактах.
//
// Отдельным файлом, без единого импорта кроме типов: сюда ходит и сервер, и
// проверка из scripts. Стоило положить его рядом с запросами к базе — и
// прогнать правило без живой базы стало нельзя.

import { LEAD_STATUSES, type LeadStatus } from '@/content/lead-status';

/** Что видно про заявку из базы. Больше автомат знать не может. */
export type LeadFacts = {
  /** Мы писали этому человеку в личку. */
  weWrote: boolean;
  /** Он написал после нашего последнего сообщения. */
  theyReplied: boolean;
  /** У него есть покупка. */
  paid: boolean;
};

/** Ступени, которые машина ставит сама. Остальные три — только руками. */
const AUTO_STATUSES: readonly LeadStatus[] = ['new', 'written', 'replied', 'client'];

/** Насколько далеко ушла заявка. Порядок статусов = порядок движения. */
const rank = (s: LeadStatus) => LEAD_STATUSES.indexOf(s);

/**
 * Каким должен стать статус. null — оставить как есть.
 *
 * Возвращаем null и когда двигать некуда, и когда нельзя: так вызывающему
 * не нужно знать правила, достаточно «дали статус — пиши, не дали — не трогай».
 */
export function decideStatus(current: LeadStatus, facts: LeadFacts): LeadStatus | null {
  // Заявку, которую вёл человек, машина не перебивает. Даже оплатой: если
  // Саша поставил «отказ», а деньги пришли — это разговор, а не автозамена.
  if (!AUTO_STATUSES.includes(current)) return null;

  const next: LeadStatus = facts.paid
    ? 'client'
    : facts.theyReplied
      ? 'replied'
      : facts.weWrote
        ? 'written'
        : 'new';

  // Назад не ходим: после его ответа мы могли написать последними, и это не
  // повод откатывать «ответил» обратно в «написал».
  return rank(next) > rank(current) ? next : null;
}
