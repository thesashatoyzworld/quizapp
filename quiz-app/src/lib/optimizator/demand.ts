// Optimizator: is the script's topic "в потоке спроса"? Evidence comes from
// demand_posts: Instagram reels and carousels that beat their own author's median
// at least 2×, exported every morning from the PackageFounder base on the
// Amsterdam server (package-founder/src/daily/export_demand.py). No paid search
// per analysis: one cheap Haiku call turns the script into search phrases, then
// Postgres full-text search. Server only. Never throws: on any error or timeout
// the analysis goes on with `searched: false`.
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';

export const DEMAND_MODEL = 'claude-haiku-5-5';
export const DEMAND_WINDOW_DAYS = 90;
const TOTAL_TIMEOUT_MS = 8_000;
const MAX_ITEMS = 30;
const MAX_PER_AUTHOR = 3;

export type DemandItem = {
  id: string;
  author: string;
  kind: 'reel' | 'carousel';
  ratio: number;
  likes: number;
  date: string;
  text: string;
  url: string;
};

export type DemandEvidence = {
  window_days: number;
  searched: boolean;
  coverage_posts: number;
  items: DemandItem[];
};

const anthropic = new Anthropic();

const PHRASES_PROMPT =
  'Тебе дают сценарий рилса. Составь 6-10 коротких поисковых фраз на русском (2-4 слова каждая), ' +
  'по которым в подписях и обложках чужих постов Instagram нашлись бы посты на ту же тему. ' +
  'Покрой: тему, боль зрителя, синонимы, и как люди сами подписали бы такой пост. ' +
  'Только смысловые слова, без имён, цифр и слов «рилс», «видео», «пост». ' +
  'Ответь одним JSON-массивом строк, без пояснений.';

function emptyEvidence(coverage = 0): DemandEvidence {
  return { window_days: DEMAND_WINDOW_DAYS, searched: false, coverage_posts: coverage, items: [] };
}

function deadline<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('demand timeout')), Math.max(ms, 1))),
  ]);
}

function parsePhrases(text: string): string[] {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  const arr: unknown = JSON.parse(m[0]);
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length >= 3 && s.length <= 80)
    .slice(0, 10);
}

/** Script → search phrases. One Haiku call, usage recorded under 'optimizator'. */
async function searchPhrases(script: string, timeoutMs: number): Promise<string[]> {
  const msg = await anthropic.messages.create(
    {
      model: DEMAND_MODEL,
      max_tokens: 800,
      // on by default for this model; it spent the whole budget thinking and cut the JSON
      thinking: { type: 'disabled' },
      system: PHRASES_PROMPT,
      messages: [{ role: 'user', content: script.slice(0, 6000) }],
    },
    { timeout: timeoutMs, maxRetries: 0 },
  );
  await recordAnthropicUsage(DEMAND_MODEL, msg.usage, 'optimizator');
  return parsePhrases(msg.content.map((b) => (b.type === 'text' ? b.text : '')).join(''));
}

type Row = {
  code: string;
  author: string;
  kind: string;
  ratio: number;
  likes: number;
  taken_at: Date;
  text: string;
};

/**
 * Full-text search over the window. A phrase matches when any two of its words
 * (stems, prefix-matched) occur in the post. A pair needs one rare word (≤1.5% of
 * the window) and no very common one (>3%, e.g. «работ»): otherwise "вести блог" or
 * "нормальная работа" match half the base.
 * Score = number of phrases matched + density, times log of the outlier ratio
 * (capped: one ×275 post must not outrank everything). At most 3 posts per author.
 * Exported for scripts/demand-try.mjs-style checks with hand-made phrases.
 */
