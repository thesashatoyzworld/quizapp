import { prisma } from '@/lib/prisma';
import { HUKI_CHANNEL } from '@/lib/huki';

// ─────────────────────────────────────────────────────────────
// Воронка «5000 хуков» для админки (/admin/huki).
//
// Две ветки:
//   1. Подписка: зашёл на /huki → увидел гейт → ушёл в бота → подписался → база открыта.
//      Страница пишет huki_* (anon, по session_id), бот — leadmagnet_* со slug=huki.
//   2. «Поток Спроса»: клик с /huki → лендинг с utm_medium=huki* → чекаут (?from=huki*)
//      → оплата (purchases, сводим с чекаутом по order_id, как в leads.ts).
// ─────────────────────────────────────────────────────────────

export type HukiPeriod = 'today' | '7d' | '30d' | 'all';

const MSK_DAY_START = "((date_trunc('day', now() AT TIME ZONE 'Europe/Moscow')) AT TIME ZONE 'Europe/Moscow')";

function since(period: HukiPeriod, col = 'created_at'): string {
  if (period === 'today') return `${col} >= ${MSK_DAY_START}`;
  if (period === 'all') return 'true';
  return `${col} >= now() - interval '${period === '30d' ? 30 : 7} days'`;
}

const num = (v: unknown): number => (typeof v === 'bigint' ? Number(v) : v == null ? 0 : Number(v));

export interface HukiStats {
  period: HukiPeriod;
  page: {
    visitors: number;       // уникальные сессии на /huki
    browser: number;        // из них в обычном браузере (инста и т.п.)
    miniapp: number;        // из них в мини-аппе Телеграма
    gateSeen: number;       // увидели окно подписки
    openBot: number;        // нажали «Открыть через Телеграм»
    unlocked: number;       // база открылась (любым путём)
    unlockedAfterGate: number; // открылась после окна подписки = пришёл новый подписчик или клиент
  };
  bot: {
    gated: number;       // пришли в бота неподписанными
    subscribed: number;  // подписались через гейт бота
    delivered: number;   // получили кнопку на базу
  };
  channelMembers: number | null; // подписчиков в канале сейчас
  potok: {
    ctaClicks: number;      // уникальные сессии, кликнувшие «Поток Спроса» на /huki
    ctaMain: number;
    ctaFeed: number;
    landingVisits: number;  // сессии на лендинге с utm_medium=huki*
    checkouts: number;      // открыли оплату с меткой from=huki*
    purchases: number;
    revenue: number;
  };
  byDay: { day: string; visitors: number; gateSeen: number; subscribed: number; ctaClicks: number }[];
}

