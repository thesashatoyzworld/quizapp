// Разовый: карта запуска 360 → игра со счётом (лист ожидания, цель 90).
// Колонка map_move, две колонки карты (люди в лист / взять деньги), у каждого хода фраза «что даёт счёту»,
// дела, которые счёт не двигают, уходят в «потом». Запуск: node scripts/tracker-karta-schet.mjs
import { config } from 'dotenv';
import pg from 'pg';
config({ path: process.env.ENV_FILE || '.env.local' });

const L = 'lyudi', D = 'dengi';
// [начало названия, колонка, что даёт счёту] ; колонка null = в «потом»
const MOVES = [
  ['Финал карусели-конвертера', L, 'карусель зовёт подписчиков в лист'],
  ['Missing: Дособирать карусель-конвертер', L, 'карусель зовёт подписчиков в лист'],
  ['Перевести /360, анкету и ВСЛ', L, 'кто пришёл на сайт, записывается в лист, а не уходит'],
  ['Поправить ответ на «360» в ChatPlace', L, 'кто пишет «360», попадает в лист'],
  ['YouTube и сторис со ссылкой на лист', L, 'ещё два входа в лист'],
  ['Прогрев: кейсы и «через год»', L, 'кейсы убеждают записаться'],
  ['Лично поговорить с теми, у кого заканчиваются т2 и т3', L, 'свои клиенты: самые тёплые записи'],
  ['Отложенные посты на каникулы', L, 'лист растёт, пока ты с братом'],
  ['Загрузить VSL на сайт', L, 'видео дожимает до записи'],
  ['сделать 7 каруселей', L, 'каждая карусель приводит людей в лист'],
  ['Назвать дату открытия набора', D, 'людям в листе нужна дата, иначе ждать нечего'],
  ['Решить, что человек получит в день оплаты', D, 'без этого 19.01 нечего продавать'],
  ['Починить «Политику конфиденциальности»', D, 'анкета собирает контакты: без политики рискуешь листом'],
  ['Показать юристу документы листа', D, 'лист и оплата по закону'],
  ['Решить спецпредложение для т1', D, 'первые оплаты от своих'],
  ['Путь после оплаты', D, 'оплатил и сразу получил доступ'],
  ['Как проверяем результат через 3 месяца', D, 'гарантия снимает «а если не сработает»'],
  ['Тестовые оплаты', D, 'деньги проходят всеми способами'],
  ['Перенести дату в start360', D, 'срок доступа считается правильно'],
  ['Вернуть оплату на /360', D, 'кнопка «оплатить» на месте к открытию'],
  ['Проверить, как люди попадают в сообщество', D, 'оплатил и не потерялся'],
  ['По тестовой покупке проверить доступ', D, 'оплатил и не потерялся'],
  ['Прогнать путь целиком на тестовом', D, 'последняя проверка перед открытием'],
  ['Написать листу ожидания, что набор открыт', D, 'лист превращается в оплаты'],
  // счёт не двигают: после открытия
  ['MVP поиска выбросов', null], ['Добавить в интервью', null], ['Онбординг по кабинету', null],
  ['Логика маршрутных карт', null], ['Страница апсейла', null], ['MVP сборщика оффера', null],
  ['Решить, кто каждый день отвечает на форуме', null], ['Кнопка «Пожелания и баги»', null],
  ['Созвоны раз в месяц', null], ['Календарь выхода новых приложений', null],
  ['Перевести т2 и т3 из групп', null], ['Оптимизатор рилсов внутри 360', null],
  ['Выкатить уникализатор', null], ['Переделать уроки курса', null],
];
// Решено или теперь считается само.
const ARCHIVE = ['Цель по листу: сколько записей нужно под 30 оплат', 'Раз в неделю смотреть, сколько записалось в лист'];

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query('ALTER TABLE tracker_task ADD COLUMN IF NOT EXISTS map_move TEXT');
await c.query(`UPDATE tracker_map SET stages = $1::jsonb WHERE id = '360'`, [JSON.stringify([
  { key: L, title: 'люди в лист', hint: 'двигает счёт' },
  { key: D, title: 'взять деньги', hint: 'без этого лист не станет оплатами' },
])]);
const { rows } = await c.query('SELECT id, title, map_stage FROM tracker_task WHERE map_stage IS NOT NULL AND archived_at IS NULL');
const left = new Set(rows.map((r) => r.id));
for (const [start, stage, move] of MOVES) {
  const hit = rows.filter((r) => r.title.startsWith(start));
  if (hit.length === 0) { console.log('нет:', start); continue; }
  for (const r of hit) {
    left.delete(r.id);
    if (stage) await c.query('UPDATE tracker_task SET map_stage=$2, map_move=$3, map_later=false WHERE id=$1', [r.id, stage, move]);
    else await c.query('UPDATE tracker_task SET map_stage=$2, map_later=true, map_week=NULL, map_move=NULL WHERE id=$1', [r.id, L]);
  }
}
for (const t of ARCHIVE) {
  const r = await c.query('UPDATE tracker_task SET archived_at=now() WHERE title LIKE $1 AND archived_at IS NULL RETURNING id', [t + '%']);
  r.rows.forEach((x) => left.delete(x.id));
}
// Старые «потом» без разбора: в «потом» с валидной колонкой.
for (const id of left) {
  const r = rows.find((x) => x.id === id);
  await c.query('UPDATE tracker_task SET map_stage=$2, map_later=true, map_week=NULL WHERE id=$1', [id, L]);
  console.log('в потом:', r.title);
}
await c.query(`UPDATE tracker_map SET level = 1 WHERE id = '360'`);
console.log('ok');
await c.end();
