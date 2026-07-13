import { prisma } from '@/lib/prisma';

// Лид воронки /uroven: живьём из events (клики «Забрать», заходы на лендинг,
// попытки оплаты), обогащённый юзернеймом, реальной оплатой и ручным статусом.
export type LeadStatusValue = 'new' | 'written' | 'replied' | 'bought' | 'rejected';

export type UrovenLead = {
  tg: string;
  username: string | null;
  name: string | null;
  clicks: number;
  visits: number;
  checkouts: number;
  paid: boolean;
  source: string | null;
  lastAt: string;
  status: LeadStatusValue;
  note: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

type AggRow = {
  tg: string;
  username: string | null;
  name: string | null;
  clicks: number;
  visits: number;
  checkouts: number;
  source: string | null;
  last_at: Date;
};

export const PRODUCT = 'uroven';

export async function getUrovenLeads(): Promise<UrovenLead[]> {
  // 1) агрегируем события по человеку (только те, у кого есть Telegram-id)
  const agg = await prisma.$queryRaw<AggRow[]>`
    SELECT
      COALESCE(e.telegram_id::text, e.metadata->>'tg')                                       AS tg,
      MAX(u.username)                                                                        AS username,
      MAX(u.first_name)                                                                      AS name,
      COUNT(*) FILTER (WHERE e.type = 'cta_click')::int                                      AS clicks,
      COUNT(*) FILTER (WHERE e.type = 'uroven_view')::int                                    AS visits,
      COUNT(*) FILTER (WHERE e.type = 'checkout_open')::int                                  AS checkouts,
      (ARRAY_AGG(e.metadata->>'from' ORDER BY e.created_at DESC)
         FILTER (WHERE e.metadata->>'from' IS NOT NULL))[1]                                  AS source,
      MAX(e.created_at)                                                                      AS last_at
    FROM events e
    LEFT JOIN users u
      ON u.telegram_id = COALESCE(e.telegram_id, NULLIF(e.metadata->>'tg', '')::bigint)
    WHERE e.type IN ('cta_click', 'uroven_view', 'checkout_open')
      AND COALESCE(e.telegram_id::text, e.metadata->>'tg') IS NOT NULL
    GROUP BY tg
  `;

  // 2) реальные оплаты uroven → множество tg (order_id: uroven_<tier>_<tg>)
  const paidRows = await prisma.$queryRaw<{ tg: string }[]>`
    SELECT DISTINCT split_part(pu.prodamus_order_id, '_', 3) AS tg
    FROM purchases pu
    JOIN products p ON p.id = pu.product_id
    WHERE (pu.source = 'uroven' OR p.slug LIKE 'uroven%')
      AND pu.prodamus_order_id ~ '_[0-9]{4,}$'
  `;
  const paid = new Set(paidRows.map((r) => r.tg));

  // 3) ручные статусы из lead_status
  const statuses = await prisma.leadStatus.findMany({ where: { product: PRODUCT } });
  const byTg = new Map(statuses.map((s) => [s.telegramId.toString(), s]));

  const leads: UrovenLead[] = agg.map((r) => {
    const st = byTg.get(r.tg);
    const isPaid = paid.has(r.tg);
    // Реальная оплата побеждает ручной статус, если он не выставлен «купил» явно.
    const status: LeadStatusValue = (st?.status as LeadStatusValue) || (isPaid ? 'bought' : 'new');
    return {
      tg: r.tg,
      username: r.username,
      name: r.name,
      clicks: Number(r.clicks),
      visits: Number(r.visits),
      checkouts: Number(r.checkouts),
      paid: isPaid,
      source: r.source,
      lastAt: r.last_at.toISOString(),
      status,
      note: st?.note ?? null,
      updatedBy: st?.updatedBy ?? null,
      updatedAt: st?.updatedAt ? st.updatedAt.toISOString() : null,
    };
  });

  // Сортировка по «теплоте»: зашёл на лендинг → кликал → свежесть
  const rank = (l: UrovenLead) => (l.visits > 0 ? 2 : 1);
  leads.sort(
    (a, b) =>
      rank(b) - rank(a) ||
      b.visits - a.visits ||
      b.clicks - a.clicks ||
      +new Date(b.lastAt) - +new Date(a.lastAt),
  );
  return leads;
}
