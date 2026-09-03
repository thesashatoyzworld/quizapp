import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { sendAs } from '@/lib/sales/tg';

// Отправить человеку ответ из кабинета — от имени рабочего аккаунта, а не
// от бота: в переписке это выглядит как обычное сообщение Саши.
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chatId, text } = await request.json();
  if (!chatId || typeof chatId !== 'string') {
    return NextResponse.json({ error: 'chatId обязателен' }, { status: 400 });
  }
  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'текст пустой' }, { status: 400 });
  }

  const res = await sendAs(chatId, text.slice(0, 4000));
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });

  return NextResponse.json({ ok: true });
}
