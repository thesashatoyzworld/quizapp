import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramAuth, isAdminUser, createSessionToken, TelegramAuthData } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const authData: TelegramAuthData = {
    id: searchParams.get('id') || '',
    first_name: searchParams.get('first_name') || undefined,
    last_name: searchParams.get('last_name') || undefined,
    username: searchParams.get('username') || undefined,
    photo_url: searchParams.get('photo_url') || undefined,
    auth_date: searchParams.get('auth_date') || '',
    hash: searchParams.get('hash') || '',
  };

  if (!authData.id || !authData.auth_date || !authData.hash) {
    return NextResponse.redirect(new URL('/admin?error=missing', request.url));
  }

  // Check auth_date is fresh (within 1 hour)
  const authAge = Date.now() / 1000 - parseInt(authData.auth_date, 10);
  if (authAge > 3600) {
    return NextResponse.redirect(new URL('/admin?error=expired', request.url));
  }

  if (!verifyTelegramAuth(authData)) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url));
  }

  if (!isAdminUser(authData.id, authData.username)) {
    // Redirect with actual id for debugging
    return NextResponse.redirect(new URL(`/admin?error=forbidden&uid=${authData.id}&un=${authData.username || ''}`, request.url));
  }

  const token = createSessionToken(authData.id);

  const response = NextResponse.redirect(new URL('/admin/dashboard', request.url));
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
