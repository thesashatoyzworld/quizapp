import { prisma } from '@/lib/prisma';
import { periodKey, recentKeys, timeLeft, type Period } from './periods';

export type StepView = { id: string; title: string; done: boolean };

export type TaskView = {
  id: string;
  kind: 'quest' | 'routine';
  title: string;
  note: string | null;
  period: Period | null;
  tags: string[];
  parentId: string | null;
  /** Карта запуска: колонка пути клиента, «потом» и неделя (понедельник). */
  map: { stage: string; later: boolean; week: string | null; move: string | null; point: string | null } | null;
  archived: boolean;
  steps: StepView[];
  /** Задача без шагов отмечается целиком. */
  doneWhole: boolean;
  /** 0..1 */
  progress: number;
  /** Для routine: заполненность прошлых периодов, от старого к текущему. */
  history: { key: string; progress: number }[];
  timeLeft: string | null;
};

const HISTORY = 14;

const include = {
  steps: { orderBy: [{ position: 'asc' as const }, { createdAt: 'asc' as const }] },
  checks: true,
};

type Row = Awaited<ReturnType<typeof loadRow>>;

function loadRow(id: string) {
  return prisma.trackerTask.findUniqueOrThrow({ where: { id }, include });
}

function fraction(row: NonNullable<Row>, key: string): number {
  const keyChecks = row.checks.filter((c) => c.periodKey === key);
  if (row.steps.length === 0) return keyChecks.some((c) => c.stepId === '') ? 1 : 0;
  const ids = new Set(row.steps.map((s) => s.id));
  const done = keyChecks.filter((c) => ids.has(c.stepId)).length;
  return done / row.steps.length;
}

export function toView(row: NonNullable<Row>, now = new Date()): TaskView {
  const period = (row.period as Period | null) ?? null;
  const kind = row.kind === 'routine' ? 'routine' : 'quest';
  const key = periodKey(kind === 'routine' ? period : null, now);
  const doneSteps = new Set(row.checks.filter((c) => c.periodKey === key).map((c) => c.stepId));
  return {
    id: row.id,
    kind,
    title: row.title,
    note: row.note,
    period,
    tags: row.tags ?? [],
    parentId: row.parentId ?? null,
    map: row.mapStage
      ? {
          stage: row.mapStage,
          later: row.mapLater,
          week: row.mapWeek ?? null,
          move: row.mapMove ?? null,
          point: row.mapPoint ?? null,
        }
      : null,
    archived: !!row.archivedAt,
    steps: row.steps.map((s) => ({ id: s.id, title: s.title, done: doneSteps.has(s.id) })),
    doneWhole: doneSteps.has(''),
    progress: fraction(row, key),
    history:
      kind === 'routine' && period
        ? recentKeys(period, HISTORY, now).map((k) => ({ key: k, progress: fraction(row, k) }))
        : [],
    timeLeft: kind === 'routine' && period ? timeLeft(period, now) : null,
  };
}

export async function getTask(id: string): Promise<TaskView> {
  return toView(await loadRow(id));
}

export async function listTasks(): Promise<TaskView[]> {
  const rows = await prisma.trackerTask.findMany({
    include,
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  });
  const now = new Date();
  return rows.map((r) => toView(r, now));
}
