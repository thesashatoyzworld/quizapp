/** Периоды трекера считаются по времени Саши (Алматы), как и остальная админка. */
export type Period = 'day' | 'week' | 'month';

export const PERIODS: Period[] = ['day', 'week', 'month'];
const TZ = 'Asia/Almaty';

function localParts(d: Date): { y: number; m: number; day: number } {
  const s = d.toLocaleDateString('en-CA', { timeZone: TZ }); // 2026-11-15
  const [y, m, day] = s.split('-').map(Number);
  return { y, m, day };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO-неделя: год и номер. */
function isoWeek(y: number, m: number, day: number): { year: number; week: number } {
  const t = new Date(Date.UTC(y, m - 1, day));
  const dow = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: t.getUTCFullYear(), week };
}

export function periodKey(period: Period | null | undefined, at: Date = new Date()): string {
  if (!period) return 'once';
  const { y, m, day } = localParts(at);
  if (period === 'day') return `${y}-${pad(m)}-${pad(day)}`;
  if (period === 'month') return `${y}-${pad(m)}`;
  const w = isoWeek(y, m, day);
  return `${w.year}-W${pad(w.week)}`;
}

/** Ключи последних n периодов, от старого к текущему. */
export function recentKeys(period: Period, n: number, now: Date = new Date()): string[] {
  const keys: string[] = [];
  const { y, m, day } = localParts(now);
  for (let i = n - 1; i >= 0; i--) {
    let d: Date;
    if (period === 'day') d = new Date(Date.UTC(y, m - 1, day - i, 12));
    else if (period === 'week') d = new Date(Date.UTC(y, m - 1, day - 7 * i, 12));
    else d = new Date(Date.UTC(y, m - 1 - i, 15, 12));
    keys.push(periodKey(period, d));
  }
  return keys;
}

/** Сколько осталось до конца текущего периода, коротко: «5 ч», «3 дн». */
export function timeLeft(period: Period, now: Date = new Date()): string {
  const { y, m, day } = localParts(now);
  // Алматы UTC+5 круглый год.
  const offsetMs = 5 * 3600 * 1000;
  let end: number;
  if (period === 'day') end = Date.UTC(y, m - 1, day + 1) - offsetMs;
  else if (period === 'month') end = Date.UTC(y, m, 1) - offsetMs;
  else {
    const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay() || 7;
    end = Date.UTC(y, m - 1, day + 8 - dow) - offsetMs;
  }
  const h = Math.max(0, Math.ceil((end - now.getTime()) / 3600000));
  return h < 24 ? `${h} ч` : `${Math.ceil(h / 24)} дн`;
}
