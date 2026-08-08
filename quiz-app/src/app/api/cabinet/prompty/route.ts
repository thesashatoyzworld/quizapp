import { NextRequest, NextResponse } from 'next/server';
import { getActiveAccessByTelegram } from '@/lib/access';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { PROMPTS, PROMPTY_ROLE, PROMPTY_MIN_TIER } from '@/content/prompty';

export const runtime = 'nodejs';

// Промпты курса «Новый уровень контента» — как уроки: отдаём только с сервера
// и только тем, у кого активен доступ. Тексты промптов это и есть продукт,
// в клиентский бандл они не попадают.
//
//   GET /api/cabinet/prompty → все промпты с текстами
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
    // Превью вёрстки при локальной разработке. На Vercel NODE_ENV=production,
    // так что в проде ветка мертва.
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
      ? PROMPTY_MIN_TIER
      : rows
          .filter((r) => r.role === PROMPTY_ROLE)
          .reduce((max, r) => Math.max(max, tierFromSlug(r.productSlug) ?? 0), 0);
    const allowed = tier >= PROMPTY_MIN_TIER;

    if (!allowed) {
      return NextResponse.json({ success: true, identified: true, allowed: false, tier, items: [] });
    }

    return NextResponse.json({ success: true, identified: true, allowed: true, tier, items: PROMPTS });
  } catch (e) {
    console.error('[cabinet/prompty]', e);
    return NextResponse.json({ success: false, error: 'server error' }, { status: 500 });
  }
}
