import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { saveWatchNote } from '@/lib/kontrol';

export const dynamic = 'force-dynamic';

const KEY_RE = /^(tg:\d{3,20}|due:[0-9a-f-]{36})$/;

/** Заметка Саши по человеку в разделе «Деньги на столе». Пустая заметка удаляется. */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { key?: string; note?: string } | null;
  const key = String(body?.key || '');
  const note = String(body?.note ?? '');
  if (!KEY_RE.test(key)) return NextResponse.json({ error: 'неверный ключ' }, { status: 400 });
  if (note.length > 4000) return NextResponse.json({ error: 'заметка длиннее 4000 символов' }, { status: 400 });

  try {
    await saveWatchNote(key, note);
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (error) {
    console.error('[Admin Watch Note]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
