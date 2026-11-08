// Optimizator ladder, "anchor" references: expert reels of other authors with a known
// outcome, closest to the script's topic. Table optimizator_anchors (built by
// scripts/optimizator-anchors-build.mjs from the reels-optimizer research pool).
// Topic match reuses the demand search phrases (Haiku) and Postgres FTS; research
// used TF-IDF over transcripts, FTS on the same phrases is the cabinet's equivalent.
// 276 anchors from 74 expert authors (29.10): a niche topic gets the nearest, not an exact match.
// Server only.
import { prisma } from '@/lib/prisma';
import { LADDER_CUT } from './config';

export type Anchor = {
  id: string;
  text: string;
  class: 'hit' | 'flop';
  ratio: number;
  first_line: string;
};

/** Per class; ladder.py used 4 hits + 4 flops. */
const PER_CLASS = 4;

/**
 * 4 hits + 4 flops closest by topic, at most one per author. Missing slots (no
 * phrases, thin topic) are filled at random within the class.
 */
export async function pickAnchors(phrases: string[]): Promise<Anchor[]> {
  let picked: (Anchor & { author: string })[] = [];
  if (phrases.length) {
    // A phrase matches when two of its words (stems, prefix) occur in the first 2500
    // chars, the part the model actually reads (as in demand.ts). Long transcripts
    // matched any OR of words and won on length; this ranks by phrases matched, then
    // by length-normalized rank.
    picked = await prisma.$queryRaw<(Anchor & { author: string })[]>`
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
      ), head AS (
        SELECT id, text, class, ratio, first_line, author, to_tsvector('russian', left(text, ${LADDER_CUT}::int)) AS tsv
          FROM optimizator_anchors
      ), scored AS (
        SELECT h.id, h.text, h.class, h.ratio, h.first_line, h.author,
               (SELECT count(*) FROM parts WHERE h.tsv @@ parts.q) AS phrases,
               (SELECT sum(ts_rank_cd(h.tsv, parts.q, 2)) FROM parts) AS rank
          FROM head h
      ), by_author AS (
        SELECT *, row_number() OVER (PARTITION BY author ORDER BY phrases DESC, rank DESC) AS an FROM scored WHERE phrases > 0
      ), by_class AS (
        SELECT *, row_number() OVER (PARTITION BY class ORDER BY phrases DESC, rank DESC) AS cn FROM by_author WHERE an = 1
      )
      SELECT id, text, class, ratio::float8 AS ratio, first_line, author FROM by_class
       WHERE cn <= ${PER_CLASS}::int ORDER BY class, cn`;
  }
  for (const cls of ['hit', 'flop'] as const) {
    const need = PER_CLASS - picked.filter((a) => a.class === cls).length;
    if (need <= 0) continue;
    const ids = picked.map((a) => a.id);
    const authors = picked.map((a) => a.author);
    const more = await prisma.$queryRaw<(Anchor & { author: string })[]>`
      SELECT DISTINCT ON (author) id, text, class, ratio::float8 AS ratio, first_line, author
        FROM (SELECT * FROM optimizator_anchors
               WHERE class = ${cls} AND id <> ALL(${ids}::text[]) AND author <> ALL(${authors}::text[])
               ORDER BY random() LIMIT 40) s
       ORDER BY author LIMIT ${need}::int`;
    picked.push(...more);
  }
  return picked.map(({ author: _a, ...a }) => { void _a; return { ...a, ratio: Math.round(Number(a.ratio) * 100) / 100 }; });
}
