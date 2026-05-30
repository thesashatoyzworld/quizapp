import { prisma } from '@/lib/prisma';

// Analytics aggregation over the Supabase `events` table.
// Read-only. Powers the admin "Аналитика" tab.

export type Period = 'today' | '7d' | '30d';

// Start of the current Moscow calendar day, expressed as a UTC timestamp.
const MSK_DAY_START = "((date_trunc('day', now() AT TIME ZONE 'Europe/Moscow')) AT TIME ZONE 'Europe/Moscow')";

interface Bounds {
  cur: string;   // SQL predicate for the selected period
  prev: string;  // SQL predicate for the immediately preceding equal-length period
  days: number;
}

function bounds(period: Period): Bounds {
  if (period === 'today') {
    return {
      cur: `created_at >= ${MSK_DAY_START}`,
      prev: `created_at >= ${MSK_DAY_START} - interval '1 day' AND created_at < ${MSK_DAY_START}`,
      days: 1,
    };
  }
  const n = period === '30d' ? 30 : 7;
  return {
    cur: `created_at >= now() - interval '${n} days'`,
    prev: `created_at >= now() - interval '${2 * n} days' AND created_at < now() - interval '${n} days'`,
    days: n,
  };
}

const num = (v: unknown): number =>
  typeof v === 'bigint' ? Number(v) : v == null ? 0 : Number(v);

export interface Kpis {
  visits: number;       // unique web sessions (page_view)
  leadmagnets: number;  // leadmagnet_delivered
  botStarts: number;    // bot_start
  applications: number; // form_submit_success (DFV)
}

async function kpisFor(where: string): Promise<Kpis> {
  const rows = (await prisma.$queryRawUnsafe(`
    SELECT
      count(DISTINCT metadata->>'session_id') FILTER (WHERE type='page_view')        AS visits,
      count(*)                                FILTER (WHERE type='leadmagnet_delivered') AS leadmagnets,
      count(*)                                FILTER (WHERE type='bot_start')         AS bot_starts,
      count(*)                                FILTER (WHERE type='form_submit_success') AS applications
    FROM events WHERE ${where}
  `)) as Record<string, unknown>[];
  const r = rows[0] || {};
  return {
    visits: num(r.visits),
    leadmagnets: num(r.leadmagnets),
    botStarts: num(r.bot_starts),
    applications: num(r.applications),
  };
}

export interface DayRow { day: string; views: number; visits: number; leadmagnets: number; }
export interface ArticleRow { path: string; views: number; uniq: number; }
export interface LeadMagnetRow { slug: string; delivered: number; gated: number; }
export interface BotQuiz { starts: number; quizStarts: number; quizDone: number; payments: number; }

export interface Analytics {
  period: Period;
  kpis: Kpis;
  kpisPrev: Kpis;
  byDay: DayRow[];
  articles: ArticleRow[];
  leadmagnets: LeadMagnetRow[];
  podcastViews: number;
  botQuiz: BotQuiz;
  totalEvents: number;
}

export async function getAnalytics(period: Period): Promise<Analytics> {
  const { cur, prev } = bounds(period);

  const [kpis, kpisPrev, byDayRaw, articlesRaw, lmRaw, podcastRaw, botRaw, totalRaw] =
    await Promise.all([
      kpisFor(cur),
      kpisFor(prev),
      prisma.$queryRawUnsafe(`
        SELECT date_trunc('day', created_at AT TIME ZONE 'Europe/Moscow')::date AS day,
               count(*) FILTER (WHERE type='page_view')                                  AS views,
               count(DISTINCT metadata->>'session_id') FILTER (WHERE type='page_view')   AS visits,
               count(*) FILTER (WHERE type='leadmagnet_delivered')                       AS leadmagnets
        FROM events WHERE ${cur}
        GROUP BY 1 ORDER BY 1
      `),
      prisma.$queryRawUnsafe(`
        SELECT split_part(metadata->>'path','?',1) AS path,
               count(*) AS views,
               count(DISTINCT metadata->>'session_id') AS uniq
        FROM events
        WHERE type='page_view' AND metadata->>'path' LIKE '/blog/%' AND ${cur}
        GROUP BY 1 ORDER BY 2 DESC
      `),
      prisma.$queryRawUnsafe(`
        SELECT coalesce(nullif(metadata->>'slug',''), replace(nullif(utm_source,''),'leadmagnet_',''), '?') AS slug,
               count(*) FILTER (WHERE type='leadmagnet_delivered') AS delivered,
               count(*) FILTER (WHERE type='leadmagnet_gated')     AS gated
        FROM events
        WHERE type IN ('leadmagnet_delivered','leadmagnet_gated') AND ${cur}
        GROUP BY 1 ORDER BY 2 DESC
      `),
      prisma.$queryRawUnsafe(`
        SELECT count(*) AS n FROM events
        WHERE type='page_view' AND ${cur}
          AND (metadata->>'path' ILIKE '%podcast%' OR metadata->>'path' ILIKE '%pachesnaku%'
               OR metadata->>'path' ILIKE '%chesn%' OR metadata->>'path' ILIKE '%podkast%')
      `),
      prisma.$queryRawUnsafe(`
        SELECT
          count(*) FILTER (WHERE type='bot_start')       AS starts,
          count(*) FILTER (WHERE type='quiz_start')      AS quiz_starts,
          count(*) FILTER (WHERE type='quiz_complete')   AS quiz_done,
          count(*) FILTER (WHERE type='payment_success') AS payments
        FROM events WHERE ${cur}
      `),
      prisma.$queryRawUnsafe(`SELECT count(*) AS n FROM events WHERE ${cur}`),
    ]);

  const byDay: DayRow[] = (byDayRaw as Record<string, unknown>[]).map((r) => ({
    day: String(r.day).slice(0, 10),
    views: num(r.views),
    visits: num(r.visits),
    leadmagnets: num(r.leadmagnets),
  }));

  const articles: ArticleRow[] = (articlesRaw as Record<string, unknown>[]).map((r) => ({
    path: String(r.path),
    views: num(r.views),
    uniq: num(r.uniq),
  }));

  const leadmagnets: LeadMagnetRow[] = (lmRaw as Record<string, unknown>[])
    .filter((r) => r.slug && r.slug !== '?')
    .map((r) => ({ slug: String(r.slug), delivered: num(r.delivered), gated: num(r.gated) }));

  const botRow = (botRaw as Record<string, unknown>[])[0] || {};
  const botQuiz: BotQuiz = {
    starts: num(botRow.starts),
    quizStarts: num(botRow.quiz_starts),
    quizDone: num(botRow.quiz_done),
    payments: num(botRow.payments),
  };

  return {
    period,
    kpis,
    kpisPrev,
    byDay,
    articles,
    leadmagnets,
    podcastViews: num((podcastRaw as Record<string, unknown>[])[0]?.n),
    botQuiz,
    totalEvents: num((totalRaw as Record<string, unknown>[])[0]?.n),
  };
}
