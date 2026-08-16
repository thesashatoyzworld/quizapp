import { LEVELS, DWY_MODES, isDwyKind, type DwyKind } from '@/content/dwy';

export type DwyLeadInput = {
  name: string;
  contact: string;
  /** Нормализованный юзернейм без @, если контакт похож на телеграм. Иначе null. */
  username: string | null;
  /** Телефон, приведённый к одному виду. null, если не заполнили. */
  phone: string | null;
  /** Инстаграм как ввели. null, если не заполнили. */
  instagram: string | null;
  /** Ник без @ и без домена, если из ввода его удалось достать. Иначе null. */
  instagramHandle: string | null;
  /** Какой поток: менторство или лист ожидания тарифа. */
  kind: DwyKind;
  // Всё ниже обязательно только в менторстве — в листе ожидания может быть пусто.
  who: string | null;
  hasProduct: string | null;
  product: string | null;
  level: number | null;
  tried: string | null;
  want: string | null;
  income: string | null;
  hours: string | null;
  source: string | null;
};

/** Прошлая анкета того же человека: сколько дней назад и каким потоком. */
export type DwyPrior = {
  days: number;
  kind: string | null;
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

/**
 * Приводит телефон к одному виду, чтобы номера в базе не были зоопарком
 * из «8 (999) 111-22-33», «+7 999 1112233» и «79991112233».
 * Российские 11-значные (8… и 7…) становятся +7XXXXXXXXXX, остальное
 * сохраняет ведущий плюс и цифры. Что не похоже на номер — возвращаем как есть:
 * поле необязательное, ввод свободный, терять его из-за формата нельзя.
 */
export function normalizePhone(raw: string): string {
  const s = raw.trim();
  const digits = s.replace(/\D/g, '');
  if (digits.length < 10) return s;
  if (digits.length === 11 && (digits[0] === '8' || digits[0] === '7')) return `+7${digits.slice(1)}`;
  if (digits.length === 10) return `+7${digits}`;
  return `+${digits}`;
}

/**
 * Вытаскивает инстаграм-ник из того, что вписали руками.
 * Принимает «@nick», «nick», «instagram.com/nick», ссылку с ?igsh=…
 * Возвращает null, если ник не распознан — тогда показываем ввод как есть,
 * без ссылки.
 */
export function normalizeInstagram(raw: string): string | null {
  let s = raw.trim();
  s = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  s = s.replace(/^(?:m\.)?instagram\.com\//i, '').replace(/^instagr\.am\//i, '');
  s = s.replace(/^@/, '');
  s = s.split(/[/?\s]/)[0];
  return /^[a-zA-Z0-9._]{1,30}$/.test(s) ? s : null;
}

/** Экранирование под parse_mode: HTML — поля свободные, туда прилетит что угодно. */
function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** «сегодня» / «вчера» / «12 дней назад» — читается быстрее, чем дата. */
function daysAgo(days: number): string {
  if (days === 0) return 'сегодня';
  if (days === 1) return 'вчера';
  const last = days % 10;
  const two = days % 100;
  const word = two >= 11 && two <= 14 ? 'дней'
    : last === 1 ? 'день'
      : last >= 2 && last <= 4 ? 'дня' : 'дней';
  return `${days} ${word} назад`;
}

/**
 * Одно сообщение Саше со всей анкетой.
 * Контакт идёт сразу после имени — это главное действие по анкете.
 * Незаполненные поля не печатаем: в листе ожидания их может не быть вовсе,
 * и строки «Доход: —» только растят сообщение.
 */
export function buildDwyMessage(lead: DwyLeadInput, prior?: DwyPrior | null): string {
  const lines: string[] = [
    `<b>${escape(DWY_MODES[lead.kind].notice)}</b>`,
  ];

  // Человек уже присылал анкету — говорим об этом до всего остального.
  if (prior) {
    const priorLabel = isDwyKind(prior.kind) ? DWY_MODES[prior.kind].notice : 'анкета';
    lines.push(`↩️ <i>Уже присылал ${daysAgo(prior.days)} · ${escape(priorLabel)}</i>`);
  }

  lines.push('', `<b>Кто:</b> ${escape(lead.name)}`);

  if (lead.username) {
    lines.push(`<b>Телеграм:</b> <a href="https://t.me/${lead.username}">@${escape(lead.username)}</a>`);
  } else {
    // Не похоже на юзернейм (почта, телефон, кривой ввод) — ссылку не строим.
    lines.push(`<b>Контакт:</b> ${escape(lead.contact)}`);
  }

  // Телефон в моноширинном — из него удобно копировать одним тапом.
  if (lead.phone) lines.push(`<b>Телефон:</b> <code>${escape(lead.phone)}</code>`);

  if (lead.instagramHandle) {
    lines.push(
      `<b>Инстаграм:</b> <a href="https://instagram.com/${lead.instagramHandle}">@${escape(lead.instagramHandle)}</a>`,
    );
  } else if (lead.instagram) {
    lines.push(`<b>Инстаграм:</b> ${escape(lead.instagram)}`);
  }

  const facts: string[] = [];
  if (lead.who) facts.push(`<b>Кем себя считает:</b> ${escape(lead.who)}`);
  if (lead.hasProduct) {
    facts.push(`<b>Есть продукт:</b> ${lead.product
      ? `${escape(lead.hasProduct)} · ${escape(lead.product)}`
      : escape(lead.hasProduct)}`);
  }
  if (lead.level) {
    const levelLabel = LEVELS[lead.level - 1] || `уровень ${lead.level}`;
    facts.push(`<b>Уровень:</b> ${lead.level} · ${escape(levelLabel)}`);
  }
  if (lead.income) facts.push(`<b>Доход:</b> ${escape(lead.income)}`);
  if (lead.hours) facts.push(`<b>Часов в неделю:</b> ${escape(lead.hours)}`);
  if (facts.length) lines.push('', ...facts);

  if (lead.tried) lines.push('', '<b>Что пробовал:</b>', escape(lead.tried));
  if (lead.want) lines.push('', '<b>Что хочет через 3 месяца:</b>', escape(lead.want));

  if (lead.source) lines.push('', `<b>Источник:</b> ${escape(lead.source)}`);

  return lines.join('\n');
}
