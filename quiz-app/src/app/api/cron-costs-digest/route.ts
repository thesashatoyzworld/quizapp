// Сводка расходов по ссылке — для проверки и для любого прошлого месяца.
//
// Регулярную отправку делает ежедневный крон сбора: первого числа он сам
// присылает итог. Отдельным кроном это было нельзя — аккаунт Vercel Hobby,
// там расписания валидируются жёстко и лишнее роняет деплой целиком.
//
//   /api/cron-costs-digest?month=2026-08

import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlyDigest } from '@/lib/costs/digest';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const month = request.nextUrl.searchParams.get('month') ?? undefined;
  return NextResponse.json(await sendMonthlyDigest(month));
}
