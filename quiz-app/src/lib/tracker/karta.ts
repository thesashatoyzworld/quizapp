import { prisma } from '@/lib/prisma';
import { MAX_LEVEL, type MapStage, type MapView, type Milestone, type Score } from './karta-shared';

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

/** Живой счёт: лист ожидания «360» из анкеты (dwy_leads kind='360'), один человек = один контакт. */
export async function getScore(): Promise<Score> {
  const rows = await prisma.$queryRaw<{ wk: string; n: bigint }[]>`
    SELECT to_char(date_trunc('week', first_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Almaty'), 'YYYY-MM-DD') AS wk,
           count(*) AS n
    FROM (
      SELECT min(created_at) AS first_at
      FROM dwy_leads
      WHERE kind = '360'
      GROUP BY coalesce(nullif(telegram_id, ''), nullif(lower(username), ''), nullif(phone, ''), id::text)
    ) people
    GROUP BY 1`;
  const byWeek: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    byWeek[r.wk] = Number(r.n);
    total += Number(r.n);
  }
  return { total, byWeek };
}
