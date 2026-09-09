import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';

// Правки маршрутных карт из /admin/roadmaps. Один роут на все сущности карты:
// поля белые списки, чужого в базу не проходит.

type Entity = 'roadmap' | 'metric' | 'step' | 'task' | 'note';

const FIELDS: Record<Entity, string[]> = {
  roadmap: ['clientName', 'tier', 'paidAmount', 'returned', 'goal', 'periodGoal', 'accessUntil', 'lastTouchAt', 'archived', 'clientVisible', 'clientIntro'],
  metric: ['label', 'startValue', 'currentValue', 'unit', 'position', 'visibility'],
  step: ['title', 'status', 'evidence', 'position', 'visibility'],
  task: ['title', 'why', 'owner', 'status', 'dueOn', 'position', 'visibility', 'linkUrl', 'linkLabel'],
  note: ['kind', 'body', 'source', 'happenedOn', 'visibility'],
};

const INT_FIELDS = new Set(['paidAmount', 'returned', 'position']);
const BOOL_FIELDS = new Set(['archived', 'clientVisible']);
const DATE_FIELDS = new Set(['accessUntil', 'lastTouchAt', 'dueOn', 'happenedOn']);

function pick(entity: Entity, data: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of FIELDS[entity]) {
    if (!(key in data)) continue;
    const raw = data[key];
    if (BOOL_FIELDS.has(key)) {
      out[key] = raw === true || raw === 'true';
      continue;
    }
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

// Базовый набор: путь, цифры и собственные задачи клиента. Заметки и задачи
// Саши остаются внутренними — там диагнозы, которые человеку в лицо не
// показывают. Метрика возврата тоже: «вернул 0 из 150 000» это разговор для
// созвона, а не строчка в его кабинете.
function inDefaults(entity: Entity, row: { key?: unknown; owner?: unknown }): boolean {
  if (entity === 'step') return true;
  if (entity === 'metric') return row.key !== 'revenue';
  if (entity === 'task') return row.owner === 'client';
  return false;
}

/** Открыть клиенту базовый набор. Возвращает число открытых строк. */
async function shareDefaults(roadmapId: string): Promise<number> {
  const where = { roadmapId };
  const [steps, metrics, tasks] = await Promise.all([
    prisma.roadmapStep.updateMany({ where, data: { visibility: 'shared' } }),
    prisma.roadmapMetric.updateMany({ where: { ...where, key: { not: 'revenue' } }, data: { visibility: 'shared' } }),
    prisma.roadmapTask.updateMany({ where: { ...where, owner: 'client' }, data: { visibility: 'shared' } }),
  ]);
  return steps.count + metrics.count + tasks.count;
}

/** Сколько строк карты клиент реально видит в кабинете. */
async function sharedRows(roadmapId: string): Promise<number> {
  const where = { roadmapId, visibility: 'shared' };
  const [steps, metrics, tasks, notes] = await Promise.all([
    prisma.roadmapStep.count({ where }),
    prisma.roadmapMetric.count({ where }),
    prisma.roadmapTask.count({ where }),
    prisma.roadmapNote.count({ where }),
  ]);
  return steps + metrics + tasks + notes;
}

/** Кабинет: раздел с картой клиента. */
const KARTA_URL = 'https://world.thesashatoyz.com/karta';

/**
 * Сообщение человеку о том, что карта собрана и лежит в кабинете.
 * Саму карту в бот не пересылаем: она живёт одним экраном в кабинете,
 * где видно шаги, задачи и прогресс, а сообщение только приводит туда.
 */
async function notifyClientRoadmapOpen(
  roadmapId: string,
  wasVisible: boolean,
): Promise<'sent' | 'blocked' | 'no-telegram' | 'already-open'> {
  if (wasVisible) return 'already-open';

  const card = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    select: { telegramId: true, clientName: true },
  });
  if (!card?.telegramId) return 'no-telegram';

  const name = (card.clientName || '').trim().split(/\s+/)[0];
  const hi = name ? `${name}, привет` : 'привет';
  const text = [
    hi,
    '',
    'Собрал по твоей анкете маршрутную карту: где ты сейчас, куда идём и что делаешь на этой неделе.',
    '',
    'Она в кабинете, в разделе «Карта». Задачи отмечаешь там же, я вижу отметки и по ним понимаю, где ты идёшь.',
  ].join(String.fromCharCode(10));

  const res = await sendBotMessage(Number(card.telegramId), text, {
    inline_keyboard: [
      [{ text: '🗺 Открыть карту', web_app: { url: KARTA_URL } }],
      [{ text: 'Открыть в браузере', url: KARTA_URL }],
    ],
  }, null);

  await prisma.event.create({
    data: {
      telegramId: card.telegramId,
      type: 'roadmap_opened',
      metadata: { roadmapId, notified: res.ok, blocked: res.blocked === true },
    },
  }).catch(() => {});

  return res.ok ? 'sent' : 'blocked';
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const entity = body.entity as Entity;
  const op = body.op as 'create' | 'update' | 'delete' | 'share-defaults';

  if (op === 'share-defaults') {
    if (!body.roadmapId) return NextResponse.json({ error: 'Missing roadmapId' }, { status: 400 });
    const shared = await shareDefaults(body.roadmapId as string);
    return NextResponse.json({ ok: true, shared });
  }

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

      // Новая строка в уже открытой карте по умолчанию едет клиенту, если
      // попадает в базовый набор. Иначе карта тихо расходится с кабинетом:
      // в админке шаг есть, у человека его нет.
      // key метрики в белый список правок не входит, поэтому смотрим и в сырое тело.
      const row = { ...(body.data as Record<string, unknown>), ...data };
      if (!data.visibility && inDefaults(entity, row)) {
        const open = await prisma.roadmap.findUnique({
          where: { id: body.roadmapId as string },
          select: { clientVisible: true },
        });
        if (open?.clientVisible) data.visibility = 'shared';
      }

      // @ts-expect-error union of delegates, all have create
      const created = await model(entity).create({ data: { ...data, roadmapId: body.roadmapId } });
      return NextResponse.json({ ok: true, id: created.id });
    }

    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Отметка «сделано» проставляет дату сама, снятие галочки её убирает.
    if (entity === 'task' && 'status' in data) {
      data.doneAt = data.status === 'done' ? new Date() : null;
    }

    // Уведомление клиенту шлём только на переходе «закрыта → открыта»,
    // иначе каждая правка уже открытой карты била бы человеку в бота.
    const wasVisible =
      entity === 'roadmap' && data.clientVisible === true
        ? (await prisma.roadmap.findUnique({ where: { id: body.id as string }, select: { clientVisible: true } }))
            ?.clientVisible === true
        : false;

    // @ts-expect-error union of delegates, all have update
    await model(entity).update({ where: { id: body.id }, data });

    // Открыли карту клиенту, а внутри всё внутреннее — человек увидит пустой
    // экран из вступления и целей. Так было у Азамата: карта включена 18.08,
    // базовый набор не открыт, «страница не листается». Открываем сами.
    let autoShared = 0;
    let notified: 'sent' | 'blocked' | 'no-telegram' | 'already-open' | null = null;
    if (entity === 'roadmap' && data.clientVisible === true) {
      if ((await sharedRows(body.id as string)) === 0) {
        autoShared = await shareDefaults(body.id as string);
      }
      // Карта открыта, но человек об этом не узнает: раньше он либо получал её
      // простынёй сообщений в боте, либо не получал ничего. Теперь карта живёт
      // в кабинете, а в бот уходит короткое уведомление со ссылкой на раздел.
      notified = await notifyClientRoadmapOpen(body.id as string, wasVisible);
    }

    // Любая правка карты это касание: держим дату свежей без ручного ввода.
    const roadmapId = entity === 'roadmap' ? body.id : body.roadmapId;
    if (roadmapId && !('lastTouchAt' in data)) {
      await prisma.roadmap.update({ where: { id: roadmapId }, data: { lastTouchAt: new Date() } });
    }

    return NextResponse.json({ ok: true, autoShared, notified });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown';
    console.error('roadmap write failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