async function channelMembers(): Promise<number | null> {
  const token = process.env.BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getChatMemberCount?chat_id=${encodeURIComponent(HUKI_CHANNEL)}`,
      { cache: 'no-store' },
    );
    const j = await res.json();
    return j.ok ? Number(j.result) : null;
  } catch {
    return null;
  }
}

export async function getHukiStats(period: HukiPeriod): Promise<HukiStats> {
  const w = since(period);
  const wE = since(period, 'e.created_at');
  const wP = since(period, 'pu.created_at');

  const [pageRaw, botRaw, potokRaw, buysRaw, dayRaw, members] = await Promise.all([
    prisma.$queryRawUnsafe(`
      SELECT
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_view') AS visitors,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_view' AND metadata->>'ctx'='browser') AS browser,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_view' AND metadata->>'ctx'='miniapp') AS miniapp,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_gate_view') AS gate_seen,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_gate_click' AND metadata->>'cta'='open_bot') AS open_bot,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_unlock') AS unlocked,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_unlock' AND metadata->>'after_gate'='true') AS unlocked_after_gate,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_cta_click') AS cta_clicks,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_cta_click' AND metadata->>'cta'='potok-main') AS cta_main,
        count(DISTINCT metadata->>'session_id') FILTER (WHERE type='huki_cta_click' AND metadata->>'cta'='potok-feed') AS cta_feed
      FROM events WHERE funnel='huki' AND ${w}
    `),
    prisma.$queryRawUnsafe(`
      SELECT
        count(DISTINCT telegram_id) FILTER (WHERE type='leadmagnet_gated')      AS gated,
        count(DISTINCT telegram_id) FILTER (WHERE type='leadmagnet_subscribed') AS subscribed,
        count(DISTINCT telegram_id) FILTER (WHERE type='leadmagnet_delivered')  AS delivered
      FROM events
      WHERE type IN ('leadmagnet_gated','leadmagnet_subscribed','leadmagnet_delivered')
        AND (metadata->>'slug'='huki' OR utm_source='leadmagnet_huki') AND ${w}
    `),
    prisma.$queryRawUnsafe(`
      SELECT
        count(DISTINCT metadata->>'session_id') FILTER (
          WHERE type='page_view' AND source='web' AND metadata->>'path' LIKE '/potok-sprosa%'
            AND utm_medium LIKE 'huki%') AS landing,
        count(*) FILTER (WHERE type='checkout_open' AND metadata->>'from' LIKE 'huki%') AS checkouts
      FROM events WHERE ${w}
    `),
    // Оплаты «Потока», у которых чекаут открыт с меткой from=huki*.
    prisma.$queryRawUnsafe(`
      SELECT count(*) AS n, coalesce(sum(pu.amount),0) AS revenue
      FROM purchases pu
      JOIN products p ON p.id = pu.product_id AND p.slug = 'potok-sprosa'
      JOIN LATERAL (
        SELECT e.metadata FROM events e
        WHERE e.type='checkout_open'
          AND (e.metadata->>'order_id' = pu.prodamus_order_id
               OR (pu.prodamus_order_id LIKE 'paid\\_%'
                   AND e.metadata->>'order_id' LIKE '%\\_web\\_' || substr(pu.prodamus_order_id, 6)))
          AND e.created_at <= pu.created_at
        ORDER BY e.created_at DESC LIMIT 1
      ) co ON co.metadata->>'from' LIKE 'huki%'
      WHERE ${wP}
    `),
    prisma.$queryRawUnsafe(`
      SELECT date_trunc('day', e.created_at AT TIME ZONE 'Europe/Moscow')::date AS day,
        count(DISTINCT e.metadata->>'session_id') FILTER (WHERE e.type='huki_view')      AS visitors,
        count(DISTINCT e.metadata->>'session_id') FILTER (WHERE e.type='huki_gate_view') AS gate_seen,
        count(DISTINCT e.telegram_id) FILTER (WHERE e.type='leadmagnet_subscribed'
          AND (e.metadata->>'slug'='huki' OR e.utm_source='leadmagnet_huki'))            AS subscribed,
        count(DISTINCT e.metadata->>'session_id') FILTER (WHERE e.type='huki_cta_click') AS cta_clicks
      FROM events e
      WHERE (e.funnel='huki' OR e.type='leadmagnet_subscribed') AND ${wE}
      GROUP BY 1 ORDER BY 1 DESC LIMIT 60
    `),
    channelMembers(),
  ]);

  const p = (pageRaw as Record<string, unknown>[])[0] || {};
  const b = (botRaw as Record<string, unknown>[])[0] || {};
  const k = (potokRaw as Record<string, unknown>[])[0] || {};
  const y = (buysRaw as Record<string, unknown>[])[0] || {};

  return {
    period,
    page: {
      visitors: num(p.visitors),
      browser: num(p.browser),
      miniapp: num(p.miniapp),
      gateSeen: num(p.gate_seen),
      openBot: num(p.open_bot),
      unlocked: num(p.unlocked),
      unlockedAfterGate: num(p.unlocked_after_gate),
    },
    bot: { gated: num(b.gated), subscribed: num(b.subscribed), delivered: num(b.delivered) },
    channelMembers: members,
    potok: {
      ctaClicks: num(p.cta_clicks),
      ctaMain: num(p.cta_main),
      ctaFeed: num(p.cta_feed),
      landingVisits: num(k.landing),
      checkouts: num(k.checkouts),
      purchases: num(y.n),
      revenue: num(y.revenue),
    },
    byDay: (dayRaw as Record<string, unknown>[]).map((r) => ({
      day: String(r.day instanceof Date ? r.day.toISOString().slice(0, 10) : r.day),
      visitors: num(r.visitors),
      gateSeen: num(r.gate_seen),
      subscribed: num(r.subscribed),
      ctaClicks: num(r.cta_clicks),
    })),
  };
}
