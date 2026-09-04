// Юнит-проверка того, что делает анкета с текстом до записи и до отправки:
// нормализация контактов и сборка сообщения Саше.
// Запуск (сервер не нужен, базы не касается):
//   npx tsx scripts/verify-dwy-message.ts

import {
  buildDwyMessage, normalizePhone, normalizeInstagram, normalizeTelegramUsername,
  type DwyLeadInput,
} from '../src/lib/dwy-message';

let failed = 0;
function check(name: string, got: unknown, want: unknown) {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? 'OK    ' : 'ПРОВАЛ'} ${name}${ok ? '' : `\n   получили: ${got}\n   ждали:    ${want}`}`);
}
function contains(name: string, haystack: string, needle: string) {
  const ok = haystack.includes(needle);
  if (!ok) failed++;
  console.log(`${ok ? 'OK    ' : 'ПРОВАЛ'} ${name}${ok ? '' : `\n   не нашли: ${needle}\n   в тексте: ${haystack}`}`);
}
function absent(name: string, haystack: string, needle: string) {
  const ok = !haystack.includes(needle);
  if (!ok) failed++;
  console.log(`${ok ? 'OK    ' : 'ПРОВАЛ'} ${name}`);
}

console.log('— телефон —');
check('8 (999) 111-22-33', normalizePhone('8 (999) 111-22-33'), '+79991112233');
check('+7 999 111 22 33', normalizePhone('+7 999 111 22 33'), '+79991112233');
check('79991112233', normalizePhone('79991112233'), '+79991112233');
check('9991112233 без кода', normalizePhone('9991112233'), '+79991112233');
check('иностранный оставляем как есть', normalizePhone('+971 50 123 4567'), '+971501234567');
check('мусор возвращаем нетронутым', normalizePhone('позвоните мне'), 'позвоните мне');

console.log('\n— инстаграм —');
check('@nick', normalizeInstagram('@dwy.probe'), 'dwy.probe');
check('ссылка с параметрами', normalizeInstagram('https://instagram.com/dwy.probe?igsh=abc'), 'dwy.probe');
check('www и m.', normalizeInstagram('https://www.instagram.com/dwy_probe/'), 'dwy_probe');
check('не ник', normalizeInstagram('мой блог про кофе'), null);

console.log('\n— телеграм —');
check('t.me ссылкой', normalizeTelegramUsername('https://t.me/dwy_probe'), 'dwy_probe');
check('почта не юзернейм', normalizeTelegramUsername('probe@example.com'), null);

const minimal: DwyLeadInput = {
  name: 'Иван', contact: '@ivan_probe', username: 'ivan_probe',
  phone: null, instagram: null, instagramHandle: null,
  kind: 't2',
  who: null, hasProduct: null, product: null, level: null,
  tried: null, want: null, income: null, hours: null,
  following: null, readiness: null, followers: null,
  source: 'uroven',
};

console.log('\n— сообщение: лист ожидания без ответов —');
const wait = buildDwyMessage(minimal);
contains('заголовок потока', wait, 'Лист ожидания - тариф 2');
contains('имя', wait, '<b>Кто:</b> Иван');
contains('телеграм ссылкой', wait, 'https://t.me/ivan_probe');
absent('пустого телефона нет', wait, 'Телефон');
absent('пустого дохода нет', wait, 'Доход');
absent('пустого уровня нет', wait, 'Уровень');

console.log('\n— сообщение: менторство целиком —');
const mentor = buildDwyMessage({
  ...minimal, kind: 'mentor',
  phone: '+79991112233', instagram: '@dwy.probe', instagramHandle: 'dwy.probe',
  who: 'эксперт', hasProduct: 'да', product: 'консультации', level: 3,
  tried: 'снимал рилсы', want: 'поток заявок', income: '150–500к', hours: '5–10 часов',
  following: 'больше года', readiness: 'вполне готов(-а)', followers: 15000,
});
contains('заголовок менторства', mentor, 'Анкета на менторство');
contains('телефон моноширинным', mentor, '<code>+79991112233</code>');
contains('инстаграм ссылкой', mentor, 'https://instagram.com/dwy.probe');
contains('уровень словами', mentor, 'Уровень:</b> 3 · Делаю, но бесит');
contains('продукт рядом с ответом', mentor, 'да · консультации');
contains('давно подписан', mentor, 'Подписан:</b> больше года');
contains('подписчики с разделителем', mentor, 'Подписчиков:</b> 15 000');
contains('готовность с огоньком', mentor, 'Готов к покупке:</b> 🔥 вполне готов(-а)');

console.log('\n— готовность: огонёк только у готовых —');
const thinking = buildDwyMessage({ ...minimal, kind: 'mentor', readiness: 'пока думаю' });
contains('думающий без огонька', thinking, 'Готов к покупке:</b> пока думаю');
absent('огонька у думающего нет', thinking, '🔥');
absent('пустой подписки нет', thinking, 'Подписан');
absent('пустых подписчиков нет', thinking, 'Подписчиков');

const zero = buildDwyMessage({ ...minimal, kind: 'mentor', followers: 0 });
contains('ноль подписчиков это ответ', zero, 'Подписчиков:</b> совсем нет');
const huge = buildDwyMessage({ ...minimal, kind: 'mentor', followers: 1000000 });
contains('верхняя ступень открытая', huge, 'Подписчиков:</b> 1 000 000+');

console.log('\n— сообщение: человек уже присылал анкету —');
const again = buildDwyMessage({ ...minimal, kind: 'mentor' }, { days: 12, kind: 't2' });
contains('строка о прошлой анкете', again, 'Уже присылал 12 дней назад');
contains('поток прошлой анкеты', again, 'Лист ожидания - тариф 2');
contains('сегодня', buildDwyMessage(minimal, { days: 0, kind: 'mentor' }), 'Уже присылал сегодня');
contains('вчера', buildDwyMessage(minimal, { days: 1, kind: 'mentor' }), 'Уже присылал вчера');
contains('один день', buildDwyMessage(minimal, { days: 21, kind: 'mentor' }), '21 день назад');
contains('два дня', buildDwyMessage(minimal, { days: 3, kind: 'mentor' }), '3 дня назад');
contains('неизвестный поток не роняет', buildDwyMessage(minimal, { days: 5, kind: null }), 'анкета');

console.log('\n— защита от разметки в свободных полях —');
const evil = buildDwyMessage({ ...minimal, name: '<b>жирный</b> & сын' });
contains('теги экранированы', evil, '&lt;b&gt;жирный&lt;/b&gt; &amp; сын');

console.log(failed ? `\n${failed} проверок провалено` : '\nвсе проверки прошли');
process.exit(failed ? 1 : 0);
