// ─────────────────────────────────────────────────────────────
// Учёт выручки по месяцам.
//
// Полной картины денег в базе нет и не будет: в `purchases` падает только
// то, что прошло через наш чекаут (тариф 1 и мелочь), а менторские сделки
// и тариф 2 живут в кабинете Продамуса, часть оплат вообще идёт переводом
// мимо всего. Поэтому источник правды здесь — ручной реестр, а `purchases`
// подтягивается подсказкой «есть в базе, но не внесено».
//
// Суммы храним двумя числами: `amount` — вал (то, что заплатил человек),
// `payout` — сколько дошло после комиссии. Цель месяца считается по валу,
// но разрыв виден сразу, потому что валютные платежи теряют до 10 %.
// ─────────────────────────────────────────────────────────────

import { randomUUID } from 'crypto';
import { prisma } from './prisma';

export const DEFAULT_TARGET = 1_500_000;

export interface RevenueEntry {
  id: string;
  paidAt: string;        // YYYY-MM-DD
  amount: number;
  payout: number | null;
  who: string;
  product: string;
  channel: string;       // prodamus | manual
  orderId: string | null;
  note: string;
}

export interface OrphanPayment {
  orderId: string;
  paidAt: string;
  amount: number;
  source: string;
}

export interface MonthTotals {
  gross: number;
  net: number;
  target: number;
  daysInMonth: number;
  daysPassed: number;
  perDayPlan: number;
  planToDate: number;
  delta: number;          // + опережение, − отставание
  remain: number;
  perDayNeeded: number;   // сколько в день нужно на остаток месяца
  byDay: { day: number; amount: number }[];
}

export interface MonthReport {
  month: string;
  entries: RevenueEntry[];
  orphans: OrphanPayment[];
  totals: MonthTotals;
}

/** '2026-09' → границы месяца. */
function monthRange(month: string): { from: Date; to: Date } {
  const [y, m] = month.split('-').map(Number);
  return { from: new Date(Date.UTC(y, m - 1, 1)), to: new Date(Date.UTC(y, m, 1)) };
}

export function currentMonth(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isoDay(v: unknown): string {
  const d = v instanceof Date ? v : new Date(String(v));
  return d.toISOString().slice(0, 10);
}

export async function getTarget(month: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ target: string }[]>`
    SELECT target::text FROM revenue_goals WHERE month = ${month}`;
  return rows.length ? num(rows[0].target) : DEFAULT_TARGET;
}

export async function setTarget(month: string, target: number): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO revenue_goals (month, target, updated_at)
    VALUES (${month}, ${target}, NOW())
    ON CONFLICT (month) DO UPDATE SET target = EXCLUDED.target, updated_at = NOW()`;
}

export async function listEntries(month: string): Promise<RevenueEntry[]> {
  const { from, to } = monthRange(month);
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT id, paid_at, amount::text AS amount, payout::text AS payout,
           who, product, channel, order_id, note
      FROM revenue_entries
     WHERE paid_at >= ${from} AND paid_at < ${to}
     ORDER BY paid_at DESC, created_at DESC`;
  return rows.map((r) => ({
    id: String(r.id),
    paidAt: isoDay(r.paid_at),
    amount: num(r.amount),
    payout: r.payout == null ? null : num(r.payout),
    who: (r.who as string) || '',
    product: (r.product as string) || '',
    channel: (r.channel as string) || 'prodamus',
    orderId: (r.order_id as string) || null,
    note: (r.note as string) || '',
  }));
}

/**
 * Оплаты, которые система записала сама, но в реестр не попали.
 * Смысл подсказки: мелочь вроде тарифа 1 капает каждый день, и вносить её
 * руками никто не будет — тут её видно и можно забрать одной кнопкой.
 */
