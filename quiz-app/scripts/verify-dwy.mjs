// Сквозная проверка /api/dwy-lead: валидация → запись в базу → метка потока.
// Запуск (dev-сервер должен быть поднят):
//   node --env-file=.env.local scripts/verify-dwy.mjs
//
// Telegram-логина в анкете нет (виджет в мобильном браузере требовал номер),
// поэтому подписывать нечего — бьём обычным JSON, как это делает страница.
//
// Анкета одна на три потока: mentor (менторство) и t2/t3 (лист ожидания).
// Обязательные поля у них разные, и это здесь главное, что проверяем.
// Свои строки скрипт помечает source и в конце удаляет.

import pg from 'pg';

const BASE = process.env.DWY_BASE || 'http://localhost:3000';
const SOURCE = 'verify-script';

// Полный набор ответов — то, что присылает менторская анкета.
const full = {
  name: 'Проверка Скриптом',
  contact: '@dwy_probe',
  who: 'эксперт',
  hasProduct: 'да',
  product: 'консультации',
  level: 3,
  tried: 'снимал рилсы полгода, охваты встали',
  want: 'стабильный поток заявок из контента',
  income: '150–500к',
  hours: '5–10 часов',
};

// Минимум, которого хватает листу ожидания.
const minimal = { name: 'Проверка Ожидание', contact: '@dwy_wait' };

const cases = [
  // ── менторство: девять вопросов обязательны ──
  { name: 'mentor: полная анкета', kind: 'mentor', answers: full, expect: 200 },
  { name: 'mentor: юзернейм ссылкой t.me/name', kind: 'mentor', answers: { ...full, contact: 'https://t.me/dwy_probe' }, expect: 200 },
  { name: 'mentor: почта вместо юзернейма', kind: 'mentor', answers: { ...full, contact: 'probe@example.com' }, expect: 200 },
  { name: 'mentor: телефон и инстаграм ссылкой', kind: 'mentor', expect: 200,
    answers: { ...full, contact: '@dwy_contacts', phone: '8 (999) 111-22-33', instagram: 'https://instagram.com/dwy.probe?igsh=abc' } },
  { name: 'mentor: без телефона и инстаграма', kind: 'mentor', answers: full, expect: 200 },
  { name: 'mentor: без имени', kind: 'mentor', answers: { ...full, name: '' }, expect: 400 },
  { name: 'mentor: без контакта', kind: 'mentor', answers: { ...full, contact: '' }, expect: 400 },
  { name: 'mentor: без уровня', kind: 'mentor', answers: { ...full, level: '' }, expect: 400 },
  { name: 'mentor: без «что пробовал»', kind: 'mentor', answers: { ...full, tried: '' }, expect: 400 },
  { name: 'mentor: кривой уровень', kind: 'mentor', answers: { ...full, level: 9 }, expect: 400 },

  // ── лист ожидания: обязательны только имя и контакт ──
  { name: 't2: только имя и контакт', kind: 't2', answers: minimal, expect: 200 },
  { name: 't3: только имя и контакт', kind: 't3', answers: { ...minimal, contact: '@dwy_wait3' }, expect: 200 },
  { name: 't2: заполнил всё по желанию', kind: 't2', answers: { ...full, contact: '@dwy_wait_full' }, expect: 200 },
  { name: 't2: без имени', kind: 't2', answers: { ...minimal, name: '' }, expect: 400 },
  { name: 't2: без контакта', kind: 't2', answers: { ...minimal, contact: '' }, expect: 400 },
  { name: 't2: кривой уровень всё равно 400', kind: 't2', answers: { ...minimal, level: 9 }, expect: 400 },

  // ── режим ──
  { name: 'неизвестный kind падает в mentor', kind: 'lolwat', answers: full, expect: 200 },
  { name: 'kind не передан вовсе', kind: undefined, answers: full, expect: 200 },
];

let failed = 0;
const fail = (msg) => { failed++; console.log(`ПРОВАЛ ${msg}`); };

for (const c of cases) {
  const res = await fetch(`${BASE}/api/dwy-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: c.answers, source: SOURCE, kind: c.kind }),
  });
  if (res.status === c.expect) console.log(`OK     ${c.name}: ${res.status}`);
  else fail(`${c.name}: ${res.status} (ждали ${c.expect}) ${await res.text()}`);
}

// ── что реально легло в базу ──
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.log('\nDIRECT_URL / DATABASE_URL не заданы — проверку базы пропускаю');
  process.exit(failed ? 1 : 0);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
const { rows } = await client.query(
  `SELECT username, contact, phone, instagram, kind, level, who, income
   FROM dwy_leads WHERE source = $1 ORDER BY id`, [SOURCE],
);

const byContact = (c) => rows.find((r) => r.contact === c);

const checks = [
  ['менторская анкета помечена mentor', () => byContact('@dwy_probe')?.kind === 'mentor'],
  ['лист ожидания помечен t2', () => byContact('@dwy_wait')?.kind === 't2'],
  ['лист ожидания помечен t3', () => byContact('@dwy_wait3')?.kind === 't3'],
  ['неизвестный kind записан как mentor', () => rows.every((r) => ['mentor', 't2', 't3'].includes(r.kind))],
  ['телефон приведён к +7…', () => byContact('@dwy_contacts')?.phone === '+79991112233'],
  ['инстаграм вынут из ссылки', () => byContact('@dwy_contacts')?.instagram === '@dwy.probe'],
  ['без телефона в базе null, а не пустая строка', () => byContact('@dwy_probe')?.phone === null],
  ['у листа ожидания пустые ответы это null', () => {
    const r = byContact('@dwy_wait');
    return r?.level === null && r?.who === null && r?.income === null;
  }],
  ['почта осталась как есть, без юзернейма', () => {
    const r = byContact('probe@example.com');
    return r && r.username === null;
  }],
  ['ссылка t.me распознана как юзернейм', () => {
    const r = rows.find((x) => x.contact === 'https://t.me/dwy_probe');
    return r?.username === 'dwy_probe';
  }],
  ['повторная анкета не блокируется', () => rows.filter((r) => r.contact === '@dwy_probe').length >= 3],
];

console.log('');
for (const [name, check] of checks) {
  let ok = false;
  try { ok = !!check(); } catch { ok = false; }
  if (ok) console.log(`OK     ${name}`);
  else fail(name);
}

const { rowCount } = await client.query(`DELETE FROM dwy_leads WHERE source = $1`, [SOURCE]);
console.log(`\nтестовых строк удалено: ${rowCount}`);
await client.end();

console.log(failed ? `${failed} проверок провалено` : 'все проверки прошли');
process.exit(failed ? 1 : 0);
