import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { BUCKET_IDS } from '@/content/budget';
import {
  addExpenses, deleteExpense, listExpenses, setBucket, validExpense, type ExpenseInput,
} from '@/lib/budget/data';

export const dynamic = 'force-dynamic';

function bad(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

/** One handler for all actions, every answer carries the fresh list of expenses. */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad('нужен JSON');
  const action = String(body.action || 'list');

  try {
    let saved: number | undefined;
    if (action === 'save') {
      const raw = Array.isArray(body.expenses) ? (body.expenses as Partial<ExpenseInput>[]) : [];
      if (!raw.length) return bad('нечего сохранять');
      const list: ExpenseInput[] = [];
      for (const e of raw) {
        const item: ExpenseInput = {
          spentAt: String(e.spentAt || ''),
          amount: Number(e.amount),
          currency: e.currency === 'RUB' ? 'RUB' : 'KZT',
          bucket: String(e.bucket || ''),
          merchant: String(e.merchant || ''),
          source: e.source === 'kaspi' || e.source === 'tbank' ? e.source : 'manual',
          note: String(e.note || ''),
          force: !!e.force,
        };
        const err = validExpense(item);
        if (err) return bad(`${item.merchant || 'строка'}: ${err}`);
        list.push(item);
      }
      saved = await addExpenses(list);
    } else if (action === 'bucket') {
      const bucket = String(body.bucket || '');
      if (!BUCKET_IDS.includes(bucket)) return bad('нет такой корзины');
      await setBucket(String(body.id || ''), bucket);
    } else if (action === 'delete') {
      await deleteExpense(String(body.id || ''));
    } else if (action !== 'list') {
      return bad('неизвестное действие');
    }
    return NextResponse.json({ saved, expenses: await listExpenses() });
  } catch (error) {
    console.error('[Admin Budget POST]', error);
    return NextResponse.json({ error: 'не получилось, попробуй ещё раз' }, { status: 500 });
  }
}
