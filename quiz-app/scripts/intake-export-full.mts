// Анкета целиком: вопросы из кода плюс ответы из базы, готовый markdown.
//
// Отличие от intake-export.mjs: тот печатает только номера вопросов, а тексты
// вопросов живут в content/intake-tarif{2,3}.ts. Здесь они подставляются, потому
// что маршрут по материалам собирается по анкете, и читать её без вопросов больно.
//
// Голосовые и текстовые ответы человек шлёт парами: сначала голосовое, следом
// расшифровка из Telegram Premium. Поэтому voices[i] склеивается с texts[i], а
// если пары нет, берётся transcript (наша расшифровка, whisper).
//
// Запуск (tsx нужен ради импорта .ts-контента):
//   npx tsx scripts/intake-export-full.mts <intake_id> > anketa.md
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { INTAKE_QUESTIONS } from '../src/content/intake-tarif3';

const id = process.argv[2];
if (!id) {
  console.error('нужен intake_id: npx tsx scripts/intake-export-full.mts <id>');
  process.exit(1);
}

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const { rows: [intake] } = await c.query(`SELECT * FROM intakes WHERE id=$1`, [id]);
if (!intake) { console.error(`анкеты ${id} нет`); process.exit(1); }
const { rows } = await c.query(`SELECT * FROM intake_answers WHERE intake_id=$1 ORDER BY step, created_at`, [id]);
await c.end();

// Только менторские вопросы: набор t2 живёт в intake-tarif2.ts, который пока
// не в репозитории, а сборка проверяет типы и в scripts. Для анкеты t2 номера
// шагов останутся без текста вопроса, содержимое ответов от этого не страдает.
const QUESTIONS = INTAKE_QUESTIONS;
const who = intake.username ? '@' + intake.username : intake.first_name;
const fmt = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ');
const out: string[] = [];
out.push(`# Анкета: ${intake.first_name || who} (${who})`);
out.push('');
out.push(`- telegram id \`${intake.telegram_id}\``);
out.push(`- трек ${intake.track}, ${QUESTIONS.length} вопросов, статус ${intake.status}`);
out.push(`- заполнял ${fmt(intake.invited_at)}${intake.completed_at ? ' - ' + fmt(intake.completed_at) : ''} UTC`);
out.push(`- досье в админке: \`world.thesashatoyz.com/admin/anketa/${intake.id}\``);
out.push('');

const byStep = new Map<number, any[]>();
for (const r of rows) {
  if (!byStep.has(r.step)) byStep.set(r.step, []);
  byStep.get(r.step)!.push(r);
}

for (let step = 0; step < QUESTIONS.length; step++) {
  const q = QUESTIONS[step];
  out.push(`## ${step + 1}. ${q.title}`);
  out.push('');
  out.push(`> ${q.body}`);
  out.push('');

  const answers = byStep.get(step) || [];
  const voices = answers.filter((a) => a.kind === 'voice' && !a.skipped);
  const texts = answers.filter((a) => a.kind !== 'voice' && !a.skipped && a.raw_text);

  if (!voices.length && !texts.length) {
    out.push(answers.some((a) => a.skipped) ? '_пропустил_' : '_ответа нет_');
    out.push('');
    continue;
  }

  if (!voices.length) {
    for (const t of texts) { out.push(t.raw_text.trim()); out.push(''); }
    continue;
  }

  voices.forEach((v, i) => {
    const mins = Math.round((v.duration_sec || 0) / 60) || 1;
    out.push(`**🎙 голосом, ${mins} мин:**`);
    out.push('');
    out.push(texts[i]?.raw_text?.trim() || v.transcript?.trim() || '_расшифровки нет_');
    out.push('');
  });

  texts.slice(voices.length).forEach((t) => {
    out.push('**дописал текстом:**');
    out.push('');
    out.push(t.raw_text.trim());
    out.push('');
  });
}
console.log(out.join('\n'));
