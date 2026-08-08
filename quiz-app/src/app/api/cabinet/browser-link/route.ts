import { NextRequest, NextResponse } from 'next/server';
import { verifyInitData, signTicket } from '@/lib/telegram-login';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Переход из мини-аппа в обычный браузер.
//
// В Телеграме человек уже опознан, а в браузере — нет, и его встречает экран
// входа. Чтобы не заставлять логиниться заново, мини-апп просит здесь ссылку
// с коротким билетом, а браузер меняет билет на сессию в /api/cabinet/open.
//
//   POST { initData, path? } → { url }
//
// Билет выдаётся ТОЛЬКО по подписанной initData: id из initDataUnsafe на клиенте
// не подписан, по нему можно было бы выпросить доступ к чужому кабинету.

const ALLOWED_PATHS = ['/dostup', '/kurs', '/prompty', '/potok', '/razbory', '/sozvony', '/lichnoe', '/formula'];

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ success: false, error: 'server misconfigured' }, { status: 500 });
    }

    const body = (await request.json()) as { initData?: string; path?: string };
    const telegramId = verifyInitData(body.initData || '', botToken);
    if (!telegramId) {
      return NextResponse.json({ success: false, error: 'unverified' }, { status: 401 });
    }

    // Возвращаем человека на ту же страницу, с которой он нажал кнопку.
    // Список закрытый, чтобы ссылку нельзя было увести на чужой адрес.
    const path = body.path && ALLOWED_PATHS.includes(body.path) ? body.path : '/dostup';

    const secret = process.env.SESSION_SECRET || botToken;
    const ticket = signTicket(telegramId, secret);

    const url = new URL('/api/cabinet/open', request.nextUrl.origin);
    url.searchParams.set('ticket', ticket);
    url.searchParams.set('to', path);

    return NextResponse.json({ success: true, url: url.toString() });
  } catch (e) {
    console.error('[cabinet/browser-link]', e);
    return NextResponse.json({ success: false, error: 'server error' }, { status: 500 });
  }
}
