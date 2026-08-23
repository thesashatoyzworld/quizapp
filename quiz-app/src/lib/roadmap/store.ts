// Запись собранной карты в базу и её открытие клиенту.
//
// Карта всегда ложится закрытой (`clientVisible = false`) и с внутренними
// строками: пока Саша не одобрил черновик, человек не видит ничего. Открытие
// это отдельное действие, оно же открывает базовый набор строк.

import { prisma } from '@/lib/prisma';
import type { RoadmapDraft } from './generate';

/** Латиница из юзернейма либо tg-<id>: slug должен быть читаемым в админке. */
export function slugFor(username: string | null, telegramId: number | null, intakeId: string): string {
  const clean = (username || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (clean) return clean;
  if (telegramId) return `tg-${telegramId}`;
  return `intake-${intakeId.slice(0, 8)}`;
}

export interface SaveParams {
  slug: string;
  clientName: string;
  telegramId: number | null;
  username: string | null;
  startedAt: Date;
  accessUntil: Date;
}

/**
 * Кладёт черновик в пять таблиц карты. Повторный вызов по тому же slug
 * переписывает карту целиком: черновик пересобирается, а не дополняется.
 * Отметки клиента при этом теряются, поэтому пересборка запрещена после
 * открытия карты (см. `canRebuild`).
 */
export async function saveDraft(draft: RoadmapDraft, params: SaveParams): Promise<string> {
  const existing = await prisma.roadmap.findUnique({ where: { slug: params.slug } });

  const data = {
    clientName: params.clientName,
    telegramId: params.telegramId ? BigInt(params.telegramId) : null,
    username: params.username,
    tier: 'uroven-t2',
    paidAmount: 10000,
    startedAt: params.startedAt,
    accessUntil: params.accessUntil,
    goal: draft.goal,
    periodGoal: draft.periodGoal,
    clientIntro: draft.clientIntro,
    lastTouchAt: new Date(),
  };

  const roadmap = existing
    ? await prisma.roadmap.update({ where: { id: existing.id }, data })
    : await prisma.roadmap.create({ data: { ...data, slug: params.slug, clientVisible: false } });

  if (existing) {
    await Promise.all([
      prisma.roadmapMetric.deleteMany({ where: { roadmapId: roadmap.id } }),
      prisma.roadmapStep.deleteMany({ where: { roadmapId: roadmap.id } }),
      prisma.roadmapTask.deleteMany({ where: { roadmapId: roadmap.id } }),
      prisma.roadmapNote.deleteMany({ where: { roadmapId: roadmap.id } }),
    ]);
  }

  await prisma.roadmapMetric.createMany({
    data: draft.metrics.map((m, i) => ({
      roadmapId: roadmap.id,
      key: m.key,
      label: m.label,
      startValue: m.startValue,
      currentValue: m.currentValue,
      position: i,
    })),
  });

  await prisma.roadmapStep.createMany({
    data: draft.steps.map((s) => ({
      roadmapId: roadmap.id,
      position: s.position,
      title: s.title,
      status: s.status,
      evidence: s.evidence,
    })),
  });

  await prisma.roadmapTask.createMany({
    data: draft.tasks.map((t, i) => ({
      roadmapId: roadmap.id,
      key: t.key,
      position: i,
      title: t.title,
      why: t.why,
      owner: t.owner,
      status: t.status,
      dueOn: new Date(t.dueOn),
      linkUrl: t.linkUrl || null,
      linkLabel: t.linkLabel || null,
    })),
  });

  await prisma.roadmapNote.createMany({
    data: [
      // Личная строка для сообщения человеку живёт заметкой особого вида:
      // отдельного поля под неё в карте нет, а править её удобно там же,
      // где остальные заметки.
      {
        roadmapId: roadmap.id,
        kind: 'handoff',
        body: draft.mainTakeaway,
        source: 'уйдёт человеку вместе со ссылкой на карту',
        happenedOn: new Date(),
      },
      ...draft.notes.map((n) => ({
        roadmapId: roadmap.id,
        kind: n.kind,
        body: n.body,
        source: n.source,
        happenedOn: new Date(n.happenedOn),
      })),
    ],
  });

  return roadmap.id;
}

/**
 * Открыть клиенту базовый набор строк. Повторяет правило админки:
 * ступени целиком, цифры кроме денежной, задачи самого клиента.
 * Заметки и задачи Саши остаются внутренними всегда.
 */
export async function shareDefaults(roadmapId: string): Promise<number> {
  const where = { roadmapId };
  const [steps, metrics, tasks] = await Promise.all([
    prisma.roadmapStep.updateMany({ where, data: { visibility: 'shared' } }),
    prisma.roadmapMetric.updateMany({ where: { ...where, key: { not: 'revenue' } }, data: { visibility: 'shared' } }),
    prisma.roadmapTask.updateMany({ where: { ...where, owner: 'client' }, data: { visibility: 'shared' } }),
  ]);
  return steps.count + metrics.count + tasks.count;
}

/** Одобрение Саши: карта открывается в кабинете вместе с базовым набором строк. */
export async function openForClient(roadmapId: string): Promise<number> {
  const shared = await shareDefaults(roadmapId);
  await prisma.roadmap.update({
    where: { id: roadmapId },
    data: { clientVisible: true, lastTouchAt: new Date() },
  });
  return shared;
}

/**
 * Пересобирать можно только закрытую карту: у открытой человек уже отмечает
 * задачи галочками, и перезапись стёрла бы его отметки.
 */
export async function canRebuild(slug: string): Promise<boolean> {
  const existing = await prisma.roadmap.findUnique({ where: { slug }, select: { clientVisible: true } });
  return !existing || !existing.clientVisible;
}
