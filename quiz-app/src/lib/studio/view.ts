// «Студия»: pure types and rules, no database. Imported by client components,
// so Prisma must never be imported here.

import { codeOf } from '@/lib/reels/plan';

export type Kind = 'reel' | 'carousel';
export type Stage = 'text' | 'edit' | 'ready' | 'published' | 'skip';
export type Actor = 'sasha' | 'danya';

export const KINDS: Kind[] = ['reel', 'carousel'];
export const STAGES: Stage[] = ['text', 'edit', 'ready', 'published', 'skip'];

export const KIND_LABEL: Record<Kind, string> = { reel: 'Рилс', carousel: 'Карусель' };
export const STAGE_LABEL: Record<Stage, string> = {
  text: 'Текст у Саши',
  edit: 'Монтаж/дизайн у Дани',
  ready: 'Готово',
  published: 'Вышло',
  skip: 'Отменено',
};
/** Who holds the item at this stage (the card shows «у …»). */
export const STAGE_OWNER: Record<Stage, string> = {
  text: 'у Саши',
  edit: 'у Дани',
  ready: 'у Дани',
  published: '',
  skip: '',
};
export const ACTOR_LABEL: Record<string, string> = { sasha: 'Саша', danya: 'Даня', api: 'Instagram' };

/** Snapshots younger than this are «ещё рано»: one upload is decided by its first audience batch. */
export const MIN_AGE_HOURS = 48;
/** Sasha works in UTC+5. */
export const TZ_OFFSET_HOURS = 5;

export interface Snapshot {
  takenAt: string; // ISO
  ageHours: number;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saved: number | null;
  skipRate: number | null; // %
  avgWatchMs: number | null;
  follows: number | null; // null for reels: not in the API
  profileVisits: number | null;
}

export interface ItemView {
  id: string;
  kind: Kind;
  title: string;
  variant: string | null;
  copyNo: number | null;
  stage: Stage;
  planDate: string | null; // YYYY-MM-DD
  briefUrl: string | null;
  briefText: string | null;
  hasBriefHtml: boolean;
  shortcode: string | null;
  permalink: string | null;
  publishedAt: string | null; // ISO
  author: string;
}

export interface CommentView {
  id: string;
  itemId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface RuleView {
  id: string;
  kind: Kind | 'all';
  text: string;
  evidence: string | null;
  order: number;
}

export interface Board {
  items: ItemView[];
  comments: CommentView[];
  rules: RuleView[];
  /** shortcode → snapshots, oldest first */
  stats: Record<string, Snapshot[]>;
}

/** Shortcode from instagram.com/reel/<code> or /p/<code>, or a bare code. */
export const shortcodeOf = codeOf;

/** Date (YYYY-MM-DD) of an instant in UTC+5. */
export function localDate(at: Date | string | number = Date.now()): string {
  return new Date(new Date(at).getTime() + TZ_OFFSET_HOURS * 3600_000).toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Monday of the week that contains `iso`. */
export function weekStart(iso: string): string {
  const dow = (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7; // Mon = 0
  return addDays(iso, -dow);
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** The snapshot we judge by: the first one at least 48h after publishing. */
export function pickSnapshot(snaps: Snapshot[] | undefined, minAge = MIN_AGE_HOURS): Snapshot | null {
  if (!snaps) return null;
  return [...snaps].sort((a, b) => a.takenAt.localeCompare(b.takenAt)).find((s) => s.ageHours >= minAge) ?? null;
}

export const METRICS = ['views', 'avgWatchMs', 'skipRate', 'comments', 'shares', 'saved', 'follows'] as const;
export type Metric = (typeof METRICS)[number];

export interface CopyResult {
  item: ItemView;
  snap: Snapshot | null;
}

export interface VariantGroup {
  key: string; // variant or `item:<id>` for single uploads without a group
  label: string;
  kind: Kind;
  copies: CopyResult[];
  published: number;
  measured: number; // copies with a ≥48h snapshot
  best: CopyResult | null; // by views
  avg: Partial<Record<Metric, number | null>>; // over measured copies; null = nobody has it
}

function mean(xs: (number | null)[]): number | null {
  const v = xs.filter((x): x is number => typeof x === 'number');
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/**
 * Groups items by variant (one edit = one group of copies). Only copies with a
 * ≥48h snapshot count towards best/avg; a group with none is «ещё рано».
 */
export function aggregateVariants(items: ItemView[], stats: Board['stats']): VariantGroup[] {
  const groups = new Map<string, VariantGroup>();
  for (const item of items) {
    if (item.stage === 'skip') continue;
    const key = item.variant || `item:${item.id}`;
    let g = groups.get(key);
    if (!g) {
      g = { key, label: item.variant || item.title, kind: item.kind, copies: [], published: 0, measured: 0, best: null, avg: {} };
      groups.set(key, g);
    }
    const snap = item.shortcode ? pickSnapshot(stats[item.shortcode]) : null;
    g.copies.push({ item, snap });
  }
  for (const g of groups.values()) {
    g.copies.sort((a, b) => (a.item.copyNo ?? 0) - (b.item.copyNo ?? 0));
    g.published = g.copies.filter((c) => c.item.shortcode).length;
    const measured = g.copies.filter((c) => c.snap);
    g.measured = measured.length;
    g.best = measured.reduce<CopyResult | null>((best, c) => (!best || (c.snap!.views ?? -1) > (best.snap!.views ?? -1) ? c : best), null);
    for (const m of METRICS) g.avg[m] = mean(measured.map((c) => c.snap![m]));
  }
  return [...groups.values()];
}

/** Display a metric; null means «we did not get it», never 0. */
export function fmt(metric: Metric, value: number | null | undefined, kind: Kind): string {
  if (metric === 'follows' && kind === 'reel') return 'нет в API';
  if (value == null) return '–';
  if (metric === 'avgWatchMs') return `${(value / 1000).toFixed(1).replace('.', ',')} с`;
  if (metric === 'skipRate') return `${Math.round(value)}%`;
  return Math.round(value).toLocaleString('ru-RU');
}
