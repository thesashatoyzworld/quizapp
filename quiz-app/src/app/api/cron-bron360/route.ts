// Бронь 360 раз в день: следующий шаг цепочки листу ожидания (с BRON360_START),
// уникализатор через сутки после брони, оптимизатор на второй неделе. Сводка Саше.
import { NextRequest, NextResponse } from 'next/server';
import { runBronCron } from '@/lib/bron360';
import { notifyAdmin } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const r = await runBronCron();
  const sent = r.chain.reduce((a, b) => a + b, 0);
  if (sent || r.uniq || r.opt || r.blocked) {
    await notifyAdmin(
      `📨 бронь 360 за сегодня: цепочка ${r.chain.map((n, i) => `${i + 1}:${n}`).join(' ')}` +
        `${r.blocked ? `, заблокировали бота ${r.blocked}` : ''}${r.uniq ? `, уникализатор ${r.uniq}` : ''}${r.opt ? `, оптимизатор ${r.opt}` : ''}`,
    ).catch(() => {});
  }
  return NextResponse.json({ ok: true, ...r });
}
