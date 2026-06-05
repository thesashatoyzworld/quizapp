import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveAccessByTelegram } from '@/lib/access';
import { getRoom } from '@/content/rooms';

// Комнаты, открытые конкретному человеку.
//   ?telegramId=<id>        — заход из Telegram (кабинет-мини-апп)
//   ?token=<token>          — заход с сайта после оплаты картой (mkdengi_web_<token>)
//
// Возвращает только активные доступы. Если по токену доступа ещё нет —
// pending:true (вебхук Продамуса не успел долететь), фронт просит обновить.
export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId');
    const token = request.nextUrl.searchParams.get('token');
    const now = new Date();

    let accesses: { productSlug: string; role: string; expiresAt: Date | null }[] = [];
    let pending = false;

    if (telegramId) {
      const rows = await getActiveAccessByTelegram(Number(telegramId));
      accesses = rows.map((r) => ({ productSlug: r.productSlug, role: r.role, expiresAt: r.expiresAt }));
    } else if (token) {
      const row = await prisma.productAccess.findFirst({
        where: { source: `mkdengi_web_${token}`, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
      if (!row) {
        pending = true;
      } else if (!row.expiresAt || row.expiresAt > now) {
        accesses = [{ productSlug: row.productSlug, role: row.role, expiresAt: row.expiresAt }];
      }
    } else {
      return NextResponse.json({ success: false, error: 'telegramId or token required' }, { status: 400 });
    }

    const rooms = accesses
      .map((a) => {
        const room = getRoom(a.role);
        if (!room) return null;
        return { ...room, expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, rooms, pending });
  } catch (error) {
    console.error('[Cabinet] rooms error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
