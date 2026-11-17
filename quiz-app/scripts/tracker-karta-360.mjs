// Разовая сборка карты запуска «360» в трекере (/admin/treker/karta).
//
// 1. Шаги групп «Набор в лист ожидания», «Открыть набор в 360», «Продукт и доступы»
//    становятся отдельными задачами внутри этих групп (сделанные остаются сделанными):
//    на карте карточка = задача, у неё свои шаги.
// 2. Каждой карточке ставится шаг пути клиента, неделя или «потом».
// 3. Добавляются карточки из роадмапа запуска, которых в трекере не было.
//
// Повторно не запускается: если карта '360' уже есть, скрипт выходит.
// Сначала: node scripts/tracker-create-tables.mjs
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE || '.env.local' });
import pg from 'pg';
import { randomUUID } from 'crypto';

const STAGES = [
  { key: 'uvidel', title: 'Увидел', hint: 'контент и трафик' },
  { key: 'zapisalsya', title: 'Записался в лист', hint: 'анкета и бот' },
  { key: 'oplatil', title: 'Оплатил', hint: 'страница и оплата' },
  { key: 'voshel', title: 'Вошёл', hint: 'доступы и онбординг' },
  { key: 'pervaya', title: 'Первая неделя', hint: 'интервью и приложения' },
  { key: 'rezultat', title: 'Результат', hint: 'через 3 месяца' },
];
const MILESTONES = [
  { from: '2026-12-22', label: 'продукт заморожен', kind: 'mark' },
  { from: '2026-12-23', to: '2027-01-16', label: 'брат прилетает, ничего не строим', kind: 'pause' },
  { from: '2027-01-19', label: 'открытие набора (дата черновая)', kind: 'launch' },
];

// Шаги групп → карточки: [начало названия шага, колонка, неделя | null | 'later']
const FROM_STEPS = [
  ['Перевести /360', 'zapisalsya', '2026-11-16'],
  ['Поправить ответ', 'zapisalsya', '2026-11-16'],
  ['Финал карусели-конвертера', 'uvidel', '2026-11-16', -27],
  ['Раз в неделю смотреть', 'zapisalsya', null],
  ['Лично поговорить', 'oplatil', '2026-12-07'],
  ['Починить «Политику', 'zapisalsya', '2026-11-23'],
  ['Показать юристу', 'zapisalsya', '2026-11-23'],
  ['Назвать дату', 'oplatil', '2026-11-16', -30],
  ['Решить спецпредложение', 'oplatil', '2026-11-30'],
  ['Перенести дату в start360', 'oplatil', '2026-12-14'],
  ['Вернуть оплату', 'oplatil', '2026-12-14'],
  ['Тестовые оплаты', 'oplatil', '2026-12-14'],
  ['По тестовой покупке', 'voshel', '2026-12-14'],
  ['Написать листу ожидания', 'oplatil', '2027-01-18'],
  ['Онбординг под 360', 'voshel', '2026-12-07'],
  ['Добавить в интервью', 'pervaya', '2026-11-30'],
  ['Логика маршрутных карт', 'pervaya', '2026-11-30'],
  ['Решить, кто каждый день', 'rezultat', '2026-12-07'],
  ['Проверить, как люди попадают', 'voshel', '2026-12-14'],
  ['Прогнать путь целиком', 'voshel', '2027-01-18'],
];

// Новые карточки: [группа-родитель (префикс id), название, колонка, неделя | null | 'later', позиция?]
const NEW = [
  ['b336dcac', 'Решить состав первого дня: что внутри к открытию, остальное в «потом»', 'pervaya', '2026-11-16', -29],
  ['b336dcac', 'Поиск выбросов в кабинете у людей', 'pervaya', '2026-11-23'],
  ['b336dcac', 'Сборщик оффера в кабинете', 'pervaya', '2026-12-07'],
  ['b336dcac', 'Как проверяем результат через 3 месяца (гарантия)', 'rezultat', '2026-12-07'],
  ['b336dcac', 'Пересборка маршрутной карты раз в месяц', 'rezultat', 'later'],
  ['b336dcac', 'Оптимизатор рилсов внутри 360', 'pervaya', 'later'],
  ['9393eb7b', 'Страница апсейла на год после оплаты 10к', 'oplatil', '2026-12-07'],
  ['9393eb7b', 'Живой счётчик мест вместо «осталось 20»', 'oplatil', 'later'],
  ['14c62a7b', 'Цель по листу: сколько записей нужно под 30 оплат', 'zapisalsya', '2026-11-16', -28],
  ['102dad83', 'YouTube и сторис со ссылкой на лист', 'uvidel', '2026-11-30'],
  ['102dad83', 'Прогрев: кейсы и «через год»', 'uvidel', '2026-12-07'],
  ['102dad83', 'Отложенные посты на каникулы', 'uvidel', '2026-12-14'],
  ['102dad83', 'Shorts и TikTok', 'uvidel', 'later'],
];

