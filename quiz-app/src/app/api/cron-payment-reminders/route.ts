// Ежедневно: напомнить людям о платежах по графику (см. lib/payment-dues.ts).
// Живёт на Vercel (vercel.json), а не на машине Саши: напоминание приходит,
// даже когда ноутбук выключен. ?dry=1 — посчитать, никому не писать.

import { NextRequest, NextResponse } from 'next/server';
import { runPaymentReminders } from '@/lib/payment-dues';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dry = request.nextUrl.searchParams.get('dry') === '1';
    const result = await runPaymentReminders(new Date(), dry);
    return NextResponse.json({ success: true, dry, ...result });
  } catch (error) {
    console.error('[Payment Reminders] Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
