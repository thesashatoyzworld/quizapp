// Optimizator storage: monthly counter and saved runs. Server only (Prisma).
// Tables: scripts/optimizator-create-tables.mjs.
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { monthKey } from './config';
import type { Analysis, Goal, HistoryItem, SavedRun } from './view';
import { toStudent } from './view';

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

export async function saveRun(data: {
  telegramId: number;
  goal: Goal;
  niche: string | null;
  audience: string | null;
  script: string;
  result: Analysis | null;
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
      niche: data.niche,
      audience: data.audience,
      script: data.script,
      result: (data.result ?? (data.error ? { error: data.error } : undefined)) as Prisma.InputJsonValue | undefined,
      model: data.model,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      durationMs: data.durationMs,
      status: data.status,
    },
  });
  return row.id;
}

function firstLine(script: string): string {
  const line = script.split('\n').map((s) => s.trim()).find(Boolean) || '';
  return line.length > 90 ? line.slice(0, 88) + '…' : line;
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
  return {
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    goal: r.goal as Goal,
    niche: r.niche,
    audience: r.audience,
    script: r.script,
    result: toStudent(r.result as unknown as Analysis),
  };
}
