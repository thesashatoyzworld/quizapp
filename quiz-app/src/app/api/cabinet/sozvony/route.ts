import { NextRequest, NextResponse } from 'next/server';
import { getActiveAccessByTelegram } from '@/lib/access';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { SOZVONY, SOZVONY_MIN_TIER, SOZVONY_ROLE, findSozvon, toCard } from '@/content/sozvony';
import { playerSrc, videoBridge } from '@/lib/cabinet-video';

export const runtime = 'nodejs';

// Записи групповых созвонов отдаём только с сервера и только тарифам 2-3:
// на встрече разбирают личные ситуации участников, в клиентский бандл это не кладём.
//
//   GET /api/cabinet/sozvony                  → список карточек
//   GET /api/cabinet/sozvony?slug=<slug>      → HTML конспекта
//
// Опознание как в /api/cabinet/razbory: ?telegramId из Mini App initData,
// иначе подписанная сессия-cookie после Telegram Login Widget.

// Тариф зашит в productSlug суффиксом -t<N> (uroven-t1 / uroven-t2 / uroven-t3).
function tierFromSlug(slug: string): number | null {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : null;
}

/** Плеер записи. Пустой kinescopeId = записи ещё нет. */
function videoBlock(kinescopeId: string): string {
  if (!kinescopeId) {
    return '<div class="rz-video rz-video-soon">Запись созвона появится здесь</div>';
  }
  return (
    '<div class="rz-video"><iframe src="' + playerSrc(kinescopeId) + '" ' +
    'allow="autoplay; fullscreen; picture-in-picture; encrypted-media;" allowfullscreen ' +
    'frameborder="0" title="Запись созвона"></iframe></div>'
  );
}

const VIDEO_CSS = `
<style>
  .rz-video{position:relative;width:100%;aspect-ratio:16/9;margin:22px 0 6px;
    border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#000}
  .rz-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .rz-video-soon{display:flex;align-items:center;justify-content:center;background:var(--chip);
    color:var(--muted);font-size:14px;font-weight:600;aspect-ratio:16/6}
</style>`;

export async function GET(request: NextRequest) {
  try {
    // Превью вёрстки при локальной разработке. На Vercel NODE_ENV=production,
    // так что в проде ветка мертва.
    const devPreview = process.env.NODE_ENV !== 'production'
      && request.nextUrl.searchParams.get('preview') === '1';

    let telegramId: number | null = null;
    const qId = request.nextUrl.searchParams.get('telegramId');
    if (qId && /^\d+$/.test(qId)) {
      telegramId = Number(qId);
    } else {
      const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
      telegramId = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
    }

    if (!telegramId && !devPreview) {
      return NextResponse.json({ success: true, identified: false, allowed: false, tier: 0, items: [] });
    }

    const rows = telegramId ? await getActiveAccessByTelegram(telegramId) : [];
    const tier = devPreview
      ? SOZVONY_MIN_TIER
      : rows
          .filter((r) => r.role === SOZVONY_ROLE)
          .reduce((max, r) => Math.max(max, tierFromSlug(r.productSlug) ?? 0), 0);
    const allowed = tier >= SOZVONY_MIN_TIER;

    if (!allowed) {
      return NextResponse.json({ success: true, identified: true, allowed: false, tier, items: [] });
    }

    const slug = request.nextUrl.searchParams.get('slug');
    if (slug) {
      const sozvon = findSozvon(slug);
      if (!sozvon) {
        return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      }
      const html = sozvon.html
        .replace('<!--VIDEO_SLOT-->', videoBlock(sozvon.kinescopeId))
        .replace('</head>', VIDEO_CSS + videoBridge('sozvony', sozvon.slug) + '</head>');
      return NextResponse.json({ success: true, identified: true, allowed: true, tier, html });
    }

    return NextResponse.json({
      success: true,
      identified: true,
      allowed: true,
      tier,
      items: SOZVONY.map(toCard),
    });
  } catch (error) {
    console.error('[Cabinet] sozvony error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
