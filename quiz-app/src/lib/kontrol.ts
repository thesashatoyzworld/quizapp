// ─────────────────────────────────────────────────────────────
// «Деньги на столе»: от кого в ближайшие недели ждём оплату или продление,
// и видно ли по человеку, что он эти деньги занесёт.
//
// Два источника денег:
//   payment_dues   договорённость: вторая половина, помесячный платёж, продление
//                  лички у тех, кого нет в боте (Стас). Сумма и дата известны.
//   product_access помесячный тариф, у которого кончается срок. Сумма — последняя
//                  оплата человека, дата — конец доступа.
// Кто уже стоит в графике, из второго источника не дублируется.
//
// Рядом с деньгами — следы человека: когда последний раз был в кабинете, сколько
// уроков прошёл, как идёт по карте, когда было последнее касание. И заметка Саши:
// что человек говорит и чем рискуем.
// ─────────────────────────────────────────────────────────────

import { prisma } from './prisma';
import { getStudents } from './progress';

const DAY_MS = 86400_000;
const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
/** Насколько вперёд смотрим. */
const AHEAD_DAYS = 60;
/** Сколько дней после даты человек ещё висит в списке как «не продлил». */
const BEHIND_DAYS = 14;
/** Цена по тарифу, если оплат человека в базе нет (платил мимо Продамуса). */
const TIER_PRICE: Record<string, number> = { 'uroven-t2': 10000, 'uroven-t3': 50000 };

export type WatchKind = 'agreed' | 'renewal' | 'auto';

export interface WatchItem {
  key: string;
  who: string;
  username: string | null;
  tg: string | null;
  kind: WatchKind;
  label: string;
  amount: number;
  /** сумма взята из тарифа, а не из оплаты человека */
  amountGuessed: boolean;
  dueAt: string;
  daysLeft: number;
  /** ставятся ли человеку напоминания в бота */
  botReminders: boolean;
  tier: number | null;
  lastSeenDays: number | null;
  lessonsRead: number | null;
  lessonsTotal: number | null;
  minutes: number | null;
  roadmap: {
    slug: string;
    done: number;
    total: number;
    clientOverdue: number;
    nextClientTask: string | null;
    lastTouchAt: string | null;
  } | null;
  note: string;
  noteAt: string | null;
}

export interface WatchReport {
  items: WatchItem[];
  /** в пределах 30 дней */
  agreed30: number;
  renewal30: number;
}

function mskDay(d: Date): number {
  return Math.floor((d.getTime() + MSK_OFFSET_MS) / DAY_MS);
}

