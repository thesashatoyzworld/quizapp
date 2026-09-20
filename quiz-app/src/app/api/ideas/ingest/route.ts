import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { scheduleIdeaAssemble } from '@/lib/qstash';
import { batchKeyOf } from '@/lib/ideas/batch';
import { IDEA_BATCH_WINDOW_MS, type IngestMessage } from '@/lib/ideas/types';

export const runtime = 'nodejs';

const SECRET = (process.env.IDEAS_INGEST_SECRET || '').trim();

function secretOk(given: string): boolean {
  if (!SECRET || !given || given.length !== SECRET.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(SECRET));
}

export async function POST(req: NextRequest) {
  if (!secretOk(req.headers.get('x-ideas-secret') || '')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let m: IngestMessage;
  try {
    m = (await req.json()) as IngestMessage;
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  if (!m?.chatId || !m?.messageId || !m?.source) {
    return NextResponse.json({ error: 'chatId, messageId and source are required' }, { status: 400 });
  }

  const batchKey = batchKeyOf(m);

  // Повтор того же сообщения (ретрай Telegram, бэкфилл) не плодит строк.
  await prisma.ideaInbox.upsert({
    where: { chatId_messageId: { chatId: String(m.chatId), messageId: m.messageId } },
    create: {
      chatId: String(m.chatId),
      threadId: m.threadId,
      messageId: m.messageId,
      authorId: m.authorId,
      batchKey,
      payload: m as unknown as object,
    },
    update: { payload: m as unknown as object, batchKey },
  });

  await scheduleIdeaAssemble(batchKey, Math.ceil(IDEA_BATCH_WINDOW_MS / 1000));

  return NextResponse.json({ ok: true, buffered: true });
}
