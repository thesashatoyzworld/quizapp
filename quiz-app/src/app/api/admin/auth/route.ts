import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = body.password || '';

  if (!password) {
    return NextResponse.json({ error: 'missing' }, { status: 400 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }

  const token = createSessionToken('admin');

  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
