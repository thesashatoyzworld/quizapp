import { after, NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { BUCKET_IDS, SKIP_BUCKET } from '@/content/budget';
import {
  addExpense, deleteExpense, listExpenses, setBucket, splitExpense, updateExpense, validExpense, type ExpenseInput,
} from '@/lib/budget/data';
import { addShot, listShots } from '@/lib/budget/shots';

export const dynamic = 'force-dynamic';

function bad(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

/** Wakes the recognizer on the VPS. The 15-minute timer there catches anything this misses. */
async function triggerRecognizer() {
  const url = process.env.BUDGET_TRIGGER_URL;
  if (!url) return;
  await fetch(url, {
    method: 'POST',
    headers: { 'x-budget-secret': process.env.BUDGET_TRIGGER_SECRET || '' },
    signal: AbortSignal.timeout(5000),
  }).catch((e) => console.error('[Admin Budget trigger]', e));
}

/** One handler for all actions, every answer carries fresh expenses and recent screenshots. */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad('нужен JSON');
  const action = String(body.action || 'list');

  try {
    if (action === 'shot') {
      const image = String(body.image || '');
      const m = /^data:(image\/(?:jpeg|png|webp|gif)|application\/pdf);base64,(.+)$/.exec(image);
      if (!m) return bad('нужна картинка jpeg, png, webp или PDF');
      if (m[2].length > 4_000_000) return bad('файл слишком большой');
      await addShot(image);
      after(triggerRecognizer);
    } else if (action === 'save') {
      const e = (body.expense ?? {}) as Partial<ExpenseInput>;
      const item: ExpenseInput = {
        spentAt: String(e.spentAt || ''),
        amount: Number(e.amount),
        currency: e.currency === 'RUB' ? 'RUB' : 'KZT',
        bucket: String(e.bucket || ''),
        merchant: String(e.merchant || ''),
        source: 'manual',
        note: '',
      };
      const err = validExpense(item);
      if (err) return bad(err);
      await addExpense(item);
    } else if (action === 'bucket') {
      const bucket = String(body.bucket || '');
      if (!BUCKET_IDS.includes(bucket) && bucket !== SKIP_BUCKET) return bad('нет такой корзины');
      await setBucket(String(body.id || ''), bucket);
    } else if (action === 'update') {
      const e = (body.expense ?? {}) as Partial<ExpenseInput>;
      const spentAt = String(e.spentAt || '');
      const amount = Number(e.amount);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(spentAt)) return bad('дата в формате ГГГГ-ММ-ДД');
      if (!(amount > 0)) return bad('сумма должна быть больше нуля');
      await updateExpense(String(body.id || ''), { spentAt, amount, merchant: String(e.merchant || ''), note: String(e.note || '') });
    } else if (action === 'split') {
      const parts = (Array.isArray(body.parts) ? body.parts : []).map((p: Record<string, unknown>) => ({
        amount: Math.round(Number(p?.amount) * 100) / 100,
        bucket: String(p?.bucket || ''),
      }));
      const err = await splitExpense(String(body.id || ''), parts);
      if (err) return bad(err);
    } else if (action === 'delete') {
      await deleteExpense(String(body.id || ''));
    } else if (action !== 'list') {
      return bad('неизвестное действие');
    }
    const [expenses, shots] = await Promise.all([listExpenses(), listShots()]);
    return NextResponse.json({ expenses, shots });
  } catch (error) {
    console.error('[Admin Budget POST]', error);
    return NextResponse.json({ error: 'не получилось, попробуй ещё раз' }, { status: 500 });
  }
}
