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

/** What Danya (studio role and his MCP key) may see; null = hidden from him. */
export function forDanya(e: LibraryEntry): LibraryEntry | null {
  if (e.visibility !== 'all') return null;
  const keep = (e.extra.publicHandles as string[] | undefined) ?? [];
  const r = (t: string | null) => (t == null ? t : redactText(t, keep));
  let body = e.body;
  const extra: Record<string, unknown> = { ...e.extra };
  if (Array.isArray(e.extra.quotes)) {
    extra.quotes = (e.extra.quotes as (LibQuote | string)[]).map((q) => {
      if (typeof q === 'string') return redactText(q, keep);
      if (q.who) body = body.split(`(${q.who})`).join(`(${anonymousWho(q.who)})`);
      return { who: anonymousWho(q.who), text: redactText(q.text, keep), source: null };
    });
  }
  return {
    ...e, title: r(e.title)!, body: redactText(body, keep), quote: r(e.quote), source: r(e.source),
    warnings: r(e.warnings), usedIn: r(e.usedIn), extra,
  };
}
