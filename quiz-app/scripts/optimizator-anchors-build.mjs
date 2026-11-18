// Fills optimizator_anchors from the reels-optimizer research pool: every reel of an
// author labelled "expert" (pairs/author_type.json) with class hit or flop
// (features/pool_truth.json: likes ≥3x / ≤0.4x the author's median), text from
// features/cases/xNNNN.txt (ElevenLabs Scribe transcripts). Upsert, safe to rerun.
//
// Run: node scripts/optimizator-anchors-build.mjs [path to reels-optimizer/prompts/kallaway]
//      ENV_FILE=../path/.env.local node scripts/optimizator-anchors-build.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import pg from 'pg';

const K = resolve(process.argv[2] || '../../reels-optimizer/prompts/kallaway');
const truth = JSON.parse(readFileSync(join(K, 'features', 'pool_truth.json'), 'utf8'));
const types = JSON.parse(readFileSync(join(K, 'pairs', 'author_type.json'), 'utf8'));

/** First sentence without "Голос 1:" labels, for the student-facing list. */
function firstLine(text) {
  const t = text.replace(/^Голос \d+:\s*/gm, '').replace(/\s+/g, ' ').trim();
  const m = t.match(/^.{12,}?[.!?…](?=\s|$)/);
  const s = m ? m[0] : t;
  return s.length > 120 ? s.slice(0, 119).trimEnd() + '…' : s;
}

const rows = [];
for (const [id, t] of Object.entries(truth)) {
  if (types[t.author] !== 'expert' || (t.class !== 'hit' && t.class !== 'flop')) continue;
  const f = join(K, 'features', 'cases', `${id}.txt`);
  if (!existsSync(f)) continue;
  const text = readFileSync(f, 'utf8').trim();
  if (text.split(/\s+/).length < 20) continue;
  rows.push({ id, text, cls: t.class, ratio: Number(t.ratio), author: t.author, first: firstLine(text) });
}
console.log(`anchors: ${rows.length} (${rows.filter((r) => r.cls === 'hit').length} hit), ${new Set(rows.map((r) => r.author)).size} authors`);

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();
for (const r of rows) {
  await db.query(
    `INSERT INTO optimizator_anchors (id, text, class, ratio, author, first_line) VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET text = $2, class = $3, ratio = $4, author = $5, first_line = $6`,
    [r.id, r.text, r.cls, r.ratio, r.author, r.first],
  );
}
const n = await db.query(`SELECT class, count(*)::int AS n FROM optimizator_anchors GROUP BY class`);
console.log('in table:', n.rows);
await db.end();
