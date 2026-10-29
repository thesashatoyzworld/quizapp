// Optimizator storage: monthly counter and saved runs. Server only (Prisma).
// Tables: scripts/optimizator-create-tables.mjs.
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { monthKey } from './config';
import type { DemandEvidence } from './demand';
import type { Analysis, DemandLink, Goal, HistoryItem, Ladder, SavedRun, Stage } from './view';
import { firstLine, toStudent } from './view';

export async function usedThisMonth(telegramId: number): Promise<number> {
  const row = await prisma.optimizatorUsage.findUnique({
    where: { telegramId_month: { telegramId: BigInt(telegramId), month: monthKey() } },
  });
  return row?.count ?? 0;
}

/**
 * Take one slot of the monthly limit atomically, before the paid call.
 * Returns the new count, or null when the limit is already used up.
 */
export async function reserveSlot(telegramId: number, limit: number): Promise<number | null> {
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO optimizator_usage (telegram_id, month, count, updated_at)
    VALUES (${BigInt(telegramId)}, ${monthKey()}, 1, now())
    ON CONFLICT (telegram_id, month) DO UPDATE
      SET count = optimizator_usage.count + 1, updated_at = now()
      WHERE optimizator_usage.count < ${limit}
    RETURNING count`;
  if (!rows.length) return null;
  return Number(rows[0].count) <= limit ? Number(rows[0].count) : null;
}

/** Give the slot back when the call failed: the student did not get a result. */
export async function releaseSlot(telegramId: number, month: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE optimizator_usage SET count = GREATEST(count - 1, 0), updated_at = now()
     WHERE telegram_id = ${BigInt(telegramId)} AND month = ${month}`;
}

/** Stored in optimizator_runs.demand: what the model got (with urls) and the links it matched. */
export type StoredDemand = DemandEvidence & { links: DemandLink[] };

export async function saveRun(data: {
  telegramId: number;
  /** Detected by the model; 'unknown' for failed runs. */
  goal: Goal | 'unknown';
  script: string;
  result: Analysis | null;
  demand: StoredDemand | null;
  /** Stored inside result as `ladder` (with token usage); null when off or failed. */
  ladder?: (Ladder & { usage?: unknown }) | null;
  /** The username the student typed, stored inside result as `instagram` to prefill the form. */
  instagram?: string | null;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  durationMs: number;
  status: 'ok' | 'error';
  error?: string;
}): Promise<string> {
  const row = await prisma.optimizatorRun.create({
    data: {
      telegramId: BigInt(data.telegramId),
      goal: data.goal,
      // v5 has no stage, niche or audience input: the model reads them from the text.
      stage: null,
      script: data.script,
      result: (data.result
        ? { ...data.result, ...(data.ladder ? { ladder: data.ladder } : {}), ...(data.instagram ? { instagram: data.instagram } : {}) }
        : data.error ? { error: data.error } : undefined) as Prisma.InputJsonValue | undefined,
      demand: (data.demand ?? undefined) as Prisma.InputJsonValue | undefined,
      model: data.model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      durationMs: data.durationMs,
      status: data.status,
    },
  });
  return row.id;
}


export async function history(telegramId: number, take = 10): Promise<HistoryItem[]> {
  const rows = await prisma.optimizatorRun.findMany({
    where: { telegramId: BigInt(telegramId), status: 'ok' },
    orderBy: { createdAt: 'desc' },
    take,
    select: { id: true, createdAt: true, goal: true, script: true, result: true },
  });
  return rows.map((r) => {
    const res = r.result as { overall_score?: number } | null;
    return {
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      goal: r.goal as Goal,
      score: typeof res?.overall_score === 'number' ? res.overall_score : null,
      firstLine: firstLine(r.script),
    };
  });
}

/** A saved run, only for its owner. */
export async function getRun(telegramId: number, id: string): Promise<SavedRun | null> {
  const r = await prisma.optimizatorRun.findFirst({
    where: { id, telegramId: BigInt(telegramId), status: 'ok' },
  });
  if (!r || !r.result) return null;
  const { ladder, instagram: _ig, ...analysis } = r.result as unknown as Analysis & {
    ladder?: Ladder & { usage?: unknown };
    instagram?: string;
  };
  void _ig;
  return {
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    goal: r.goal as Goal,
    stage: r.stage === 'filmed' || r.stage === 'draft' ? (r.stage as Stage) : null,
    script: r.script,
    result: toStudent(analysis),
    demandLinks: (r.demand as StoredDemand | null)?.links ?? [],
    ladder: ladder ? studentLadder(ladder) : null,
  };
}

/** Token usage stays on the server. */
export function studentLadder(l: Ladder & { usage?: unknown }): Ladder {
  const { usage: _u, ...rest } = l;
  void _u;
  return rest;
}

/** The Instagram username the student gave last time, to prefill the form. */
export async function lastUsername(telegramId: number): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ u: string | null }[]>`
    SELECT result->>'instagram' AS u FROM optimizator_runs
     WHERE telegram_id = ${BigInt(telegramId)} AND status = 'ok' AND result->>'instagram' IS NOT NULL
     ORDER BY created_at DESC LIMIT 1`;
  return rows[0]?.u ?? null;
}
