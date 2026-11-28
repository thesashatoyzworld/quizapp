import { prisma } from '@/lib/prisma';
import { SASHA_TG } from '@/content/sasha';

// /admin/metki: одна строка на метку поста (start-параметр бота, он же utm_source
// у bot_start; для гайдов «<гайд> · <src>»). Воронка по людям, каждый считается
// в окне w дней от СВОЕГО первого клика по этой метке:
//   нажали        — разные telegram_id с bot_start / leadmagnet_gated|delivered;
//   получили      — бот доставил обещанное (metadata.delivered, leadmagnet_delivered)
//                   или человек открыл целевую страницу (page_view с его tg);
//   посмотрели    — video_play / video_progress / scroll_depth с его tg;
//   пошли платить — checkout_open с его tg; для potok_* ещё анонимные чекауты
//                   сайта с тем же ?post= (считаются заказами, а не людьми);
//   оплатили      — purchases на его аккаунт + непривязанные web_paid по таким чекаутам.
// tracked = у метки есть bot_start с metadata.delivered (размечаем с 28.11.2026):
// до этого «получили/посмотрели/пошли платить» для потока были анонимными,
// интерфейс показывает там прочерк, а не ноль.
export type MetkaRow = {
  label: string;
  first_at: Date;
  last_at: Date;
  pressed: number;
  tracked: boolean;
  got: number;
  watched: number;
  checkout: number;
  paid: number;
  paid_sum: number;
  anon_checkout: number;
  anon_paid: number;
  anon_paid_sum: number;
};

export const WINDOWS = [1, 3, 7] as const;

export async function getMetki(w: number): Promise<MetkaRow[]> {
  return prisma.$queryRaw<MetkaRow[]>`
WITH clicks AS (
  SELECT e.utm_source AS label, e.telegram_id AS tg, e.created_at,
         COALESCE((e.metadata->>'delivered')::boolean, false) AS delivered,
         COALESCE(e.metadata ? 'delivered', false) AS tracked
  FROM events e
  WHERE e.type = 'bot_start' AND e.utm_source ~ '^(potok|kazino|uroven|uniq)_'
    AND e.telegram_id IS NOT NULL AND e.telegram_id <> ${SASHA_TG}
    AND e.created_at > now() - interval '120 days'
  UNION ALL
  SELECT substr(e.utm_source, 12) || ' · ' || (e.metadata->>'src'), e.telegram_id, e.created_at,
         e.type = 'leadmagnet_delivered', true
  FROM events e
  WHERE e.type IN ('leadmagnet_gated', 'leadmagnet_delivered') AND e.utm_source LIKE 'leadmagnet\\_%'
    AND e.metadata->>'src' IS NOT NULL
    AND e.telegram_id IS NOT NULL AND e.telegram_id <> ${SASHA_TG}
    AND e.created_at > now() - interval '120 days'
),
people AS (
  SELECT label, tg, min(created_at) AS t0, min(created_at) + make_interval(days => ${w}) AS t1,
         bool_or(delivered) AS got_bot, bool_or(tracked) AS tracked,
         CASE WHEN label LIKE 'kazino\\_%' THEN '/algoritm-sistema%'
              WHEN label LIKE 'potok\\_%' THEN '/potok-sprosa%'
              WHEN label LIKE 'uroven\\_%' THEN '/uroven%' END AS target
  FROM clicks GROUP BY label, tg
),
web AS (
  SELECT COALESCE(e.telegram_id, CASE WHEN e.metadata->>'tg' ~ '^[0-9]{3,15}$' THEN (e.metadata->>'tg')::bigint END) AS tg,
         e.type, e.created_at, e.metadata->>'path' AS path
  FROM events e
  WHERE e.type IN ('page_view', 'video_play', 'video_progress', 'scroll_depth')
    AND (e.telegram_id IS NOT NULL OR e.metadata ? 'tg')
    AND e.created_at > now() - interval '130 days'
),
co AS (
  SELECT CASE WHEN e.metadata->>'tg' ~ '^[0-9]{3,15}$' THEN (e.metadata->>'tg')::bigint END AS tg,
         e.metadata->>'post' AS post, e.metadata->>'order_id' AS order_id, e.created_at
  FROM events e
  WHERE e.type = 'checkout_open' AND e.created_at > now() - interval '130 days'
),
pur AS (
  SELECT u.telegram_id AS tg, pu.amount, pu.created_at
  FROM purchases pu JOIN users u ON u.id = pu.user_id
  WHERE pu.created_at > now() - interval '130 days'
),
per AS (
  SELECT p.label, p.tg, p.t0, p.tracked,
         p.got_bot OR COALESCE(w.got_page, false) AS got,
         COALESCE(w.watched, false) AS watched,
         c.n > 0 AS checkout,
         pa.n AS paid_n, COALESCE(pa.s, 0) AS paid_sum
  FROM people p
  LEFT JOIN LATERAL (
    SELECT bool_or(w.type = 'page_view' AND w.path LIKE p.target) AS got_page,
           bool_or(w.type <> 'page_view') AS watched
    FROM web w WHERE w.tg = p.tg AND w.created_at BETWEEN p.t0 AND p.t1
  ) w ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS n FROM co WHERE co.tg = p.tg AND co.created_at BETWEEN p.t0 AND p.t1
  ) c ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS n, sum(pur.amount) AS s FROM pur WHERE pur.tg = p.tg AND pur.created_at BETWEEN p.t0 AND p.t1
  ) pa ON true
),
labels AS (
  SELECT label, min(t0) AS first_at, max(t0) AS last_at, count(*)::int AS pressed, bool_or(tracked) AS tracked,
         count(*) FILTER (WHERE got)::int AS got,
         count(*) FILTER (WHERE watched)::int AS watched,
         count(*) FILTER (WHERE checkout)::int AS checkout,
         count(*) FILTER (WHERE paid_n > 0)::int AS paid,
         COALESCE(sum(paid_sum), 0)::float AS paid_sum
  FROM per GROUP BY label
),
-- anonymous checkouts from the site matched by ?post= (potok labels only: post comes from /potok-sprosa)
anon AS (
  SELECT l.label, co.order_id
  FROM labels l JOIN co
    ON co.tg IS NULL AND l.label LIKE 'potok\\_%'
   AND regexp_replace(co.post, '[^a-z0-9]', '', 'g') = regexp_replace(substr(l.label, 7), '[^a-z0-9]', '', 'g')
   AND co.created_at BETWEEN l.first_at AND l.last_at + make_interval(days => ${w})
),
anon_paid AS (
  SELECT a.label, count(DISTINCT a.order_id)::int AS n, COALESCE(sum((wp.metadata->>'amount')::numeric), 0)::float AS s
  FROM anon a JOIN events wp ON wp.type = 'web_paid' AND wp.metadata->>'orderId' = a.order_id
  WHERE wp.telegram_id IS NULL OR NOT EXISTS (SELECT 1 FROM people p WHERE p.label = a.label AND p.tg = wp.telegram_id)
  GROUP BY a.label
)
SELECT l.*, COALESCE((SELECT count(DISTINCT order_id) FROM anon a WHERE a.label = l.label), 0)::int AS anon_checkout,
       COALESCE(ap.n, 0) AS anon_paid, COALESCE(ap.s, 0) AS anon_paid_sum
FROM labels l LEFT JOIN anon_paid ap ON ap.label = l.label
ORDER BY l.first_at DESC`;
}
