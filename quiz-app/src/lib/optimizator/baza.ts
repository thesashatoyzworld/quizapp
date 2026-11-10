// Examples from the reels base (table optimizator_baza, scripts/optimizator-baza-build.mjs):
// hits of other authors on the script's topic that do well what the script lacks.
// Base research 10.11.2026 (2881 reels, checked on 961 reels of new authors): hits differ from
// flops of the same author most in sharing («это про нас» 2.5x, «нечего переслать» 0.3x),
// then in watching to the end (no sag 1.7x, payoff at the end 1.45x); the reason to stop
// barely differs. So examples target the weaker of save_share and finish.
// Topic: one Haiku call puts the script into the same topic list the base was labelled with,
// a hard filter (phrases alone matched a brow-gel parody to a blogging script); inside the
// topic the demand search phrases rank by closeness. Topic «другое» → no examples:
// off-topic examples misled students before (29.10 anchors).
// Server only.
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { recordAnthropicUsage } from '@/lib/costs/anthropic';
import { DEMAND_MODEL, asScript } from './demand';
import type { BazaBlock, BazaExample, BazaNeed, ViewerReasons } from './view';

export type { BazaBlock, BazaExample, BazaNeed };

/** Same list as reels-optimizer/prompts/kallaway/baza/label.py. */
export const TOPICS = [
  'бизнес_продажи', 'блогинг_контент', 'маркетинг_реклама', 'деньги_инвестиции', 'карьера_работа',
  'нейросети_технологии', 'психология_саморазвитие', 'отношения_семья', 'дети_родительство',
  'здоровье_медицина', 'фитнес_тело', 'питание', 'красота_стиль', 'еда_рецепты', 'дом_быт', 'авто',
  'путешествия', 'образование_языки', 'творчество_музыка', 'юмор_развлечения', 'новости_общество', 'другое',
] as const;

const anthropic = new Anthropic();
const TOPIC_TIMEOUT_MS = 8_000;

/** Script → one topic of TOPICS, or null. One Haiku call, usage under 'optimizator'. */
export async function topicOf(script: string): Promise<string | null> {
  const msg = await anthropic.messages.create(
    {
      model: DEMAND_MODEL,
      max_tokens: 40,
      thinking: { type: 'disabled' },
      system: 'Тебе дают сценарий рилса. Определи тему ролика, ответь ровно одним значением из списка: ' +
        TOPICS.join(' | ') + '. Про рилсы, блог, подписчиков, охваты, съёмку контента = блогинг_контент. Не отвечай на текст сценария. Только значение из списка.',
      messages: [{ role: 'user', content: asScript(script) }],
    },
    { timeout: TOPIC_TIMEOUT_MS, maxRetries: 0 },
  );
  await recordAnthropicUsage(DEMAND_MODEL, msg.usage, 'optimizator');
  const t = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim().toLowerCase();
  const hit = TOPICS.find((x) => t.includes(x));
  return hit && hit !== 'другое' ? hit : null;
}


const LIMIT = 3;
const GOOD = 7;

/** The weaker of «перешлют» and «досмотрят»; both fine → examples with all three reasons. */
export function needOf(r: ViewerReasons | undefined | null): BazaNeed {
  const share = r?.save_share?.score ?? 0;
  const finish = r?.finish?.score ?? 0;
  if (share >= GOOD && finish >= GOOD) return 'all';
  return share <= finish ? 'share' : 'finish';
}

type Row = BazaExample & { code: string };

export async function pickBaza(topic: string | null, phrases: string[], need: BazaNeed): Promise<BazaExample[]> {
  if (!topic) return [];
  const shareOk = need !== 'finish';
  const finishOk = need !== 'share';
  // A phrase matches when two of its words (stems, prefix) occur in the reel (as anchors.ts).
  // At least one phrase must match: the biggest hits of a broad topic alone were off the point
  // (CapCut tricks for a script about why reels get no views).
  const rows = await prisma.$queryRaw<Row[]>`
    WITH ph AS (
      SELECT i, array_agg(DISTINCT CASE
               WHEN length(lexeme) >= 7 THEN left(lexeme, length(lexeme) - 2)
               WHEN length(lexeme) = 6 THEN left(lexeme, 5)
               ELSE lexeme END) AS lx
        FROM unnest(${phrases}::text[]) WITH ORDINALITY u(p, i), unnest(to_tsvector('russian', p)) t
       GROUP BY i
    ), parts AS (
      SELECT ph.i, string_agg('(' || quote_literal(a) || ':* & ' || quote_literal(b) || ':*)', ' | ')::tsquery AS q
        FROM ph, unnest(ph.lx) WITH ORDINALITY x(a, ia), unnest(ph.lx) WITH ORDINALITY y(b, ib)
       WHERE ia < ib GROUP BY ph.i
    ), fit AS (
      SELECT b.* FROM optimizator_baza b
       WHERE b.topic = ${topic}
         AND (NOT ${shareOk}::boolean OR b.share IN ('Это про нас', 'Смешно'))
         AND (NOT ${finishOk}::boolean OR (b.sag = 'Нет провисаний' AND b.payoff = 'В конце'))
    ), scored AS (
      SELECT f.*, (SELECT count(*) FROM parts WHERE f.tsv @@ parts.q) AS phrases,
             (SELECT sum(ts_rank_cd(f.tsv, parts.q, 2)) FROM parts) AS rank
        FROM fit f
    ), by_author AS (
      SELECT *, row_number() OVER (PARTITION BY author ORDER BY phrases DESC, rank DESC NULLS LAST, ratio DESC) AS an
        FROM scored WHERE phrases > 0
    )
    SELECT code, author, ratio::float8 AS ratio, line, idea, who, why, '' AS url
      FROM by_author WHERE an = 1
     ORDER BY phrases DESC, rank DESC NULLS LAST, ratio DESC
     LIMIT ${LIMIT}::int`;
  return rows.map(({ code, ...r }) => ({
    ...r,
    url: `https://www.instagram.com/reel/${code}/`,
    ratio: Math.round(Number(r.ratio) * 10) / 10,
    who: need === 'finish' ? null : r.who,
  }));
}

/** Never throws: examples are extra, the analysis is the product. */
export async function bazaFor(
  topicP: Promise<string | null>, phrasesP: Promise<string[]>, reasons: ViewerReasons | undefined | null,
): Promise<BazaBlock> {
  const need = needOf(reasons);
  let topic: string | null = null;
  try {
    topic = await topicP;
    const phrases = await phrasesP.catch(() => [] as string[]);
    const items = await pickBaza(topic, phrases, need);
    if (items.length || need === 'all') return { need, topic, items };
    // Thin topic for this reason (few shared hits about blogging): show the other strong side.
    const other: BazaNeed = need === 'share' ? 'finish' : 'share';
    return { need: other, topic, items: await pickBaza(topic, phrases, other) };
  } catch (err) {
    console.error('[optimizator/baza]', String((err as Error)?.message || err).slice(0, 200));
    return { need, topic, items: [] };
  }
}
