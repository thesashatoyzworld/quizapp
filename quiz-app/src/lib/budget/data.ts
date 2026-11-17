// Budget expenses (/admin/byudzhet). Raw SQL: the table is created by
// scripts/budget-create-tables.mjs, it is not in the Prisma schema.
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { BUCKET_IDS, PERIOD, fingerprint, type Currency, type Source } from '@/content/budget';

export interface Expense {
  id: string;
  spentAt: string; // YYYY-MM-DD
  amount: number;
  currency: Currency;
  bucket: string;
  merchant: string;
  source: Source;
  note: string;
}

export type ExpenseInput = Omit<Expense, 'id'>;

export async function listExpenses(): Promise<Expense[]> {
  const rows = await prisma.$queryRaw<Record<string, string | null>[]>`
    SELECT id, spent_at::text AS spent_at, amount::text AS amount, currency, bucket,
           merchant, source, note
      FROM budget_expenses
     WHERE spent_at >= ${PERIOD.from}::date AND spent_at <= ${PERIOD.to}::date
     ORDER BY spent_at DESC, created_at DESC`;
  return rows.map((r) => ({
    id: String(r.id),
    spentAt: String(r.spent_at),
    amount: Number(r.amount),
    currency: r.currency === 'RUB' ? 'RUB' : 'KZT',
    bucket: String(r.bucket),
    merchant: r.merchant ?? '',
    source: (r.source as Source) ?? 'manual',
    note: r.note ?? '',
  }));
}

export function validExpense(e: Partial<ExpenseInput>): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.spentAt))) return 'дата в формате ГГГГ-ММ-ДД';
  if (!Number.isFinite(e.amount) || Number(e.amount) <= 0) return 'сумма должна быть больше нуля';
  if (e.currency !== 'KZT' && e.currency !== 'RUB') return 'валюта KZT или RUB';
  if (!BUCKET_IDS.includes(String(e.bucket))) return 'нет такой корзины';
  return null;
}

/**
 * Inserts one row. False when the same operation is already recorded: screenshot
 * rows carry a fingerprint, manual rows do not (two equal coffees are fine).
 */
export async function addExpense(e: ExpenseInput, nth = 1): Promise<boolean> {
  // nth: the same operation repeated on one screenshot (two bus tickets) is 2 rows, not a duplicate.
  const fp = e.source === 'manual' ? null : fingerprint(e) + (nth > 1 ? `#${nth}` : '');
  const n = await prisma.$executeRaw`
    INSERT INTO budget_expenses (id, spent_at, amount, currency, bucket, merchant, source, note, fingerprint)
    VALUES (${randomUUID()}, ${e.spentAt}::date, ${e.amount}, ${e.currency}, ${e.bucket},
            ${e.merchant.slice(0, 200)}, ${e.source}, ${e.note.slice(0, 500)}, ${fp})
    ON CONFLICT DO NOTHING`;
  return n > 0;
}

export async function setBucket(id: string, bucket: string): Promise<void> {
  await prisma.$executeRaw`UPDATE budget_expenses SET bucket = ${bucket} WHERE id = ${id}`;
}

export async function deleteExpense(id: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM budget_expenses WHERE id = ${id}`;
}

/** Edits a row in place. The fingerprint stays, so the bank row is still recognized as a duplicate. */
export async function updateExpense(
  id: string,
  e: { spentAt: string; amount: number; merchant: string; note: string },
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE budget_expenses
       SET spent_at = ${e.spentAt}::date, amount = ${e.amount},
           merchant = ${e.merchant.slice(0, 200)}, note = ${e.note.slice(0, 500)}
     WHERE id = ${id}`;
}

/**
 * Splits one operation into parts with their own buckets (one transfer to Даша = taxes + credit + life).
 * The first part keeps the original row and its fingerprint, the rest become manual rows.
 */
export async function splitExpense(id: string, parts: { amount: number; bucket: string }[]): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ amount: string; spent_at: string; currency: string; merchant: string | null; note: string | null }[]>`
    SELECT amount::text AS amount, spent_at::text AS spent_at, currency, merchant, note FROM budget_expenses WHERE id = ${id}`;
  const o = rows[0];
  if (!o) return 'запись не найдена';
  const total = Number(o.amount);
  if (parts.length < 2) return 'нужно хотя бы две части';
  if (parts.some((p) => !(p.amount > 0) || !BUCKET_IDS.includes(p.bucket))) return 'у каждой части сумма и корзина';
  if (Math.abs(parts.reduce((s, p) => s + p.amount, 0) - total) > 0.005) return 'части должны в сумме дать всю операцию';
  const note = `часть операции на ${total.toLocaleString('ru-RU')}`;
  await prisma.$transaction([
    prisma.$executeRaw`UPDATE budget_expenses SET amount = ${parts[0].amount}, bucket = ${parts[0].bucket}, note = ${note} WHERE id = ${id}`,
    ...parts.slice(1).map(
      (p) => prisma.$executeRaw`
        INSERT INTO budget_expenses (id, spent_at, amount, currency, bucket, merchant, source, note)
        VALUES (${randomUUID()}, ${o.spent_at}::date, ${p.amount}, ${o.currency}, ${p.bucket}, ${o.merchant ?? ''}, 'manual', ${note})`,
    ),
  ]);
  return null;
}
