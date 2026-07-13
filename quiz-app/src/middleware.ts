import { NextRequest, NextResponse } from 'next/server';

// world.thesashatoyz.com — публичная дверь кабинета.
// Заход в корень world.* отдаёт страницу кабинета /dostup (rewrite, URL остаётся
// чистым). Любой другой хост (quiz.*) проходит как обычно — там квиз/бот/админка.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  if (host.startsWith('world.') && pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/dostup';
    return NextResponse.rewrite(url);
  }

  // Гейт админки: нет сессии → на логин, но с возвратом на запрошенную страницу
  // (?next=...). Полную подпись куки валидирует layout; тут только наличие.
  if (pathname.startsWith('/admin/') && !req.cookies.get('admin_session')) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = `next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path+'],
};
