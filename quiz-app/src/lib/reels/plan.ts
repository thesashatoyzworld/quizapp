// Раздел «Ролики»: чистые правила без базы. Импортируется и из клиентских
// компонентов, поэтому никакой Prisma здесь быть не должно.
//
// Этапы версии: tz (в ТЗ, ждёт монтажа) → done (смонтирована) → up (выложена);
// skip — не выкладываем, на доске не видна. done с датой — это «Расписание».

export type Stage = 'tz' | 'done' | 'up' | 'skip';
export type Column = 'tz' | 'done' | 'plan' | 'up';

export const STAGES: Stage[] = ['tz', 'done', 'up', 'skip'];

export const COLUMNS: { key: Column; name: string }[] = [
  { key: 'tz', name: 'В ТЗ, ждут монтажа' },
  { key: 'done', name: 'Смонтировано' },
  { key: 'plan', name: 'Расписание' },
  { key: 'up', name: 'Выложено' },
];

/** Следующая версия того же ролика не раньше, чем через столько дней. */
export const SAME_REEL_GAP_DAYS = 2;

export interface ReelBriefView {
  id: string;
  order: number;
  title: string;
  label: string;
  summary: string;
  state: string; // ok | wait | go
  stateLabel: string;
  hasHtml: boolean;
}

export interface ReelVersionView {
  id: string;
  briefId: string;
  reel: string;
  title: string;
  version: string;
  order: number;
  stage: Stage;
  planDate: string | null; // YYYY-MM-DD
  code: string | null;
  uploadedAt: string | null; // YYYY-MM-DD
  plays: number | null;
  likes: number | null;
  comments: number | null;
  statsAt: string | null; // ISO
  note: string;
}

/** Shortcode из ссылки на рилс или сам shortcode. */
export function codeOf(input: string): string | null {
  const s = String(input ?? '').trim();
  const m = s.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{8,}$/.test(s) ? s : null;
}

export function columnOf(v: Pick<ReelVersionView, 'stage' | 'planDate'>): Column | null {
  if (v.stage === 'skip') return null;
  if (v.stage === 'done' && v.planDate) return 'plan';
  return v.stage;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Сегодня по Москве, YYYY-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }).format(now);
}

const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
export const weekday = (iso: string) => WD[new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay()];
export const ddmm = (iso: string | null) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}` : '');
export const fmt = (n: number | null | undefined) =>
  n == null ? '–' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

type PlanInput = Pick<ReelVersionView, 'id' | 'briefId' | 'reel' | 'order' | 'stage' | 'planDate' | 'uploadedAt'>;

/**
 * «Расставить по дням»: смонтированные версии без даты по очереди (order)
 * на ближайшие свободные дни, начиная с завтра. Один ролик в день на
 * клиента; следующая версия того же ролика не раньше SAME_REEL_GAP_DAYS
 * после предыдущей (выложенной или назначенной).
 */
export function autoPlan(versions: PlanInput[], today: string): { id: string; planDate: string }[] {
  const live = versions.filter((v) => v.stage !== 'skip');
  const taken = new Set(live.filter((v) => v.planDate && v.stage !== 'up').map((v) => v.planDate as string));
  const last: Record<string, string> = {};
  const key = (v: PlanInput) => `${v.briefId}|${v.reel}`;
  for (const v of live) {
    const day = v.uploadedAt || (v.stage === 'done' ? v.planDate : null);
    if (day && (!last[key(v)] || day > last[key(v)])) last[key(v)] = day;
  }
  const queue = live.filter((v) => v.stage === 'done' && !v.planDate).sort((a, b) => a.order - b.order);
  const out: { id: string; planDate: string }[] = [];
  for (const v of queue) {
    let day = addDays(today, 1);
    const prev = last[key(v)];
    if (prev) {
      const min = addDays(prev, SAME_REEL_GAP_DAYS);
      if (min > day) day = min;
    }
    while (taken.has(day)) day = addDays(day, 1);
    taken.add(day);
    last[key(v)] = day;
    out.push({ id: v.id, planDate: day });
  }
  return out;
}

/** Полоса сверху доски: сколько выложено, просмотры, лучший, следующая выкладка. */
export function summarize(versions: ReelVersionView[]) {
  const live = versions.filter((v) => v.stage !== 'skip');
  const up = live.filter((v) => v.stage === 'up');
  const checked = up.filter((v) => v.statsAt);
  const best = checked.reduce<ReelVersionView | null>((a, v) => ((v.plays ?? 0) > (a?.plays ?? 0) ? v : a), null);
  const next = live
    .filter((v) => columnOf(v) === 'plan')
    .sort((a, b) => ((a.planDate as string) < (b.planDate as string) ? -1 : 1))[0] ?? null;
  const statsAt = checked.reduce<string | null>((a, v) => (!a || (v.statsAt as string) > a ? v.statsAt : a), null);
  return {
    uploaded: up.length,
    total: live.length,
    // Просмотры только по проверенным: «не проверено» не равно нулю.
    plays: checked.length ? checked.reduce((s, v) => s + (v.plays ?? 0), 0) : null,
    unchecked: up.length - checked.length,
    statsAt,
    best: best && best.plays ? best : null,
    next,
  };
}
