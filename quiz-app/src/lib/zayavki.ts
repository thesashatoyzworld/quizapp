// Заявки с сайта: список для раздела «Заявки» и карточка человека.
//
// Анкета одна на несколько потоков (менторство, листы ожидания тарифов),
// живёт в dwy_leads. Telegram-логина в ней нет намеренно, поэтому человека
// в остальных таблицах ищем по тому, что он вписал руками: телеграм-нику,
// инстаграм-нику и телефону.

import { prisma } from '@/lib/prisma';
import { normalizeInstagram } from '@/lib/dwy-message';
import { LEVELS, DWY_MODES, isDwyKind } from '@/content/dwy';

/** Стадии работы с заявкой. Порядок = порядок движения по воронке. */
export const LEAD_STATUSES = ['new', 'written', 'replied', 'call', 'client', 'rejected'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'новая',
  written: 'написал',
  replied: 'ответил',
  call: 'созвон',
  client: 'клиент',
  rejected: 'отказ',
};

/** Цвет статуса. Один словарь на список и на карточку, чтобы не разъезжались. */
export const STATUS_COLOR: Record<LeadStatus, string> = {
  new: '#00f0ff',
  written: '#ffd166',
  replied: '#c792ea',
  call: '#7ee787',
  client: '#3fb950',
  rejected: '#8b949e',
};

export function isLeadStatus(v: unknown): v is LeadStatus {
  return typeof v === 'string' && (LEAD_STATUSES as readonly string[]).includes(v);
}

/** Как называется поток: «Анкета на менторство», «Лист ожидания - тариф 2». */
export function kindLabel(kind: string | null): string {
  return isDwyKind(kind) ? DWY_MODES[kind].notice.replace(/^📌\s*/, '') : 'анкета';
}

export type LeadRow = {
  id: number;
  name: string;
  username: string | null;
  contact: string | null;
  instagram: string | null;
  phone: string | null;
  kind: string | null;
  source: string | null;
  status: LeadStatus;
  note: string | null;
  createdAt: Date;
  /** Сколько всего анкет у этого человека, включая эту. 1 = пришёл однажды. */
  formsCount: number;
  /** Заходил в бота: нашёлся в users по нику. */
  inBot: boolean;
  /** Что-то покупал. */
  paid: boolean;
};

export type LeadFilters = {
  kind?: string;
  source?: string;
  status?: string;
  q?: string;
};

/** Ключ человека: по нему склеиваем повторные анкеты одного и того же. */
function personKeys(lead: {
  username: string | null; phone: string | null; instagram: string | null; contact: string | null;
}) {
  const insta = lead.instagram ? normalizeInstagram(lead.instagram) : null;
  return {
    username: lead.username ? lead.username.toLowerCase() : null,
    instagram: insta ? insta.toLowerCase() : null,
    phone: lead.phone,
    contact: lead.contact ? lead.contact.trim().toLowerCase() : null,
  };
}

/**
 * Список заявок под фильтры раздела.
 *
 * Признаки «в боте» и «покупал» считаем одним запросом на всю страницу, а не
 * по строке: 98 заявок дали бы 196 обращений к базе и раздел открывался бы
 * секундами, как «Кампании».
 */