function ddmm(d: Date): string {
  const x = new Date(d.getTime() + MSK_OFFSET_MS);
  return `${String(x.getUTCDate()).padStart(2, '0')}.${String(x.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function getWatchlist(now = new Date()): Promise<WatchReport> {
  const from = new Date(now.getTime() - BEHIND_DAYS * DAY_MS);
  const to = new Date(now.getTime() + AHEAD_DAYS * DAY_MS);

  const [dues, access, students, notes] = await Promise.all([
    prisma.paymentDue.findMany({
      where: { status: 'pending', dueAt: { gte: from, lte: to } },
      orderBy: { dueAt: 'asc' },
    }),
    prisma.productAccess.findMany({
      where: {
        role: 'uroven',
        productSlug: { in: ['uroven-t2', 'uroven-t3'] },
        status: 'active',
        expiresAt: { gte: from, lte: to },
        telegramId: { not: null },
      },
      orderBy: { expiresAt: 'asc' },
    }),
    getStudents(),
    prisma.watchNote.findMany(),
  ]);

  const today = mskDay(now);
  const noteBy = new Map(notes.map((n) => [n.key, n]));
  const studentBy = new Map(students.map((s) => [s.tg, s]));
  const items: WatchItem[] = [];

  // Кто уже в графике: у них дата и сумма договорные, конец доступа не показываем.
  const scheduled = new Set(dues.filter((d) => d.telegramId).map((d) => String(d.telegramId)));

  // Одна строка на человека: ближайший платёж, остальные подписью «дальше».
  const later = new Map<string, typeof dues>();
  for (const d of dues) {
    const tg = d.telegramId ? String(d.telegramId) : null;
    if (tg && later.has(tg)) {
      later.get(tg)!.push(d);
      continue;
    }
    if (tg) later.set(tg, []);
  }

  for (const d of dues) {
    const tg = d.telegramId ? String(d.telegramId) : null;
    if (tg && later.get(tg)!.includes(d)) continue;
    const next = tg ? later.get(tg)! : [];
    const tail = next.length
      ? ` · дальше ${next.map((n) => `${n.amount.toLocaleString('ru-RU')} ₽ ${ddmm(n.dueAt)}`).join(', ')}`
      : '';
    items.push(blank({
      key: tg ? `tg:${tg}` : `due:${d.id}`,
      who: d.who || tg || '—',
      tg,
      kind: 'agreed',
      label: (d.label || 'платёж по договорённости') + tail,
      amount: d.amount,
      amountGuessed: false,
      dueAt: d.dueAt,
      daysLeft: mskDay(d.dueAt) - today,
      botReminders: Boolean(d.telegramId && d.dealId),
    }));
  }

  // Один человек может держать два доступа; берём самый дальний конец.
  const lastAccess = new Map<string, (typeof access)[number]>();
  for (const a of access) {
    const tg = String(a.telegramId);
    if (scheduled.has(tg)) continue;
    const prev = lastAccess.get(tg);
    if (!prev || (prev.expiresAt as Date) < (a.expiresAt as Date)) lastAccess.set(tg, a);
  }

  // Последняя оплата человека за этот же тариф — сумма следующей. Доплата с т1
  // до т2 (3 450) ценой продления не считается, поэтому тариф должен совпасть.
  // Платил мимо Продамуса — цена тарифа.
  const renewIds = [...lastAccess.keys()].map((t) => BigInt(t));
  const purchases = renewIds.length
    ? await prisma.purchase.findMany({
        where: { user: { telegramId: { in: renewIds } }, product: { slug: { in: ['uroven-t2', 'uroven-t3'] } } },
        select: { amount: true, user: { select: { telegramId: true } }, product: { select: { slug: true } } },
        orderBy: { createdAt: 'desc' },
      })
    : [];
  const lastPaid = new Map<string, number>();
  for (const p of purchases) {
    const tg = String(p.user.telegramId);
    const a = lastAccess.get(tg);
    if (a && a.productSlug === p.product.slug && !lastPaid.has(tg)) lastPaid.set(tg, p.amount);
  }

  for (const [tg, a] of lastAccess) {
    const exp = a.expiresAt as Date;
    // uroven_t2_<tg> — оплата из бота через карточку подписки: Продамус спишет сам.
    const auto = /^uroven_t\d_\d+$/.test(a.source || '');
    const paid = lastPaid.get(tg);
    items.push(blank({
      key: `tg:${tg}`,
      who: tg,
      tg,
      kind: auto ? 'auto' : 'renewal',
      label: auto ? 'в этот день кончается доступ, Продамус спишет сам' : 'в этот день кончается доступ, автосписания нет',
      amount: paid ?? TIER_PRICE[a.productSlug] ?? 0,
      amountGuessed: paid === undefined,
      dueAt: exp,
      daysLeft: mskDay(exp) - today,
      botReminders: false,
    }));
  }

  // Следы в кабинете и карта.
  const tgs = items.map((i) => i.tg).filter((t): t is string => !!t);
  const [users, roadmaps] = await Promise.all([
    tgs.length
      ? prisma.user.findMany({
          where: { telegramId: { in: tgs.map((t) => BigInt(t)) } },
          select: { telegramId: true, username: true, firstName: true },
        })
      : [],
    tgs.length
      ? prisma.roadmap.findMany({
          where: { telegramId: { in: tgs.map((t) => BigInt(t)) }, archived: false },
          select: {
            slug: true, telegramId: true, lastTouchAt: true,
            tasks: { select: { status: true, owner: true, dueOn: true, title: true, position: true } },
          },
        })
      : [],
  ]);
  const userBy = new Map(users.map((u) => [String(u.telegramId), u]));
  const roadmapBy = new Map(roadmaps.map((r) => [String(r.telegramId), r]));

  for (const item of items) {
    const note = noteBy.get(item.key);
    if (note) {
      item.note = note.note;
      item.noteAt = note.updatedAt.toISOString();
    }
    if (!item.tg) continue;

    const u = userBy.get(item.tg);
    if (u) {
      item.username = u.username;
      if (item.who === item.tg) item.who = u.firstName || (u.username ? `@${u.username}` : item.tg);
    }

    const s = studentBy.get(item.tg);
    if (s) {
      item.tier = s.tier;
      item.lastSeenDays = s.daysSince;
      item.lessonsRead = s.lessonsRead;
      item.lessonsTotal = s.lessonsTotal;
      item.minutes = s.minutes;
    }

    const r = roadmapBy.get(item.tg);
    if (r) {
      const live = r.tasks.filter((t) => t.status !== 'dropped');
      const open = live
        .filter((t) => t.owner === 'client' && t.status !== 'done')
        .sort((x, y) => x.position - y.position);
      item.roadmap = {
        slug: r.slug,
        done: live.filter((t) => t.status === 'done').length,
        total: live.length,
        clientOverdue: open.filter((t) => t.dueOn && mskDay(t.dueOn) < today).length,
        nextClientTask: open[0]?.title ?? null,
        lastTouchAt: r.lastTouchAt ? r.lastTouchAt.toISOString() : null,
      };
    }
  }

  items.sort((x, y) => x.daysLeft - y.daysLeft);

  const within30 = items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30);
  return {
    items,
    agreed30: within30.filter((i) => i.kind === 'agreed').reduce((s, i) => s + i.amount, 0),
    renewal30: within30.filter((i) => i.kind !== 'agreed').reduce((s, i) => s + i.amount, 0),
  };
}

function blank(
  base: Pick<WatchItem, 'key' | 'who' | 'tg' | 'kind' | 'label' | 'amount' | 'amountGuessed' | 'daysLeft' | 'botReminders'> & { dueAt: Date },
): WatchItem {
  return {
    ...base,
    dueAt: base.dueAt.toISOString(),
    username: null,
    tier: null,
    lastSeenDays: null,
    lessonsRead: null,
    lessonsTotal: null,
    minutes: null,
    roadmap: null,
    note: '',
    noteAt: null,
  };
}

export async function saveWatchNote(key: string, note: string) {
  const text = note.trim();
  if (!text) {
    await prisma.watchNote.delete({ where: { key } }).catch(() => null);
    return;
  }
  await prisma.watchNote.upsert({ where: { key }, create: { key, note: text }, update: { note: text } });
}
