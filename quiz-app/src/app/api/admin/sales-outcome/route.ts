import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { isOutcome, setOutcome, wakeDate } from '@/lib/sales/outcome';

// Пометить, чем кончился разговор: думает (и когда вернуться) или слился.
//
// Пустой outcome снимает пометку и возвращает человека в очередь. Оплату сюда
// не шлют: она считается по выданному доступу.
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chatId, outcome, days, reason } = await request.json();
  if (typeof chatId !== 'string' || !chatId) {
    return NextResponse.json({ error: 'chatId обязателен' }, { status: 400 });
  }
  if (outcome !== null && outcome !== undefined && !isOutcome(outcome)) {
    return NextResponse.json({ error: 'Bad outcome' }, { status: 400 });
  }

  const mark = await setOutcome(chatId, outcome ?? null, {
    reason: typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 500) : null,
    wakeAt: Number.isFinite(Number(days)) ? wakeDate(Number(days)) : undefined,
    by: session.userId,
  });

  return NextResponse.json({
    ok: true,
    outcome: mark?.outcome ?? null,
    wakeAt: mark?.wakeAt?.toISOString() ?? null,
  });
}
