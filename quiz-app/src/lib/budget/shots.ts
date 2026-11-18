// Bank screenshots (Kaspi, T-Bank) → budget expenses.
// The cabinet only stores the upload. Recognition runs on the VPS through the
// Claude CLI on Sasha's subscription (services/budget-shots/run.mjs): it takes
// pending shots with the prompt and schema below and posts the result back,
// then the rows are recorded here automatically. Sasha fixes buckets afterwards.
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { BEFORE_PLAN, BUCKETS, BUCKET_IDS, PERIOD, almatyToday, defaultBucket, fingerprint, type Currency, type Source } from '@/content/budget';
import { addExpense } from './data';

export type ShotRow = {
  date: string | null;
  merchant: string;
  amount: number;
  currency: Currency;
  bucket: string;
  outcome: 'added' | 'duplicate' | 'skipped';
  reason: string | null;
};

export type Balance = { amount: number; date: string; currency: Currency };

export type ShotResult = { added: number; duplicates: number; skipped: number; rows: ShotRow[]; balance?: Balance | null };

export interface Shot {
  id: string;
  status: 'pending' | 'done' | 'error';
  error: string | null;
  result: ShotResult | null;
  createdAt: string;
}

export const SHOT_SCHEMA = {
  type: 'object',
  properties: {
    bank: { type: 'string', enum: ['kaspi', 'tbank', 'unknown'] },
    balance: {
      anyOf: [
        {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            date: { type: 'string' },
            currency: { type: 'string', enum: ['KZT', 'RUB'] },
          },
          required: ['amount', 'date', 'currency'],
          additionalProperties: false,
        },
        { type: 'null' },
      ],
    },
    operations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          merchant: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string', enum: ['KZT', 'RUB'] },
          bucket: { type: 'string', enum: BUCKET_IDS },
          skip: { type: 'boolean' },
          reason: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        },
        required: ['date', 'merchant', 'amount', 'currency', 'bucket', 'skip', 'reason'],
        additionalProperties: false,
      },
    },
  },
  required: ['bank', 'operations', 'balance'],
  additionalProperties: false,
};

/** Prompt for the worker. {{FILE}} is replaced with the image path on the VPS. */
export function shotPrompt(today = almatyToday()): string {
  const buckets = BUCKETS.map(
    (b) => `- ${b.id} (${b.currency === 'RUB' ? '₽' : '₸'}): ${b.label}, ${b.hint}${b.items ? `; в плане: ${b.items.join(', ')}` : ''}`,
  ).join('\n');
  return `Открой инструментом Read файл {{FILE}}. Это скриншот банковского приложения Саши или текст PDF-выписки (файл .txt): Kaspi (тенге) или Т-Банк (рубли). Выпиши каждую операцию для учёта личного бюджета и ответь строго по схеме. Ничего не выдумывай: чего нет в файле, того нет.

Если это выписка: операции раньше ${PERIOD.from} не выписывай вовсе. В выписке Kaspi у каждой операции дата ДД.ММ.ГГ, сумма со знаком (минус = расход, плюс = поступление), тип (Покупка, Перевод, Пополнение, Снятие, Разное) и детали. merchant = детали. Снятие наличных = расход, bucket life. Шапку и итоги выписки («Пополнения», «Покупки», «Доступно на») не выписывай.

Сегодня ${today} (Алматы).

Правила:
- bank: kaspi, tbank или unknown.
- date: ГГГГ-ММ-ДД. Год на скринах часто не пишут: бери ближайшую дату не позже сегодня. «Сегодня» = ${today}, «Вчера» = день до этого. Если дату не понять, null.
- amount: число без знака, в валюте операции. Минус или списание = расход.
- currency: по значку ₸ = KZT, ₽ = RUB.
- merchant: название магазина, сервиса или имя получателя, как написано.
- skip = true с причиной в reason для того, что НЕ расход: поступления и пополнения (плюс), переводы между своими счетами (Т-Банк → Kaspi, карта 440043*4212, «Вывод на Kaspi», с Kaspi Gold на депозит и обратно, «Между своими счетами»), возвраты. Для них bucket всё равно укажи (life или rother).
- Переводы «Дарья П.» это расход семьи, не пропускать: bucket life. Исключение: перевод «Дарья П.» ровно на 162 000 ₸ это налоги за Дашу, bucket must.
- bucket: подходящая корзина из списка ниже, по валюте операции. Если не похоже ни на что из плана: other для тенге, rother для рублей.
- reason для расходов: null.
- balance: остаток на карте на самый поздний момент, который виден в файле. В выписке Kaspi это «Доступно на ДД.ММ.ГГ» на дату конца периода (не на начало), в выписке Т-Банка исходящий остаток. На скрине баланс, если он виден сверху. date ГГГГ-ММ-ДД. Если остатка не видно, null.

Корзины:
${buckets}`;
}

