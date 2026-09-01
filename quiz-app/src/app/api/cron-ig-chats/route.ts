// ─────────────────────────────────────────────────────────────
// Сбор ников из инста-директа, дважды в день.
//
// Помощник в продажах ищет человека по нику, а список чатов ChatPlace ников
// не отдаёт — только имена. Ник лежит в карточке чата, и карточки под
// нагрузкой отвечают 429: Cloudflare просит ждать тридцать секунд. Поймали на
// живом, когда помощник искал человека прямо во время вопроса и молча никого
// не находил.
//
// Поэтому ники собираются заранее и понемногу, а в момент вопроса помощник
// делает один запрос к нашей базе. Крон живёт на серверах Vercel
// (vercel.json), а не на машине Саши.
//
// За заход берём ограниченное число карточек: в облаке важнее уложиться в
// отведённое функции время, чем собрать всех разом. Новых людей приходит
// около сорока в день, двух заходов хватает с запасом.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { syncIgChats } from '@/lib/sales/chats-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const res = await syncIgChats({ chats: 400, budget: 60 });
    console.log('[cron-ig-chats]', JSON.stringify(res));
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    console.error('[cron-ig-chats] упал:', e);
    return NextResponse.json({ ok: false, error: String(e).slice(0, 300) }, { status: 500 });
  }
}
