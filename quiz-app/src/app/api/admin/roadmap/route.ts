import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// Правки маршрутных карт из /admin/roadmaps. Один роут на все сущности карты:
// поля белые списки, чужого в базу не проходит.

type Entity = 'roadmap' | 'metric' | 'step' | 'task' | 'note';

const FIELDS: Record<Entity, string[]> = {
  roadmap: ['clientName', 'tier', 'paidAmount', 'returned', 'goal', 'periodGoal', 'accessUntil', 'lastTouchAt', 'archived'],
  metric: ['label', 'startValue', 'currentValue', 'unit', 'position', 'visibility'],
  step: ['title', 'status', 'evidence', 'position', 'visibility'],
  task: ['title', 'why', 'owner', 'status', 'dueOn', 'position', 'visibility'],
  note: ['kind', 'body', 'source', 'happenedOn', 'visibility'],
};

const INT_FIELDS = new Set(['paidAmount', 'returned', 'position']);
const DATE_FIELDS = new Set(['accessUntil', 'lastTouchAt', 'dueOn', 'happenedOn']);

function pick(entity: Entity, data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of FIELDS[entity]) {
    if (!(key in data)) continue;
    const raw = data[key];
    if (raw === '' || raw === null) {
      out[key] = null;
      continue;
    }
    if (INT_FIELDS.has(key)) {
      const n = Number(raw);
      out[key] = Number.isFinite(n) ? Math.round(n) : null;
    } else if (DATE_FIELDS.has(key)) {
      const d = new Date(String(raw));
      out[key] = Number.isNaN(d.getTime()) ? null : d;
    } else {
      out[key] = raw;
    }
  }
  return out;
}

function model(entity: Entity) {
  switch (entity) {
    case 'roadmap': return prisma.roadmap;
    case 'metric': return prisma.roadmapMetric;
    case 'step': return prisma.roadmapStep;
    case 'task': return prisma.roadmapTask;
    case 'note': return prisma.roadmapNote;
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const entity = body.entity as Entity;
  const op = body.op as 'create' | 'update' | 'delete';

  if (!FIELDS[entity]) return NextResponse.json({ error: 'Unknown entity' }, { status: 400 });
  if (!['create', 'update', 'delete'].includes(op)) {
    return NextResponse.json({ error: 'Unknown op' }, { status: 400 });
  }

  try {
    if (op === 'delete') {
      if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
      if (entity === 'roadmap') return NextResponse.json({ error: 'Roadmaps are archived, not deleted' }, { status: 400 });
      // @ts-expect-error union of delegates, all have delete
      await model(entity).delete({ where: { id: body.id } });
      return NextResponse.json({ ok: true });
    }

    const data = pick(entity, body.data || {});

    if (op === 'create') {
      if (entity === 'roadmap') return NextResponse.json({ error: 'Roadmaps come from the import script' }, { status: 400 });
      if (!body.roadmapId) return NextResponse.json({ error: 'Missing roadmapId' }, { status: 400 });
      // @ts-expect-error union of delegates, all have create
      const created = await model(entity).create({ data: { ...data, roadmapId: body.roadmapId } });
      return NextResponse.json({ ok: true, id: created.id });
    }

    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Отметка «сделано» проставляет дату сама, снятие галочки её убирает.
    if (entity === 'task' && 'status' in data) {
      data.doneAt = data.status === 'done' ? new Date() : null;
    }

    // @ts-expect-error union of delegates, all have update
    await model(entity).update({ where: { id: body.id }, data });

    // Любая правка карты это касание: держим дату свежей без ручного ввода.
    const roadmapId = entity === 'roadmap' ? body.id : body.roadmapId;
    if (roadmapId && !('lastTouchAt' in data)) {
      await prisma.roadmap.update({ where: { id: roadmapId }, data: { lastTouchAt: new Date() } });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown';
    console.error('roadmap write failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
