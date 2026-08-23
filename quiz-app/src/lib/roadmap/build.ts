// Полный цикл сборки карты: анкета → модель → база → предпросмотр Саше.
//
// Вызывается из двух мест: сама собой после закрытой анкеты тарифа 2 (через
// очередь) и руками командой `/karta_sobrat`. Человеку по итогу не уходит
// ничего: карта ложится закрытой, дальше решает Саша.

import { prisma } from '@/lib/prisma';
import { getActiveAccessByTelegram } from '@/lib/access';
import { scheduleRoadmapBuild } from '@/lib/qstash';
import { buildSource } from './source';
import { generateRoadmap } from './generate';
import { saveDraft, slugFor, canRebuild } from './store';
import { sendPreview } from './review';

export interface BuildResult {
  roadmapId: string;
  slug: string;
  warnings: string[];
  previewSent: boolean;
}

/** Месяц доступа: конец берём из самой выдачи, а не из календаря. */
async function accessWindow(telegramId: number | null): Promise<{ startedAt: Date; accessUntil: Date }> {
  const startedAt = new Date();
  const fallback = new Date(startedAt);
  fallback.setUTCMonth(fallback.getUTCMonth() + 1);

  if (!telegramId) return { startedAt, accessUntil: fallback };

  const rows = await getActiveAccessByTelegram(telegramId);
  const uroven = rows.find((r) => r.productSlug.startsWith('uroven-'));
  if (!uroven) return { startedAt, accessUntil: fallback };

  return {
    startedAt: uroven.grantedAt || startedAt,
    accessUntil: uroven.expiresAt || fallback,
  };
}

export async function buildRoadmap(intakeId: string): Promise<BuildResult> {
  const source = await buildSource(intakeId);

  const slug = slugFor(source.username, source.telegramId, intakeId);
  if (!(await canRebuild(slug))) {
    throw new Error(`карта ${slug} уже открыта клиенту, пересборка стёрла бы его отметки`);
  }

  const { startedAt, accessUntil } = await accessWindow(source.telegramId);
  const draft = await generateRoadmap(source, startedAt, accessUntil);

  const roadmapId = await saveDraft(draft, {
    slug,
    clientName: source.firstName || source.username || slug,
    telegramId: source.telegramId,
    username: source.username,
    startedAt,
    accessUntil,
  });

  const previewSent = await sendPreview(roadmapId, draft.warnings);

  return { roadmapId, slug, warnings: draft.warnings, previewSent };
}

/**
 * Пересобрать черновик заново по той же анкете. Возвращает строку для чата:
 * сборка идёт минуты, поэтому уходит в очередь, а не выполняется здесь.
 */
export async function rebuildRoadmap(roadmapId: string): Promise<string> {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { slug: true, telegramId: true, clientVisible: true },
  });
  if (!roadmap) return 'карта не найдена';
  if (roadmap.clientVisible) return 'карта уже открыта клиенту, пересборка стёрла бы его отметки';
  if (!roadmap.telegramId) return 'у карты нет telegram id, анкету по ней не найти';

  const intakeId = await findIntakeFor(String(roadmap.telegramId));
  if (!intakeId) return 'анкета этого человека не нашлась';

  await scheduleRoadmapBuild(intakeId, 1);
  return 'пересобираю, новый черновик придёт через пару минут';
}

/** Последняя закрытая анкета человека: по ней и собираем. */
export async function findIntakeFor(arg: string): Promise<string | null> {
  const clean = arg.trim().replace(/^@/, '');

  if (/^\d+$/.test(clean)) {
    const byTg = await prisma.intake.findFirst({
      where: { telegramId: BigInt(clean) },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    return byTg?.id ?? null;
  }

  const byName = await prisma.intake.findFirst({
    where: { username: { equals: clean, mode: 'insensitive' } },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
  return byName?.id ?? null;
}
