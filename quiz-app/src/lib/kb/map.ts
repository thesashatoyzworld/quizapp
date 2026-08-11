// Карта материалов Саши: оглавление всех разделов кабинета в одной структуре.
//
// Никакой нарезки на куски и никаких эмбеддингов: модель получает оглавление
// целиком, выбирает по нему один материал, и только его текст читается вторым
// обращением. Новый урок появляется в боте сразу после деплоя — карта
// собирается из тех же структур, которыми живёт кабинет.
//
// Правило доступа берётся из констант разделов, своей копии здесь нет.

import { LESSONS, KURS_ROLE, KURS_MIN_TIER } from '@/content/kurs';
import { PROMPTS, PROMPTY_ROLE, PROMPTY_MIN_TIER } from '@/content/prompty';
import { POTOK_FILES, POTOK_ROLE, POTOK_MIN_TIER } from '@/content/potok';
import { RAZBORY, RAZBORY_ROLE, RAZBORY_MIN_TIER } from '@/content/razbory';
import { SOZVONY, SOZVONY_ROLE, SOZVONY_MIN_TIER } from '@/content/sozvony';
import { WORKSHOPS_KB } from '@/content/workshops';
import contentJson from '@/content/formula/content.json';
import type { Content, Block, Rich, NavNode } from '@/content/formula/types';

const formula = contentJson as unknown as Content;

// Правила доступа библиотеки воркшопов повторяют gated.tsx на её страницах:
// премиум — «Синхронизация» либо «Новый уровень» от тарифа 2; предобучение —
// любой «Новый уровень» либо «Синхронизация».
const WORKSHOP_PREMIUM: AccessRule[] = [
  { role: 'sync', minTier: 0 },
  { role: 'uroven', minTier: 2 },
];
const WORKSHOP_PREOBUCHENIE: AccessRule[] = [
  { role: 'uroven', minTier: 0 },
  { role: 'sync', minTier: 0 },
];

/** «Формула вирусного контента» открыта по роли uroven на любом тарифе. */
const FORMULA_ROLE = 'uroven';
const FORMULA_MIN_TIER = 1;

export type Section =
  | 'kurs' | 'prompty' | 'potok' | 'formula' | 'razbory' | 'sozvony' | 'workshops';

/** Роль плюс минимальный тариф. Тариф 0 = роли достаточно самой по себе. */
export interface AccessRule {
  role: string;
  minTier: number;
}

export interface MapEntry {
  section: Section;
  slug: string;
  title: string;
  /** одна строка: о чём материал */
  note: string;
  /** заголовки блоков внутри — чтобы модель понимала содержание, не читая материал */
  headings: string[];
  /** доступ открыт, если выполнено ЛЮБОЕ из правил */
  access: AccessRule[];
  /** раздел кабинета, куда вести человека */
  path: string;
  /** материал живёт на другом домене (библиотека воркшопов) */
  external?: boolean;
  /**
   * Имена участников встречи. Из разборов и созвонов бот берёт приём, но не
   * называет, с кем его разбирали: по этому списку выдача чистится.
   */
  people: string[];
}

// ── HTML → текст ─────────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  laquo: '«', raquo: '»', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', deg: '°',
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

/**
 * Статьи уроков — целые HTML-документы со стилями и интерактивами. В контекст
 * едет только человеческий текст: скрипты, стили и разметка выбрасываются.
 */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<\/(p|div|li|h[1-6]|section|tr|blockquote)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n[ \n]*/g, '\n')
    .trim();
}

/** Заголовки блоков статьи — h2 и h3 по порядку. */
function headingsFromHtml(html: string): string[] {
  const out: string[] = [];
  const re = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const t = htmlToText(m[2]).replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
  }
  return out;
}

// ── «Формула»: дерево блоков → текст ─────────────────────────────────────────

function richText(rich: Rich[] | undefined): string {
  return (rich ?? []).map((r) => r.text).join('');
}

