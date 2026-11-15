import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getTask, type TaskView } from './data';
import { PERIODS, periodKey, type Period } from './periods';
import { splitIntoSteps } from './split';

export type TrackerAction =
  | { action: 'createTask'; kind: 'quest' | 'routine'; title: string; period?: Period; note?: string; steps?: string[]; auto?: boolean }
  | { action: 'suggestSteps'; id: string }
  | { action: 'updateTask'; id: string; title?: string; note?: string | null; period?: Period }
  | { action: 'archiveTask'; id: string; archived: boolean }
  | { action: 'deleteTask'; id: string }
  | { action: 'moveTask'; id: string; dir: -1 | 1 }
  | { action: 'addStep'; taskId: string; title: string }
  | { action: 'updateStep'; id: string; title: string }
  | { action: 'deleteStep'; id: string }
  | { action: 'moveStep'; id: string; dir: -1 | 1 }
  | { action: 'toggle'; taskId: string; stepId: string; done: boolean };

export class BadInput extends Error {}

function clean(s: unknown, max = 300): string {
  const v = String(s ?? '').trim();
  if (!v) throw new BadInput('пустой текст');
  if (v.length > max) throw new BadInput(`длиннее ${max} символов`);
  return v;
}

function period(p: unknown): Period {
  if (!PERIODS.includes(p as Period)) throw new BadInput('неверный период');
  return p as Period;
}

/** Меняет местами соседей в списке по position. */
async function swap(
  list: { id: string; position: number }[],
  id: string,
  dir: -1 | 1,
  write: (id: string, position: number) => Promise<unknown>,
) {
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  const order = list.map((x) => x.id);
  [order[i], order[j]] = [order[j], order[i]];
  await Promise.all(order.map((oid, pos) => write(oid, pos)));
}

/** Возвращает изменённую задачу или null, если она удалена. */
export async function runAction(a: TrackerAction): Promise<TaskView | null> {
  switch (a.action) {
    case 'createTask': {
      const kind = a.kind === 'routine' ? 'routine' : 'quest';
      const id = randomUUID();
      const max = await prisma.trackerTask.aggregate({ where: { kind }, _max: { position: true } });
      const title = clean(a.title, 200);
      const p = kind === 'routine' ? period(a.period ?? 'day') : null;
      const note = a.note ? String(a.note).trim().slice(0, 4000) || null : null;
      let steps = (a.steps ?? []).map((s) => String(s).trim()).filter(Boolean).slice(0, 50);
      // Шаги не вписаны руками: раскладывает нейронка. Не вышло = задача без шагов, не ошибка.
      if (!steps.length && a.auto !== false) {
        steps = await splitIntoSteps({ title, note, kind, period: p }).catch((e) => {
          console.error('[Tracker split]', e);
          return [];
        });
      }
      await prisma.trackerTask.create({
        data: {
          id,
          kind,
          title,
          note,
          period: p,
          position: (max._max.position ?? -1) + 1,
          steps: { create: steps.map((t, i) => ({ id: randomUUID(), title: clean(t), position: i })) },
        },
      });
      return getTask(id);
    }
    case 'updateTask': {
      const data: { title?: string; note?: string | null; period?: string } = {};
      if (a.title !== undefined) data.title = clean(a.title, 200);
      if (a.note !== undefined) data.note = a.note ? String(a.note).slice(0, 4000) : null;
      if (a.period !== undefined) data.period = period(a.period);
      await prisma.trackerTask.update({ where: { id: a.id }, data });
      return getTask(a.id);
    }
    case 'suggestSteps': {
      // Пересобрать: сделанные шаги остаются, несделанные заменяются новыми.
      const t = await prisma.trackerTask.findUniqueOrThrow({ where: { id: a.id }, include: { steps: { orderBy: { position: 'asc' } }, checks: true } });
      const key = periodKey(t.kind === 'routine' ? (t.period as Period) : null);
      const doneIds = new Set(t.checks.filter((c) => c.periodKey === key).map((c) => c.stepId));
      const done = t.steps.filter((s) => doneIds.has(s.id));
      const fresh = await splitIntoSteps({
        title: t.title,
        note: t.note,
        kind: t.kind === 'routine' ? 'routine' : 'quest',
        period: t.period as Period | null,
        done: done.map((s) => s.title),
      });
      if (!fresh.length) throw new BadInput('нейронка не предложила шагов, попробуй ещё раз');
      await prisma.$transaction([
        prisma.trackerStep.deleteMany({ where: { taskId: t.id, id: { notIn: done.map((s) => s.id) } } }),
        ...done.map((s, i) => prisma.trackerStep.update({ where: { id: s.id }, data: { position: i } })),
        ...fresh.map((title, i) =>
          prisma.trackerStep.create({ data: { id: randomUUID(), taskId: t.id, title, position: done.length + i } }),
        ),
      ]);
      return getTask(t.id);
    }
    case 'archiveTask':
      await prisma.trackerTask.update({
        where: { id: a.id },
        data: { archivedAt: a.archived ? new Date() : null },
      });
      return getTask(a.id);
    case 'deleteTask':
      await prisma.trackerTask.delete({ where: { id: a.id } });
      return null;
    case 'moveTask': {
      const t = await prisma.trackerTask.findUniqueOrThrow({ where: { id: a.id } });
      const list = await prisma.trackerTask.findMany({
        where: { kind: t.kind, archivedAt: null },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, position: true },
      });
      await swap(list, a.id, a.dir, (id, position) => prisma.trackerTask.update({ where: { id }, data: { position } }));
      return getTask(a.id);
    }
    case 'addStep': {
      const max = await prisma.trackerStep.aggregate({ where: { taskId: a.taskId }, _max: { position: true } });
      await prisma.trackerStep.create({
        data: { id: randomUUID(), taskId: a.taskId, title: clean(a.title), position: (max._max.position ?? -1) + 1 },
      });
      return getTask(a.taskId);
    }
    case 'updateStep': {
      const s = await prisma.trackerStep.update({ where: { id: a.id }, data: { title: clean(a.title) } });
      return getTask(s.taskId);
    }
    case 'deleteStep': {
      const s = await prisma.trackerStep.delete({ where: { id: a.id } });
      await prisma.trackerCheck.deleteMany({ where: { taskId: s.taskId, stepId: s.id } });
      return getTask(s.taskId);
    }
    case 'moveStep': {
      const s = await prisma.trackerStep.findUniqueOrThrow({ where: { id: a.id } });
      const list = await prisma.trackerStep.findMany({
        where: { taskId: s.taskId },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, position: true },
      });
      await swap(list, a.id, a.dir, (id, position) => prisma.trackerStep.update({ where: { id }, data: { position } }));
      return getTask(s.taskId);
    }
    case 'toggle': {
      const t = await prisma.trackerTask.findUniqueOrThrow({ where: { id: a.taskId } });
      const key = periodKey(t.kind === 'routine' ? (t.period as Period) : null);
      const where = { taskId_stepId_periodKey: { taskId: t.id, stepId: String(a.stepId ?? ''), periodKey: key } };
      if (a.done) {
        await prisma.trackerCheck.upsert({ where, create: where.taskId_stepId_periodKey, update: {} });
      } else {
        await prisma.trackerCheck.deleteMany({ where: where.taskId_stepId_periodKey });
      }
      return getTask(t.id);
    }
    default:
      throw new BadInput('неизвестное действие');
  }
}
