/** Карта запуска: типы и расчёты, общие для сервера и экрана. Без prisma. */

export type MapStage = { key: string; title: string; hint?: string };
/** Точка пути: что человек встречает на шаге. ready = уже работает без задачи. */
export type PathPoint = { key: string; title: string; ready?: boolean };
/** Шаг пути клиента глазами человека. */
export type PathStep = { key: string; title: string; does: string; points: PathPoint[] };
export type Milestone = { from: string; to?: string; label: string; kind: 'launch' | 'pause' | 'mark' };

export type MapView = {
  id: string;
  title: string;
  goalTaskId: string | null;
  deadline: string;
  stages: MapStage[];
  milestones: Milestone[];
  path: PathStep[];
  level: number;
  levelBase: number;
  hintsSeen: string[];
};

export const MAX_LEVEL = 4;
/** Сколько карточек закрыть на текущем уровне, чтобы открылся следующий. */
export const UNLOCK_AFTER = 3;

export const LEVELS: { n: number; name: string; hint: string }[] = [
  { n: 1, name: 'Сегодня', hint: 'Только цель и три дела этой недели. Остальное подождёт.' },
  {
    n: 2,
    name: 'Время',
    hint: 'Полоска до запуска: каждая неделя со своими делами. Нажми на неделю, чтобы её открыть.',
  },
  { n: 3, name: 'Путь клиента', hint: 'Всё, что нужно к запуску, по шагам человека: от «увидел» до результата.' },
  { n: 4, name: 'Всё', hint: 'Под линией то, что сделаем после запуска. Сейчас на это не смотрим.' },
];

const DAY = 86400000;

/** Сегодня по Алматы, «2026-11-17». */
export function todayLocal(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Almaty' });
}

function toUtc(d: string): number {
  const [y, m, day] = d.split('-').map(Number);
  return Date.UTC(y, m - 1, day);
}

function fromUtc(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

/** Понедельник недели, в которую попадает дата. */
export function mondayOf(d: string): string {
  const t = toUtc(d);
  const dow = new Date(t).getUTCDay() || 7;
  return fromUtc(t - (dow - 1) * DAY);
}

export function addDays(d: string, n: number): string {
  return fromUtc(toUtc(d) + n * DAY);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY);
}

/** Понедельники от недели `from` до недели дедлайна включительно. */
export function weeksUntil(from: string, deadline: string): string[] {
  const out: string[] = [];
  for (let w = mondayOf(from), last = mondayOf(deadline); w <= last && out.length < 60; w = addDays(w, 7)) out.push(w);
  return out;
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** «16 ноя» */
export function shortDate(d: string): string {
  const [, m, day] = d.split('-').map(Number);
  return `${day} ${MONTHS[m - 1]}`;
}

/** Веха, которая покрывает неделю (пауза на всю неделю, запуск внутри неё). */
export function milestoneOfWeek(ms: Milestone[], monday: string): Milestone | undefined {
  const sunday = addDays(monday, 6);
  return (
    ms.find((m) => m.kind === 'launch' && m.from >= monday && m.from <= sunday) ??
    // Пауза закрашивает неделю, если занимает в ней хотя бы 4 дня.
    ms.find((m) => {
      if (m.kind !== 'pause') return false;
      const from = m.from > monday ? m.from : monday;
      const to = (m.to ?? m.from) < sunday ? (m.to ?? m.from) : sunday;
      return from <= to && daysBetween(from, to) + 1 >= 4;
    }) ??
    ms.find((m) => m.from >= monday && m.from <= sunday)
  );
}

/** Счёт карты: живые записи в лист ожидания. */
export type Score = {
  /** Сколько человек в листе (по одному на контакт). */
  total: number;
  /** Записи по неделям: понедельник → сколько. */
  byWeek: Record<string, number>;
};

/** Цель листа: 90 записей ≈ 30 оплат, если платит каждый третий (Саша 18.11). */
export const LIST_TARGET = 90;
/** С этой недели лист открыт; от неё считается график. */
export const LIST_START = '2026-11-16';

/** Сколько должно быть в листе к дате, если идти ровно от старта к запуску. */
export function planBy(day: string, deadline: string): number {
  const all = daysBetween(LIST_START, deadline);
  const gone = Math.min(all, Math.max(0, daysBetween(LIST_START, day) + 1));
  return Math.round((LIST_TARGET * gone) / all);
}
