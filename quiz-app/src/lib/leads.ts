import { prisma } from '@/lib/prisma';

// Лид воронки /uroven: живьём из events (клики «Забрать», заходы на лендинг,
// попытки оплаты), обогащённый юзернеймом, реальной оплатой, ручным статусом
// и КОНТЕКСТОМ — что человек делал и куда заходил (путь по событиям).
export type LeadStatusValue = 'new' | 'written' | 'replied' | 'bought' | 'rejected';

export type JourneyStep = { at: string; label: string };

export type UrovenLead = {
  tg: string;
  username: string | null;
  name: string | null;
  clicks: number;
  visits: number;
  checkouts: number;
  paid: boolean;
  paidAmount: number | null;
  paidTier: string | null;
  paidAt: string | null;
  source: string | null;
  lastAt: string;
  context: string; // человекочитаемая сводка пути
  timeline: JourneyStep[]; // пошаговый путь
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

type EvRow = { tg: string; created_at: Date; type: string; path: string | null; src: string | null; pct: number | null };

type PaidRow = { tg: string | null; amount: number | null; slug: string | null; created_at: Date };

// uroven-t2 / t2 / uroven_t3 → «тариф 2»
function tierName(slug: string | null): string | null {
  const m = (slug || '').match(/t([0-9])/);
  return m ? `тариф ${m[1]}` : null;
}

export const PRODUCT = 'uroven';

export const SOURCE_RU: Record<string, string> = {
  'casino-block': 'блок-казино',
  popup: 'попап',
  final: 'финал статьи',
  inline: 'по тексту',
  floatcta: 'плавающая кнопка',
  'urovni-article': 'статья 6 уровней',
  'chitkody-article': 'статья чит-коды',
  'article-bottom': 'низ статьи',
};

const ARTICLE_RU: Record<string, string> = {
  '/algoritm-sistema.html': 'Алгоритм (казино)',
  '/algoritm-sistema': 'Алгоритм (казино)',
  '/blog/urovni-navyka-kontenta': '6 уровней',
  '/blog/10-chit-kodov-dlya-kontenta': '10 чит-кодов',
  '/blog/pochemu-kontent-ne-idet': 'Почему контент не идёт',
  '/blog/naydi-svoyu-igru': 'Найди свою игру',
  '/blog/ne-obnulyay-svoy-opyt': 'Не обнуляй опыт',
};

function articleName(path: string | null): string {
  const clean = (path || '').split('?')[0];
  return ARTICLE_RU[clean] || clean.replace('/blog/', '').replace('.html', '') || 'страница';
}

// Собираем путь одного человека: сводка + таймлайн (без соседних повторов).
function buildJourney(evs: EvRow[]): { context: string; timeline: JourneyStep[] } {
  const timeline: JourneyStep[] = [];
  const articles = new Map<string, { count: number; maxPct: number }>();
  const clickSrc = new Set<string>();
  let fromBot = false,
    visits = 0,
    checkouts = 0,
    clicks = 0,
    quiz = false;
  let last = '';
  const push = (at: Date, label: string) => {
    if (label !== last) {
      timeline.push({ at: at.toISOString(), label });
      last = label;
    }
  };

  for (const e of evs) {
    switch (e.type) {
      case 'bot_start':
        fromBot = true;
        push(e.created_at, 'запустил бота');
        break;
      case 'page_view': {
        const n = articleName(e.path);
        const a = articles.get(n) || { count: 0, maxPct: 0 };
        a.count++;
        articles.set(n, a);
        push(e.created_at, `открыл «${n}»`);
        break;
      }
      case 'scroll_depth': {
        const n = articleName(e.path);
        const a = articles.get(n) || { count: 0, maxPct: 0 };
        if ((e.pct || 0) > a.maxPct) {
          a.maxPct = e.pct || 0;
          articles.set(n, a);
          push(e.created_at, `дочитал «${n}» до ${e.pct}%`);
        }
        break;
      }
      case 'cta_click': {
        clicks++;
        const s = e.src ? SOURCE_RU[e.src] || e.src : '';
        if (s) clickSrc.add(s);
        push(e.created_at, `кликнул «Забрать»${s ? ` (${s})` : ''}`);
        break;
      }
      case 'uroven_view':
        visits++;
        push(e.created_at, 'зашёл на страницу продукта');
        break;
      case 'checkout_open':
        checkouts++;
        push(e.created_at, 'начал оплату');
        break;
      case 'quiz_start':
      case 'quiz_complete':
        quiz = true;
        break;
    }
  }

  const parts: string[] = [fromBot ? 'пришёл из бота' : 'с сайта'];
  if (articles.size) {
    const arr = [...articles.entries()].map(
      ([n, a]) => `«${n}»${a.count > 1 ? ` ×${a.count}` : ''}${a.maxPct ? ` (до ${a.maxPct}%)` : ''}`,
    );
    parts.push('читал ' + arr.join(', '));
  }
  if (clicks) parts.push(`кликал «Забрать»${clickSrc.size ? ` (${[...clickSrc].join(', ')})` : ''}${clicks > 1 ? ` ×${clicks}` : ''}`);
  if (visits) parts.push(`заходил на страницу продукта${visits > 1 ? ` ×${visits}` : ''}`);
  if (checkouts) parts.push('начинал оплату');
  if (quiz) parts.push('проходил квиз');

  return { context: parts.join(' · '), timeline };
}

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

  // 2) реальные оплаты uroven.
  // Телеграм-путь кладёт tg прямо в order_id (uroven_<tier>_<tg>), карточный/токенный —
  // нет (paid_<token>), там tg берётся через purchases.user_id → users. Раньше был только
  // парсинг order_id, поэтому карточные покупатели висели как «новые лиды».
  const paidRows = await prisma.$queryRaw<PaidRow[]>`
    SELECT
      COALESCE(
        u.telegram_id::text,
        NULLIF(CASE WHEN pu.prodamus_order_id ~ '_[0-9]{4,}$'
                    THEN split_part(pu.prodamus_order_id, '_', 3) END, '')
      )                                                                    AS tg,
      pu.amount                                                            AS amount,
      COALESCE(p.slug, (regexp_match(pu.prodamus_order_id, '^uroven_(t[0-9])'))[1]) AS slug,
      pu.created_at                                                        AS created_at
    FROM purchases pu
    LEFT JOIN products p ON p.id = pu.product_id
    LEFT JOIN users u ON u.id = pu.user_id
    WHERE pu.source = 'uroven' OR p.slug LIKE 'uroven%'
    ORDER BY pu.created_at ASC
  `;
  // на человека — последняя покупка (перекрывает предыдущую при апгрейде тарифа)
  const paid = new Map<string, PaidRow>();
  for (const r of paidRows) if (r.tg) paid.set(r.tg, r);

  // Покупатель мог оплатить прямо из бота, не задев трекер сайта — событий у него нет,
  // но в лидборде он нужен. Берём его отдельной строкой.
  const inAgg = new Set(agg.map((r) => r.tg));
  const buyersNoEvents = [...paid.keys()].filter((tg) => !inAgg.has(tg));
  const tgs = [...inAgg, ...buyersNoEvents];

  // имена/юзернеймы для покупателей без событий (в agg они подтягиваются джойном)
  const extraUsers = buyersNoEvents.length
    ? await prisma.$queryRaw<{ tg: string; username: string | null; name: string | null }[]>`
        SELECT u.telegram_id::text AS tg, u.username, u.first_name AS name
        FROM users u WHERE u.telegram_id::text = ANY(${buyersNoEvents})
      `
    : [];
  const extraByTg = new Map(extraUsers.map((u) => [u.tg, u]));

  // 3) ручные статусы из lead_status
  const statuses = await prisma.leadStatus.findMany({ where: { product: PRODUCT } });
  const byTg = new Map(statuses.map((s) => [s.telegramId.toString(), s]));

  // 4) путь каждого человека (все ключевые события по его tg)
  const journeys = new Map<string, { context: string; timeline: JourneyStep[] }>();
  if (tgs.length) {
    const evs = await prisma.$queryRaw<EvRow[]>`
      SELECT
        COALESCE(e.telegram_id::text, e.metadata->>'tg') AS tg,
        e.created_at,
        e.type,
        e.metadata->>'path'                              AS path,
        COALESCE(e.metadata->>'from', e.metadata->>'cta') AS src,
        (e.metadata->>'pct')::int                         AS pct
      FROM events e
      WHERE COALESCE(e.telegram_id::text, e.metadata->>'tg') = ANY(${tgs})
        AND e.type IN ('bot_start','page_view','scroll_depth','cta_click','uroven_view','checkout_open','quiz_start','quiz_complete')
      ORDER BY e.created_at ASC
    `;
    const byPerson = new Map<string, EvRow[]>();
    for (const e of evs) {
      const arr = byPerson.get(e.tg) || [];
      arr.push(e);
      byPerson.set(e.tg, arr);
    }
    for (const [tg, arr] of byPerson) journeys.set(tg, buildJourney(arr));
  }

  const build = (tg: string, r: Partial<AggRow>, fallbackAt: Date): UrovenLead => {
    const st = byTg.get(tg);
    const pay = paid.get(tg) || null;
    const status: LeadStatusValue = (st?.status as LeadStatusValue) || (pay ? 'bought' : 'new');
    const j = journeys.get(tg) || { context: '', timeline: [] };
    return {
      tg,
      username: r.username ?? null,
      name: r.name ?? null,
      clicks: Number(r.clicks || 0),
      visits: Number(r.visits || 0),
      checkouts: Number(r.checkouts || 0),
      paid: !!pay,
      paidAmount: pay?.amount ?? null,
      paidTier: pay ? tierName(pay.slug) : null,
      paidAt: pay ? pay.created_at.toISOString() : null,
      source: r.source ?? null,
      lastAt: (r.last_at || fallbackAt).toISOString(),
      context: j.context || (pay ? 'оплатил (событий на сайте не было)' : ''),
      timeline: j.timeline,
      status,
      note: st?.note ?? null,
      updatedBy: st?.updatedBy ?? null,
      updatedAt: st?.updatedAt ? st.updatedAt.toISOString() : null,
    };
  };

  const leads: UrovenLead[] = [
    ...agg.map((r) => build(r.tg, r, r.last_at)),
    ...buyersNoEvents.map((tg) => build(tg, extraByTg.get(tg) || {}, paid.get(tg)!.created_at)),
  ];

  // оплатившие сверху, дальше тёплые (дошли до страницы продукта)
  const rank = (l: UrovenLead) => (l.paid ? 3 : l.visits > 0 ? 2 : 1);
  leads.sort(
    (a, b) =>
      rank(b) - rank(a) ||
      b.visits - a.visits ||
      b.clicks - a.clicks ||
      +new Date(b.lastAt) - +new Date(a.lastAt),
  );
  return leads;
}