function blocksToText(blocks: Block[] | undefined, out: string[] = []): string[] {
  for (const b of blocks ?? []) {
    switch (b.t) {
      case 'p':
      case 'heading':
        out.push(richText(b.rich));
        break;
      case 'list':
        for (const item of b.items) {
          const line = richText(item.rich);
          if (line) out.push(`• ${line}`);
          blocksToText(item.children, out);
        }
        break;
      case 'toggle':
        out.push(b.title);
        blocksToText(b.children, out);
        break;
      case 'callout':
        blocksToText(b.children, out);
        break;
      default:
        break;
    }
  }
  return out;
}

function formulaHeadings(blocks: Block[] | undefined): string[] {
  const out: string[] = [];
  for (const b of blocks ?? []) {
    if (b.t === 'heading') {
      const t = richText(b.rich).trim();
      if (t) out.push(t);
    } else if (b.t === 'toggle') {
      if (b.title) out.push(b.title);
    }
  }
  return out;
}

/** Первый абзац страницы «Формулы» — он же строка о содержании. */
function formulaNote(blocks: Block[] | undefined): string {
  for (const b of blocks ?? []) {
    if (b.t === 'p') {
      const t = richText(b.rich).trim();
      if (t) return t.slice(0, 200);
    }
  }
  return '';
}

function flattenNav(nodes: NavNode[] | undefined, acc: NavNode[] = []): NavNode[] {
  for (const n of nodes ?? []) {
    acc.push(n);
    flattenNav(n.children, acc);
  }
  return acc;
}

// ── сборка карты ─────────────────────────────────────────────────────────────

let cached: MapEntry[] | null = null;

export function buildMap(): MapEntry[] {
  if (cached) return cached;

  const entries: MapEntry[] = [];

  for (const l of LESSONS) {
    if (!l.html) continue; // урок ещё не выложен — материала нет
    entries.push({
      section: 'kurs',
      slug: l.slug,
      title: `${l.badge} · ${l.title}`,
      note: l.subtitle,
      headings: headingsFromHtml(l.html),
      access: [{ role: KURS_ROLE, minTier: KURS_MIN_TIER }],
      path: '/kurs',
      people: [],
    });
  }

  for (const p of PROMPTS) {
    entries.push({
      section: 'prompty',
      slug: p.slug,
      title: p.title,
      note: `${p.intro} На выходе: ${p.outcome}`,
      headings: [],
      access: [{ role: PROMPTY_ROLE, minTier: PROMPTY_MIN_TIER }],
      path: '/prompty',
      people: [],
    });
  }

  for (const f of POTOK_FILES) {
    entries.push({
      section: 'potok',
      slug: f.key,
      title: `«Поток спроса» — ${f.label}`,
      note: f.note,
      headings: [],
      access: [{ role: POTOK_ROLE, minTier: POTOK_MIN_TIER }],
      path: '/potok',
      people: [],
    });
  }

  for (const node of flattenNav(formula.nav)) {
    const page = formula.pages?.[node.slug];
    if (!page) continue;
    entries.push({
      section: 'formula',
      slug: node.slug,
      title: `Формула вирусного контента · ${node.title}`,
      note: formulaNote(page.blocks),
      headings: formulaHeadings(page.blocks),
      access: [{ role: FORMULA_ROLE, minTier: FORMULA_MIN_TIER }],
      path: '/formula',
      people: [],
    });
  }

  for (const w of WORKSHOPS_KB) {
    entries.push({
      section: 'workshops',
      slug: w.slug,
      title: `Воркшоп · ${w.title}`,
      note: w.blurb,
      headings: w.headings,
      access: w.rule === 'preobuchenie' ? WORKSHOP_PREOBUCHENIE : WORKSHOP_PREMIUM,
      path: `/w/${w.slug}`,
      external: true,
      people: [],
    });
  }

  for (const r of RAZBORY) {
    entries.push({
      section: 'razbory',
      slug: r.slug,
      title: `Разбор · ${r.title}`,
      note: r.subtitle,
      headings: headingsFromHtml(r.html),
      access: [{ role: RAZBORY_ROLE, minTier: RAZBORY_MIN_TIER }],
      path: '/razbory',
      people: [],
    });
  }

  for (const s of SOZVONY) {
    entries.push({
      section: 'sozvony',
      slug: s.slug,
      title: `Групповой созвон ${s.date} · ${s.title}`,
      note: s.subtitle,
      headings: headingsFromHtml(s.html),
      access: [{ role: SOZVONY_ROLE, minTier: SOZVONY_MIN_TIER }],
      path: '/sozvony',
      people: s.participants ?? [],
    });
  }

  cached = entries;
  return entries;
}

