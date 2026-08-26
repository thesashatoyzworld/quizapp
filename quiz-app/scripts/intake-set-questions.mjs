// Личная анкета: кладём человеку свои вопросы вместо вопросов трека.
//
// Нужно, когда Саша уже созвонился с человеком: переспрашивать то, что
// прозвучало на созвоне, глупо, а общий набор тарифа 3 этого не умеет.
//
//   node scripts/intake-set-questions.mjs scripts/intake-personal/<файл>.json @username
//   node scripts/intake-set-questions.mjs <файл>.json --label "@riderbuba"
//   node scripts/intake-set-questions.mjs <файл>.json --id <uuid анкеты>
//
// Анкету, которая уже в работе, не трогаем без --force: человек отвечает
// на вопросы по номерам, и подмена набора на середине перемешает ответы.

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

for (const file of ['.env.local', '.env']) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const file = args.find((a) => a.endsWith('.json'));
if (!file) {
  console.error('нужен путь к json с вопросами');
  process.exit(1);
}

const idx = args.findIndex((a) => a === '--id' || a === '--label');
const target = idx >= 0 ? { kind: args[idx].slice(2), value: args[idx + 1] } : null;
const username = args.find((a) => a.startsWith('@'));
if (!target && !username) {
  console.error('нужен @username, либо --label "<как выдавали ссылку>", либо --id <uuid>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const questions = raw.questions;
if (!Array.isArray(questions) || !questions.length) throw new Error('в файле нет questions');
for (const [i, q] of questions.entries()) {
  if (!q?.title || !q?.body) throw new Error(`вопрос ${i + 1} без title или body`);
}

const payload = { questions: questions.map((q) => ({ title: q.title, body: q.body })) };
if (raw.preamble) payload.preamble = raw.preamble;

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const where = target?.kind === 'id'
  ? { sql: 'id = $1', v: target.value }
  : target?.kind === 'label'
    ? { sql: 'label = $1', v: target.value }
    : { sql: 'username ILIKE $1', v: username.slice(1) };

const found = await client.query(
  `SELECT id, username, label, status, current_step FROM intakes WHERE ${where.sql}`,
  [where.v],
);
if (found.rows.length !== 1) {
  console.error(`нашёл ${found.rows.length} анкет, нужна ровно одна:`, found.rows);
  await client.end();
  process.exit(1);
}

const intake = found.rows[0];
if (intake.status !== 'invited' && !force) {
  console.error(
    `анкета уже в статусе ${intake.status} (вопрос ${intake.current_step + 1}). ` +
    'подмена набора перемешает ответы. если точно надо, добавь --force',
  );
  await client.end();
  process.exit(1);
}

await client.query('UPDATE intakes SET custom_questions = $1, updated_at = now() WHERE id = $2', [
  JSON.stringify(payload),
  intake.id,
]);

console.log(`анкета ${intake.username || intake.label || intake.id}: ${questions.length} личных вопросов`);
await client.end();
