// «Библиотека»: parsers for the three content bases built for Sasha. Pure, no
// database: the import script (scripts/studio-import-library.mjs) and tests use them.
//
//   position: BAZA-POZICIY.md (build_baza.py output), 114 graded positions + reference sections
//   story:    «База историй и пруфов.md» (Vault), numbered entries + warning sections
//   problem:  problems.json (comments), problems-voice.json (anketas/chats/calls), mapping.json

import { createHash } from 'crypto';

export type Base = 'position' | 'story' | 'problem';

export interface Quote {
  who?: string | null; // speaker; for leads/clients this is personal and hidden from Danya
  text: string;
  source?: string | null;
}

export interface ParsedEntry {
  base: Base;
  code: string; // stable original code: Z4, 1а, BV.0, K1.0
  title: string;
  grade: 'A' | 'B' | 'C' | null;
  group: string; // category / theme / portrait
  body: string; // markdown
  quote: string | null; // first quote, one line for the list
  source: string | null;
  warnings: string | null; // shown in warning style
  flags: string[]; // core, top, unused, used, overlap, consent, reference, voice, comments
  usedIn: string | null;
  visibility: 'all' | 'sasha';
  sort: number;
  extra: Record<string, unknown>;
}

/** Hash of the imported content: lets a re-import tell «source changed» from «Sasha edited». */
export function entryHash(e: ParsedEntry): string {
  const { base, code, title, grade, group, body, quote, source, warnings, flags, usedIn, visibility, extra } = e;
  return createHash('sha256')
    .update(JSON.stringify([base, code, title, grade, group, body, quote, source, warnings, flags, usedIn, visibility, extra]))
    .digest('hex')
    .slice(0, 16);
}

/**
 * Client numbers go out only with the client's consent (rule from both bases):
 * entries that name these clients or say «согласовать» stay Sasha-only until he opens them.
 */
// JS \b is ASCII-only, so Cyrillic word edges are spelled out with \p{L}.
// Names are matched case-sensitively («лев» the word is not Лев the client).
const CONSENT_NAMES = /(?<!\p{L})(Лев|Льв(?:а|у|ом|е)|Стас(?:а|у|ом|е)?|Волеслав\p{L}*|Сокольчик\p{L}*|Коробицын\p{L}*)(?!\p{L})/u;
const CONSENT_WORDS = /(?<!\p{L})кондитер|согласова|согласи[ея]/iu;
export const needsConsent = (text: string) => CONSENT_NAMES.test(text) || CONSENT_WORDS.test(text);

const unquote = (s: string) => s.trim().replace(/^«/, '').replace(/»$/, '');

// ─── positions ───