/** Открыт ли материал человеку с такими ролями и тарифами. */
export function isOpen(entry: MapEntry, tiers: Record<string, number>): boolean {
  return entry.access.some((rule) => {
    const tier = tiers[rule.role];
    if (tier === undefined) return false;
    return tier >= rule.minTier;
  });
}

/** Что из карты открыто человеку с такими тарифами. */
export function visibleTo(tiers: Record<string, number>): MapEntry[] {
  return buildMap().filter((e) => isOpen(e, tiers));
}

export function findEntry(section: string, slug: string): MapEntry | undefined {
  return buildMap().find((e) => e.section === section && e.slug === slug);
}

/**
 * Текст материала целиком — то, по чему модель отвечает.
 * Обрезается по символам: 30 000 токенов это порядка 90 000 знаков кириллицы.
 */
const MAX_CHARS = 90_000;

export function materialText(entry: MapEntry): string {
  let text = '';

  switch (entry.section) {
    case 'kurs': {
      const l = LESSONS.find((x) => x.slug === entry.slug);
      text = l ? htmlToText(l.html) : '';
      break;
    }
    case 'prompty': {
      const p = PROMPTS.find((x) => x.slug === entry.slug);
      text = p ? `${p.title}\n${p.intro}\n\n${p.body}` : '';
      break;
    }
    case 'potok': {
      // Файлы раздачи лежат base64 — читать нечего, есть только описание.
      const f = POTOK_FILES.find((x) => x.key === entry.slug);
      text = f ? `${f.label}\n${f.note}\nФайл: ${f.name}` : '';
      break;
    }
    case 'formula': {
      const page = formula.pages?.[entry.slug];
      text = page ? `${page.title}\n\n${blocksToText(page.blocks).join('\n')}` : '';
      break;
    }
    case 'workshops': {
      const w = WORKSHOPS_KB.find((x) => x.slug === entry.slug);
      text = w ? w.text : '';
      break;
    }
    case 'razbory': {
      const r = RAZBORY.find((x) => x.slug === entry.slug);
      text = r ? htmlToText(r.html) : '';
      break;
    }
    case 'sozvony': {
      const s = SOZVONY.find((x) => x.slug === entry.slug);
      text = s ? htmlToText(s.html) : '';
      break;
    }
  }

  return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}\n…(материал обрезан)` : text;
}

// ── оглавление для модели ────────────────────────────────────────────────────
//
// Оглавление едет в каждом вопросе, поэтому каждая запись живёт в бюджете
// знаков, а не в лимите на количество заголовков: у воркшопов заголовки
// длинные и их полсотни, у уроков короткие и их десяток. Бюджет уравнивает —
// короткие заголовки помещаются числом, длинные обрезаются.

/** Сколько знаков отдаём под описание материала. */
const NOTE_BUDGET = 180;
/** Сколько знаков отдаём под заголовки блоков одной записи. */
const HEADINGS_BUDGET = 320;
/** Длиннее этого заголовок обрезаем: дальше идёт подзаголовок, а не суть. */
const HEADING_MAX = 70;

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trim()}…`;
}

/** Заголовки блоков, уложенные в бюджет знаков. Дубли выбрасываются. */
function fitHeadings(headings: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  let used = 0;

  for (const raw of headings) {
    const h = clip(raw, HEADING_MAX);
    const key = h.toLowerCase();
    if (!h || seen.has(key)) continue;
    if (used + h.length > HEADINGS_BUDGET) break;
    seen.add(key);
    out.push(h);
    used += h.length + 3; // « · »
  }
  return out.join(' · ');
}

/** Оглавление в том виде, в котором его читает модель. */
export function renderMap(entries: MapEntry[]): string {
  return entries
    .map((e) => {
      const head = fitHeadings(e.headings);
      const tail = head ? `\n   блоки: ${head}` : '';
      return `[${e.section}/${e.slug}] ${e.title}\n   ${clip(e.note, NOTE_BUDGET)}${tail}`;
    })
    .join('\n\n');
}
