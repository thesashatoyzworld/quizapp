import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Маршрутная карта глазами клиента. Гейт строго по человеку: карта находится
// по telegram_id, тариф и роль здесь ничего не открывают — чужая карта не
// должна доставаться никому.
//
// Два замка, оба обязательны:
//   1. roadmap.clientVisible — Саша сам решает, когда карта готова к показу;
//   2. visibility = 'shared' на каждой строке — внутренние диагнозы, риски и
//      задачи Саши остаются в админке и в клиентский ответ не попадают.
//
//   GET  /api/cabinet/roadmap  → { identified, hasRoadmap, card }
//   POST /api/cabinet/roadmap  → отметить свою задачу сделанной / снять отметку
//
// Опознание как в /api/cabinet/lichnoe: ?telegramId из Mini App initData,
// иначе подписанная сессия-cookie после Telegram Login Widget.

const SHARED = 'shared';

/** Кто смотрит: id из Mini App initData, иначе подписанная сессия-cookie. */
function viewerId(request: NextRequest, bodyId?: unknown): number | null {
  const raw = request.nextUrl.searchParams.get('telegramId') ?? (bodyId != null ? String(bodyId) : null);
  if (raw && /^\d+$/.test(raw)) return Number(raw);
  const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
  return verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
}

/** Дата в «17 августа» — без года, карта живёт в текущем периоде. */
function ru(date: Date | null): string {
  if (!date) return '';
  const M = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date.getDate()} ${M[date.getMonth()]}`;
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = viewerId(request);

    if (!telegramId) {
      return NextResponse.json({ success: true, identified: false, hasRoadmap: false, card: null });
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: {
        telegramId: BigInt(telegramId),
        clientVisible: true,
        archived: false,
      },
      include: {
        metrics: { where: { visibility: SHARED }, orderBy: { position: 'asc' } },
        steps: { where: { visibility: SHARED }, orderBy: { position: 'asc' } },
        tasks: { where: { visibility: SHARED }, orderBy: { position: 'asc' } },
        notes: { where: { visibility: SHARED }, orderBy: { happenedOn: 'desc' } },
      },
    });

    if (!roadmap) {
      return NextResponse.json({ success: true, identified: true, hasRoadmap: false, card: null });
    }

    // Ступень, на которой человек стоит: первая незакрытая. Если закрыты все —
    // подсвечивать нечего, карта пройдена.
    const currentStep = roadmap.steps.find((s) => s.status !== 'done')?.position ?? null;

    return NextResponse.json({
      success: true,
      identified: true,
      hasRoadmap: true,
      card: {
        clientName: roadmap.clientName,
        intro: roadmap.clientIntro || '',
        goal: roadmap.goal || '',
        periodGoal: roadmap.periodGoal || '',
        currentStep,
        metrics: roadmap.metrics.map((m) => ({
          key: m.key,
          label: m.label,
          startValue: m.startValue || '',
          currentValue: m.currentValue || '',
          unit: m.unit || '',
        })),
        steps: roadmap.steps.map((s) => ({
          position: s.position,
          title: s.title,
          status: s.status,
          evidence: s.evidence || '',
        })),
        tasks: roadmap.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          why: t.why || '',
          owner: t.owner,
          status: t.status,
          dueOn: ru(t.dueOn),
          linkUrl: t.linkUrl || '',
          linkLabel: t.linkLabel || '',
        })),
        notes: roadmap.notes.map((n) => ({
          kind: n.kind,
          body: n.body,
          happenedOn: ru(n.happenedOn),
        })),
      },
    });
  } catch (error) {
    console.error('[Cabinet] roadmap error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Клиент отмечает свой шаг сделанным. Меняем только собственные задачи
// (owner = client) в собственной открытой карте: id задачи из чужой карты
// ничего не даст, потому что связь проверяется до записи.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const telegramId = viewerId(request, body?.telegramId);
    if (!telegramId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const taskId = typeof body?.taskId === 'string' ? body.taskId : '';
    const status = body?.status === 'done' ? 'done' : 'todo';
    if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });

    const task = await prisma.roadmapTask.findFirst({
      where: {
        id: taskId,
        owner: 'client',
        visibility: SHARED,
        roadmap: { telegramId: BigInt(telegramId), clientVisible: true, archived: false },
      },
      select: { id: true, roadmapId: true },
    });
    // Чужая задача для него не существует: 404, а не 403.
    if (!task) return NextResponse.json({ error: 'not found' }, { status: 404 });

    await prisma.roadmapTask.update({
      where: { id: task.id },
      data: { status, doneAt: status === 'done' ? new Date() : null },
    });
    // Отметка клиента — тоже касание карты: Саша видит в админке свежую дату.
    await prisma.roadmap.update({
      where: { id: task.roadmapId },
      data: { lastTouchAt: new Date() },
    });

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error('[Cabinet] roadmap task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