export async function searchDemandPosts(phrases: string[], days = DEMAND_WINDOW_DAYS): Promise<Row[]> {
  if (!phrases.length) return [];
  return prisma.$queryRaw<Row[]>`
    WITH win AS (
      SELECT code, author, kind, ratio, likes, taken_at, text, tsv FROM demand_posts
       WHERE taken_at > now() - make_interval(days => ${days}::int)
    ), ph AS (
      SELECT i, array_agg(DISTINCT CASE
               WHEN length(lexeme) >= 7 THEN left(lexeme, length(lexeme) - 2)
               WHEN length(lexeme) = 6 THEN left(lexeme, 5)
               ELSE lexeme END) AS lx
        FROM unnest(${phrases}::text[]) WITH ORDINALITY u(p, i), unnest(to_tsvector('russian', p)) t
       GROUP BY i
    ), df AS (
      SELECT l, (SELECT count(*) FROM win WHERE tsv @@ (quote_literal(l) || ':*')::tsquery) AS n
        FROM (SELECT DISTINCT unnest(lx) AS l FROM ph) s
    ), parts AS (
      SELECT ph.i, string_agg('(' || quote_literal(a) || ':* & ' || quote_literal(b) || ':*)', ' | ')::tsquery AS q
        FROM ph, unnest(ph.lx) WITH ORDINALITY x(a, ia), unnest(ph.lx) WITH ORDINALITY y(b, ib),
             df da, df db
       WHERE ia < ib AND da.l = a AND db.l = b
         AND least(da.n, db.n) <= greatest(60, (SELECT count(*) FROM win) * 0.015)
         AND greatest(da.n, db.n) <= greatest(120, (SELECT count(*) FROM win) * 0.03)
       GROUP BY ph.i
    ), anyq AS (
      SELECT string_agg(q::text, ' | ')::tsquery AS q FROM parts
    ), hits AS (
      SELECT w.*, (SELECT count(*) FROM parts WHERE w.tsv @@ parts.q) AS phrases
        FROM win w, anyq
       WHERE w.tsv @@ anyq.q
    ), scored AS (
      SELECT hits.*, phrases + least(ts_rank_cd(tsv, anyq.q, 1) * ln(2 + least(ratio, 30)), 0.99) AS score
        FROM hits, anyq
    ), ranked AS (
      SELECT *, row_number() OVER (PARTITION BY author ORDER BY score DESC) AS n FROM scored
    )
    SELECT code, author, kind, ratio::float8 AS ratio, likes, taken_at, text
      FROM ranked WHERE n <= ${MAX_PER_AUTHOR}::int ORDER BY score DESC LIMIT ${MAX_ITEMS}::int`;
}

async function coverage(days: number): Promise<number> {
  const rows = await prisma.$queryRaw<{ n: number }[]>`
    SELECT count(*)::int AS n FROM demand_posts WHERE taken_at > now() - make_interval(days => ${days}::int)`;
  return Number(rows[0]?.n ?? 0);
}

function toItem(r: Row, i: number): DemandItem {
  const kind = r.kind === 'reel' ? 'reel' : 'carousel';
  return {
    id: `d${i + 1}`,
    author: r.author,
    kind,
    ratio: Math.round(Number(r.ratio) * 10) / 10,
    likes: Number(r.likes),
    date: new Date(r.taken_at).toISOString().slice(0, 10),
    text: r.text,
    url: `https://www.instagram.com/${kind === 'reel' ? 'reel' : 'p'}/${r.code}/`,
  };
}

/** Evidence of demand for the script's topic. Never throws, returns within ~8 s. */
export async function findDemand(script: string): Promise<DemandEvidence> {
  const t0 = Date.now();
  const left = () => TOTAL_TIMEOUT_MS - (Date.now() - t0);
  const cov = coverage(DEMAND_WINDOW_DAYS).catch(() => 0);
  try {
    const phrases = await deadline(searchPhrases(script, left()), left());
    const rows = await deadline(searchDemandPosts(phrases), left());
    return {
      window_days: DEMAND_WINDOW_DAYS,
      searched: phrases.length > 0,
      coverage_posts: await deadline(cov, left()),
      // one author often reposts the same carousel: same text, new code
      items: rows.filter((r, i) => rows.findIndex((o) => o.text === r.text) === i).map(toItem),
    };
  } catch (err) {
    console.error('[optimizator/demand]', String((err as Error)?.message || err).slice(0, 200));
    return emptyEvidence(await deadline(cov, 500).catch(() => 0));
  }
}
