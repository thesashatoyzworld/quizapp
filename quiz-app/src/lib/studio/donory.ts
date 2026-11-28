// «Доноры» in the Studio: the bank of donors (gsd: thesashatoyzworld/bank-donorov) ranks themes
// that took off for other authors on carousels, reels, YouTube and Shorts. The bank computes the
// weight; the Studio shows it and keeps people's edits (rename, «мимо», merge, «беру»), which go
// back to the bank in the sync answer. Pure: no database.

import type { Actor } from './view';

export interface DonorExhibit {
  id: string;
  source: string;
  author: string;
  hook: string;
  his: string;
  move: string;
  x: number | null;
  likes: number | null;
  date: string | null;
  url: string | null;
  /** Our own carousel on the same hook: code and its multiple of our median. */
  ourCode: string | null;
  ourX: number | null;
}

export interface DonorTheme {
  id: string;
  name: string;
  ves: number;
  authors: number;
  sources: string[];
  hits: number;
  flops: number;
  used: number;
  maxX: number | null;
  last: string | null;
  rank: number;
  exhibitIds: string[];
  /** Set by applyDonorOverrides. */
  hidden?: boolean;
  hideReason?: string | null;
  originalName?: string;
  mergedFrom?: string[];
}

export interface DonorOverride {
  themeId: string;
  hidden: boolean;
  reason: string | null;
  name: string | null;
  mergedInto: string | null;
}

export interface DonorTaken {
  themeId: string;
  exhibitId: string | null;
  zahod: string;
  karusel: string;
  actor: string;
  createdAt: string | null;
  itemId: string | null;
}

export const SOURCE_LABEL: Record<string, string> = {
  'instagram-carousel': 'Карусели', 'instagram-reel': 'Рилсы', 'youtube-long': 'YouTube', 'youtube-shorts': 'Shorts',
};
export const SOURCES = Object.keys(SOURCE_LABEL);

type Raw = Record<string, unknown>;
const str = (v: unknown): string | null => (v === null || v === undefined || v === '' ? null : String(v));
const num = (v: unknown): number | null => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

export function urlOf(e: Raw): string | null {
  if (e.url) return String(e.url);
  const id = String(e.id ?? '');
  if (String(e.source ?? '').startsWith('instagram')) {
    return `https://www.instagram.com/${e.source === 'instagram-reel' ? 'reel' : 'p'}/${id}/`;
  }
  return null;
}

export function mapExhibit(e: Raw): DonorExhibit {
  const used = (e.used && typeof e.used === 'object' ? e.used : {}) as Raw;
  return {
    id: String(e.id), source: String(e.source ?? ''), author: String(e.author ?? ''), hook: String(e.hook ?? ''),
    his: String(e.his ?? ''), move: String(e.move ?? ''), x: num(e.x), likes: num(e.likes ?? e.views), date: str(e.date),
    url: urlOf(e), ourCode: str(used.our_code), ourX: num(used.our_x),
  };
}

/** The bank's ranked rows (muzey_donorov.rank) and exhibits → rows. */
export function mapDonory(input: { temy?: unknown; eksponaty?: unknown }): { themes: DonorTheme[]; exhibits: DonorExhibit[] } {
  const rawEx = input.eksponaty;
  const list = (Array.isArray(rawEx) ? rawEx : rawEx && typeof rawEx === 'object' ? Object.values(rawEx) : []) as Raw[];
  const exhibits = list.filter((e) => e && typeof e === 'object' && e.id).map(mapExhibit);
  const known = new Set(exhibits.map((e) => e.id));
  const themes = ((Array.isArray(input.temy) ? input.temy : []) as Raw[])
    .filter((t) => t && t.id && t.name)
    .map((t, i) => ({
      id: String(t.id), name: String(t.name), ves: num(t.ves) ?? 0, authors: num(t.authors) ?? 0,
      sources: Array.isArray(t.sources) ? t.sources.map(String) : [], hits: num(t.hits) ?? 0, flops: num(t.flops) ?? 0,
      used: num(t.used) ?? 0, maxX: num(t.max_x), last: str(t.last), rank: i,
      exhibitIds: (Array.isArray(t.items) ? t.items.map(String) : []).filter((x) => known.has(x)),
    }))
    .filter((t) => t.exhibitIds.length);
  return { themes, exhibits };
}

