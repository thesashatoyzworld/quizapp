import { NextRequest, NextResponse } from 'next/server';
import { getActiveAccessByTelegram } from '@/lib/access';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { LESSONS, KURS_MIN_TIER, KURS_ROLE, findLesson, toCard } from '@/content/kurs';

export const runtime = 'nodejs';

// ⚠️ ВРЕМЕННО: секрет ревью-ссылки для Саши, снять перед мёржем в master.
const PREVIEW_SECRET = 'kurs-2026-sasha';

// Уроки курса «Новый уровень контента» отдаём только с сервера и только тем,
// у кого активен доступ: статья это и есть продукт, в клиентский бандл её не кладём.
//
//   GET /api/cabinet/kurs                 → список уроков
//   GET /api/cabinet/kurs?slug=<slug>     → HTML статьи с вшитым плеером
//
// Опознание как в /api/cabinet/razbory: ?telegramId из Mini App initData,
// иначе подписанная сессия-cookie после Telegram Login Widget.

// Тариф зашит в productSlug суффиксом -t<N> (uroven-t1 / uroven-t2 / uroven-t3).
function tierFromSlug(slug: string): number | null {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : null;
}

/** Плеер урока. Пустой kinescopeId = запись ещё не выложена. */
function videoBlock(kinescopeId: string, watermark: string): string {
  if (!kinescopeId) {
    return '<div class="kv kv-soon">Запись этого урока появится здесь</div>';
  }
  // Вотермарк — Telegram-метка зрителя, тумблер включён в дашборде Kinescope.
  const src = 'https://kinescope.io/embed/' + encodeURIComponent(kinescopeId)
    + (watermark ? '?watermark=' + encodeURIComponent(watermark) : '');
  return (
    '<div class="kv"><iframe src="' + src + '" '
    + 'allow="autoplay; fullscreen; picture-in-picture; encrypted-media;" allowfullscreen '
    + 'frameborder="0" title="Видеоурок"></iframe></div>'
  );
}

// Стиль плеера под системную вёрстку статей: та же колонка 620, жёсткая рамка,
// offset-тень и оранжевый акцент.
const VIDEO_CSS = `
<style>
  .kvwrap{max-width:620px;margin:0 auto;padding:30px 24px 4px;}
  .kvlabel{font-family:"Courier New",Courier,monospace;font-size:12px;letter-spacing:.14em;
    text-transform:uppercase;color:#e8590c;font-weight:bold;margin-bottom:10px;}
  .kv{position:relative;width:100%;aspect-ratio:16/9;background:#000;
    border:1px solid #000;box-shadow:6px 6px 0 #e8590c;}
  .kv iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}
  .kv-soon{display:flex;align-items:center;justify-content:center;aspect-ratio:16/5;
    background:#f5f5f5;border:1px dashed #999;box-shadow:none;color:#666;font-size:17px;}
  .kvnote{font-size:15px;color:#666;margin:12px 0 0;line-height:1.45;}
  @media(max-width:640px){.kvwrap{padding:22px 16px 4px;}.kv{box-shadow:4px 4px 0 #e8590c;}}
</style>`;

export async function GET(request: NextRequest) {
  try {
    // Превью вёрстки при локальной разработке. На Vercel NODE_ENV=production,
    // так что в проде ветка мертва.
    const q = request.nextUrl.searchParams.get('preview');
    const devPreview = process.env.NODE_ENV !== 'production' && q === '1';

    // ⚠️ ВРЕМЕННО: ссылка Саше на ревью до открытия курса. Работает только на
    // превью-деплоях Vercel — на боевых доменах курс всё равно за гейтом.
    // УБРАТЬ перед мёржем в master.
    const host = request.headers.get('host') || '';
    const reviewLink = q === PREVIEW_SECRET && host.endsWith('.vercel.app');

    const bypass = devPreview || reviewLink;

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
      ? KURS_MIN_TIER
      : rows
          .filter((r) => r.role === KURS_ROLE)
          .reduce((max, r) => Math.max(max, tierFromSlug(r.productSlug) ?? 0), 0);
    const allowed = tier >= KURS_MIN_TIER;

    if (!allowed) {
      return NextResponse.json({ success: true, identified: true, allowed: false, tier, items: [] });
    }

    const slug = request.nextUrl.searchParams.get('slug');
    if (slug) {
      const lesson = findLesson(slug);
      if (!lesson || !lesson.html) {
        return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      }
      // Метка вотермарка приходит с клиента (там доступен initData с username).
      const wm = (request.nextUrl.searchParams.get('wm') || '').slice(0, 64);
      const player = '<div class="kvwrap"><div class="kvlabel">Видеоурок · '
        + (lesson.duration || 'скоро') + '</div>'
        + videoBlock(lesson.kinescopeId, wm)
        + '<p class="kvnote">Ниже — тот же урок текстом, с картинками и разборами. '
        + 'Смотреть или читать, как удобнее.</p></div>';
      const html = lesson.html
        .replace('<!--VIDEO_SLOT-->', player)
        .replace('</head>', VIDEO_CSS + '</head>');
      return NextResponse.json({ success: true, identified: true, allowed: true, tier, html });
    }

    return NextResponse.json({
      success: true,
      identified: true,
      allowed: true,
      tier,
      items: LESSONS.map(toCard),
    });
  } catch (e) {
    console.error('[cabinet/kurs]', e);
    return NextResponse.json({ success: false, error: 'server error' }, { status: 500 });
  }
}
