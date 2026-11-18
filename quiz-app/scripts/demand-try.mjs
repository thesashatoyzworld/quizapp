// Try the demand search (src/lib/optimizator/demand.ts) against prod demand_posts
// without the Haiku call: phrases are given here by hand. Prints hit counts and
// sample texts per topic so we can see whether hits are on-topic.
//
// Run: ENV_FILE=../path/.env.local node scripts/demand-try.mjs [phrases.json]
// phrases.json = {topic: [phrase, ...]} (e.g. saved Haiku output) replaces TOPICS.
import { readFileSync } from 'node:fs';
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

const HAND = {
  'родные не понимают чем я занимаюсь блог': [
    'родные не понимают', 'семья не поддерживает блог', 'родители против блога',
    'мама не понимает чем я занимаюсь', 'близкие не верят', 'стыдно вести блог', 'что скажут люди',
    'осуждение близких', 'родственники смеются над блогом',
  ],
  'как набрать подписчиков в инстаграм': [
    'набрать подписчиков', 'рост подписчиков', 'как набрать аудиторию', 'продвижение в инстаграм',
    'охваты упали', 'как раскрутить блог', 'подписчики не растут',
  ],
  'похудеть после родов': [
    'похудеть после родов', 'вес после беременности', 'живот после родов', 'восстановление после родов',
    'лишний вес мама', 'как похудеть', 'фигура после родов',
  ],
};

const TOPICS = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], 'utf8')) : HAND;

// Mirror of the query in src/lib/optimizator/demand.ts.
const SQL = `
  WITH win AS (
    SELECT code, author, kind, ratio, likes, taken_at, text, tsv FROM demand_posts
     WHERE taken_at > now() - make_interval(days => $2)
  ), ph AS (
    SELECT i, array_agg(DISTINCT CASE
             WHEN length(lexeme) >= 7 THEN left(lexeme, length(lexeme) - 2)
             WHEN length(lexeme) = 6 THEN left(lexeme, 5)
             ELSE lexeme END) AS lx
      FROM unnest($1::text[]) WITH ORDINALITY u(p, i), unnest(to_tsvector('russian', p)) t
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
  ), hits AS (
    SELECT w.*, (SELECT count(*) FROM parts WHERE w.tsv @@ parts.q) AS phrases
      FROM win w
     WHERE w.tsv @@ (SELECT string_agg(q::text, ' | ')::tsquery FROM parts)
  ), scored AS (
    SELECT *, phrases + least(ts_rank_cd(tsv, (SELECT string_agg(q::text, ' | ')::tsquery FROM parts), 1)
              * ln(2 + least(ratio, 30)), 0.99) AS score
      FROM hits
  ), ranked AS (
    SELECT *, row_number() OVER (PARTITION BY author ORDER BY score DESC) AS n FROM scored
  )
  SELECT code, author, kind, ratio, likes, taken_at, text, phrases, score,
         (SELECT count(*) FROM hits)::int AS total
    FROM ranked WHERE n <= 3 ORDER BY score DESC LIMIT 30`;

const db = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await db.connect();
const cov = await db.query(`SELECT count(*)::int AS n FROM demand_posts WHERE taken_at > now() - interval '90 days'`);
console.log(`coverage (90 days): ${cov.rows[0].n}\n`);
for (const [topic, phrases] of Object.entries(TOPICS)) {
  const t0 = Date.now();
  const { rows } = await db.query(SQL, [phrases, 90]);
  console.log(`## ${topic}: ${rows.length} items (${rows[0]?.total ?? 0} matched), ${Date.now() - t0} ms`);
  for (const r of rows.slice(0, 5)) {
    console.log(`  [${r.phrases}] ×${r.ratio.toFixed(1)} ${r.kind} @${r.author}: ${r.text.slice(0, 140).replace(/\s+/g, ' ')}`);
  }
  console.log();
}
await db.end();
