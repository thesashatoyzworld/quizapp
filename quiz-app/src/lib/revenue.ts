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
  /**
   * Похожая строка реестра: та же сумма в пределах трёх дней. Одна и та же
   * оплата приходит к нам под разными номерами (счёт Продамуса против
   * идентификатора прайс-ссылки), и по order_id они не сходятся. Такую
   * «сироту» массовый импорт не берёт, иначе сумма месяца задвоится.
   */
  duplicateOf?: { paidAt: string; who: string; product: string };
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

// Реестр ведётся по московским суткам: платёж в час ночи должен лечь в этот
// день, а не во вчерашний. Лямбда живёт в UTC, поэтому сдвигаем сами.
function msk(now: Date): Date {
  return new Date(now.getTime() + 3 * 3600_000);
}

export function currentMonth(now = new Date()): string {
  const d = msk(now);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Колонку `date` драйвер отдаёт объектом Date по зоне машины, и полночь
// уезжает на сутки назад: 2026-09-05 в базе показывалась как 04.09 и деньги
// попадали не в тот столбик графика. Поэтому даты тянем из SQL строкой
// (`paid_at::text`), а тут отрезаем день без часовых поясов.
function isoDay(v: unknown): string {
  if (typeof v === 'string') return v.slice(0, 10);
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
    SELECT id, paid_at::text AS paid_at, amount::text AS amount, payout::text AS payout,
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
    SELECT p.prodamus_order_id AS order_id,
           (p.created_at AT TIME ZONE 'Europe/Moscow')::date::text AS paid_day,
           p.amount, p.source,
           d.paid_at::text AS dup_paid_at, d.who AS dup_who, d.product AS dup_product
      FROM purchases p
      LEFT JOIN LATERAL (
        SELECT e.paid_at, e.who, e.product
          FROM revenue_entries e
         WHERE e.amount = p.amount
           AND e.paid_at BETWEEN ((p.created_at AT TIME ZONE 'Europe/Moscow')::date - 3)
                             AND ((p.created_at AT TIME ZONE 'Europe/Moscow')::date + 3)
           -- Строка, уже привязанная к нашему собственному номеру, занята другой
           -- оплатой: наши номера уникальны, и совпадение по order_id выше эту
           -- пару уже отсеяло бы. Дубль возможен только у строки, внесённой
           -- руками (номера нет) или по номеру счёта Продамуса.
           AND (e.order_id IS NULL OR e.order_id !~ '^(uroven_|deal_|paid_)')
         ORDER BY abs(e.paid_at - (p.created_at AT TIME ZONE 'Europe/Moscow')::date)
         LIMIT 1
      ) d ON true
     WHERE p.created_at >= ${from} AND p.created_at < ${to}
       AND p.prodamus_order_id IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM revenue_entries e WHERE e.order_id = p.prodamus_order_id
       )
     ORDER BY p.created_at DESC`;
  return rows.map((r) => ({
    orderId: String(r.order_id),
    paidAt: isoDay(r.paid_day),
    amount: num(r.amount),
    source: (r.source as string) || '',
    duplicateOf: r.dup_paid_at
      ? {
        paidAt: isoDay(r.dup_paid_at),
        who: (r.dup_who as string) || '',
        product: (r.dup_product as string) || '',
      }
      : undefined,
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
  const daysPassed = isCurrent ? Math.min(msk(now).getUTCDate(), daysInMonth) : daysInMonth;

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
  const orphans = (await listOrphans(month)).filter((o) => !o.duplicateOf);
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
