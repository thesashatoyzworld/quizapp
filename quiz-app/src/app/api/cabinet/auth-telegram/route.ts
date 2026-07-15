import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramLogin, signSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/telegram-login';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Telegram Login Widget (data-auth-url) redirects here with the signed user
// data as query params. We verify the signature against the bot token, mint a
// session cookie, and send the user back into the cabinet.
export async function GET(request: NextRequest) {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
  }

  const data: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => { data[k] = v; });

  const { ok, telegramId } = verifyTelegramLogin(data, botToken);
  const dostup = new URL('/dostup', request.nextUrl.origin);
  if (!ok || !telegramId) {
    dostup.searchParams.set('auth', 'failed');
    return NextResponse.redirect(dostup);
  }

  const secret = process.env.SESSION_SECRET || botToken;
  const token = signSession(telegramId, secret);

  const res = NextResponse.redirect(dostup);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
