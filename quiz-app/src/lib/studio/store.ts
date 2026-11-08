// «Студия»: database reads and writes shared by the admin page, /studio, the
// API route and the MCP endpoint. Server only: Prisma lives here.

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { getAdminSession } from '@/lib/admin-auth';
import { cookies } from 'next/headers';
import { STUDIO_COOKIE, verifyStudioSession } from './keys';
import { LIB_BASES, filterLibrary, forDanya, type LibBase, type LibFilter, type LibraryEntry } from './library';
import {
  KINDS, STAGES, localDate, shortcodeOf,
  type Actor, type Board, type CommentView, type ItemView, type Kind, type RuleView, type Snapshot, type Stage,
} from './view';

/** Admin session acts as Sasha; otherwise the studio_session cookie. */
export async function currentActor(): Promise<Actor | null> {
  if (await getAdminSession()) return 'sasha';
  return verifyStudioSession((await cookies()).get(STUDIO_COOKIE)?.value);
}

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

type ItemRow = Awaited<ReturnType<typeof prisma.studioItem.findMany>>[number];
const ITEM_SELECT = {
  id: true, kind: true, title: true, variant: true, copyNo: true, stage: true, planDate: true, briefUrl: true,
  briefText: true, shortcode: true, mediaId: true, permalink: true, publishedAt: true, author: true, briefId: true,
} as const;

function itemView(r: Omit<ItemRow, 'briefHtml' | 'createdAt' | 'updatedAt'>, hasHtml: boolean): ItemView {
  return {
    id: r.id,
    kind: r.kind as Kind,
    title: r.title,
    variant: r.variant,
    copyNo: r.copyNo,
    stage: r.stage as Stage,
    planDate: iso(r.planDate),
    briefUrl: r.briefUrl,
    briefText: r.briefText,
    hasBriefHtml: hasHtml,
    shortcode: r.shortcode,
    mediaId: r.mediaId,
    briefId: r.briefId,
    permalink: r.permalink,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    author: r.author,
  };
}

type StatRow = Awaited<ReturnType<typeof prisma.studioStat.findMany>>[number];
function snapView(s: StatRow): Snapshot {
  return {
    takenAt: s.takenAt.toISOString(), ageHours: s.ageHours, views: s.views, reach: s.reach, likes: s.likes,
    comments: s.comments, shares: s.shares, saved: s.saved, skipRate: s.skipRate, avgWatchMs: s.avgWatchMs,
    follows: s.follows, profileVisits: s.profileVisits,
  };
}

function commentView(c: { id: string; itemId: string; author: string; text: string; createdAt: Date }): CommentView {
  return { id: c.id, itemId: c.itemId, author: c.author, text: c.text, createdAt: c.createdAt.toISOString() };
}

