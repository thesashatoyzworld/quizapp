import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { prisma } from '@/lib/prisma';
import { getProductBySlug } from '@/lib/catalog';
import { isEmail } from '@/lib/mail';
import { sendPaidEmail } from '@/lib/paid-email';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

// Через час после оплаты с сайта: если человек так и не зашёл в бота по
// /start paid_<token>, шлём на почту одно напоминание. Второго нет.
export async function POST(request: NextRequest) {
  const signature = request.headers.get('upstash-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 401 });

  const body = await request.text();
  const valid = await receiver
    .verify({ signature, body, url: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/paid-reminder` })
    .catch(() => false);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const { orderId } = JSON.parse(body) as { orderId: string };
  const ev = await prisma.event.findFirst({
    where: { type: 'web_paid', metadata: { path: ['orderId'], equals: orderId } },
    orderBy: { createdAt: 'desc' },
  });
  if (!ev) return NextResponse.json({ ok: true, skipped: 'not found' });

  const meta = (ev.metadata || {}) as { token?: string; email?: string; consumed?: boolean; remindedAt?: string };
  if (meta.consumed) return NextResponse.json({ ok: true, skipped: 'consumed' });
  if (meta.remindedAt) return NextResponse.json({ ok: true, skipped: 'already reminded' });
  if (!isEmail(meta.email) || !meta.token) return NextResponse.json({ ok: true, skipped: 'no email' });

  const product = getProductBySlug(ev.productSlug || '');
  const sent = await sendPaidEmail({
    kind: 'reminder',
    to: meta.email,
    token: meta.token,
    productSlug: ev.productSlug || '',
    productName: product?.name || 'Оплата',
  });
  if (sent) {
    await prisma.event.update({
      where: { id: ev.id },
      data: { metadata: { ...meta, remindedAt: new Date().toISOString() } },
    });
  }

  return NextResponse.json({ ok: true, reminded: sent });
}
