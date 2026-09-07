// Прайс-ссылки в кабинете: список, новая позиция, правка, открыть/закрыть.
//
// Одна ручка на все действия: прайс маленький, отдельные роуты под каждое
// действие только размазали бы авторизацию по файлам (как и в /api/admin/revenue).

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { listDeals, createDeal, setDealStatus, updateDeal, type DealTier } from '@/lib/deals';

export const dynamic = 'force-dynamic';

const TIERS = ['t1', 't2', 't3'];

function bad(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ deals: await listDeals() });
  } catch (error) {
    console.error('[Admin Deals GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad('нужен JSON');
  }

  const action = String(body.action || 'create');

  try {
    if (action === 'create') {
      const tier = String(body.tier || '');
      const price = Number(body.price);
      const days = Number(body.days);
      const title = String(body.title || '').trim();
      if (!TIERS.includes(tier)) return bad('тариф: t1, t2 или t3');
      if (!Number.isFinite(price) || price <= 0) return bad('цена должна быть положительным числом');
      if (!Number.isFinite(days) || days <= 0) return bad('срок в днях должен быть положительным числом');
      if (!title) return bad('нужно название, оно уходит в чек Продамуса');
      const deals = await createDeal({
        tier: tier as DealTier,
        price: Math.round(price),
        days: Math.round(days),
        title,
        note: String(body.note || '').trim() || null,
      });
      return NextResponse.json({ deals });
    }

    const id = String(body.id || '');
    if (!id) return bad('нужен id позиции');

    if (action === 'status') {
      const status = String(body.status || '');
      if (status !== 'active' && status !== 'off') return bad('статус: active или off');
      return NextResponse.json({ deals: await setDealStatus(id, status) });
    }

    if (action === 'update') {
      const patch: Record<string, unknown> = {};
      if (body.title !== undefined) {
        const title = String(body.title).trim();
        if (!title) return bad('название не может быть пустым');
        patch.title = title;
      }
      if (body.note !== undefined) patch.note = String(body.note).trim() || null;
      if (body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price <= 0) return bad('цена должна быть положительным числом');
        patch.price = Math.round(price);
      }
      if (body.days !== undefined) {
        const days = Number(body.days);
        if (!Number.isFinite(days) || days <= 0) return bad('срок в днях должен быть положительным числом');
        patch.days = Math.round(days);
      }
      return NextResponse.json({ deals: await updateDeal(id, patch) });
    }

    return bad(`неизвестное действие: ${action}`);
  } catch (error) {
    console.error('[Admin Deals POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
