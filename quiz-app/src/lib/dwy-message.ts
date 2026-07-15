import { LEVELS } from '@/content/dwy';

export type DwyLeadInput = {
  name: string;
  contact: string;
  /** Нормализованный юзернейм без @, если контакт похож на телеграм. Иначе null. */
  username: string | null;
  who: string;
  hasProduct: string;
  product: string | null;
  level: number;
  tried: string;
  want: string;
  income: string;
  hours: string;
  source: string | null;
};

/**
 * Вытаскивает telegram-юзернейм из того, что человек вписал руками.
 * Принимает «@name», «name», «t.me/name», «https://t.me/name».
 * Возвращает null, если это не юзернейм (например, почта) — тогда контакт
 * показываем как есть, без ссылки.
 */
export function normalizeTelegramUsername(raw: string): string | null {
  let s = raw.trim();
  s = s.replace(/^https?:\/\//i, '').replace(/^t\.me\//i, '').replace(/^@/, '');
  s = s.split(/[/?\s]/)[0];
  return /^[a-zA-Z0-9_]{5,32}$/.test(s) ? s : null;
}

/** Экранирование под parse_mode: HTML — поля свободные, туда прилетит что угодно. */
function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Одно сообщение Саше со всей анкетой.
 * Контакт идёт сразу после имени — это главное действие по анкете.
 */
export function buildDwyMessage(lead: DwyLeadInput): string {
  const levelLabel = LEVELS[lead.level - 1] || `уровень ${lead.level}`;

  const lines: string[] = [
    '<b>Анкета на группу «делаем вместе»</b>',
    '',
    `<b>Кто:</b> ${escape(lead.name)}`,
  ];

  if (lead.username) {
    lines.push(`<b>Телеграм:</b> <a href="https://t.me/${lead.username}">@${escape(lead.username)}</a>`);
  } else {
    // Не похоже на юзернейм (почта, телефон, кривой ввод) — ссылку не строим.
    lines.push(`<b>Контакт:</b> ${escape(lead.contact)}`);
  }

  const productLine = lead.product
    ? `${escape(lead.hasProduct)} · ${escape(lead.product)}`
    : escape(lead.hasProduct);

  lines.push(
    '',
    `<b>Кем себя считает:</b> ${escape(lead.who)}`,
    `<b>Есть продукт:</b> ${productLine}`,
    `<b>Уровень:</b> ${lead.level} · ${escape(levelLabel)}`,
    `<b>Доход:</b> ${escape(lead.income)}`,
    `<b>Часов в неделю:</b> ${escape(lead.hours)}`,
    '',
    '<b>Что пробовал:</b>',
    escape(lead.tried),
    '',
    '<b>Что хочет через 3 месяца:</b>',
    escape(lead.want),
  );

  if (lead.source) lines.push('', `<b>Источник:</b> ${escape(lead.source)}`);

  return lines.join('\n');
}
