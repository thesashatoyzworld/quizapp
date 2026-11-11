// Ежедневно: добрать списания PayPal, которые не дошли вебхуком.
import { NextRequest, NextResponse } from 'next/server';
import { sweepPaypal } from '@/lib/paypal';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const granted = await sweepPaypal().catch((e) => { console.error('[cron-paypal]', e); return -1; });
  return NextResponse.json({ ok: true, granted });
}
