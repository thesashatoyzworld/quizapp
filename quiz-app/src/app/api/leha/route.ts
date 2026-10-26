import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { runLeha } from '@/lib/leha/run';
import { runLehaDialog } from '@/lib/leha/dialog';
import { scheduleLehaDialog, scheduleLehaDraft } from '@/lib/qstash';

export const runtime = 'nodejs';
export const maxDuration = 300;

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function POST(request: NextRequest) {
  const signature = request.headers.get('upstash-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 401 });

  const body = await request.text();
  const valid = await receiver
    .verify({ signature, body, url: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/leha` })
    .catch(() => false);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const { draftId, dialogChatId } = JSON.parse(body) as { draftId?: string; dialogChatId?: string };

  // Диалог: Лёха ведёт разговор целиком в чатах из LEHA_DIALOG_CHATS.
  if (dialogChatId) {
    const res = await runLehaDialog(dialogChatId);
    if (!res.done) {
      await scheduleLehaDialog(dialogChatId, res.retryInSec);
      return NextResponse.json({ ok: true, rescheduled: true });
    }
    return NextResponse.json({ ok: true, status: res.status });
  }
  if (!draftId) return NextResponse.json({ error: 'no job' }, { status: 400 });

  const res = await runLeha(draftId);
  if (!res.done) {
    await scheduleLehaDraft(draftId, res.retryInSec);
    return NextResponse.json({ ok: true, rescheduled: true });
  }
  return NextResponse.json({ ok: true, status: res.status });
}
