import { NextRequest, NextResponse } from 'next/server';
import { getActiveAccessByTelegram } from '@/lib/access';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import { forTelegram } from '@/content/lichnoe';

export const runtime = 'nodejs';

// Какие платные разделы открыты человеку. Три способа опознать:
//   ?telegramId=<id>  — заход из Telegram
//   ?token=<token>    — ссылка после оплаты картой (<prefix>_web_<token>)
//   ?email=<email>    — «закрыл ссылку» → вход по почте, которой платил
//
// Токен/почта работают для любого продукта: источник доступа всегда
// оканчивается на `_web_<token>`, а событие оплаты картой — тип web_paid
// (mk_web_paid — легаси, тоже учитываем).
//
// Возвращает unlockedRoles + tiers (макс. тариф на роль, чтобы кабинет мог
// показать материалы старших тарифов под замком) + token (если опознали —
// фронт сохранит в браузере, чтобы дальше открывалось само).
// pending:true — оплата по токену ещё в пути.
type AccessRow = { role: string; productSlug: string };

// Тариф зашит в productSlug как суффикс -t<N> (uroven-t1 / uroven-t2 / uroven-t3).
function tierFromSlug(slug: string): number | null {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : null;
}

// Макс. тариф, купленный человеком, по каждой роли.
function computeTiers(rows: AccessRow[]): Record<string, number> {
  const tiers: Record<string, number> = {};
  for (const r of rows) {
    const n = tierFromSlug(r.productSlug);
    if (n != null) tiers[r.role] = Math.max(tiers[r.role] ?? 0, n);
  }
  return tiers;
}

export async function GET(request: NextRequest) {
  try {
    // Опознание: (1) ?telegramId из Mini App initData, либо (2) подписанная
    // сессия-cookie после входа через Telegram Login Widget в браузере (десктоп).
    // Вход по token/email из URL убран (ссылки расшаривались).
    let telegramId: number | null = null;
    const qId = request.nextUrl.searchParams.get('telegramId');
    if (qId && /^\d+$/.test(qId)) {
      telegramId = Number(qId);
    } else {
      const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
      telegramId = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
    }

    let activeRows: AccessRow[] = [];
    if (telegramId) {
      const rows = await getActiveAccessByTelegram(telegramId);
      activeRows = rows.map((r) => ({ role: r.role, productSlug: r.productSlug }));
    }

    const unlockedRoles = Array.from(new Set(activeRows.map((r) => r.role)));
    const tiers = computeTiers(activeRows);

    // Раздел «Личное» показываем только тем, у кого личные материалы реально
    // есть. Остальным его в кабинете не существует — даже под замком: пустой
    // запертый раздел выглядел бы как «мне что-то не додали».
    const hasPersonal = telegramId != null && forTelegram(telegramId).length > 0;

    // identified — знаем ЛИ мы, кто это (по Telegram или сессии). Кабинет так
    // отличает «вошёл, но без покупок» (показать разделы под замком) от «не вошёл»
    // (показать кнопку входа).
    return NextResponse.json({ success: true, identified: telegramId != null, telegramId, unlockedRoles, tiers, hasPersonal, pending: false, token: null });
  } catch (error) {
    console.error('[Cabinet] rooms error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
