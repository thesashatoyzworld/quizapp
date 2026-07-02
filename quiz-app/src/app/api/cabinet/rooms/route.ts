import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveAccessByTelegram } from '@/lib/access';

// Какие платные разделы открыты человеку. Три способа опознать:
//   ?telegramId=<id>  — заход из Telegram
//   ?token=<token>    — ссылка после оплаты картой (<prefix>_web_<token>)
//   ?email=<email>    — «закрыл ссылку» → вход по почте, которой платил
//
// Токен/почта работают для любого продукта: источник доступа всегда
// оканчивается на `_web_<token>`, а событие оплаты картой — тип web_paid
// (mk_web_paid — легаси, тоже учитываем).
//
// Возвращает unlockedRoles + token (если опознали — фронт сохранит в браузере,
// чтобы дальше открывалось само). pending:true — оплата по токену ещё в пути.
export async function GET(request: NextRequest) {
  try {
    const telegramId = request.nextUrl.searchParams.get('telegramId');
    const token = request.nextUrl.searchParams.get('token');
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
    const now = new Date();

    let unlockedRoles: string[] = [];
    let pending = false;
    let foundToken: string | null = null;

    if (telegramId) {
      const rows = await getActiveAccessByTelegram(Number(telegramId));
      unlockedRoles = rows.map((r) => r.role);
    } else if (token) {
      const rows = await prisma.productAccess.findMany({
        where: { source: { endsWith: `_web_${token}` }, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
      if (!rows.length) pending = true;
      else {
        unlockedRoles = rows.filter((r) => !r.expiresAt || r.expiresAt > now).map((r) => r.role);
        if (unlockedRoles.length) foundToken = token;
      }
    } else if (email) {
      // Вход по почте: ищем оплату картой с этой почтой → её токен → доступ.
      const ev = await prisma.event.findFirst({
        where: { type: { in: ['web_paid', 'mk_web_paid'] }, metadata: { path: ['email'], equals: email } },
        orderBy: { createdAt: 'desc' },
      });
      const evToken = ev ? (ev.metadata as { token?: string } | null)?.token : undefined;
      if (evToken) {
        const rows = await prisma.productAccess.findMany({
          where: { source: { endsWith: `_web_${evToken}` }, status: 'active' },
          orderBy: { createdAt: 'desc' },
        });
        unlockedRoles = rows.filter((r) => !r.expiresAt || r.expiresAt > now).map((r) => r.role);
        if (unlockedRoles.length) foundToken = evToken;
      }
    }

    return NextResponse.json({ success: true, unlockedRoles, pending, token: foundToken });
  } catch (error) {
    console.error('[Cabinet] rooms error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
