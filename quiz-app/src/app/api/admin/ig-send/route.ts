import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { closeChat, getChat, openChat, sendChatMessage } from '@/lib/chatplace';

// Отправить сообщение в инста-директ прямо из кабинета.
//
// До этого переписка в разделе была только на чтение: ответ приходилось
// копировать руками в инстаграм. Теперь он уходит отсюда, тем же каналом,
// которым отвечают воронки.
//
// Открытый чат — обязательное условие ChatPlace для сообщения оператора, и
// открываем мы его сами в момент отправки. Пока чат открыт, автоматизации
// этому человеку не отвечают, поэтому «вернуть боту» лежит рядом.
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { chatId, text, close } = await request.json().catch(() => ({}));
  if (typeof chatId !== 'string' || !chatId) {
    return NextResponse.json({ error: 'chatId обязателен' }, { status: 400 });
  }

  try {
    // Отдельная кнопка «вернуть боту»: тело без текста ничего не отправляет.
    if (close === true && !text) {
      await closeChat(chatId);
      return NextResponse.json({ ok: true, closed: true });
    }

    const message = typeof text === 'string' ? text.trim() : '';
    if (!message) return NextResponse.json({ error: 'пустое сообщение' }, { status: 400 });

    const chat = await getChat(chatId);
    // type: 1 — у оператора, 2 — у бота. Открываем только закрытый: лишний
    // вызов на открытом чате тратит лимит и ничего не меняет.
    const opened = chat.type !== 1;
    if (opened) await openChat(chatId);

    await sendChatMessage(chatId, message);

    return NextResponse.json({ ok: true, sent: message, opened });
  } catch (e) {
    console.error('[ig-send]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
