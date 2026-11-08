// Imports Sasha's three content bases into «Библиотека» (studio_library).
//
//   node --import tsx scripts/studio-import-library.mjs
//
// Idempotent: entries are keyed by (base, code) with their original codes.
// New → inserted; untouched since the last import → refreshed from the source;
// edited in the Studio (updated_by ≠ 'import') → never overwritten, only reported
// when the source changed under them. Codes gone from the source are reported, not deleted.
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import pg from 'pg';
import { entryHash, parsePositions, parseProblems, parseStories } from '../src/lib/studio/library-parse.ts';

const HYP = process.env.LIB_HYP || '/Users/sashatoyz/Documents/ClaudeCode/Projects/GSD-BRAND/clients/sasha/audience-hypothesis';
const STORIES = process.env.LIB_STORIES || '/Users/sashatoyz/Documents/Vault/Работа/Карусели/База историй и пруфов.md';
const read = (p) => fs.readFileSync(p, 'utf8');
const json = (f) => JSON.parse(read(`${HYP}/problems/${f}`));

const entries = [
  ...parsePositions(read(`${HYP}/ugly/BAZA-POZICIY.md`)),
  ...parseStories(read(STORIES)),
  ...parseProblems(json('problems.json'), json('problems-voice.json'), json('mapping.json')),
];

const db = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await db.connect();
const existing = new Map((await db.query('SELECT id, source_hash, updated_by FROM studio_library')).rows.map((r) => [r.id, r]));

const report = {};
const keptEdited = [];
for (const e of entries) {
  const id = `${e.base}:${e.code}`;
  const hash = entryHash(e);
  const r = (report[e.base] ??= { inserted: 0, updated: 0, unchanged: 0, keptEdited: 0, sashaOnly: 0 });
  if (e.visibility === 'sasha') r.sashaOnly++;
  const row = existing.get(id);
  existing.delete(id);
  const values = [id, e.base, e.code, e.title, e.grade, e.group, e.body, e.quote, e.source, e.warnings, e.flags, e.usedIn, e.visibility, JSON.stringify(e.extra), e.sort, hash];
  if (!row) {
    await db.query(
      `INSERT INTO studio_library (id, base, code, title, grade, grp, body, quote, source, warnings, flags, used_in, visibility, extra, sort, source_hash, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'import')`, values);
    r.inserted++;
  } else if (row.source_hash === hash) {
    r.unchanged++;
  } else if (row.updated_by === 'import') {
    await db.query(
      `UPDATE studio_library SET base=$2, code=$3, title=$4, grade=$5, grp=$6, body=$7, quote=$8, source=$9, warnings=$10, flags=$11,
         used_in=$12, visibility=$13, extra=$14, sort=$15, source_hash=$16, updated_at=CURRENT_TIMESTAMP WHERE id=$1`, values);
    r.updated++;
  } else {
    r.keptEdited++;
    keptEdited.push(`${id} (правил ${row.updated_by})`);
  }
}

console.log('импорт библиотеки:');
console.table(report);
if (keptEdited.length) console.log('в источнике изменились, но правлены в Студии, не трогал:', keptEdited.join(', '));
const gone = [...existing.keys()].filter((id) => !id.includes(':new-'));
if (gone.length) console.log('есть в Студии, нет в источнике (оставлены):', gone.join(', '));
await db.end();
