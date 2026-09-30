import { NextRequest, NextResponse } from 'next/server';
import { getActiveAccessByTelegram } from '@/lib/access';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { POTOK_FILES } from '@/content/potok';
import { resolvePotokAccess } from '@/content/potok/access';
import { POTOK_STEPS } from '@/content/potok/steps';
import { playerSrc } from '@/lib/cabinet-video';
import { isAdminUser } from '@/lib/admin-auth';
import { potokOffer, stepCtaHtml, STEP_CTA_CSS, STEP_CTA_JS, type PotokOffer } from '@/content/potok/upsell';

export const runtime = 'nodejs';

// Раздача «Поток спроса» — методичка по поиску рабочих заходов и правила для Claude.
// Материал платный, поэтому файлы не лежат в public: их отдаёт этот роут после
// проверки доступа, как статьи уроков.
//
//   GET /api/cabinet/potok             → карта ветки и список файлов без содержимого
//   GET /api/cabinet/potok?file=<key>  → сам файл на скачивание
//   GET /api/cabinet/potok?view=html   → методичка для просмотра в iframe
//   GET /api/cabinet/potok?step=<key>  → статья шага ветки для iframe
//
// Опознание как в /api/cabinet/kurs: ?telegramId из Mini App initData,
// иначе подписанная сессия-cookie после Telegram Login Widget.

// Два входа в ветку: своя роль `potok` (купил за 1 490) и роль курса `uroven`.
// Кто именно вошёл, страница узнаёт из `via`: покупателю трипвайра показываем
// апсейл на курс, ученику курса он не нужен.

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Кнопки «предыдущий / следующий» в конце статьи шага. Дописываются при отдаче,
// а не в генераторе: steps.ts пересобирается из курса и правки там затираются.
// Внутри кабинета статья открыта в iframe: клик сообщает странице, какой шаг
// открыть, чтобы сменился и заголовок просмотрщика. Открытая напрямую статья
// просто переходит по ссылке.
function withStepNav(html: string, key: string, params: URLSearchParams): string {
  const list = POTOK_STEPS.filter((s) => s.html);
  const i = list.findIndex((s) => s.key === key);
  if (i < 0) return html;
  const link = (k: string) => {
    const qs = new URLSearchParams();
    qs.set('step', k);
    for (const p of ['telegramId', 'preview']) {
      const v = params.get(p);
      if (v) qs.set(p, v);
    }
    return `/api/cabinet/potok?${qs}`;
  };
  const prev = list[i - 1];
  const next = list[i + 1];
  const a = (cls: string, label: string, title: string, step: string) =>
    `<a class="${cls}" href="${step ? esc(link(step)) : '/potok'}" data-step="${step}">` +
    `<span class="k">${label}</span><span class="n">${esc(title)}</span></a>`;
  const nav =
    `<nav class="lvlnav potok-nav">` +
    (prev ? a('prev', '‹ Предыдущий шаг', prev.title, prev.key) : '') +
    (next ? a('next', 'Следующий шаг ›', next.title, next.key) : a('next', 'Это последний шаг', 'К списку шагов', '')) +
    `</nav>` +
    `<script>document.querySelectorAll('.potok-nav a').forEach(function(el){el.addEventListener('click',function(e){` +
    `var s=el.getAttribute('data-step');if(window.parent!==window){e.preventDefault();` +
    `window.parent.postMessage({type:'potok-step',key:s},location.origin);}});});</script>`;
  const at = html.lastIndexOf('</main>');
  return at < 0 ? html : html.slice(0, at) + nav + html.slice(at);
}

// Запись к шагу (например, практикум в «Разборах»): плеер Kinescope под шапкой,
// в той же рамке с оранжевой тенью, что и видео в уроках курса.
function withVideo(html: string, kinescopeId: string): string {
  if (!kinescopeId || !html.includes('<!--VIDEO_SLOT-->')) return html;
  const player =
    `<div class="pvwrap"><div class="pv"><iframe src="${esc(playerSrc(kinescopeId))}" ` +
    `allow="autoplay; fullscreen; picture-in-picture; encrypted-media;" allowfullscreen frameborder="0" title="Видео"></iframe></div>` +
    `<p class="pvnote">Ниже то же самое текстом, с картинками. Смотреть или читать, как удобнее.</p></div>`;
  const css =
    `<style>.pvwrap{max-width:620px;margin:0 auto;padding:30px 24px 4px;}` +
    `.pv{position:relative;width:100%;aspect-ratio:16/9;background:#000;border:1px solid #000;box-shadow:6px 6px 0 #e8590c;}` +
    `.pv iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}` +
    `.pvnote{font-size:15px;color:#666;margin:12px 0 0;line-height:1.45;}` +
    `@media(max-width:640px){.pvwrap{padding:22px 16px 4px;}.pv{box-shadow:4px 4px 0 #e8590c;}}</style>`;
  return html.replace('<!--VIDEO_SLOT-->', player).replace('</head>', css + '</head>');
}

// Призыв на курс внутри статьи шага: только покупателю «Потока» без курса
// и только на шагах из STEP_CTA. Встаёт в конец статьи, над кнопками шагов.
function withCta(html: string, key: string, offer: PotokOffer | null): string {
  if (!offer) return html;
  const block = stepCtaHtml(key, offer);
  if (!block) return html;
  const at = html.lastIndexOf('</main>');
  if (at < 0) return html;
  return (html.slice(0, at) + block + STEP_CTA_JS + html.slice(at)).replace('</head>', STEP_CTA_CSS + '</head>');
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
      return NextResponse.json({ success: true, identified: false, allowed: false, via: null, tier: 0, steps: [], items: [] });
    }

    const rows = telegramId ? await getActiveAccessByTelegram(telegramId) : [];
    // ?preview=cta — Саша смотрит ветку глазами покупателя «Потока»: с призывами
    // на курс и таймером. Только для админа, остальным параметр ничего не даёт.
    const demo = q === 'cta' && !!telegramId && isAdminUser(String(telegramId));
    const access = bypass || demo
      ? { allowed: true, via: 'potok' as const, tier: 0 }
      : resolvePotokAccess(rows.map((r) => ({ role: r.role, productSlug: r.productSlug })));

    if (!access.allowed) {
      return NextResponse.json({ success: true, identified: true, allowed: false, via: null, tier: access.tier, steps: [], items: [] });
    }

    // В превью (локально, без Telegram) показываем предложение как у свежего покупателя.
    const offer = bypass || demo
      ? potokOffer([{ role: 'potok', productSlug: 'potok-sprosa', grantedAt: new Date() }], null)
      : potokOffer(rows, telegramId);

    // Статья шага ветки. Содержимое вырезано из курса скриптом potok-steps.mjs
    // и лежит самодостаточным документом — отдаём как есть, одним файлом.
    const stepKey = request.nextUrl.searchParams.get('step');
    if (stepKey) {
      const st = POTOK_STEPS.find((x) => x.key === stepKey);
      if (!st || !st.html) return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
      return new NextResponse(withStepNav(withCta(withVideo(st.html, st.kinescopeId), st.key, offer), st.key, request.nextUrl.searchParams), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' },
      });
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
      via: access.via,
      tier: access.tier,
      offer,
      steps: POTOK_STEPS.map(({ key, title, note, group, html }) => ({ key, title, note, group, ready: !!html || key === 'metod' })),
      items: POTOK_FILES.map(({ key, name, label, note, bytes }) => ({ key, name, label, note, bytes })),
    });
  } catch (e) {
    console.error('[cabinet/potok]', e);
    return NextResponse.json({ success: false, error: 'server error' }, { status: 500 });
  }
}