export async function listRules(kind?: Kind): Promise<RuleView[]> {
  const rows = await prisma.studioRule.findMany({
    where: kind ? { kind: { in: [kind, 'all'] } } : undefined,
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return rows.map((r) => ({ id: r.id, kind: r.kind as RuleView['kind'], text: r.text, evidence: r.evidence, order: r.order }));
}

async function statsFor(shortcodes: string[]): Promise<Board['stats']> {
  const rows = shortcodes.length
    ? await prisma.studioStat.findMany({ where: { shortcode: { in: shortcodes } }, orderBy: { takenAt: 'asc' } })
    : [];
  const out: Board['stats'] = {};
  for (const r of rows) (out[r.shortcode] ??= []).push(snapView(r));
  return out;
}

export async function listItems(where: Prisma.StudioItemWhereInput = {}): Promise<ItemView[]> {
  const [rows, withHtml] = await Promise.all([
    prisma.studioItem.findMany({ where, select: ITEM_SELECT, orderBy: [{ planDate: 'asc' }, { variant: 'asc' }, { copyNo: 'asc' }, { createdAt: 'asc' }] }),
    prisma.studioItem.findMany({ where: { ...where, briefHtml: { not: null } }, select: { id: true } }),
  ]);
  const html = new Set(withHtml.map((r) => r.id));
  return rows.map((r) => itemView(r, html.has(r.id) || !!r.briefId));
}

export async function loadBoard(): Promise<Board> {
  const [items, comments, rules] = await Promise.all([
    listItems(),
    prisma.studioComment.findMany({ orderBy: { createdAt: 'asc' } }),
    listRules(),
  ]);
  const stats = await statsFor(items.map((i) => i.shortcode).filter((c): c is string => !!c));
  return { items, comments: comments.map(commentView), rules, stats };
}

export async function getItem(id: string) {
  const row = await prisma.studioItem.findUnique({
    where: { id },
    include: { comments: { orderBy: { createdAt: 'asc' } }, brief: { select: { title: true, html: true } } },
  });
  if (!row) return null;
  const item = itemView(row, !!row.briefHtml || !!row.brief);
  const stats = row.shortcode ? (await statsFor([row.shortcode]))[row.shortcode] ?? [] : [];
  return { item, briefTitle: row.brief?.title ?? null, briefHtml: row.brief?.html ?? row.briefHtml, comments: row.comments.map(commentView), stats };
}

/** Brief HTML for an item: the shared brief row, else the legacy per-item copy. */
export async function getBriefHtml(id: string): Promise<string | null> {
  const row = await prisma.studioItem.findUnique({ where: { id }, select: { briefHtml: true, brief: { select: { html: true } } } });
  return row?.brief?.html ?? row?.briefHtml ?? null;
}

/** Cached fresh thumbnail URL for a media id, or null. */
export async function cachedThumb(mediaId: string) {
  return prisma.studioThumb.findUnique({ where: { mediaId } });
}

export async function saveThumb(mediaId: string, url: string) {
  const fetchedAt = new Date();
  await prisma.studioThumb.upsert({ where: { mediaId }, create: { mediaId, url, fetchedAt }, update: { url, fetchedAt } });
}

/** Only media we know about get a thumbnail route (keeps the route from proxying arbitrary ids). */
export async function isKnownMedia(mediaId: string): Promise<boolean> {
  return !!(await prisma.studioItem.findFirst({ where: { mediaId }, select: { id: true } }));
}

// ─── writes ───

/** Fields each person may change. Danya moves work along; Sasha edits everything. */
const FIELDS: Record<Actor, string[]> = {
  sasha: ['kind', 'title', 'variant', 'copyNo', 'stage', 'planDate', 'briefUrl', 'briefText'],
  danya: ['stage', 'planDate'],
};

export class StudioError extends Error {}

function pick(actor: Actor, data: Record<string, unknown>): Record<string, unknown> {
  const extra = Object.keys(data).find((k) => !FIELDS[actor].includes(k));
  if (extra) throw new StudioError(actor === 'danya' ? 'Даня меняет этап и дату, остальное Саша' : `нельзя менять ${extra}`);
  const out: Record<string, unknown> = {};
  for (const key of FIELDS[actor]) {
    if (!(key in data)) continue;
    const raw = data[key];
    if (raw === '' || raw === null || raw === undefined) {
      if (key === 'title' || key === 'kind' || key === 'stage') throw new StudioError(`пустое поле ${key}`);
      out[key] = null;
    } else if (key === 'copyNo') {
      const n = Number(raw);
      if (!Number.isInteger(n)) throw new StudioError('номер копии: целое число');
      out[key] = n;
    } else if (key === 'planDate') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) throw new StudioError('дата: ГГГГ-ММ-ДД');
      out[key] = new Date(`${raw}T00:00:00Z`);
    } else {
      out[key] = String(raw).trim();
    }
  }
  if ('stage' in out && !STAGES.includes(out.stage as Stage)) throw new StudioError('неизвестный этап');
  if ('kind' in out && !KINDS.includes(out.kind as Kind)) throw new StudioError('неизвестный тип');
  if (out.stage === 'published') throw new StudioError('«Вышло» ставится ссылкой на пост');
  return out;
}

export async function createItem(actor: Actor, data: Record<string, unknown>): Promise<string> {
  if (actor !== 'sasha') throw new StudioError('создавать может только Саша');
  const fields = pick(actor, { kind: 'reel', stage: 'text', ...data });
  if (!fields.title) throw new StudioError('пустое поле title');
  const row = await prisma.studioItem.create({ data: { ...(fields as { title: string }), author: actor } });
  return row.id;
}