export async function listLeads(filters: LeadFilters = {}): Promise<LeadRow[]> {
  const q = (filters.q || '').trim().toLowerCase();

  const leads = await prisma.dwyLead.findMany({
    where: {
      ...(filters.kind ? { kind: filters.kind } : {}),
      ...(filters.source ? { source: filters.source } : {}),
      ...(isLeadStatus(filters.status) ? { status: filters.status } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' as const } },
              { username: { contains: q, mode: 'insensitive' as const } },
              { contact: { contains: q, mode: 'insensitive' as const } },
              { instagram: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q } },
              { note: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  const usernames = leads.map((l) => l.username?.toLowerCase()).filter((u): u is string => !!u);

  const users = usernames.length
    ? await prisma.user.findMany({
        where: { username: { in: usernames, mode: 'insensitive' } },
        select: { id: true, username: true },
      })
    : [];
  const userByName = new Map(users.map((u) => [(u.username || '').toLowerCase(), u.id]));

  const buyers = users.length
    ? await prisma.purchase.groupBy({
        by: ['userId'],
        where: { userId: { in: users.map((u) => u.id) } },
      })
    : [];
  const paidUserIds = new Set(buyers.map((b) => b.userId));

  // Сколько раз этот человек присылал анкету. Считаем по нику: телефон и
  // инстаграм заполнены у четверти, ник — почти у всех.
  const countByName = new Map<string, number>();
  for (const l of leads) {
    const key = l.username?.toLowerCase();
    if (key) countByName.set(key, (countByName.get(key) || 0) + 1);
  }

  return leads.map((l) => {
    const key = l.username?.toLowerCase() || null;
    const userId = key ? userByName.get(key) : undefined;
    return {
      id: l.id,
      name: l.firstName || 'без имени',
      username: l.username,
      contact: l.contact,
      instagram: l.instagram,
      phone: l.phone,
      kind: l.kind,
      source: l.source,
      status: isLeadStatus(l.status) ? l.status : 'new',
      note: l.note,
      createdAt: l.createdAt,
      formsCount: key ? countByName.get(key) || 1 : 1,
      inBot: !!userId,
      paid: !!userId && paidUserIds.has(userId),
    };
  });
}

/** Значения для выпадающих фильтров — берём из самих данных, а не из списка констант. */
export async function listLeadFacets() {
  const [kinds, sources, statuses] = await Promise.all([
    prisma.dwyLead.groupBy({ by: ['kind'], _count: true }),
    prisma.dwyLead.groupBy({ by: ['source'], _count: true }),
    prisma.dwyLead.groupBy({ by: ['status'], _count: true }),
  ]);

  return {
    kinds: kinds
      .filter((k) => k.kind)
      .map((k) => ({ value: k.kind as string, count: k._count, label: kindLabel(k.kind) }))
      .sort((a, b) => b.count - a.count),
    sources: sources
      .filter((s) => s.source)
      .map((s) => ({ value: s.source as string, count: s._count }))
      .sort((a, b) => b.count - a.count),
    statuses: statuses
      .map((s) => ({ value: s.status, count: s._count }))
      .sort((a, b) => LEAD_STATUSES.indexOf(a.value as LeadStatus) - LEAD_STATUSES.indexOf(b.value as LeadStatus)),
  };
}

export type LeadAnswer = { label: string; value: string };

export type LeadCard = {
  lead: {
    id: number;
    name: string;
    username: string | null;
    contact: string | null;
    phone: string | null;
    instagram: string | null;
    instagramHandle: string | null;
    kind: string | null;
    source: string | null;
    status: LeadStatus;
    note: string | null;
    updatedBy: string | null;
    updatedAt: Date | null;
    createdAt: Date;
  };
  answers: LeadAnswer[];
  /** Другие анкеты того же человека, новее сверху. */
  otherForms: { id: number; kind: string | null; source: string | null; createdAt: Date }[];
  /** Из какой воронки ChatPlace пришёл и что с перепиской. */
  funnels: {
    automationName: string | null;
    keyword: string | null;
    firstSeenAt: Date;
    lastEventAt: Date;
    chatStatus: string | null;
    chatHandler: string | null;
    status: string;
    note: string | null;
  }[];
  bot: { telegramId: string; firstName: string | null; startedAt: Date } | null;
  intake: { id: string; status: string; track: string; completedAt: Date | null } | null;
  purchases: { name: string; amount: number; source: string | null; createdAt: Date }[];
  accesses: { productSlug: string; role: string; status: string; expiresAt: Date | null }[];
  /** Листы ожидания, куда человек записался из бота. */
  waitlists: { label: string; createdAt: Date }[];
};

/** Ответы анкеты в порядке формы. Пустые поля не показываем: в листе ожидания их нет. */
function buildAnswers(l: {
  who: string | null; hasProduct: string | null; product: string | null; level: number | null;
  tried: string | null; want: string | null; income: string | null; hours: string | null;
}): LeadAnswer[] {
  const out: LeadAnswer[] = [];
  if (l.who) out.push({ label: 'кем себя считает', value: l.who });
  if (l.hasProduct) {
    out.push({ label: 'есть продукт', value: l.product ? `${l.hasProduct} · ${l.product}` : l.hasProduct });
  }
  if (l.level) out.push({ label: 'уровень', value: `${l.level} · ${LEVELS[l.level - 1] || ''}`.trim() });
  if (l.income) out.push({ label: 'доход', value: l.income });
  if (l.hours) out.push({ label: 'часов в неделю', value: l.hours });
  if (l.tried) out.push({ label: 'что пробовал', value: l.tried });
  if (l.want) out.push({ label: 'что хочет через 3 месяца', value: l.want });
  return out;
}

/**
 * Всё, что известно о человеке из этой заявки.
 *
 * Ищем по трём ключам: телеграм-ник, инстаграм-ник, телефон. Совпадение по
 * имени намеренно не используем — «Александр» в базе двадцать штук, и склейка
 * по имени показала бы Саше чужие покупки.
 */
export async function getLeadCard(id: number): Promise<LeadCard | null> {
  const l = await prisma.dwyLead.findUnique({ where: { id } });
  if (!l) return null;

  const keys = personKeys(l);
  const instagramHandle = keys.instagram;

  const [otherForms, igLeads, user] = await Promise.all([
    prisma.dwyLead.findMany({
      where: {
        id: { not: id },
        OR: [
          ...(keys.username ? [{ username: { equals: keys.username, mode: 'insensitive' as const } }] : []),
          ...(keys.phone ? [{ phone: keys.phone }] : []),
          ...(keys.instagram ? [{ instagram: { contains: keys.instagram, mode: 'insensitive' as const } }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, kind: true, source: true, createdAt: true },
    }),
    // В воронке ChatPlace человек лежит под инстаграм-ником, но анкету мог
    // подписать телеграмом — проверяем оба.
    keys.username || keys.instagram
      ? prisma.igLead.findMany({
          where: {
            username: {
              in: [keys.username, keys.instagram].filter((v): v is string => !!v),
              mode: 'insensitive',
            },
          },
          orderBy: { lastEventAt: 'desc' },
        })
      : Promise.resolve([]),
    keys.username
      ? prisma.user.findFirst({
          where: { username: { equals: keys.username, mode: 'insensitive' } },
        })
      : Promise.resolve(null),
  ]);

  const [intake, purchases, accesses, syncWl, moneyWl] = await Promise.all([
    keys.username
      ? prisma.intake.findFirst({
          where: { username: { equals: keys.username, mode: 'insensitive' } },
          orderBy: { invitedAt: 'desc' },
          select: { id: true, status: true, track: true, completedAt: true },
        })
      : Promise.resolve(null),
    user
      ? prisma.purchase.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : Promise.resolve([]),
    user
      ? prisma.productAccess.findMany({
          where: { OR: [{ userId: user.id }, { telegramId: user.telegramId }] },
          orderBy: { grantedAt: 'desc' },
          take: 20,
        })
      : Promise.resolve([]),
    user
      ? prisma.syncWaitlist.findMany({ where: { telegramId: user.telegramId } })
      : Promise.resolve([]),
    user
      ? prisma.moneyMkWaitlist.findMany({ where: { telegramId: user.telegramId } })
      : Promise.resolve([]),
  ]);

  // Название продукта у покупки лежит отдельной таблицей — тянем одним запросом.
  const productIds = [...new Set(purchases.map((p) => p.productId))];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } })
    : [];
  const productName = new Map(products.map((p) => [p.id, p.name]));

  return {
    lead: {
      id: l.id,
      name: l.firstName || 'без имени',
      username: l.username,
      contact: l.contact,
      phone: l.phone,
      instagram: l.instagram,
      instagramHandle,
      kind: l.kind,
      source: l.source,
      status: isLeadStatus(l.status) ? l.status : 'new',
      note: l.note,
      updatedBy: l.updatedBy,
      updatedAt: l.updatedAt,
      createdAt: l.createdAt,
    },
    answers: buildAnswers(l),
    otherForms,
    funnels: igLeads.map((f) => ({
      automationName: f.automationName,
      keyword: f.keyword,
      firstSeenAt: f.firstSeenAt,
      lastEventAt: f.lastEventAt,
      chatStatus: f.chatStatus,
      chatHandler: f.chatHandler,
      status: f.status,
      note: f.note,
    })),
    bot: user
      ? { telegramId: String(user.telegramId), firstName: user.firstName, startedAt: user.createdAt }
      : null,
    intake,
    purchases: purchases.map((p) => ({
      name: productName.get(p.productId) || p.productId,
      amount: p.amount,
      source: p.source,
      createdAt: p.createdAt,
    })),
    accesses: accesses.map((a) => ({
      productSlug: a.productSlug,
      role: a.role,
      status: a.status,
      expiresAt: a.expiresAt,
    })),
    waitlists: [
      ...syncWl.map((w) => ({ label: `SYNC · ${w.tier}`, createdAt: w.createdAt })),
      ...moneyWl.map((w) => ({ label: 'МК «Разрешение быстрых денег»', createdAt: w.createdAt })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  };
}