/** Rename, «мимо» and merges on top of the bank's ranking. A merged theme hands its exhibits to the target. */
export function applyDonorOverrides(themes: DonorTheme[], overrides: DonorOverride[]): DonorTheme[] {
  const by = new Map(overrides.map((o) => [o.themeId, o]));
  const ids = new Set(themes.map((t) => t.id));
  /** Final theme a merge chain ends in; a chain that loops is ignored (the theme stays itself). */
  const target = (id: string) => {
    const seen = new Set([id]);
    let cur = id;
    for (;;) {
      const next = by.get(cur)?.mergedInto;
      if (!next || !ids.has(next)) return cur;
      if (seen.has(next)) return id;
      seen.add(next);
      cur = next;
    }
  };
  const out = new Map<string, DonorTheme>();
  for (const t of themes) {
    const o = by.get(t.id);
    out.set(t.id, {
      ...t, name: o?.name ?? t.name, hidden: !!o?.hidden, hideReason: o?.hidden ? o.reason : null,
      ...(o?.name ? { originalName: t.name } : {}),
    });
  }
  for (const t of themes) {
    const to = target(t.id);
    if (to === t.id || target(to) !== to) continue;
    const dst = out.get(to)!;
    out.set(to, {
      ...dst, exhibitIds: [...new Set([...dst.exhibitIds, ...t.exhibitIds])], sources: [...new Set([...dst.sources, ...t.sources])],
      authors: dst.authors + t.authors, ves: dst.ves + t.ves, hits: dst.hits + t.hits, flops: dst.flops + t.flops,
      used: dst.used + t.used, maxX: Math.max(dst.maxX ?? 0, t.maxX ?? 0) || null,
      mergedFrom: [...(dst.mergedFrom ?? []), t.id],
    });
    out.delete(t.id);
  }
  return [...out.values()].sort((a, b) => b.ves - a.ves || (b.maxX ?? 0) - (a.maxX ?? 0) || a.rank - b.rank);
}

export interface ThemeView {
  id: string;
  name: string;
  originalName?: string;
  ves: number;
  authors: number;
  platforms: Record<string, number>;
  ours: string;
  maxX: number | null;
  last: string | null;
  hidden: boolean;
  hideReason: string | null;
  mergedFrom: string[];
  taken: { zahod: string; karusel: string; actor: string; date: string | null }[];
  best: DonorExhibit | null;
  examples: DonorExhibit[];
}

/** One theme as the table row and the MCP answer: best example first, then by multiple. */
export function themeView(t: DonorTheme, byId: Map<string, DonorExhibit>, taken: DonorTaken[], examples = 3): ThemeView {
  const items = t.exhibitIds.map((i) => byId.get(i)).filter((e): e is DonorExhibit => !!e)
    .sort((a, b) => (b.x ?? 0) - (a.x ?? 0));
  const platforms: Record<string, number> = {};
  for (const e of items) platforms[e.source] = (platforms[e.source] ?? 0) + 1;
  return {
    id: t.id, name: t.name, ...(t.originalName ? { originalName: t.originalName } : {}), ves: t.ves, authors: t.authors,
    platforms, ours: t.used ? `${t.hits} из ${t.used}` : 'не брали', maxX: t.maxX, last: t.last, hidden: !!t.hidden,
    hideReason: t.hideReason ?? null, mergedFrom: t.mergedFrom ?? [],
    taken: taken.filter((x) => x.themeId === t.id).map((x) => ({ zahod: x.zahod, karusel: x.karusel, actor: x.actor, date: x.createdAt })),
    best: items[0] ?? null, examples: examples ? items.slice(0, examples) : items,
  };
}

export interface PickOpts { limit?: number; platform?: string; query?: string; withHidden?: boolean; examples?: number }

/** Themes by weight; platform = only themes that took off there; query = words in the name or hooks. */
export function pickThemes(themes: DonorTheme[], exhibits: DonorExhibit[], taken: DonorTaken[], opts: PickOpts = {}): ThemeView[] {
  const byId = new Map(exhibits.map((e) => [e.id, e]));
  const q = (opts.query ?? '').trim().toLowerCase();
  const out: ThemeView[] = [];
  for (const t of themes) {
    if (t.hidden && !opts.withHidden) continue;
    const v = themeView(t, byId, taken, opts.examples ?? 3);
    if (opts.platform && !v.platforms[opts.platform]) continue;
    if (q) {
      const all = t.exhibitIds.map((i) => byId.get(i)).filter(Boolean) as DonorExhibit[];
      const text = [t.name, ...all.map((e) => `${e.hook} ${e.his}`)].join(' ').toLowerCase();
      if (!q.split(/\s+/).every((w) => text.includes(w))) continue;
    }
    out.push(v);
    if (opts.limit && out.length >= opts.limit) break;
  }
  return out;
}

/** What goes back to the bank: its temy.json keeps names and merges, hidden themes stay out of the pages. */
export function overridesForBank(overrides: DonorOverride[]) {
  return overrides.map((o) => ({ id: o.themeId, hidden: o.hidden, reason: o.reason, name: o.name, merged_into: o.mergedInto }));
}

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const WHO: Record<string, string> = { sasha: 'Саша', danya: 'Даня' };
export const who = (a: Actor | string) => WHO[a] ?? a;

export function donorNotice(actor: Actor, action: string, theme: string, detail?: string | null): string {
  return `${who(actor)} в банке доноров: ${action} «${esc(theme)}»` + (detail ? `\n${esc(detail)}` : '');
}
