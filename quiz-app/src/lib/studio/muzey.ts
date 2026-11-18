// Museum of ideas in the Studio: points for carousel cards from Sasha's calls.
// Mirrors scripts/muzey/podbor.py in gsd-brand: hot ideas first, then meanings
// Sasha repeats (ves >= 2). A point is used many times: the unit that works is
// point + заход (hook), so uses are listed with the point, never hide it. Only
// «мимо» (hide_point) takes a point out. Pure: no database (crypto only for hot ids).

import { createHash } from 'crypto';
import type { Actor } from './view';

export interface MuzeyExhibit {
  id: string;
  tip: string | null;
  sut: string;
  doslovno: string;
  kto: string | null;
  taym: string | null;
  tsifra: string | null;
  pokazyvat: string | null;
  istochnik: string | null;
  data: string | null;
  smysl: string | null;
}

export interface MuzeyPoint {
  id: string;
  kind: 'hot' | 'smysl';
  title: string;
  why: string;
  ves: number;
  bol: number;
  sozvonov: number;
  posledniy: string | null;
  rank: number;
  exhibitIds: string[];
  /** Set by applyOverrides: marked «мимо», and the formula before someone retitled it. */
  hidden?: boolean;
  hideReason?: string | null;
  originalTitle?: string;
}

/** A Studio edit to a point (studio_muzey_overrides): survives the daily sync. */
export interface MuzeyOverride {
  pointId: string;
  hidden: boolean;
  reason: string | null;
  title: string | null;
}

export function applyOverrides(points: MuzeyPoint[], overrides: MuzeyOverride[]): MuzeyPoint[] {
  const by = new Map(overrides.map((o) => [o.pointId, o]));
  return points.map((p) => {
    const o = by.get(p.id);
    if (!o) return p;
    return {
      ...p, title: o.title ?? p.title, hidden: o.hidden, hideReason: o.hidden ? o.reason : null,
      ...(o.title ? { originalTitle: p.title } : {}),
    };
  });
}

/** One use of a point in a carousel (studio_muzey_taken). Rows from pokazano.json have no pointId. */
export interface MuzeyTaken {
  pointId: string | null;
  title: string;
  exhibitIds: string[];
  karusel: string;
  zahod?: string | null;
  createdAt?: string; // YYYY-MM-DD
  itemId?: string | null;
}

/** Numbers of the linked Studio card (snapshot >= 48h after publishing). */
export interface UseStats {
  views: number | null;
  saved: number | null;
  shares: number | null;
  follows: number | null;
  comments: number | null;
}

export interface PointUse {
  zahod: string | null;
  karusel: string;
  date: string | null;
  itemId: string | null;
  stats: UseStats | null;
}

/** One entry of pokazano.json (the repo's list of points used in carousels). */
export interface PokazanoEntry {
  mysl: string;
  eksponaty: string[];
  karusel: string;
  data: string;
  zahod?: string | null;
}

type Raw = Record<string, unknown>;
const str = (v: unknown): string | null => (v === null || v === undefined || v === '' ? null : String(v));
const num = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0);
const ids = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

/** Hot ideas have no id in goryachee.json (G1 is just the index): derive one from their exhibits. */
export function hotId(exhibitIds: string[]): string {
  return `G-${createHash('sha1').update([...exhibitIds].sort().join(',')).digest('hex').slice(0, 8)}`;
}

/** The extractor sometimes writes «tsifra» with Cyrillic letters inside: take any of them. */
function tsifraOf(e: Raw): string | null {
  if (e.tsifra !== undefined) return str(e.tsifra);
  const key = Object.keys(e).find((k) => /^ts.{4}$/i.test(k) && k !== 'tsifra');
  return key ? str(e[key]) : null;
}

export function mapExhibit(e: Raw): MuzeyExhibit {
  return {
    id: String(e.id), tip: str(e.tip), sut: str(e.sut) ?? '', doslovno: str(e.doslovno) ?? '', kto: str(e.kto),
    taym: str(e.taym), tsifra: tsifraOf(e), pokazyvat: str(e.pokazyvat), istochnik: str(e.istochnik), data: str(e.data),
    smysl: str(e.smysl),
  };
}

/** Files of clients/sasha/muzey → rows. Hot first (file order), then meanings with ves >= 2 (file order). */
export function mapMuzey(input: { goryachee?: unknown; smysly?: unknown; eksponaty?: unknown }): {
  points: MuzeyPoint[]; exhibits: MuzeyExhibit[];
} {
  const hot = (Array.isArray(input.goryachee) ? input.goryachee : []) as Raw[];
  const smysly = (Array.isArray(input.smysly) ? input.smysly : []) as Raw[];
  const points: MuzeyPoint[] = [];
  const seen = new Set<string>();
  hot.forEach((g, i) => {
    const exhibitIds = ids(g.eksponaty);
    const id = hotId(exhibitIds);
    if (!exhibitIds.length || seen.has(id)) return;
    seen.add(id);
    points.push({
      id, kind: 'hot', title: String(g.mysl ?? ''), exhibitIds, rank: i, ves: 0, bol: 0,
      sozvonov: num(g.sozvonov), posledniy: str(g.posledniy),
      why: `горячее: ${num(g.sozvonov)} созвонов за 2 недели, за 3 дня ${num(g.sozvonov_3dnya)}${g.novaya ? ', новая мысль' : ''}`,
    });
  });
  smysly.forEach((m, i) => {
    if (num(m.ves) < 2 || !m.id || seen.has(String(m.id))) return;
    seen.add(String(m.id));
    points.push({
      id: String(m.id), kind: 'smysl', title: String(m.formula ?? ''), exhibitIds: ids(m.eksponaty), rank: 1000 + i,
      ves: num(m.ves), bol: num(m.bol), sozvonov: 0, posledniy: str(m.posledniy),
      why: `повторил в ${num(m.ves)} источниках${num(m.bol) ? `, боль у ${num(m.bol)}` : ''}`,
    });
  });
  const exhibits = (Array.isArray(input.eksponaty) ? input.eksponaty : [])
    .filter((e): e is Raw => !!e && typeof e === 'object' && !!(e as Raw).id)
    .map(mapExhibit);
  return { points, exhibits };
}

