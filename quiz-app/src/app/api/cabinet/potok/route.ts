import { NextRequest, NextResponse } from 'next/server';
import { getActiveAccessByTelegram } from '@/lib/access';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { POTOK_FILES, POTOK_ROLE, POTOK_MIN_TIER } from '@/content/potok';

export const runtime = 'nodejs';

// Раздача «Поток спроса» — методичка по поиску рабочих заходов и правила для Claude.
// Материал платный, поэтому файлы не лежат в public: их отдаёт этот роут после
// проверки доступа, как статьи уроков.
//
//   GET /api/cabinet/potok             → список файлов без содержимого
//   GET /api/cabinet/potok?file=<key>  → сам файл на скачивание
//   GET /api/cabinet/potok?view=html   → методичка для просмотра в iframe
//
// Опознание как в /api/cabinet/kurs: ?telegramId из Mini App initData,
// иначе подписанная сессия-cookie после Telegram Login Widget.

// Тариф зашит в productSlug суффиксом -t<N> (uroven-t1 / uroven-t2 / uroven-t3).
function tierFromSlug(slug: string): number | null {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : null;
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('preview');
    const bypass = process.env.NODE_ENV !== 'production' && q === '1';

    let telegramId: number | null = null;
    const qId = request.nextUrl.searchParams.get('telegramId');
    if (qId && /^\d+$/.test(qId)) {
      telegramId = Number(qId);
    } else {
      const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
      telegramId = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
    }

    if (!telegramId && !bypass) {
      return NextResponse.json({ success: true, identified: false, allowed: false, tier: 0, items: [] });
    }

    const rows = telegramId ? await getActiveAccessByTelegram(telegramId) : [];
    const tier = bypass
      ? POTOK_MIN_TIER
      : rows
          .filter((r) => r.role === POTOK_ROLE)
          .reduce((max, r) => Math.max(max, tierFromSlug(r.productSlug) ?? 0), 0);
    const allowed = tier >= POTOK_MIN_TIER;

    if (!allowed) {
      return NextResponse.json({ success: true, identified: true, allowed: false, tier, items: [] });
    }

    // Методичка для просмотра прямо на странице. Отдаём как есть, одним файлом:
    // вёрстка внутри и рассчитана на самодостаточный документ.
    const view = request.nextUrl.searchParams.get('view');
    if (view === 'html') {
      const f = POTOK_FILES.find((x) => x.key === 'html');
      if (!f) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return new NextResponse(Buffer.from(f.b64, 'base64'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
      });
    }

    const key = request.nextUrl.searchParams.get('file');
    if (key) {
      const f = POTOK_FILES.find((x) => x.key === key);
      if (!f) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      const body = Buffer.from(f.b64, 'base64');
      // Имя файла кириллицей: ASCII-фолбэк плюс filename* по RFC 5987,
      // иначе Telegram и часть браузеров портят имя (см. lessons_tg-bot-api-filename-utf8).
      const ascii = f.key === 'zip' ? 'potok-sprosa.zip' : f.key === 'html' ? 'instrukciya.html' : 'pravila-dlya-claude.txt';
      return new NextResponse(body, {
        headers: {
          'Content-Type': f.mime,
          'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(f.name)}`,
          'Content-Length': String(body.length),
          'Cache-Control': 'private, no-store',
        },
      });
    }

    return NextResponse.json({
      success: true,
      identified: true,
      allowed: true,
      tier,
      items: POTOK_FILES.map(({ key, name, label, note, bytes }) => ({ key, name, label, note, bytes })),
    });
  } catch (e) {
    console.error('[cabinet/potok]', e);
    return NextResponse.json({ success: false, error: 'server error' }, { status: 500 });
  }
}
