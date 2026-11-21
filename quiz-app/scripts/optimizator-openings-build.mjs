// Fills optimizator_openings from the reels base (reels-optimizer/prompts/kallaway/baza): openings of hits
// (likes >= 3x the author's median) whose expectation the reel paid off in full (expect.jsonl, 21.11: x2.03 within author,
// a scene's «how will it end» counts as much as stated words; replaced promise.jsonl x1.52), from opening
// families not worse than average in the family rating (fam.jsonl + fam_rating.json, hits AND flops of the same
// authors, 20.11.2026: no recognizable construction x0.59, confirmed families x1.5-3.4).
// Also creates the tables for student stats screenshots. Additive, IF NOT EXISTS: the database is shared, no db push.
//
// Run: node scripts/optimizator-openings-build.mjs [path to .../kallaway/baza]
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import pg from 'pg';

const B = resolve(process.argv[2] || '../../reels-optimizer/prompts/kallaway/baza');
const lines = (n) => readFileSync(join(B, n), 'utf8').split('\n').filter(Boolean).map((x) => JSON.parse(x));
const fam = new Map(lines('fam.jsonl').map((o) => [o.id, o.f]));
const rate = new Map(JSON.parse(readFileSync(join(B, 'fam_rating.json'), 'utf8')).map((x) => [x.id, x]));
// f00 = no recognizable construction, f25 = birthday prophecy (astrologers, not our experts)
function tier(f) {
  const x = rate.get(f);
  if (!x || f === 'f00' || f === 'f25' || !x.or) return null;
  if (x.verdict.startsWith('↑')) return 0;
  if ((x.verdict === 'мало данных' && x.or >= 1.5) || (x.verdict === 'как у всех' && x.or >= 1)) return 1;
  return null;
}
const rows = [];
for (const b of lines('bank.jsonl')) {
  const f = fam.get(b.code);
  const t = tier(f);
  if (t === null || b.paid !== 'full' || b.tmpl_kind !== 'template') continue; // 21.11: only openings that become a template (copies x2.90 same topic)
  const x = rate.get(f);
  rows.push({ ...b, fam: f, fam_name: x.name, fam_or: x.or, tier: t });
}
console.log(`openings: ${rows.length}, authors ${new Set(rows.map((r) => r.author)).size}`);

const db = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await db.connect();
await db.query(`
  CREATE TABLE IF NOT EXISTS optimizator_openings (
    code TEXT PRIMARY KEY, author TEXT NOT NULL, ratio REAL NOT NULL, likes INT, plaque TEXT, first TEXT NOT NULL,
    speech30 TEXT NOT NULL, fam TEXT NOT NULL, fam_name TEXT NOT NULL, fam_or REAL NOT NULL, tier INT NOT NULL,
    topic TEXT, format TEXT, promise TEXT, url TEXT NOT NULL
  );
  ALTER TABLE optimizator_openings ADD COLUMN IF NOT EXISTS expect_type TEXT;
  ALTER TABLE optimizator_openings ADD COLUMN IF NOT EXISTS explicit BOOLEAN;
  ALTER TABLE optimizator_openings ADD COLUMN IF NOT EXISTS tmpl TEXT;
  CREATE INDEX IF NOT EXISTS optimizator_openings_topic_idx ON optimizator_openings (topic, format);
  CREATE TABLE IF NOT EXISTS optimizator_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id TEXT NOT NULL,
    telegram_id BIGINT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now(),
    opening TEXT,
    reel_url TEXT,
    metrics JSONB,
    status TEXT NOT NULL DEFAULT 'draft'
  );
  CREATE INDEX IF NOT EXISTS optimizator_stats_run_idx ON optimizator_stats (run_id, created_at);
  CREATE TABLE IF NOT EXISTS optimizator_stats_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stats_id UUID NOT NULL REFERENCES optimizator_stats(id) ON DELETE CASCADE,
    mime TEXT NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT now()
  );
`);
for (const r of rows) {
  await db.query(
    `INSERT INTO optimizator_openings (code, author, ratio, likes, plaque, first, speech30, fam, fam_name, fam_or, tier, topic, format, promise, url, expect_type, explicit, tmpl)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (code) DO UPDATE SET author=$2, ratio=$3, likes=$4, plaque=$5, first=$6, speech30=$7, fam=$8, fam_name=$9,
       fam_or=$10, tier=$11, topic=$12, format=$13, promise=$14, url=$15, expect_type=$16, explicit=$17, tmpl=$18`,
    [r.code, r.author, r.ratio, r.likes ?? null, r.plaque || null, r.first, r.speech30, r.fam, r.fam_name, r.fam_or, r.tier,
     r.topic || null, r.format || null, r.expect || null, r.url, r.expect_type || null, r.explicit ?? null, r.tmpl || null],
  );
}
// Openings that left the bank (family re-rated, promise re-labelled) leave the table too.
await db.query('DELETE FROM optimizator_openings WHERE NOT (code = ANY($1))', [rows.map((r) => r.code)]);
const n = await db.query('SELECT count(*)::int AS n FROM optimizator_openings');
console.log('in table:', n.rows[0].n);
await db.end();
