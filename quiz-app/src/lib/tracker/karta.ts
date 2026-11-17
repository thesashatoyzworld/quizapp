import { prisma } from '@/lib/prisma';
import { MAX_LEVEL, type MapStage, type MapView, type Milestone } from './karta-shared';

function toView(row: Awaited<ReturnType<typeof prisma.trackerMap.findFirst>>): MapView | null {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    goalTaskId: row.goalTaskId ?? null,
    deadline: row.deadline,
    stages: (row.stages as MapStage[]) ?? [],
    milestones: (row.milestones as Milestone[]) ?? [],
    level: Math.min(MAX_LEVEL, Math.max(1, row.level)),
    levelBase: row.levelBase,
    hintsSeen: row.hintsSeen ?? [],
  };
}

/** Карта одна на запуск; берём самую свежую. */
export async function getMap(): Promise<MapView | null> {
  return toView(await prisma.trackerMap.findFirst({ orderBy: { createdAt: 'desc' } }));
}

export type MapAction =
  | { action: 'levelUp'; id: string; doneNow: number }
  | { action: 'levelDown'; id: string; doneNow: number }
  | { action: 'seeHint'; id: string; hint: string };

export async function runMapAction(a: MapAction): Promise<MapView | null> {
  const row = await prisma.trackerMap.findUniqueOrThrow({ where: { id: a.id } });
  const doneNow = Math.max(0, Math.floor(Number((a as { doneNow?: number }).doneNow) || 0));
  if (a.action === 'levelUp' && row.level < MAX_LEVEL) {
    await prisma.trackerMap.update({ where: { id: a.id }, data: { level: row.level + 1, levelBase: doneNow } });
  } else if (a.action === 'levelDown' && row.level > 1) {
    await prisma.trackerMap.update({ where: { id: a.id }, data: { level: row.level - 1, levelBase: doneNow } });
  } else if (a.action === 'seeHint') {
    const hint = String(a.hint).slice(0, 40);
    if (!row.hintsSeen.includes(hint)) {
      await prisma.trackerMap.update({ where: { id: a.id }, data: { hintsSeen: [...row.hintsSeen, hint] } });
    }
  }
  return getMap();
}