// Задачи, которые уже есть: [префикс id, колонка, неделя | null | 'later']
const EXISTING = [
  ['5441ce1a', 'uvidel', '2026-11-16'],
  ['629bdb4e', 'uvidel', '2026-11-16'],
  ['8b79eeac', 'uvidel', null],
  ['8b54c850', 'uvidel', 'later'],
  ['140eee14', 'zapisalsya', null],
  ['9943f7a4', 'uvidel', null],
];

const GROUPS = ['14c62a7b', '9393eb7b', 'b336dcac'];
const GOAL = '84404057';

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

if ((await c.query("SELECT 1 FROM tracker_map WHERE id = '360'")).rowCount) {
  console.log('карта 360 уже есть, выхожу');
  process.exit(0);
}

const all = (await c.query('SELECT id, title FROM tracker_task')).rows;
const full = (prefix) => {
  const hit = all.filter((t) => t.id.startsWith(prefix));
  if (hit.length !== 1) throw new Error(`задача ${prefix}: найдено ${hit.length}`);
  return hit[0].id;
};
const place = (week) => (week === 'later' ? { later: true, week: null } : { later: false, week });

await c.query('BEGIN');
try {
  let made = 0;
  for (const g of GROUPS.map(full)) {
    const steps = (await c.query('SELECT id, title, position FROM tracker_step WHERE task_id = $1 ORDER BY position, created_at', [g])).rows;
    const done = new Set((await c.query("SELECT step_id FROM tracker_check WHERE task_id = $1 AND period_key = 'once'", [g])).rows.map((r) => r.step_id));
    for (const s of steps) {
      const rule = FROM_STEPS.find(([p]) => s.title.startsWith(p));
      if (!rule) throw new Error(`шаг без места на карте: «${s.title}»`);
      const [, stage, week, pos] = rule;
      const { later, week: w } = place(week);
      const id = randomUUID();
      await c.query(
        `INSERT INTO tracker_task (id, kind, title, parent_id, tags, position, map_stage, map_later, map_week)
         VALUES ($1, 'quest', $2, $3, '{360}', $4, $5, $6, $7)`,
        [id, s.title, g, pos ?? 100 + s.position, stage, later, w],
      );
      if (done.has(s.id)) {
        await c.query("INSERT INTO tracker_check (task_id, step_id, period_key) VALUES ($1, '', 'once')", [id]);
      }
      made++;
    }
    await c.query('DELETE FROM tracker_check WHERE task_id = $1', [g]);
    await c.query('DELETE FROM tracker_step WHERE task_id = $1', [g]);
  }
  for (const [parent, title, stage, week, pos] of NEW) {
    const { later, week: w } = place(week);
    await c.query(
      `INSERT INTO tracker_task (id, kind, title, parent_id, tags, position, map_stage, map_later, map_week)
       VALUES ($1, 'quest', $2, $3, '{360}', $4, $5, $6, $7)`,
      [randomUUID(), title, full(parent), pos ?? 200 + made++, stage, later, w],
    );
  }
  for (const [prefix, stage, week] of EXISTING) {
    const { later, week: w } = place(week);
    await c.query('UPDATE tracker_task SET map_stage = $2, map_later = $3, map_week = $4 WHERE id = $1', [full(prefix), stage, later, w]);
  }
  const goal = full(GOAL);
  await c.query("UPDATE tracker_task SET title = '30 человек в «360» к запуску' WHERE id = $1", [goal]);
  await c.query(
    `INSERT INTO tracker_map (id, title, goal_task_id, deadline, stages, milestones) VALUES ('360', 'Запуск 360', $1, '2027-01-19', $2, $3)`,
    [goal, JSON.stringify(STAGES), JSON.stringify(MILESTONES)],
  );
  await c.query('COMMIT');
  const r = await c.query('SELECT map_stage, map_later, count(*) FROM tracker_task WHERE map_stage IS NOT NULL GROUP BY 1, 2 ORDER BY 1, 2');
  console.table(r.rows);
} catch (e) {
  await c.query('ROLLBACK');
  throw e;
} finally {
  await c.end();
}
