import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getActiveAccessByTelegram } from '@/lib/access';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { LESSONS, KURS_MIN_TIER, KURS_ROLE, findLesson, toCard } from '@/content/kurs';

export const runtime = 'nodejs';

// Пройденные уроки лежат событиями в общей таблице events — отдельная таблица
// не нужна, а миграции на общей базе трогать опасно.
const DONE_EVENT = 'kurs_done';

/** Слаги уроков, которые человек дочитал до конца. */
async function doneSlugs(telegramId: number | null): Promise<string[]> {
  if (!telegramId) return [];
  const rows = await prisma.event.findMany({
    where: { telegramId: BigInt(telegramId), type: DONE_EVENT },
    select: { metadata: true },
  });
  const set = new Set<string>();
  for (const r of rows) {
    const slug = (r.metadata as { lesson?: string } | null)?.lesson;
    if (slug) set.add(slug);
  }
  return [...set];
}

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

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/**
 * Концовка урока: отметка «пройдено» и переход дальше. Статью кабинет показывает
 * в iframe, поэтому кнопки не переходят сами, а стучатся наверх через postMessage —
 * решает уже страница раздела, она знает про доступы и остальные уроки.
 */
function footerBlock(slug: string, next: { slug: string; title: string; ready: boolean } | null): string {
  const nextHtml = !next
    ? '<div class="kfin-soon"><span class="k">это последняя часть курса</span></div>'
    : next.ready
      ? `<button class="kfin-next" data-slug="${esc(next.slug)}">`
        + `<span class="k">следующий →</span><span class="n">${esc(next.title)}</span></button>`
      : `<div class="kfin-soon"><span class="k">следующий</span><span class="n">${esc(next.title)}</span>`
        + '<span class="s">появится, как только Саша его снимет</span></div>';

  return `<div class="kfin">
  <div class="kfin-mark">✓ урок пройден</div>
  ${nextHtml}
  <button class="kfin-back">‹ ко всем урокам</button>
</div>
<script>
(function(){
  var SLUG = ${JSON.stringify(slug)}, sent = false;
  function post(m){ try { parent.postMessage(m, '*'); } catch (e) {} }
  // «Пройдено» = статья домотана до конца. Короткая статья, которая целиком
  // помещается в экран, засчитывается сразу.
  function check(){
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 1;
    if (!sent && p >= 0.97) {
      sent = true;
      document.body.classList.add('kdone');
      post({ kurs: 'done', slug: SLUG });
    }
  }
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);
  check();
  document.addEventListener('click', function(e){
    var n = e.target.closest && e.target.closest('.kfin-next');
    if (n) { post({ kurs: 'open', slug: n.dataset.slug }); return; }
    var b = e.target.closest && e.target.closest('.kfin-back');
    if (b) post({ kurs: 'back' });
  });
})();
</script>`;
}

// Стиль плеера и концовки под системную вёрстку статей: та же колонка 620,
// жёсткая рамка, offset-тень и оранжевый акцент.
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

  .kfin{max-width:620px;margin:0 auto;padding:34px 24px 60px;border-top:1px solid #ccc;}
  .kfin-mark{display:none;font-family:"Courier New",Courier,monospace;font-size:13px;
    letter-spacing:.12em;text-transform:uppercase;color:#2f9e44;font-weight:bold;margin-bottom:18px;}
  body.kdone .kfin-mark{display:block;}
  .kfin-next{display:block;width:100%;text-align:left;cursor:pointer;font:inherit;color:#000;
    background:#fff;border:1px solid #000;box-shadow:6px 6px 0 #e8590c;padding:18px 20px;}
  .kfin-next:hover{box-shadow:3px 3px 0 #e8590c;transform:translate(3px,3px);}
  .kfin-next .k,.kfin-soon .k{display:block;font-family:"Courier New",Courier,monospace;font-size:12px;
    letter-spacing:.14em;text-transform:uppercase;color:#e8590c;margin-bottom:6px;}
  .kfin-next .n,.kfin-soon .n{display:block;font-size:1.3em;font-weight:bold;line-height:1.2;}
  .kfin-soon{border:1px dashed #999;background:#f7f7f7;color:#666;padding:18px 20px;}
  .kfin-soon .n{color:#333;}
  .kfin-soon .s{display:block;font-size:15px;margin-top:6px;}
  .kfin-back{display:inline-block;margin-top:20px;cursor:pointer;font:inherit;font-size:15px;
    color:#666;background:none;border:none;padding:0;text-decoration:underline;}
  .kfin-back:hover{color:#000;}
  @media(max-width:640px){.kfin{padding:28px 16px 48px;}.kfin-next{box-shadow:4px 4px 0 #e8590c;}}
</style>`;

export async function GET(request: NextRequest) {
  try {
    // Превью вёрстки при локальной разработке. На Vercel NODE_ENV=production,
    // так что в проде ветка мертва.
    const q = request.nextUrl.searchParams.get('preview');
    const devPreview = process.env.NODE_ENV !== 'production' && q === '1';

    const bypass = devPreview;

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
      const i = LESSONS.findIndex((l) => l.slug === lesson.slug);
      const n = LESSONS[i + 1];
      const next = n ? { slug: n.slug, title: n.title, ready: !!n.html } : null;
      const html = lesson.html
        .replace('<!--VIDEO_SLOT-->', player)
        .replace('<!--FOOTER_SLOT-->', footerBlock(lesson.slug, next))
        .replace('</head>', VIDEO_CSS + '</head>');
      return NextResponse.json({ success: true, identified: true, allowed: true, tier, html });
    }

    return NextResponse.json({
      success: true,
      identified: true,
      allowed: true,
      tier,
      items: LESSONS.map(toCard),
      done: await doneSlugs(telegramId),
    });
  } catch (e) {
    console.error('[cabinet/kurs]', e);
    return NextResponse.json({ success: false, error: 'server error' }, { status: 500 });
  }
}

// POST /api/cabinet/kurs  { slug }  → отметить урок пройденным.
// Зовётся, когда человек домотал статью до конца. Без Telegram отмечать некого:
// отвечаем успехом, чтобы страница не ругалась, но в базу ничего не пишем.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { slug?: string; telegramId?: number };
    const lesson = body.slug ? findLesson(body.slug) : undefined;
    if (!lesson) {
      return NextResponse.json({ success: false, error: 'not found' }, { status: 404 });
    }

    let telegramId: number | null = null;
    if (body.telegramId && Number.isInteger(body.telegramId)) {
      telegramId = body.telegramId;
    } else {
      const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
      telegramId = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
    }
    if (!telegramId) return NextResponse.json({ success: true, stored: false });

    // Только тем, у кого доступ есть: отметка о чужом продукте базе не нужна.
    const rows = await getActiveAccessByTelegram(telegramId);
    if (!rows.some((r) => r.role === KURS_ROLE)) {
      return NextResponse.json({ success: true, stored: false });
    }

    // Идемпотентно: перечитал урок — вторая отметка не нужна.
    const already = (await doneSlugs(telegramId)).includes(lesson.slug);
    if (already) return NextResponse.json({ success: true, stored: true });

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      select: { id: true },
    });
    await prisma.event.create({
      data: {
        type: DONE_EVENT,
        source: 'cabinet',
        userId: user?.id ?? null,
        telegramId: BigInt(telegramId),
        productSlug: KURS_ROLE,
        metadata: { lesson: lesson.slug },
      },
    });
    return NextResponse.json({ success: true, stored: true });
  } catch (e) {
    console.error('[cabinet/kurs POST]', e);
    return NextResponse.json({ success: false, error: 'server error' }, { status: 500 });
  }
}
