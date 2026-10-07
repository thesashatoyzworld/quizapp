import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { runDraft } from '@/lib/group-draft/draft';
import { scheduleGroupDraft } from '@/lib/qstash';

export const runtime = 'nodejs';
// Модель смотрит картинки и pdf: на пачке из восьми слайдов минута не всегда.
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
    .verify({ signature, body, url: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/group-draft` })
    .catch(() => false);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const { key } = JSON.parse(body) as { key: string };
  const res = await runDraft(key);
  if (!res.done) {
    await scheduleGroupDraft(key, res.retryInSec);
    return NextResponse.json({ ok: true, rescheduled: true });
  }
  return NextResponse.json({ ok: true, reason: res.reason });
}