export async function updateItem(actor: Actor, id: string, data: Record<string, unknown>): Promise<void> {
  const fields = pick(actor, data);
  const row = await prisma.studioItem.findUnique({ where: { id }, select: { stage: true } });
  if (!row) throw new StudioError('не найдено');
  // Moving a published item back: the post link belongs to a post we no longer count.
  if ('stage' in fields && row.stage === 'published') {
    Object.assign(fields, { shortcode: null, mediaId: null, permalink: null, publishedAt: null });
  }
  await prisma.studioItem.update({ where: { id }, data: fields });
}

/** Link the Instagram post: stage → published; the daily sync fills in the numbers. */
export async function attachPost(id: string, url: string): Promise<string> {
  const code = shortcodeOf(url);
  if (!code || !/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reels?|p)\//.test(url)) {
    throw new StudioError('нужна ссылка вида instagram.com/reel/… или /p/…');
  }
  const row = await prisma.studioItem.findUnique({ where: { id }, select: { planDate: true } });
  if (!row) throw new StudioError('не найдено');
  const other = await prisma.studioItem.findUnique({ where: { shortcode: code }, select: { id: true, author: true, stage: true } });
  if (other && other.id !== id) {
    // The sync may have auto-created this post already: fold it into the planned item.
    if (other.author !== 'api') throw new StudioError('этот пост уже привязан к другой карточке');
    await prisma.studioComment.updateMany({ where: { itemId: other.id }, data: { itemId: id } });
    await prisma.studioItem.delete({ where: { id: other.id } });
  }
  await prisma.studioItem.update({
    where: { id },
    data: {
      stage: 'published', shortcode: code, permalink: `https://www.instagram.com/${url.includes('/p/') ? 'p' : 'reel'}/${code}/`,
      planDate: row.planDate ?? new Date(`${localDate()}T00:00:00Z`),
    },
  });
  return code;
}

export async function addComment(actor: Actor, itemId: string, text: string): Promise<string> {
  const body = String(text ?? '').trim();
  if (!body) throw new StudioError('пустой комментарий');
  if (body.length > 4000) throw new StudioError('слишком длинный комментарий');
  if (!(await prisma.studioItem.findUnique({ where: { id: itemId }, select: { id: true } }))) throw new StudioError('не найдено');
  const row = await prisma.studioComment.create({ data: { itemId, author: actor, text: body } });
  return row.id;
}

export async function saveRule(actor: Actor, data: { id?: string; kind?: string; text?: string; evidence?: string; order?: number }) {
  if (actor !== 'sasha') throw new StudioError('правила правит только Саша');
  const kind = data.kind ?? 'all';
  if (!['reel', 'carousel', 'all'].includes(kind)) throw new StudioError('неизвестный тип');
  const text = String(data.text ?? '').trim();
  if (!text) throw new StudioError('пустое правило');
  const fields = { kind, text, evidence: String(data.evidence ?? '').trim() || null, order: Number(data.order) || 0 };
  if (data.id) await prisma.studioRule.update({ where: { id: data.id }, data: fields });
  else await prisma.studioRule.create({ data: fields });
}

export async function deleteRule(actor: Actor, id: string) {
  if (actor !== 'sasha') throw new StudioError('правила правит только Саша');
  await prisma.studioRule.delete({ where: { id } });
}

// ─── «Библиотека» ───

const LIBRARY_DANYA = 'library_danya';

/** Sasha checks the library first: Danya (studio and MCP) sees nothing until it is opened. */
export async function libraryOpenToDanya(): Promise<boolean> {
  return (await prisma.studioSetting.findUnique({ where: { key: LIBRARY_DANYA } }))?.value === 'open';
}

export async function setLibraryOpen(actor: Actor, open: boolean) {
  if (actor !== 'sasha') throw new StudioError('открывает библиотеку только Саша');
  const value = open ? 'open' : 'closed';
  await prisma.studioSetting.upsert({ where: { key: LIBRARY_DANYA }, create: { key: LIBRARY_DANYA, value }, update: { value } });
}

