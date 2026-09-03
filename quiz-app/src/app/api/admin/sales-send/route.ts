import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { sendAs } from '@/lib/sales/tg';
import { readySuggestion } from '@/lib/sales/dialogs';

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

  const body = text.slice(0, 4000);

  // Что предлагали до правки — берём до отправки: сразу после неё подсказка
  // помечается отправленной и перестанет находиться.
  const ready = await readySuggestion(chatId);

  const res = await sendAs(chatId, body);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });

  if (ready) {
    await prisma.tgSuggestion.update({ where: { id: ready.id }, data: { sentAt: new Date() } });

    // Правку запоминаем: разница между предложенным и отправленным — то
    // единственное, на чём помощник сейчас может учиться.
    if (ready.message.trim() !== body.trim()) {
      await prisma.salesCorrection.create({
        data: { id: randomUUID(), chatId, suggested: ready.message, sent: body },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
