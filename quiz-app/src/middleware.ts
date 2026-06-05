import { NextRequest, NextResponse } from 'next/server';

// world.thesashatoyz.com — публичная дверь кабинета.
// Заход в корень world.* отдаёт страницу кабинета /dostup (rewrite, URL остаётся
// чистым). Любой другой хост (quiz.*) проходит как обычно — там квиз/бот/админка.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host.startsWith('world.') && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/dostup';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
