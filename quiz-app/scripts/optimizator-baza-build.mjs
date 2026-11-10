// Fills optimizator_baza from the reels base (reels-optimizer/prompts/kallaway/baza): hits only
// (likes ≥3x the author's median), with the blind labels of the three viewer lenses
// (why people stopped, watched to the end, sent it). The optimizator shows 2-3 of them on the
// script's topic for its weakest lens. Creates the table if missing (additive, IF NOT EXISTS,
// the database is shared: no prisma db push). Upsert, safe to rerun daily.
//
// Run: node scripts/optimizator-baza-build.mjs [path to .../kallaway/baza]
//      ENV_FILE=../path/.env.local node scripts/optimizator-baza-build.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import pg from 'pg';

const B = resolve(process.argv[2] || '../../reels-optimizer/prompts/kallaway/baza');
const read = (name) => {
  const p = join(B, name);
  return existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map((x) => JSON.parse(x)) : [];
};
const byId = (rows, key = 'id') => new Map(rows.map((o) => [o[key], o]));

const labels = byId(read('labels.jsonl'));
const lenses = byId(read('lenses.jsonl'));

/** First sentence, for the student-facing list. */
function firstLine(text) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  const m = t.match(/^.{12,}?[.!?…](?=\s|$)/);
  const s = m ? m[0] : t;
  return s.length > 140 ? s.slice(0, 139).trimEnd() + '…' : s;
}

const seen = new Set();
const rows = [];
for (const r of read('reels.jsonl')) {
  if (r.outcome !== 'hit' || seen.has(r.code)) continue;
  const l = labels.get(r.code);
  const x = lenses.get(r.code);
  if (!l || !x || !l.idea) continue;
  seen.add(r.code);
  rows.push({
    code: r.code, author: r.author, ratio: Number(r.ratio), topic: l.topic || null, idea: l.idea,
    line: firstLine(l.audio_hook || r.text || l.screen_text || ''), text: (r.text || '').slice(0, 2500),
    share: x.share, who: x.who || null, loop: x.loop, payoff: x.payoff, sag: x.sag, why: x.why || null,
    taken: r.taken_at ? new Date(r.taken_at * 1000) : null,
  });
}
console.log(`baza hits: ${rows.length}, ${new Set(rows.map((r) => r.author)).size} authors`);

const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();
await db.query(`
  CREATE TABLE IF NOT EXISTS optimizator_baza (
    code     TEXT PRIMARY KEY,
    author   TEXT NOT NULL,
    ratio    REAL NOT NULL,
    topic    TEXT,
    idea     TEXT NOT NULL,
    line     TEXT NOT NULL,
    text     TEXT NOT NULL,
    share    TEXT NOT NULL,
    who      TEXT,
    loop     TEXT NOT NULL,
    payoff   TEXT NOT NULL,
    sag      TEXT NOT NULL,
    why      TEXT,
    taken_at TIMESTAMP(3),
    tsv      TSVECTOR GENERATED ALWAYS AS (to_tsvector('russian', idea || ' ' || line || ' ' || text)) STORED
  );
`);
await db.query(`CREATE INDEX IF NOT EXISTS optimizator_baza_tsv_idx ON optimizator_baza USING GIN (tsv);`);
for (const r of rows) {
  await db.query(
    `INSERT INTO optimizator_baza (code, author, ratio, topic, idea, line, text, share, who, loop, payoff, sag, why, taken_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (code) DO UPDATE SET author=$2, ratio=$3, topic=$4, idea=$5, line=$6, text=$7, share=$8, who=$9,
       loop=$10, payoff=$11, sag=$12, why=$13, taken_at=$14`,
    [r.code, r.author, r.ratio, r.topic, r.idea, r.line, r.text, r.share, r.who, r.loop, r.payoff, r.sag, r.why, r.taken],
  );
}
const n = await db.query(`SELECT count(*)::int AS n FROM optimizator_baza`);
console.log('in table:', n.rows[0].n);
await db.end();
