import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { forTelegram, findForTelegram, toCard } from '@/content/lichnoe';

export const runtime = 'nodejs';

// Личные материалы — записи персональных созвонов. Гейт строго по человеку:
// материал видит только тот telegram id, который вписан в его telegramIds.
// Тариф и роль здесь ничего не открывают: чужой личный созвон не должен
// доставаться никому, включая тариф 3.
//
//   GET /api/cabinet/lichnoe               → список карточек этого человека
//   GET /api/cabinet/lichnoe?slug=<slug>   → HTML конспекта, если материал его
//
// Опознание как в /api/cabinet/razbory: ?telegramId из Mini App initData,
// иначе подписанная сессия-cookie после Telegram Login Widget.

/** Плеер записи. Пустой kinescopeId = записи ещё нет. */
function videoBlock(kinescopeId: string): string {
  if (!kinescopeId) {
    return '<div class="rz-video rz-video-soon">Запись созвона появится здесь</div>';
  }
  return (
    '<div class="rz-video"><iframe src="https://kinescope.io/embed/' + kinescopeId + '" ' +
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
    let telegramId: number | null = null;
    const qId = request.nextUrl.searchParams.get('telegramId');
    if (qId && /^\d+$/.test(qId)) {
      telegramId = Number(qId);
    } else {
      const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
      telegramId = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
    }

    if (!telegramId) {
      return NextResponse.json({ success: true, identified: false, items: [] });
    }

    const slug = request.nextUrl.searchParams.get('slug');
    if (slug) {
      // Материал не его → 404, а не 403: чужого здесь для него не существует.
      const material = findForTelegram(slug, telegramId);
      if (!material) {
        return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      }
      const html = material.html
        .replace('<!--VIDEO_SLOT-->', videoBlock(material.kinescopeId))
        .replace('</head>', VIDEO_CSS + '</head>');
      return NextResponse.json({ success: true, identified: true, html });
    }

    return NextResponse.json({
      success: true,
      identified: true,
      items: forTelegram(telegramId).map(toCard),
    });
  } catch (error) {
    console.error('[Cabinet] lichnoe error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
