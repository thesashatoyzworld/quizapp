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
import { prices } from '@/content/prices';

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

/**
 * Деньги, которых ждём до конца месяца.
 *   agreed   — строка в графике платежей (payment_dues): сумма и дата договорные;
 *   auto     — подписка из бота, Продамус спишет сам (но вебхук об этом не шлёт,
 *              строка уйдёт, только когда доступ продлят);
 *   renewal  — помесячный доступ без автосписания, продление руками.
 */
export interface ExpectedPayment {
  key: string;
  dueAt: string;          // YYYY-MM-DD по Москве
  who: string;
  label: string;
  amount: number;
  /** сумма взята из прайса, а не из прошлой оплаты человека */
  amountGuessed: boolean;
  kind: 'agreed' | 'auto' | 'renewal';
}

export interface MonthReport {
  month: string;
  entries: RevenueEntry[];
  orphans: OrphanPayment[];
  expected: ExpectedPayment[];
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

/**
 * Кто и сколько должен занести до конца месяца. Источники те же, что у
 * «Денег на столе» (src/lib/kontrol.ts), только окно — календарный месяц.
 * Прошедшим месяцам ждать нечего, там пусто.
 */
export async function listExpected(month: string, now = new Date()): Promise<ExpectedPayment[]> {
  if (month < currentMonth(now)) return [];
  const { from, to } = monthRange(month);

  // Время в обеих таблицах — UTC без зоны; день считаем по Москве.
  const dues = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT id, telegram_id::text AS tg, who, amount, label,
           (due_at + interval '3 hours')::date::text AS due_day
      FROM payment_dues
     WHERE status = 'pending'
       AND due_at + interval '3 hours' >= ${from}
       AND due_at + interval '3 hours' < ${to}
     ORDER BY due_at`;

  // Помесячные доступы, которые кончаются в этом месяце. Кто держит другой
  // доступ дальше конца месяца или стоит в графике с любой датой (его деньги
  // уже посчитаны договорённостью), не считается дважды.
  // Сумма — последняя оплата того же тарифа, иначе цена из прайса.
  const access = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT DISTINCT ON (pa.telegram_id)
           pa.telegram_id::text AS tg, pa.product_slug, pa.source,
           (pa.expires_at + interval '3 hours')::date::text AS due_day,
           u.username, u.first_name,
           (SELECT p.amount FROM purchases p
              JOIN users pu ON pu.id = p.user_id
              JOIN products pr ON pr.id = p.product_id
             WHERE pu.telegram_id = pa.telegram_id AND pr.slug = pa.product_slug
             ORDER BY p.created_at DESC LIMIT 1) AS last_paid,
           -- Кого нет в боте (Стас), того знаем только по графику платежей.
           (SELECT d.amount FROM payment_dues d
             WHERE d.telegram_id = pa.telegram_id AND d.status = 'paid'
             ORDER BY d.paid_at DESC NULLS LAST LIMIT 1) AS last_due,
           (SELECT d.who FROM payment_dues d
             WHERE d.telegram_id = pa.telegram_id AND d.who <> ''
             ORDER BY d.created_at DESC LIMIT 1) AS due_who
      FROM product_access pa
      LEFT JOIN users u ON u.telegram_id = pa.telegram_id
     WHERE pa.role = 'uroven'
       AND pa.product_slug IN ('uroven-t2', 'uroven-t3')
       AND pa.status = 'active'
       AND pa.telegram_id IS NOT NULL
       AND pa.expires_at + interval '3 hours' >= ${from}
       AND pa.expires_at + interval '3 hours' < ${to}
       AND NOT EXISTS (
         SELECT 1 FROM product_access o
          WHERE o.telegram_id = pa.telegram_id AND o.status = 'active'
            AND o.product_slug IN ('uroven-t2', 'uroven-t3')
            AND o.expires_at + interval '3 hours' >= ${to}
       )
       AND NOT EXISTS (
         SELECT 1 FROM payment_dues d
          WHERE d.telegram_id = pa.telegram_id AND d.status = 'pending'
       )
     ORDER BY pa.telegram_id, pa.expires_at DESC`;

  const price = prices(now);
  const out: ExpectedPayment[] = dues.map((d) => ({
    key: `due:${d.id}`,
    dueAt: isoDay(d.due_day),
    who: (d.who as string) || (d.tg as string) || '—',
    label: (d.label as string) || 'платёж по договорённости',
    amount: num(d.amount),
    amountGuessed: false,
    kind: 'agreed' as const,
  }));

  for (const a of access) {
    const t3 = a.product_slug === 'uroven-t3';
    // uroven_t2_<tg> — оплата из бота через карточку подписки: Продамус спишет сам.
    const auto = /^uroven_t\d_\d+$/.test((a.source as string) || '');
    const last = a.last_paid ?? a.last_due;
    const paid = last == null ? null : num(last);
    const name = a.username ? `@${a.username}` : '';
    out.push({
      key: `tg:${a.tg}`,
      dueAt: isoDay(a.due_day),
      who: [name, a.first_name ? `(${a.first_name})` : ''].filter(Boolean).join(' ')
        || (a.due_who as string) || String(a.tg),
      label: `${t3 ? 'тариф 3' : 'тариф 2'}, ${auto ? 'автосписание' : 'продление руками'}`,
      amount: paid ?? (t3 ? price.t3Month : price.t2Month),
      amountGuessed: paid == null,
      kind: auto ? 'auto' : 'renewal',
    });
  }

  return out.sort((x, y) => x.dueAt.localeCompare(y.dueAt));
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
  const [entries, orphans, expected, target] = await Promise.all([
    listEntries(month),
    listOrphans(month),
    listExpected(month),
    getTarget(month),
  ]);
  return { month, entries, orphans, expected, totals: computeTotals(month, entries, target) };
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