/**
 * Only Sasha's own words are quoted. Danya gets exhibits marked «да» only:
 * «с согласия» is a client's data, «нет» is never shown. Sasha sees all but «нет».
 */
export function visibleTo(e: MuzeyExhibit, actor: Actor): boolean {
  if (!(e.kto ?? '').includes('Саша')) return false;
  return actor === 'danya' ? e.pokazyvat === 'да' : e.pokazyvat !== 'нет';
}

export function usedSet(taken: Pick<MuzeyTaken, 'exhibitIds'>[]): Set<string> {
  return new Set(taken.flatMap((t) => t.exhibitIds));
}

export function isUsed(exhibitIds: string[], used: Set<string>): boolean {
  return exhibitIds.length > 0 && exhibitIds.filter((i) => used.has(i)).length * 2 > exhibitIds.length;
}

export interface Quote {
  exhibit: string;
  quote: string;
  source: string | null;
  date: string | null;
  timecode: string | null;
  number: string | null;
}

/** Visible exhibits of a point as quotes: with a number first, then the latest. */
export function quotesFor(p: MuzeyPoint, byId: Map<string, MuzeyExhibit>, actor: Actor, maxLen = 0): Quote[] {
  const es = p.exhibitIds.map((i) => byId.get(i)).filter((e): e is MuzeyExhibit => !!e && visibleTo(e, actor));
  es.sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''));
  es.sort((a, b) => Number(a.tsifra === null) - Number(b.tsifra === null));
  return es.map((e) => {
    const q = e.doslovno.replace(/\s+/g, ' ').trim();
    return {
      exhibit: e.id, quote: maxLen && q.length > maxLen ? `${q.slice(0, maxLen)}…` : q,
      source: e.istochnik, date: e.data, timecode: e.taym, number: e.tsifra,
    };
  });
}

export interface PointView {
  id: string;
  hot: boolean;
  title: string;
  why: string;
  quotes: Quote[];
  used: number;
  uses: PointUse[];
}

/** Uses of this point: rows with its id, and repo rows (no id) that share most of its exhibits. */
export function usesOf(p: Pick<MuzeyPoint, 'id' | 'exhibitIds'>, taken: MuzeyTaken[], stats: Record<string, UseStats> = {}): PointUse[] {
  return taken
    .filter((t) => (t.pointId ? t.pointId === p.id : isUsed(p.exhibitIds, new Set(t.exhibitIds))))
    .map((t) => ({
      zahod: t.zahod ?? null, karusel: t.karusel, date: t.createdAt ?? null, itemId: t.itemId ?? null,
      stats: t.itemId ? stats[t.itemId] ?? null : null,
    }));
}

/** Points for cards, hot first; used points stay with their past заход → карусель pairs. */
export function pickPoints(
  points: MuzeyPoint[], exhibits: MuzeyExhibit[], taken: MuzeyTaken[], actor: Actor, limit = 10,
  opts: { onlyNew?: boolean; stats?: Record<string, UseStats> } = {},
): PointView[] {
  const byId = new Map(exhibits.map((e) => [e.id, e]));
  const out: PointView[] = [];
  const order = [...points].sort((a, b) => Number(b.kind === 'hot') - Number(a.kind === 'hot') || a.rank - b.rank);
  for (const p of order) {
    if (out.length >= limit) break;
    if (p.hidden) continue;
    const uses = usesOf(p, taken, opts.stats);
    if (opts.onlyNew && uses.length) continue;
    const quotes = quotesFor(p, byId, actor, 260).slice(0, 3);
    if (!quotes.length) continue;
    out.push({ id: p.id, hot: p.kind === 'hot', title: p.title, why: p.why, quotes, used: uses.length, uses });
  }
  return out;
}

/** Repo entries the DB does not know yet (same carousel + same thought = same entry). */
export const takenKey = (t: { karusel: string; title: string }) => `${t.karusel}\u0000${t.title}`;

export function parsePokazano(v: unknown): PokazanoEntry[] {
  return (Array.isArray(v) ? v : [])
    .filter((p): p is Raw => !!p && typeof p === 'object')
    .map((p) => ({
      mysl: String(p.mysl ?? ''), eksponaty: ids(p.eksponaty), karusel: String(p.karusel ?? ''), data: String(p.data ?? ''),
      zahod: str(p.zahod),
    }))
    .filter((p) => p.mysl && p.karusel);
}

const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function takeNotice(title: string, karusel: string, zahod?: string | null): string {
  return `Даня взял поинт из музея: ${escapeHtml(title)} → ${escapeHtml(karusel)}` + (zahod ? `\nЗаход: ${escapeHtml(zahod)}` : '');
}

export function hideNotice(title: string, hidden: boolean, reason: string | null): string {
  return `Даня ${hidden ? 'убрал поинт из музея как «мимо»' : 'вернул поинт в музей'}: ${escapeHtml(title)}`
    + (reason ? `\nПричина: ${escapeHtml(reason)}` : '');
}

export function titleNotice(before: string, after: string, note: string | null): string {
  return `Даня переписал поинт в музее:\nбыло: ${escapeHtml(before)}\nстало: ${escapeHtml(after)}` + (note ? `\nЗаметка: ${escapeHtml(note)}` : '');
}
