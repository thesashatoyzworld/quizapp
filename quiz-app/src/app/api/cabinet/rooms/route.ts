import { NextRequest, NextResponse } from 'next/server';
import { getActiveAccessByTelegram } from '@/lib/access';

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
    // Доступ к кабинету — ТОЛЬКО по привязанному Telegram. Вход по токену из URL
    // и по почте убран: токен-ссылка расшаривалась (кто угодно с ссылкой открывал
    // кабинет). Оплата картой теперь ведёт в бота (/start paid_<token>), который
    // привязывает доступ к Telegram, дальше кабинет опознаёт по telegramId.
    const telegramId = request.nextUrl.searchParams.get('telegramId');

    let activeRows: AccessRow[] = [];
    if (telegramId) {
      const rows = await getActiveAccessByTelegram(Number(telegramId));
      activeRows = rows.map((r) => ({ role: r.role, productSlug: r.productSlug }));
    }

    const unlockedRoles = Array.from(new Set(activeRows.map((r) => r.role)));
    const tiers = computeTiers(activeRows);

    return NextResponse.json({ success: true, unlockedRoles, tiers, pending: false, token: null });
  } catch (error) {
    console.error('[Cabinet] rooms error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
