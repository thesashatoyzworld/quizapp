import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { BadInput, runAction, type TrackerAction } from '@/lib/tracker/actions';
import { listTasks } from '@/lib/tracker/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ tasks: await listTasks() });
}

/** Все правки трекера одной ручкой: { action, ...поля }. Отвечает изменённой задачей. */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as TrackerAction | null;
  if (!body?.action) return NextResponse.json({ error: 'нет action' }, { status: 400 });
  try {
    const task = await runAction(body);
    return NextResponse.json({ ok: true, task });
  } catch (error) {
    if (error instanceof BadInput) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('[Admin Tracker]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
