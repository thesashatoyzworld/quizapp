import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getIgThread } from '@/lib/ig-leads';

// Переписка человека — тянется живьём из ChatPlace по клику на строку,
// чтобы не таскать её на каждой синхронизации.
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const chatId = new URL(request.url).searchParams.get('chatId');
  if (!chatId) return NextResponse.json({ error: 'chatId обязателен' }, { status: 400 });

  try {
    return NextResponse.json({ ok: true, messages: await getIgThread(chatId) });
  } catch (e) {
    console.error('[ig-thread]', e);
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
