// ─────────────────────────────────────────────────────────────
// Просмотры выложенных рилсов у всех клиентов лички, раз в день.
//
// Apify на бесплатном тарифе: один запуск на все коды разом, а не по
// клиенту. Что Apify не вернул, остаётся как было (не ноль).
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { lichkaClients, refreshStats } from '@/lib/reels/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const clients = await lichkaClients();
    const res = await refreshStats(clients.map((c) => BigInt(c.telegramId)));
    console.log('[cron-reels-stats]', JSON.stringify({ clients: clients.length, ...res }));
    return NextResponse.json({ ok: true, clients: clients.length, ...res });
  } catch (e) {
    console.error('[cron-reels-stats] упал:', e);
    return NextResponse.json({ ok: false, error: String(e).slice(0, 300) }, { status: 500 });
  }
}
