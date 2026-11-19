// Путь клиента на карте запуска «360» (/admin/treker/karta).
// Шаги человека от «увидел» до результата, в каждом точки, которые он встречает.
// Карточки карты привязываются к точкам (tracker_task.map_point).
// Можно запускать повторно: путь перезаписывается, привязки ставятся заново.
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';

// [ключ, название, что делает человек, [[ключ точки, название, [префиксы задач], готово без задач?]]]
const PATH = [
  [
    'uvidel',
    'Увидел',
    'наткнулся на Сашу и захотел больше',
    [
      ['karuseli', 'Карусели в инсте зовут в лист', ['8b79eeac', '5441ce1a', 'dc06cd00', '8b54c850']],
      ['svoi', 'Свои клиенты т2 и т3 узнают первыми', ['a4b12df7']],
      ['youtube', 'YouTube и сторис со ссылкой на лист', ['6a2bd147']],
      ['kanikuly', 'Посты выходят, пока ты на каникулах', ['4aee4394']],
      ['shorts', 'Shorts и TikTok', ['1bd651f6']],
    ],
  ],
  [
    'zapisalsya',
    'Записался в лист',
    'оставил контакт и ждёт открытия',
    [
      ['stranica', 'Страница /360 с видео ведёт в лист', ['4e3bf748', '140eee14']],
      ['direkt', 'Ответ на «360» в директе', ['c39e8ce8']],
      ['anketa', 'Анкета листа ожидания', [], true],
      ['zakon', 'Политика и документы по закону', ['8174854a', '08a11f32']],
    ],
  ],
  [
    'zhdet',
    'Ждёт открытия',
    'до открытия помнит о запуске и греется',
    [
      ['data', 'Знает дату открытия', ['ce716a49']],
      ['progrev', 'Прогрев: кейсы и «через год»', ['e2fcfdeb']],
      ['svoim', 'Спецпредложение для своих', ['d1e80771']],
      ['pismo', 'Сообщение «набор открыт»', ['77f748f0']],
    ],
  ],
  [
    'oplatil',
    'Оплатил',
    'нажал «оплатить», деньги прошли',
    [
      ['sostav', 'Знает, что получит в день оплаты', ['0188d5c4']],
      ['knopka', 'Кнопка «оплатить» на /360 и в видео', ['ce877a2e']],
      ['sposoby', 'Карта, крипта и PayPal проходят', ['235e3956']],
      ['srok', 'Срок доступа считается со старта', ['9679db1f']],
      ['schetchik', 'Живой счётчик мест', ['1076fff9']],
      ['god', 'Апсейл на год после оплаты 10к', ['cb4620f2']],
    ],
  ],
  [
    'voshel',
    'Вошёл',
    'получил доступ и понял, что делать первым',
    [
      ['dostup', 'Доступ и приветствие сразу после оплаты', ['dc71ef6c', 'adec198e']],
      ['soobshchestvo', 'Попал в сообщество и на созвоны', ['f4530276', '728d327f']],
      ['progon', 'Весь путь прогнан на тестовом человеке', ['c0bdc1f4']],
      ['intervyu', 'Интервью', ['da364a7d']],
      ['onbording', 'Онбординг по кабинету', ['2b9b8e84']],
    ],
  ],
  [
    'rabotaet',
    'Первый месяц',
    'работает по своей карте и приложениям',
    [
      ['forum', 'Ответ на форуме каждый день', ['9c575ed2']],
      ['karta', 'Маршрутная карта по его горлышку', ['eefc09f9', 'd280a2bd']],
      [
        'prilozheniya',
        'Приложения в кабинете',
        ['cc6d071c', '9943f7a4', '8a7b3977', '29b7c60b', '185e64aa', 'cd96e804'],
      ],
      ['sozvony', 'Созвоны раз в месяц', ['b58d6175']],
      ['uroki', 'Уроки под новую методологию', ['63a35890']],
    ],
  ],
  [
    'rezultat',
    'Результат',
    'через 3 месяца видит, что сработало',
    [['garantiya', 'Проверка результата и гарантия', ['78e227cb']]],
  ],
];

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
await c.query('BEGIN');
try {
  await c.query('ALTER TABLE tracker_task ADD COLUMN IF NOT EXISTS map_point text');
  await c.query('ALTER TABLE tracker_map ADD COLUMN IF NOT EXISTS path jsonb');

  const ids = (await c.query('SELECT id FROM tracker_task WHERE map_stage IS NOT NULL')).rows.map((r) => r.id);
  const full = (prefix) => {
    const hit = ids.filter((id) => id.startsWith(prefix));
    if (hit.length !== 1) throw new Error(`задача ${prefix}: найдено ${hit.length}`);
    return hit[0];
  };

  const path = PATH.map(([key, title, does, points]) => ({
    key,
    title,
    does,
    points: points.map(([k, t, , ready]) => (ready ? { key: k, title: t, ready: true } : { key: k, title: t })),
  }));
  await c.query("UPDATE tracker_map SET path = $1 WHERE id = '360'", [JSON.stringify(path)]);

  await c.query('UPDATE tracker_task SET map_point = NULL WHERE map_point IS NOT NULL');
  let linked = 0;
  for (const [, , , points] of PATH) {
    for (const [k, , tasks] of points) {
      for (const p of tasks) {
        await c.query('UPDATE tracker_task SET map_point = $2 WHERE id = $1', [full(p), k]);
        linked++;
      }
    }
  }
  const loose = await c.query(
    'SELECT title FROM tracker_task WHERE map_stage IS NOT NULL AND map_point IS NULL AND archived_at IS NULL',
  );
  await c.query('COMMIT');
  console.log(`путь: ${path.length} шагов, привязано задач: ${linked}`);
  if (loose.rowCount)
    console.log(
      'без точки:',
      loose.rows.map((r) => r.title),
    );
} catch (e) {
  await c.query('ROLLBACK');
  throw e;
} finally {
  await c.end();
}