type LibRow = Awaited<ReturnType<typeof prisma.studioLibrary.findMany>>[number];
function libView(r: LibRow): LibraryEntry {
  return {
    id: r.id, base: r.base as LibBase, code: r.code, title: r.title, grade: r.grade as LibraryEntry['grade'], group: r.group,
    body: r.body, quote: r.quote, source: r.source, warnings: r.warnings, flags: r.flags, usedIn: r.usedIn,
    visibility: r.visibility as LibraryEntry['visibility'], extra: (r.extra ?? {}) as Record<string, unknown>, sort: r.sort,
    updatedBy: r.updatedBy, updatedAt: r.updatedAt.toISOString(),
  };
}

/** Everything for Sasha; Danya gets the redacted view, or nothing while the library is closed. */
export async function listLibrary(actor: Actor): Promise<{ open: boolean; entries: LibraryEntry[] }> {
  const open = await libraryOpenToDanya();
  if (actor !== 'sasha' && !open) return { open, entries: [] };
  const rows = (await prisma.studioLibrary.findMany({ orderBy: [{ base: 'asc' }, { sort: 'asc' }] })).map(libView);
  return { open, entries: actor === 'sasha' ? rows : rows.map(forDanya).filter((e): e is LibraryEntry => !!e) };
}

export function searchLibrary(entries: LibraryEntry[], f: LibFilter, limit = 20) {
  return filterLibrary(entries, f).slice(0, Math.max(1, Math.min(limit, 100)));
}

/** By id («position:Z4») or by code («Z4», «1а», «BV.0»), optionally within a base. */
export async function getLibraryEntry(actor: Actor, idOrCode: string, base?: LibBase): Promise<LibraryEntry> {
  const { entries } = await listLibrary(actor);
  const hit = entries.find((e) => e.id === idOrCode) ?? entries.find((e) => e.code === idOrCode && (!base || e.base === base));
  if (!hit) throw new StudioError(actor === 'sasha' || (await libraryOpenToDanya()) ? 'не найдено' : 'библиотека пока закрыта: Саша её проверяет');
  return hit;
}

const LIB_TEXT = ['title', 'group', 'body', 'quote', 'source', 'warnings', 'usedIn'] as const;

/** Create or edit an entry (Sasha only). Edited entries are never overwritten by a re-import. */
export async function saveLibraryEntry(actor: Actor, data: Record<string, unknown>, by = actor): Promise<string> {
  if (actor !== 'sasha') throw new StudioError('библиотеку правит только Саша');
  const fields: Record<string, unknown> = {};
  for (const k of LIB_TEXT) if (k in data) fields[k] = data[k] == null || data[k] === '' ? (k === 'group' || k === 'body' ? '' : null) : String(data[k]);
  if ('title' in fields && !fields.title) throw new StudioError('пустое название');
  if ('grade' in data) {
    const g = data.grade ? String(data.grade).toUpperCase() : null;
    if (g && !['A', 'B', 'C'].includes(g)) throw new StudioError('оценка: A, B или C');
    fields.grade = g;
  }
  if ('visibility' in data) {
    if (!['all', 'sasha'].includes(String(data.visibility))) throw new StudioError('видимость: all или sasha');
    fields.visibility = data.visibility;
  }
  if ('flags' in data) {
    if (!Array.isArray(data.flags)) throw new StudioError('flags: список');
    fields.flags = (data.flags as unknown[]).map(String);
  }
  fields.updatedBy = by;

  const id = typeof data.id === 'string' && data.id ? data.id : null;
  const existing = id
    ? await prisma.studioLibrary.findUnique({ where: { id } })
    : data.base && data.code ? await prisma.studioLibrary.findUnique({ where: { base_code: { base: String(data.base), code: String(data.code) } } }) : null;
  if (existing) {
    await prisma.studioLibrary.update({ where: { id: existing.id }, data: fields });
    return existing.id;
  }
  if (id) throw new StudioError('не найдено');
  const base = String(data.base ?? '');
  if (!(LIB_BASES as string[]).includes(base)) throw new StudioError('база: position, story или problem');
  if (!fields.title) throw new StudioError('пустое название');
  const code = String(data.code ?? '').trim() || `N${Date.now().toString(36).toUpperCase()}`;
  const newId = `${base}:${code}`;
  await prisma.studioLibrary.create({
    data: { ...(fields as { title: string }), id: newId, base, code, sort: 5_000, flags: (fields.flags as string[]) ?? [] },
  });
  return newId;
}
