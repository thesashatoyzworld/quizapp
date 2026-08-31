// Кнопки под уведомлением о заявке с сайта.
//
// Смысл: увидел анкету в боте, написал человеку — тут же ткнул «написал», и это
// же состояние стоит в разделе «Заявки». Без захода в кабинет.

import { LEAD_STATUSES, STATUS_LABEL, isLeadStatus, type LeadStatus } from '@/content/lead-status';

/** Префикс callback_data. Короткий: у Телеграма на всё поле 64 байта. */
export const LEAD_CB = 'zv';

/** Значки статусов — в кнопке они читаются быстрее слова. */
const ICON: Record<LeadStatus, string> = {
  new: '↩️',
  written: '✍️',
  replied: '💬',
  call: '📞',
  client: '🤝',
  rejected: '✖️',
};

function cabinetBase(): string {
  return (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');
}

/**
 * Клавиатура заявки. Текущий статус помечен галочкой, поэтому в чате видно
 * состояние, даже когда сообщение уже уехало вверх на сотню строк.
 */
export function leadKeyboard(leadId: number, status: LeadStatus) {
  const btn = (s: LeadStatus) => ({
    text: `${status === s ? '✅' : ICON[s]} ${STATUS_LABEL[s]}`,
    callback_data: `${LEAD_CB}:${leadId}:${s}`,
  });

  return {
    inline_keyboard: [
      [btn('written'), btn('replied')],
      [btn('call'), btn('client'), btn('rejected')],
      [
        // «↩️ новая» — на случай промаха: статус ставится одним тапом, отменить
        // его иначе можно было бы только из кабинета.
        btn('new'),
        { text: '🗂 карточка', url: `${cabinetBase()}/admin/zayavki/${leadId}` },
      ],
    ],
  };
}

/** Разбирает нажатие. null — это не наша кнопка или мусор в данных. */
export function parseLeadCallback(data: string): { leadId: number; status: LeadStatus } | null {
  const parts = data.split(':');
  if (parts.length !== 3 || parts[0] !== LEAD_CB) return null;

  const leadId = Number(parts[1]);
  if (!Number.isInteger(leadId)) return null;
  if (!isLeadStatus(parts[2])) return null;

  return { leadId, status: parts[2] };
}

export { LEAD_STATUSES, STATUS_LABEL, type LeadStatus };
