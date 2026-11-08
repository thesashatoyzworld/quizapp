// «Библиотека»: pure view types, filters and Danya's redacted view. No Prisma:
// imported by the client component too.

export type LibBase = 'position' | 'story' | 'problem';
export const LIB_BASES: LibBase[] = ['position', 'story', 'problem'];
export const LIB_BASE_LABEL: Record<LibBase, string> = { position: 'Позиции', story: 'Истории и пруфы', problem: 'Проблемы' };

export const FLAG_LABEL: Record<string, string> = {
  core: 'ядро', top: 'топ', consent: 'нужно согласие', reference: 'справка', used: 'использовано',
  unused: 'не использовано', overlap: 'охват + деньги', voice: 'голос', comments: 'комментарии',
};

export interface LibQuote {
  who?: string | null;
  text: string;
  source?: string | null;
}

export interface LibraryEntry {
  id: string;
  base: LibBase;
  code: string;
  title: string;
  grade: 'A' | 'B' | 'C' | null;
  group: string;
  body: string;
  quote: string | null;
  source: string | null;
  warnings: string | null;
  flags: string[];
  usedIn: string | null;
  visibility: 'all' | 'sasha';
  extra: Record<string, unknown>;
  sort: number;
  updatedBy: string;
  updatedAt: string;
}

export interface LibFilter {
  base?: LibBase;
  q?: string;
  grade?: string; // A | B | C
  group?: string;
  core?: boolean;
  unused?: boolean;
  source?: 'comments' | 'voice';
  overlap?: boolean;
}

export function filterLibrary(entries: LibraryEntry[], f: LibFilter): LibraryEntry[] {
  const q = f.q?.trim().toLowerCase();
  return entries.filter((e) =>
    (!f.base || e.base === f.base) &&
    (!f.grade || e.grade === f.grade) &&
    (!f.group || e.group === f.group) &&
    (!f.core || e.flags.includes('core')) &&
    (!f.unused || e.flags.includes('unused')) &&
    (!f.source || e.flags.includes(f.source)) &&
    (!f.overlap || e.flags.includes('overlap')) &&
    (!q || [e.code, e.title, e.quote ?? '', e.body, e.group].some((t) => t.toLowerCase().includes(q))),
  );
}

// ─── Danya's view ───

/**
 * Personal identifiers out of a text: e-mails, phones, t.me links, Telegram
 * ids, @handles (except public donor accounts we name as references) and a
 * speaker's name in «(Имя 02.10, …)» attributions.
 */
export function redactText(text: string, keepHandles: string[] = []): string {
  const keep = new Set(keepHandles.map((h) => h.toLowerCase()));
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[почта]')
    .replace(/(?:https?:\/\/)?t\.me\/[\w/+-]+/gi, '[ссылка]')
    .replace(/(?<![\w@])@[A-Za-z0-9_.]{2,}/g, (h) => (keep.has(h.replace(/\.$/, '').toLowerCase()) ? h : '[ник]'))
    .replace(/(?<!\d)(?:\+7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}(?!\d)/g, '[телефон]')
    .replace(/(?<!\d)\d{9,12}(?!\d)/g, '[id]')
    .replace(/\((\p{Lu}\p{Ll}+)(?: \p{Lu}\p{Ll}+)? (\d{2}\.\d{2})/gu, '(клиент $2');
}

/** «Махаббат @makhabbat.pr (не купила)» → «не купила»: who spoke, without who they are. */
export function anonymousWho(who: string | null | undefined): string | null {
  if (!who) return null;
  const status = who.match(/\(([^)]+)\)\s*$/)?.[1];
  return status ? redactText(status) : 'участник';
}

/** Clients named in the consent rule: never by name to Danya. */
const CONSENT_PEOPLE = ['Лев', 'Стас', 'Волеслав', 'Сокольчик', 'Коробицын'];

/**
 * Names of real people who speak in the anketa / chat / call quotes (leads and
 * clients), plus the consent list. Sasha himself is not redacted.
 */
export function personNames(entries: LibraryEntry[]): string[] {
  const names = new Set(CONSENT_PEOPLE);
  for (const e of entries) {
    for (const q of (e.extra.quotes as (LibQuote | string)[] | undefined) ?? []) {
      const first = typeof q === 'object' && q.who ? q.who.split(/[\s@(,]/)[0] : '';
      if (/^\p{Lu}\p{Ll}{2,}$/u.test(first)) names.add(first);
    }
  }
  names.delete('Саша');
  return [...names];
}

/** «Женя» also catches «Жени», «Женей»; «Стас» catches «Стаса», «Стасом». */
function namesRegex(names: string[]): RegExp | null {
  if (!names.length) return null;
  const forms = names.map((n) => (/[аяь]$/.test(n) ? `${n.slice(0, -1)}(?:а|я|ы|и|е|у|ю|ой|ей|ь)` : `${n}(?:а|у|ом|е|ем)?`));
  return new RegExp(`(?<!\\p{L})(?:${forms.join('|')})(?!\\p{L})`, 'gu');
}

/** Donor accounts named in positions' «Спрос»: public creators, kept as references everywhere. */
export function publicHandles(entries: LibraryEntry[]): string[] {
  return [...new Set(entries.flatMap((e) => (e.extra.publicHandles as string[] | undefined) ?? []))];
}

export interface DanyaContext {
  names: string[];
  handles: string[];
}

/** Context for Danya's view, computed once over the whole library. */
export function danyaContext(entries: LibraryEntry[]): DanyaContext {
  return { names: personNames(entries), handles: publicHandles(entries) };
}

/** What Danya (studio role and his MCP key) may see; null = hidden from him. */
export function forDanya(e: LibraryEntry, ctx: DanyaContext = { names: [], handles: [] }): LibraryEntry | null {
  if (e.visibility !== 'all') return null;
  const { names } = ctx;
  const keep = [...ctx.handles, ...((e.extra.publicHandles as string[] | undefined) ?? [])];
  const nameRe = namesRegex(names);
  const redact = (t: string) => {
    const out = redactText(t, keep);
    return nameRe ? out.replace(nameRe, '[имя]') : out;
  };
  const r = (t: string | null) => (t == null ? t : redact(t));
  let body = e.body;
  const extra: Record<string, unknown> = { ...e.extra };
  if (Array.isArray(e.extra.quotes)) {
    extra.quotes = (e.extra.quotes as (LibQuote | string)[]).map((q) => {
      if (typeof q === 'string') return redact(q);
      if (q.who) body = body.split(`(${q.who})`).join(`(${anonymousWho(q.who)})`);
      return { who: anonymousWho(q.who), text: redact(q.text), source: null };
    });
  }
  // every other string in extra (facts, screen paths, notes, estimates) goes through the same filter
  const deep = (v: unknown): unknown =>
    typeof v === 'string' ? redact(v) : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v;
  for (const [k, v] of Object.entries(extra)) if (k !== 'quotes' && k !== 'publicHandles') extra[k] = deep(v);
  if (e.base === 'problem') {
    // «Сколько / Покупали: оценка ~8 (Бобров, Никита, …)»: the brackets list real people.
    const noNames = (t: string) => t.replace(/\s*\([^)\n]*\)/g, '');
    body = body.replace(/^\*\*(?:Сколько|Покупали):\*\*.*$/gm, noNames);
    for (const k of ['countEst', 'buyersEst']) if (typeof extra[k] === 'string') extra[k] = noNames(extra[k] as string);
  }
  return {
    ...e, title: r(e.title)!, body: redact(body), quote: r(e.quote), source: r(e.source),
    warnings: r(e.warnings), usedIn: r(e.usedIn), extra,
  };
}
