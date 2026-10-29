// Optimizator ladder, "anchor" references: expert reels of other authors with a known
// outcome, closest to the script's topic. Table optimizator_anchors (built by
// scripts/optimizator-anchors-build.mjs from the reels-optimizer research pool).
// Topic match reuses the demand search phrases (Haiku) and Postgres FTS; research
// used TF-IDF over transcripts, FTS on the same phrases is the cabinet's equivalent.
// Server only.
import { prisma } from '@/lib/prisma';

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
    picked = await prisma.$queryRaw<(Anchor & { author: string })[]>`
      WITH lx AS (
        SELECT DISTINCT CASE
                 WHEN length(lexeme) >= 7 THEN left(lexeme, length(lexeme) - 2)
                 WHEN length(lexeme) = 6 THEN left(lexeme, 5)
                 ELSE lexeme END AS l
          FROM unnest(${phrases}::text[]) p, unnest(to_tsvector('russian', p)) t
      ), q AS (
        SELECT string_agg(quote_literal(l) || ':*', ' | ')::tsquery AS q FROM lx WHERE length(l) >= 3
      ), scored AS (
        SELECT a.id, a.text, a.class, a.ratio, a.first_line, a.author, ts_rank_cd(a.tsv, q.q, 1) AS score
          FROM optimizator_anchors a, q
         WHERE q.q IS NOT NULL AND a.tsv @@ q.q
      ), by_author AS (
        SELECT *, row_number() OVER (PARTITION BY author ORDER BY score DESC) AS an FROM scored
      ), by_class AS (
        SELECT *, row_number() OVER (PARTITION BY class ORDER BY score DESC) AS cn FROM by_author WHERE an = 1
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
  return picked.map(({ author: _a, ...a }) => { void _a; return { ...a, ratio: Number(a.ratio) }; });
}
