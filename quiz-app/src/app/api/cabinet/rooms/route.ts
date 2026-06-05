import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveAccessByTelegram } from '@/lib/access';

// Какие платные разделы открыты человеку.
//   ?telegramId=<id>  — заход из Telegram
//   ?token=<token>    — заход с сайта после оплаты картой (mkdengi_web_<token>)
//
// Возвращает unlockedRoles — роли активных доступов. Сам список разделов
// (включая замкнутые и бесплатные) рисует фронт из content/rooms.ts.
// pending:true — оплата по токену ещё не долетела вебхуком.
export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId');
    const token = request.nextUrl.searchParams.get('token');
    const now = new Date();

    let unlockedRoles: string[] = [];
    let pending = false;

    if (telegramId) {
      const rows = await getActiveAccessByTelegram(Number(telegramId));
      unlockedRoles = rows.map((r) => r.role);
    } else if (token) {
      const row = await prisma.productAccess.findFirst({
        where: { source: `mkdengi_web_${token}`, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
      if (!row) pending = true;
      else if (!row.expiresAt || row.expiresAt > now) unlockedRoles = [row.role];
    }
    // нет ни token, ни telegramId → пустой набор (гость видит только бесплатное)

    return NextResponse.json({ success: true, unlockedRoles, pending });
  } catch (error) {
    console.error('[Cabinet] rooms error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
