// Ежедневно: добрать оплаченные криптой счета, которые не дошли вебхуком,
// и разослать счета на продление тем, у кого крипто-доступ кончается за 3 дня.
import { NextRequest, NextResponse } from 'next/server';
import { sweepPaid, sendRenewals } from '@/lib/cryptopay';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const granted = await sweepPaid().catch((e) => { console.error('[cron-cryptopay] sweep', e); return -1; });
  const renewals = await sendRenewals().catch((e) => { console.error('[cron-cryptopay] renew', e); return -1; });
  return NextResponse.json({ ok: true, granted, renewals });
}
