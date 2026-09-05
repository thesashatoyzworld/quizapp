import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import {
  createEntry, deleteEntry, getMonthReport, importOrphans,
  setTarget, updateEntry, currentMonth, type EntryInput,
} from '@/lib/revenue';

export const dynamic = 'force-dynamic';

const MONTH_RE = /^\d{4}-\d{2}$/;

function bad(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const month = request.nextUrl.searchParams.get('month') || currentMonth();
  if (!MONTH_RE.test(month)) return bad('месяц в формате YYYY-MM');

  try {
    return NextResponse.json(await getMonthReport(month));
  } catch (error) {
    console.error('[Admin Revenue GET]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * Одна ручка на все действия: реестр маленький, отдельные роуты под каждое
 * действие тут только размазали бы авторизацию по файлам.
 */
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
    if (action === 'goal') {
      const month = String(body.month || '');
      const target = Number(body.target);
      if (!MONTH_RE.test(month)) return bad('месяц в формате YYYY-MM');
      if (!Number.isFinite(target) || target <= 0) return bad('цель должна быть положительным числом');
      await setTarget(month, target);
      return NextResponse.json(await getMonthReport(month));
    }

    if (action === 'import') {
      const month = String(body.month || '');
      if (!MONTH_RE.test(month)) return bad('месяц в формате YYYY-MM');
      const imported = await importOrphans(month);
      return NextResponse.json({ imported, ...(await getMonthReport(month)) });
    }

    if (action === 'delete') {
      const id = String(body.id || '');
      if (!id) return bad('нет id');
      await deleteEntry(id);
      const month = String(body.month || currentMonth());
      return NextResponse.json(await getMonthReport(month));
    }

    // create / update
    const paidAt = String(body.paidAt || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paidAt)) return bad('дата в формате YYYY-MM-DD');
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return bad('сумма должна быть положительным числом');

    const payoutRaw = body.payout;
    const payout = payoutRaw === '' || payoutRaw == null ? null : Number(payoutRaw);
    if (payout != null && !Number.isFinite(payout)) return bad('«к выплате» должно быть числом');

    const input: EntryInput = {
      paidAt,
      amount,
      payout,
      who: String(body.who || ''),
      product: String(body.product || ''),
      channel: String(body.channel || 'prodamus'),
      note: String(body.note || ''),
      orderId: body.orderId ? String(body.orderId) : null,
    };

    if (action === 'update') {
      const id = String(body.id || '');
      if (!id) return bad('нет id');
      await updateEntry(id, input);
    } else {
      await createEntry(input);
    }

    return NextResponse.json(await getMonthReport(paidAt.slice(0, 7)));
  } catch (error) {
    console.error('[Admin Revenue POST]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
