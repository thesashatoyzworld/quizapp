// Сквозная проверка /api/dwy-lead: валидация → запись в базу → уведомление.
// Запуск (dev-сервер должен быть поднят):
//   node --env-file=.env.local scripts/verify-dwy.mjs
//
// Telegram-логина в анкете нет (виджет в мобильном браузере требовал номер),
// поэтому подписывать нечего — бьём обычным JSON, как это делает страница.

const BASE = process.env.DWY_BASE || 'http://localhost:3000';

const base = {
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

const cases = [
  { name: 'валидная анкета', answers: base, expect: 200 },
  { name: 'юзернейм ссылкой t.me/name', answers: { ...base, contact: 'https://t.me/dwy_probe' }, expect: 200 },
  { name: 'почта вместо юзернейма', answers: { ...base, contact: 'probe@example.com' }, expect: 200 },
  { name: 'без контакта', answers: { ...base, contact: '' }, expect: 400 },
  { name: 'без имени', answers: { ...base, name: '' }, expect: 400 },
  { name: 'кривой уровень', answers: { ...base, level: 9 }, expect: 400 },
];

let failed = 0;
for (const c of cases) {
  const res = await fetch(`${BASE}/api/dwy-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: c.answers, source: 'verify-script' }),
  });
  const ok = res.status === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? 'OK  ' : 'ПРОВАЛ'} ${c.name}: ${res.status} (ждали ${c.expect})${ok ? '' : ' ' + await res.text()}`);
}

console.log(failed ? `\n${failed} проверок провалено` : '\nвсе проверки прошли');
process.exit(failed ? 1 : 0);