export function parsePositions(raw: string): ParsedEntry[] {
  const md = raw.replace(/\r\n?/g, '\n');
  const out: ParsedEntry[] = [];
  const top = new Map<string, number>();
  for (const m of md.matchAll(/^(\d+)\. \*\*([A-Z]\d+)\./gm)) top.set(m[2], Number(m[1]));

  const sections = md.split(/^## /m).slice(1);
  let sort = 0;
  for (const sec of sections) {
    const nl = sec.indexOf('\n');
    const heading = sec.slice(0, nl).trim();
    const content = sec.slice(nl + 1).replace(/\n---\s*$/, '').trim();
    if (heading.startsWith('Топ-15')) continue; // folded into each position as flag «top»
    const group = heading.replace(/\s*\(\d+\)\s*$/, '');
    const blocks = content.split(/^### /m);
    const graded = blocks.slice(1).filter((b) => /^[A-Z]\d+ \[[ABC]\]/.test(b));

    if (!graded.length) {
      // Reference sections: contradictions, models, killer phrases, «не использовать как пруф».
      const warn = /Противоречия|Не использовать/.test(heading);
      out.push({
        base: 'position', code: `REF-${++sort}`, title: heading, grade: null, group: 'Справка', body: content,
        quote: null, source: null, warnings: warn ? content : null, flags: ['reference'], usedIn: null,
        visibility: 'all', sort: 10_000 + sort, extra: {},
      });
      continue;
    }

    for (const b of graded) {
      const head = b.slice(0, b.indexOf('\n'));
      const hm = head.match(/^([A-Z]\d+) \[([ABC])\] (.+)$/);
      if (!hm) throw new Error(`position head: ${JSON.stringify(head.slice(0, 80))}`);
      const [, code, grade, title] = hm;
      const body = b.slice(head.length + 1).trim();
      const field = (name: string) => body.match(new RegExp(`^- \\*\\*${name}[^*]*:\\*\\*\\s*(.*)$`, 'm'))?.[1]?.trim() ?? null;
      const quotes = [...body.matchAll(/^- \*\*Цитата:\*\*\s*(.+)$/gm)].map((m) => m[1].trim());
      const status = field('Статус') ?? '';
      const fresh = field('Свежесть') ?? '';
      const warnLines = body.split('\n').filter((l) => l.includes('⚠️')).map((l) => l.replace(/^- \*\*[^*]+:\*\*\s*/, '').trim());
      const note = field('Заметка');
      const flags: string[] = [];
      if (/ядро/.test(status)) flags.push('core');
      if (top.has(code)) flags.push('top');
      const consent = needsConsent(body);
      if (consent) flags.push('consent');
      out.push({
        base: 'position', code, title, grade: grade as 'A' | 'B' | 'C', group, body,
        quote: quotes[0] ?? null,
        source: field('Где говорил'),
        warnings: warnLines.length ? warnLines.join('\n') : null,
        flags, usedIn: field('В каруселях'),
        visibility: consent ? 'sasha' : 'all',
        sort: ++sort,
        extra: {
          status, fresh, demand: field('Спрос'), note, topRank: top.get(code) ?? null, quotes,
          // donor accounts named in «Спрос» are public creators: Danya keeps these @handles
          publicHandles: [...(field('Спрос') ?? '').matchAll(/@[A-Za-z0-9_.]*[A-Za-z0-9_]/g)].map((h) => h[0]),
        },
      });
    }
  }
  return out;
}

// ─── stories ───

export function parseStories(raw: string): ParsedEntry[] {
  const md = raw.replace(/\r\n?/g, '\n');
  const out: ParsedEntry[] = [];
  const sections = md.split(/^## /m).slice(1);
  let sort = 0;
  for (const sec of sections) {
    const nl = sec.indexOf('\n');
    const group = sec.slice(0, nl).trim();
    const content = sec.slice(nl + 1).replace(/\n---\s*$/, '').trim();
    const parts = content.split(/^(?=\*\*\d+[а-яa-z]?\. )/m).filter((p) => /^\*\*\d+[а-яa-z]?\. /.test(p));

    if (!parts.length) {
      // «Расхождения в цифрах», «Чужие кейсы»: must stay visible as warnings.
      out.push({
        base: 'story', code: `REF-${++sort}`, title: group, grade: null, group: 'Справка', body: content, quote: null,
        source: null, warnings: content, flags: ['reference'], usedIn: null, visibility: 'all', sort: 10_000 + sort, extra: {},
      });
      continue;
    }

    for (const p of parts) {
      const text = p.trim();
      const head = text.slice(0, text.indexOf('\n') < 0 ? text.length : text.indexOf('\n'));
      const m = head.match(/^\*\*(\d+[а-яa-z]?)\. (.+?)\*\*\s*(.*)$/);
      if (!m) throw new Error(`story head: ${head.slice(0, 80)}`);
      const [, code, title] = m;
      const facts = m[3].replace(/^·\s*/, '').trim() || null;
      const quotes = [...text.matchAll(/^> (.+)$/gm)].map((q) => unquote(q[1]));
      const srcLine = text.match(/^Источник:\s*(.+)$/m)?.[1] ?? null;
      const segs = srcLine ? srcLine.split(' · ') : [];
      const used = segs.filter((s) => s.startsWith('✅')).map((s) => s.replace(/^✅\s*/, '')).join('; ') || null;
      const screen = segs.filter((s) => s.startsWith('скрин:')).map((s) => s.replace(/^скрин:\s*/, '')).join('; ') || null;
      const warns = segs.filter((s) => s.includes('⚠️')).map((s) => s.replace(/^⚠️\s*/, ''));
      const source = segs.filter((s) => !s.startsWith('✅') && !s.startsWith('скрин:') && !s.includes('⚠️')).join(' · ') || null;
      const flags = [used ? 'used' : 'unused'];
      const consent = needsConsent(text);
      if (consent) flags.push('consent');
      out.push({
        base: 'story', code, title, grade: null, group, body: text, quote: quotes[0] ?? null, source,
        warnings: warns.length ? warns.join('\n') : null, flags, usedIn: used,
        visibility: consent ? 'sasha' : 'all', sort: ++sort,
        extra: { facts: facts ?? null, screen, quotes },
      });
    }
  }
  return out;
}

// ─── problems ───

interface CommentProblem {
  problem: string; quotes?: { nick?: string; text: string; post?: string }[]; count_est?: string; lack?: string[];
  belief_A?: string; theme?: { name?: string; demand?: string } | null; keywords?: string[]; note?: string;
}
interface VoiceProblem {
  problem: string; quotes?: { who?: string; text: string; source?: string }[]; count_est?: string; buyers_est?: string;
  lack?: string[]; belief_A?: string; source_types?: string[];
}
type Portraits<P> = { id: number | string; name: string; problems: P[] }[];

function problemBody(p: CommentProblem & VoiceProblem, quotes: Quote[]): string {
  const lines: string[] = [];
  if (p.count_est) lines.push(`**Сколько:** ${p.count_est}`);
  if (p.buyers_est) lines.push(`**Покупали:** ${p.buyers_est}`);
  if (p.lack?.length) lines.push(`**Чего не хватает:** ${p.lack.join(', ')}`);
  if (p.belief_A) lines.push(`**Убеждение:** ${p.belief_A}`);
  if (p.theme?.name) lines.push(`**Тема:** ${p.theme.name}${p.theme.demand ? `, спрос ${p.theme.demand}` : ''}`);
  if (quotes.length) lines.push('', ...quotes.map((q) => `> «${q.text}»${q.who ? ` (${q.who})` : ''}`));
  if (p.keywords?.length) lines.push('', `**Ключевые слова:** ${p.keywords.join('; ')}`);
  if (p.note) lines.push('', `**Заметка:** ${p.note}`);
  return lines.join('\n');
}

export function parseProblems(
  comments: { portraits: Portraits<CommentProblem>; top10?: { rank: number; refs?: string[] }[] },
  voice: {
    portraits: Portraits<VoiceProblem>; objections?: VoiceProblem[]; outside_portraits?: VoiceProblem[];
    top10?: { rank: number; portrait: string; problem: string }[];
  },
  mapping: Record<string, unknown>,
): ParsedEntry[] {
  const out: ParsedEntry[] = [];
  let sort = 0;

  // mapping: voice code → [theme, [comment refs]]; an overlap = a money problem that also lives in comments.
  const overlapVoice = new Map<string, string[]>();
  for (const [k, v] of Object.entries(mapping)) {
    if (k.startsWith('_') || !Array.isArray(v)) continue;
    const refs = (v[1] as string[] | undefined) ?? [];
    if (refs.length) overlapVoice.set(k, refs);
  }
  const overlapComments = new Set([...overlapVoice.values()].flat());
  const commentTop = new Map<string, number>();
  for (const t of comments.top10 ?? []) for (const r of t.refs ?? []) if (!commentTop.has(r)) commentTop.set(r, t.rank);

  for (const portrait of comments.portraits) {
    portrait.problems.forEach((p, i) => {
      const ref = `${portrait.id}.${i}`;
      // Commenters wrote publicly, but their @nick is still a person: kept only for Sasha.
      const quotes: Quote[] = (p.quotes ?? []).map((q) => ({ who: q.nick ?? null, text: q.text, source: q.post ? `пост ${q.post}` : null }));
      const flags = ['comments'];
      if (overlapComments.has(ref)) flags.push('overlap');
      if (commentTop.has(ref)) flags.push('top');
      out.push({
        base: 'problem', code: `K${ref}`, title: p.problem, grade: null, group: portrait.name, body: problemBody(p, quotes),
        quote: quotes[0]?.text ?? null, source: 'комментарии под выбросами (problems.json)', warnings: null, flags,
        usedIn: null, visibility: 'all', sort: ++sort,
        extra: { portraitId: portrait.id, ref, quotes, countEst: p.count_est ?? null, lack: p.lack ?? [], theme: p.theme ?? null, topRank: commentTop.get(ref) ?? null },
      });
    });
  }

  const voiceEntry = (code: string, group: string, p: VoiceProblem, extra: Record<string, unknown> = {}) => {
    const quotes: Quote[] = (p.quotes ?? []).map((q) => ({ who: q.who ?? null, text: q.text, source: q.source ?? null }));
    const flags = ['voice'];
    if (overlapVoice.has(code)) flags.push('overlap');
    const top = voice.top10?.find((t) => t.problem === p.problem);
    if (top) flags.push('top');
    out.push({
      base: 'problem', code, title: p.problem, grade: null, group, body: problemBody(p, quotes),
      quote: quotes[0]?.text ?? null, source: 'анкеты, переписки и созвоны (problems-voice.json)',
      warnings: 'Цитаты живых людей из анкет, переписок и созвонов: имена и ники только для Саши.',
      flags, usedIn: null, visibility: 'all', sort: ++sort,
      extra: { quotes, countEst: p.count_est ?? null, buyersEst: p.buyers_est ?? null, lack: p.lack ?? [], sourceTypes: p.source_types ?? [], commentRefs: overlapVoice.get(code) ?? [], topRank: top?.rank ?? null, ...extra },
    });
  };
  for (const portrait of voice.portraits) portrait.problems.forEach((p, i) => voiceEntry(`${portrait.id}.${i}`, portrait.name, p));
  (voice.objections ?? []).forEach((p, i) => voiceEntry(`OBJ.${i}`, 'Возражения на покупке', p));
  (voice.outside_portraits ?? []).forEach((p, i) => voiceEntry(`OUT.${i}`, 'Вне портретов', p));
  return out;
}
