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

// Маршруты внутри шага: каждый источник своей веткой, как в схеме промо группы Маши.
// Узел: [ключ, что делает человек, подпись, [префиксы задач], флаги]. Флаги: ready = работает без задачи,
// point = берёт задачи другого узла (одна задача на два маршрута). from = метки анкеты, по ним счёт «пришло».
const ROUTES = {
  zapisalsya: [
    {
      key: 'r-anketa',
      title: 'Анкета листа',
      from: [''],
      nodes: [
        ['an-open', 'Открывает анкету', '«набор пока закрыт, первые 30 мест по 10 000 в месяц»', [], { ready: true }],
        ['an-kontakt', 'Оставляет имя и контакт', 'телефон и «расскажите о себе» по желанию', [], { ready: true }],
        [
          'an-soglasie',
          'Ставит галочку согласия',
          'ссылка на политику ведёт на 404, юрист не смотрел',
          ['8174854a', '08a11f32'],
        ],
        [
          'an-spasibo',
          'Видит «остался один шаг: подтвердите в телеграме»',
          'кнопка «Подтвердить в телеграме» открывает бота',
          [],
          { ready: true },
        ],
        [
          'an-bot',
          'Жмёт «Старт»: бот пишет «анкета принята»',
          'бот запоминает Телеграм, об открытии напишет сам',
          [],
          { ready: true },
        ],
        ['an-sasha', 'Саше приходит заявка в Телеграм', 'и счёт на карте +1', [], { ready: true }],
      ],
    },
  ],
  uvidel: [
    {
      key: 'r-tg',
      title: 'ТГ-канал',
      from: ['tg_', 'kanal'],
      nodes: [
        ['tg-post', 'Видит пост в канале', 'отложенные посты держат канал, пока ты с братом', ['4aee4394']],
        ['tg-link', 'Жмёт ссылку в посте', 'у поста своя метка tg_дата', [], { ready: true }],
        ['tg-anketa', 'Анкета листа ожидания', '«набор пока закрыт, первые 30 мест по 10 000»', [], { ready: true }],
      ],
    },
    {
      key: 'r-konverter',
      title: 'Карусель-конвертер',
      from: ['konverter'],
      nodes: [
        [
          'kv-karusel',
          'Видит карусель-конвертер',
          '«30 мест, 10 заняты… напиши в комментах 360»',
          ['5441ce1a', 'dc06cd00'],
        ],
        ['kv-slovo', 'Пишет «360» в комменты или директ', 'ChatPlace ловит слово', [], { ready: true }],
        [
          'kv-otvet',
          'ChatPlace присылает ответ',
          '«набор пока закрыт: запишись в лист» + кнопка на /360?from=konverter',
          ['c39e8ce8'],
        ],
        ['kv-stranica', 'Страница /360 с видео', 'кнопки «Записаться в лист ожидания»', ['4e3bf748', '140eee14']],
        ['kv-anketa', 'Анкета листа ожидания', 'метка konverter (с 19.11)', [], { ready: true }],
      ],
    },
    {
      key: 'r-site',
      title: 'Сайт /360 без метки',
      from: ['site360'],
      nodes: [
        [
          'si-stranica',
          'Заходит на /360',
          'без метки; до 19.11 сюда же писались люди с конвертера',
          [],
          { ready: true },
        ],
        ['si-anketa', 'Анкета листа ожидания', 'метка site360', [], { ready: true }],
      ],
    },
    {
      key: 'r-shapka',
      title: 'Шапка профиля',
      from: ['shapka'],
      nodes: [
        ['sp-profil', 'Заходит в профиль', '«помогаю создавать пиздатые личные бренды»', [], { ready: true }],
        ['sp-link', 'Видит ссылки в шапке', 'первая на /potok-sprosa', [], { ready: true }],
        ['sp-360', 'Жмёт вторую ссылку: лист 360', '/360?from=shapka', ['8f406bf1']],
        ['sp-anketa', 'Анкета листа ожидания', 'метка shapka', [], { ready: true }],
      ],
    },
    {
      key: 'r-sajt',
      title: 'Страницы сайта',
      from: ['site-'],
      nodes: [
        ['sj-stranica', 'Читает главную, кейсы, блог, подкаст', 'про 360 там ни одной ссылки', [], { ready: true }],
        [
          'sj-360',
          'Видит блок «Личный бренд на 360»',
          'своя метка у страницы: site-home, site-cases, site-blog',
          ['1fea572a'],
        ],
        ['sj-anketa', 'Анкета листа ожидания', 'по метке видно, какая страница привела', [], { ready: true }],
      ],
    },
    {
      key: 'r-uniq',
      title: 'Уникализатор',
      from: ['uniq'],
      nodes: [
        ['un-rolik', 'Делает версии ролика', '', [], { ready: true }],
        [
          'un-offer',
          'Видит предложение на последнем экране',
          'одно из трёх по очереди: курс, «Поток Спроса», 360',
          [],
          { ready: true },
        ],
        ['un-stranica', 'Страница /360', 'метка uniq-c доходит до анкеты', [], { ready: true }],
      ],
    },
    {
      key: 'r-karuseli',
      title: 'Карусели недели',
      nodes: [['kr-karusel', 'Видит карусель недели', 'Даня собирает по ТЗ, 7 штук', ['8b79eeac', '8b54c850']]],
    },
    {
      key: 'r-stories',
      title: 'Сторис',
      from: ['stories'],
      nodes: [
        ['st-story', 'Видит сторис', '', []],
        ['st-link', 'Жмёт ссылку на лист', 'метка stories', ['6a2bd147']],
        ['st-anketa', 'Анкета листа ожидания', '', [], { ready: true }],
      ],
    },
    {
      key: 'r-youtube',
      title: 'YouTube',
      from: ['youtube'],
      nodes: [
        ['yt-video', 'Смотрит ролик', '', []],
        ['yt-link', 'Ссылка на лист в описании', '', [], { point: 'st-link' }],
        ['yt-anketa', 'Анкета листа ожидания', '', [], { ready: true }],
      ],
    },
    {
      key: 'r-svoi',
      title: 'Свои т2 и т3',
      nodes: [
        ['sv-konec', 'У человека заканчивается т2 или т3', '', [], { ready: true }],
        ['sv-razgovor', 'Саша пишет лично', '', ['a4b12df7']],
      ],
    },
    {
      key: 'r-shorts',
      title: 'Shorts и TikTok',
      nodes: [['sh-video', 'Видит короткое видео', '', ['1bd651f6']]],
    },
  ],
};

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
await c.query('BEGIN');
try {
  await c.query('ALTER TABLE tracker_task ADD COLUMN IF NOT EXISTS map_point text');
  await c.query('ALTER TABLE tracker_map ADD COLUMN IF NOT EXISTS path jsonb');

  // Задачи, которые родились из маршрутов (Саша 19.11): создаются один раз.
  const NEW_TASKS = [
    [
      '8f406bf1-682f-42c1-a98a-a5f2b44e0950',
      'Вторая ссылка в шапке инсты: лист 360 (/360?from=shapka)',
      'кто зашёл в профиль, попадает в лист',
    ],
    [
      '1fea572a-e9f4-45a7-95e6-76750934df79',
      'Блок «Личный бренд на 360» на главной, в кейсах и блоге со своей меткой',
      'читатели сайта попадают в лист',
    ],
  ];
  for (const [id, title, move] of NEW_TASKS) {
    await c.query(
      `INSERT INTO tracker_task (id, kind, title, parent_id, tags, position, map_stage, map_later, map_week, map_move)
       VALUES ($1, 'quest', $2, '14c62a7b-387d-4131-8b73-4f0e4b16720a', '{360}', 300, 'lyudi', false, '2026-11-16', $3)
       ON CONFLICT (id) DO NOTHING`,
      [id, title, move],
    );
  }

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
    points: ROUTES[key]
      ? []
      : points.map(([k, t, , ready]) => (ready ? { key: k, title: t, ready: true } : { key: k, title: t })),
    ...(ROUTES[key]
      ? {
          routes: ROUTES[key].map((r) => ({
            key: r.key,
            title: r.title,
            ...(r.from ? { from: r.from } : {}),
            nodes: r.nodes.map(([k, t, sub, , f = {}]) => ({ key: k, title: t, ...(sub ? { sub } : {}), ...f })),
          })),
        }
      : {}),
  }));
  await c.query("UPDATE tracker_map SET path = $1 WHERE id = '360'", [JSON.stringify(path)]);

  await c.query('UPDATE tracker_task SET map_point = NULL WHERE map_point IS NOT NULL');
  let linked = 0;
  const links = [
    ...PATH.filter(([key]) => !ROUTES[key]).flatMap(([, , , points]) => points.map(([k, , tasks]) => [k, tasks])),
    ...Object.values(ROUTES).flatMap((rs) => rs.flatMap((r) => r.nodes.map(([k, , , tasks]) => [k, tasks]))),
  ];
  {
    for (const [k, tasks] of links) {
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
