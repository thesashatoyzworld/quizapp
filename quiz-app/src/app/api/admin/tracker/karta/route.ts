import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { runMapAction, type MapAction } from '@/lib/tracker/karta';

export const dynamic = 'force-dynamic';

/** Уровни карты запуска: { action: levelUp | levelDown | seeHint, id, ... }. */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as MapAction | null;
  if (!body?.action || !body.id) return NextResponse.json({ error: 'нет action или id' }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, map: await runMapAction(body) });
  } catch (error) {
    console.error('[Admin Tracker Karta]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