export async function listOrphans(month: string): Promise<OrphanPayment[]> {
  const { from, to } = monthRange(month);
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT p.prodamus_order_id AS order_id, p.created_at, p.amount, p.source
      FROM purchases p
     WHERE p.created_at >= ${from} AND p.created_at < ${to}
       AND p.prodamus_order_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM revenue_entries e WHERE e.order_id = p.prodamus_order_id
       )
     ORDER BY p.created_at DESC`;
  return rows.map((r) => ({
    orderId: String(r.order_id),
    paidAt: isoDay(r.created_at),
    amount: num(r.amount),
    source: (r.source as string) || '',
  }));
}

export function computeTotals(
  month: string,
  entries: RevenueEntry[],
  target: number,
  now = new Date(),
): MonthTotals {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const isCurrent = currentMonth(now) === month;
  const daysPassed = isCurrent ? Math.min(now.getUTCDate(), daysInMonth) : daysInMonth;

  const gross = entries.reduce((s, e) => s + e.amount, 0);
  const net = entries.reduce((s, e) => s + (e.payout ?? e.amount), 0);

  const perDayPlan = target / daysInMonth;
  const planToDate = perDayPlan * daysPassed;
  const daysLeft = Math.max(daysInMonth - daysPassed, 0);
  const remain = Math.max(target - gross, 0);

  const byDay = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, amount: 0 }));
  for (const e of entries) {
    const d = Number(e.paidAt.slice(8, 10));
    if (d >= 1 && d <= daysInMonth) byDay[d - 1].amount += e.amount;
  }

  return {
    gross,
    net,
    target,
    daysInMonth,
    daysPassed,
    perDayPlan,
    planToDate,
    delta: gross - planToDate,
    remain,
    // Месяц закрыт — темп считать не на чем, показываем ноль.
    perDayNeeded: daysLeft > 0 ? remain / daysLeft : 0,
    byDay,
  };
}

export async function getMonthReport(month: string): Promise<MonthReport> {
  const [entries, orphans, target] = await Promise.all([
    listEntries(month),
    listOrphans(month),
    getTarget(month),
  ]);
  return { month, entries, orphans, totals: computeTotals(month, entries, target) };
}

export interface EntryInput {
  paidAt: string;
  amount: number;
  payout?: number | null;
  who?: string;
  product?: string;
  channel?: string;
  orderId?: string | null;
  note?: string;
}

export async function createEntry(input: EntryInput): Promise<string> {
  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO revenue_entries (id, paid_at, amount, payout, who, product, channel, order_id, note)
    VALUES (${id}, ${new Date(input.paidAt + 'T00:00:00Z')}, ${input.amount},
            ${input.payout ?? null}, ${input.who ?? ''}, ${input.product ?? ''},
            ${input.channel ?? 'prodamus'}, ${input.orderId || null}, ${input.note ?? ''})
    ON CONFLICT (order_id) WHERE order_id IS NOT NULL DO NOTHING`;
  return id;
}

export async function updateEntry(id: string, input: EntryInput): Promise<void> {
  await prisma.$executeRaw`
    UPDATE revenue_entries
       SET paid_at = ${new Date(input.paidAt + 'T00:00:00Z')},
           amount = ${input.amount},
           payout = ${input.payout ?? null},
           who = ${input.who ?? ''},
           product = ${input.product ?? ''},
           channel = ${input.channel ?? 'prodamus'},
           note = ${input.note ?? ''},
           updated_at = NOW()
     WHERE id = ${id}`;
}

export async function deleteEntry(id: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM revenue_entries WHERE id = ${id}`;
}

/** Забрать в реестр оплаты, которые система записала сама. */
export async function importOrphans(month: string): Promise<number> {
  const orphans = await listOrphans(month);
  for (const o of orphans) {
    await createEntry({
      paidAt: o.paidAt,
      amount: o.amount,
      payout: null,
      who: '',
      product: o.source,
      channel: 'prodamus',
      orderId: o.orderId,
      note: 'подтянуто из базы',
    });
  }
  return orphans.length;
}
