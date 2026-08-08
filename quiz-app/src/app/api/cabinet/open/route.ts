import { NextRequest, NextResponse } from 'next/server';
import { verifyTicket, signSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/telegram-login';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Вторая половина перехода из мини-аппа в браузер: меняем короткий билет
// на обычную сессию-cookie и ведём человека на нужную страницу.
//
//   GET /api/cabinet/open?ticket=<билет>&to=/kurs
//
// Билет живёт пять минут. Просрочен или подделан - человек просто попадает
// на вход в кабинет, как будто открыл адрес руками.

const ALLOWED_PATHS = ['/dostup', '/kurs', '/prompty', '/potok', '/razbory', '/sozvony', '/lichnoe', '/formula'];

export async function GET(request: NextRequest) {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
  }

  const to = request.nextUrl.searchParams.get('to') || '/dostup';
  const target = new URL(ALLOWED_PATHS.includes(to) ? to : '/dostup', request.nextUrl.origin);

  const secret = process.env.SESSION_SECRET || botToken;
  const telegramId = verifyTicket(request.nextUrl.searchParams.get('ticket') || undefined, secret);

  if (!telegramId) {
    const dostup = new URL('/dostup', request.nextUrl.origin);
    dostup.searchParams.set('auth', 'expired');
    return NextResponse.redirect(dostup);
  }

  const res = NextResponse.redirect(target);
  res.cookies.set(SESSION_COOKIE, signSession(telegramId, secret), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