function toShot(r: Record<string, unknown>): Shot {
  return {
    id: String(r.id),
    status: (r.status as Shot['status']) ?? 'pending',
    error: (r.error as string | null) ?? null,
    result: (r.result as ShotResult | null) ?? null,
    createdAt: String(r.created_at),
  };
}

export async function addShot(image: string): Promise<void> {
  await prisma.$executeRaw`INSERT INTO budget_shots (id, image) VALUES (${randomUUID()}, ${image})`;
}

/** Recent uploads for the page, without the image itself. */
export async function listShots(limit = 15): Promise<Shot[]> {
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT id, status, error, result, created_at::text AS created_at
      FROM budget_shots ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(toShot);
}

export async function pendingShots(limit = 5): Promise<{ id: string; image: string }[]> {
  return prisma.$queryRaw<{ id: string; image: string }[]>`
    SELECT id, image FROM budget_shots WHERE status = 'pending' ORDER BY created_at LIMIT ${limit}`;
}

export async function failShot(id: string, error: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE budget_shots SET status = 'error', error = ${error.slice(0, 500)}, processed_at = now()
     WHERE id = ${id} AND status = 'pending'`;
}

type RawOp = { date?: unknown; merchant?: unknown; amount?: unknown; currency?: unknown; bucket?: unknown; skip?: unknown; reason?: unknown };

/** Records recognized operations as expenses and closes the shot. */
export async function completeShot(id: string, out: { operations?: unknown; balance?: unknown }): Promise<ShotResult | null> {
  const rows0 = await prisma.$queryRaw<{ status: string }[]>`SELECT status FROM budget_shots WHERE id = ${id}`;
  if (rows0[0]?.status !== 'pending') return null;

  const ops = (Array.isArray(out.operations) ? out.operations : []) as RawOp[];
  const rows: ShotRow[] = [];
  const seen = new Map<string, number>();
  for (const o of ops.slice(0, 500)) {
    const amount = Math.round(Math.abs(Number(o.amount)) * 100) / 100;
    if (!(amount > 0)) continue;
    const currency: Currency = o.currency === 'RUB' ? 'RUB' : 'KZT';
    const bucket = BUCKETS.some((b) => b.id === o.bucket && b.currency === currency) ? String(o.bucket) : defaultBucket(currency);
    const date = typeof o.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.date) ? o.date : null;
    const merchant = String(o.merchant ?? '').trim().slice(0, 200);
    const row: ShotRow = { date, merchant, amount, currency, bucket, outcome: 'skipped', reason: null };
    if (o.skip) {
      row.reason = String(o.reason || 'не расход').slice(0, 200);
    } else if (!date) {
      row.reason = 'дата не видна, добавь вручную';
    } else if (date < PERIOD.from || date > PERIOD.to) {
      row.reason = 'вне периода бюджета';
    } else if (BEFORE_PLAN.some((p) => p.date === date && p.amount === amount && p.currency === currency)) {
      row.reason = 'было до плана, уже учтено в остатке';
    } else {
      const source: Source = currency === 'RUB' ? 'tbank' : 'kaspi';
      const e = { spentAt: date, amount, currency, bucket, merchant, source, note: '' };
      const nth = (seen.get(fingerprint(e)) ?? 0) + 1;
      seen.set(fingerprint(e), nth);
      const ok = await addExpense(e, nth);
      row.outcome = ok ? 'added' : 'duplicate';
    }
    rows.push(row);
  }
  const b = out.balance as { amount?: unknown; date?: unknown; currency?: unknown } | null | undefined;
  const balance: Balance | null =
    b && Number.isFinite(Number(b.amount)) && typeof b.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date)
      ? { amount: Number(b.amount), date: b.date, currency: b.currency === 'RUB' ? 'RUB' : 'KZT' }
      : null;
  const result: ShotResult = {
    balance,
    added: rows.filter((r) => r.outcome === 'added').length,
    duplicates: rows.filter((r) => r.outcome === 'duplicate').length,
    skipped: rows.filter((r) => r.outcome === 'skipped').length,
    rows,
  };
  await prisma.$executeRaw`
    UPDATE budget_shots SET status = 'done', result = ${JSON.stringify(result)}::jsonb, processed_at = now()
     WHERE id = ${id}`;
  return result;
}

/** Latest known card balance per currency, from the most recent statement or screenshot that showed it. */
export async function latestBalances(): Promise<Balance[]> {
  const rows = await prisma.$queryRaw<{ b: Balance }[]>`
    SELECT DISTINCT ON (result->'balance'->>'currency') result->'balance' AS b
      FROM budget_shots
     WHERE status = 'done' AND jsonb_typeof(result->'balance') = 'object'
     ORDER BY result->'balance'->>'currency', result->'balance'->>'date' DESC, created_at DESC`;
  return rows.map((r: { b: Balance }) => r.b);
}
