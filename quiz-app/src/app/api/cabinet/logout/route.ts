import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/telegram-login';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Clears the browser cabinet session so the user can log in again (e.g. under a
// different Telegram account). Redirects back to the cabinet, which then shows
// the login button.
function clear(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/dostup', request.nextUrl.origin));
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}

export const GET = clear;
export const POST = clear;
