import { prisma } from '@/lib/prisma';

export type BoardData = { nodes: unknown[]; edges: unknown[] };
export type BoardView = { slug: string; title: string; data: BoardData; version: number; updatedAt: string };
export type BoardListItem = { slug: string; title: string; updatedAt: string };

function clean(data: unknown): BoardData {
  const d = (data ?? {}) as Partial<BoardData>;
  return { nodes: Array.isArray(d.nodes) ? d.nodes : [], edges: Array.isArray(d.edges) ? d.edges : [] };
}

function toView(row: { slug: string; title: string; data: unknown; version: number; updatedAt: Date }): BoardView {
  return { slug: row.slug, title: row.title, data: clean(row.data), version: row.version, updatedAt: row.updatedAt.toISOString() };
}

export async function listBoards(): Promise<BoardListItem[]> {
  const rows = await prisma.adminBoard.findMany({ orderBy: { updatedAt: 'desc' }, select: { slug: true, title: true, updatedAt: true } });
  return rows.map((r) => ({ slug: r.slug, title: r.title, updatedAt: r.updatedAt.toISOString() }));
}

export async function getBoard(slug: string): Promise<BoardView | null> {
  const row = await prisma.adminBoard.findUnique({ where: { slug } });
  return row ? toView(row) : null;
}

export class Conflict extends Error {
  constructor(public board: BoardView) {
    super('conflict');
  }
}

/** Сохраняет схему, если никто не сохранил её раньше нас (baseVersion совпадает). */
export async function saveBoard(slug: string, data: unknown, baseVersion: number): Promise<BoardView> {
  const res = await prisma.adminBoard.updateMany({
    where: { slug, version: baseVersion },
    data: { data: clean(data) as object, version: { increment: 1 } },
  });
  const row = await getBoard(slug);
  if (!row) throw new Error('схема не найдена');
  if (res.count === 0) throw new Conflict(row);
  return row;
}

export async function createBoard(title: string): Promise<BoardView> {
  const base = title.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'skhema';
  let slug = base;
  for (let i = 2; await prisma.adminBoard.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  const row = await prisma.adminBoard.create({ data: { slug, title, data: { nodes: [], edges: [] } } });
  return toView(row);
}

export async function renameBoard(slug: string, title: string): Promise<void> {
  await prisma.adminBoard.update({ where: { slug }, data: { title } });
}
