import { LEVELS } from '@/content/dwy';

export type DwyLeadInput = {
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  who: string;
  hasProduct: string;
  product: string | null;
  level: number;
  tried: string;
  want: string;
  income: string;
  hours: string;
  contact: string | null;
  source: string | null;
};

/** Экранирование под parse_mode: HTML — поля свободные, туда прилетит что угодно. */
function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Одно сообщение Саше со всей анкетой.
 * Ссылка «написать» идёт сразу после шапки — это главное действие по анкете.
 */
export function buildDwyMessage(lead: DwyLeadInput): string {
  const name = lead.firstName ? escape(lead.firstName) : 'без имени';
  const levelLabel = LEVELS[lead.level - 1] || `уровень ${lead.level}`;

  const lines: string[] = [
    '<b>Анкета на группу «делаем вместе»</b>',
    '',
  ];

  if (lead.username) {
    lines.push(`<b>Кто:</b> ${name} · <a href="https://t.me/${lead.username}">@${escape(lead.username)}</a>`);
  } else {
    // Юзернейма нет — написать из Telegram нельзя, ведём по запасному контакту.
    lines.push(`<b>Кто:</b> ${name} · <i>юзернейма нет</i>`);
  }
  if (lead.contact) lines.push(`<b>Запасной контакт:</b> ${escape(lead.contact)}`);
  if (lead.telegramId) lines.push(`<b>Telegram id:</b> ${escape(lead.telegramId)}`);

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
