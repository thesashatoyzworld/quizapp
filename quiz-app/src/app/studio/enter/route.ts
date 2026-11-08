// Personal entry link: /studio/enter?k=<key> → studio_session cookie → /studio.
// The key is the same one Danya uses for MCP.

import { NextRequest, NextResponse } from 'next/server';
import { actorForKey, createStudioSession, SESSION_MAX_AGE, STUDIO_COOKIE } from '@/lib/studio/keys';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const actor = actorForKey(request.nextUrl.searchParams.get('k'));
  const session = actor && createStudioSession(actor);
  if (!session) return new NextResponse('Ссылка не подходит. Попроси у Саши новую.', { status: 401 });
  const res = NextResponse.redirect(new URL('/studio', request.url));
  res.cookies.set(STUDIO_COOKIE, session, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE,
  });
  return res;
}
