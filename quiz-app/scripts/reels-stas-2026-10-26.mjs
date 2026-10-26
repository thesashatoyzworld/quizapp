// Доска роликов Стаса на 26.10: v3 смонтирована, перезапуск «Химзавода», ТЗ записи 23.10.
//
// Запуск:
//   node scripts/reels-stas-2026-10-26.mjs <путь к TZ-MONTAZH-2026-10-23.html>
//
// Идемпотентно. Этапы версий, которые Стас уже отметил выложенными, не трогает.
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import { readFileSync } from 'node:fs';

const TELEGRAM_ID = '204608959';
const [tzPath] = process.argv.slice(2);
if (!tzPath) {
  console.error('нужно: node scripts/reels-stas-2026-10-26.mjs <TZ-MONTAZH-2026-10-23.html>');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

async function brief(id, order, title, label, summary, state, stateLabel, html = null) {
  await client.query(
    `INSERT INTO reel_briefs (id, telegram_id, "order", title, label, summary, state, state_label, html)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET "order" = EXCLUDED."order", title = EXCLUDED.title, label = EXCLUDED.label,
       summary = EXCLUDED.summary, state = EXCLUDED.state, state_label = EXCLUDED.state_label,
       html = COALESCE(EXCLUDED.html, reel_briefs.html), updated_at = now()`,
    [id, TELEGRAM_ID, order, title, label, summary, state, stateLabel, html],
  );
}

// Новая версия: этап задаём только при создании, дальше его двигают Стас и админка.
async function version(id, briefId, reel, title, ver, order, stage, note = null) {
  await client.query(
    `INSERT INTO reel_versions (id, telegram_id, brief_id, reel, title, version, "order", stage, note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO UPDATE SET brief_id = EXCLUDED.brief_id, reel = EXCLUDED.reel, title = EXCLUDED.title,
       version = EXCLUDED.version, "order" = EXCLUDED."order", note = EXCLUDED.note, updated_at = now()`,
    [id, TELEGRAM_ID, briefId, reel, title, ver, order, stage, note],
  );
}

// v3: монтажёр сдал все 20 файлов 20–21.10.
await brief('t2509v3', 2, 'Запись 25.09 · v3 · 5 роликов × 4 версии', '25.09 v3',
  'Текст утверждён 19.10. Порядок выкладки 4, 7, 8, 6, 5. Химзавод перезапускаем по правкам 25.10, короткую с бутылкой не выкладываем.',
  'ok', 'смонтировано 20–21.10');
await client.query(
  `UPDATE reel_versions SET stage = 'done', updated_at = now()
    WHERE telegram_id = $1 AND brief_id = 't2509v3' AND stage = 'tz' AND id <> 'v3-07-relaunch'`,
  [TELEGRAM_ID],
);
await client.query(
  `UPDATE reel_versions SET stage = 'skip', plan_date = NULL, note = 'Стас 25.10: версию с бутылкой больше не выкладываем', updated_at = now()
    WHERE id = 'v3-07-short-broll' AND telegram_id = $1 AND stage <> 'up'`,
  [TELEGRAM_ID],
);
await version('v3-07-relaunch', 't2509v3', '07', 'Химзавод проще, чем маленький ресторан', 'перезапуск по правкам 25.10', 220, 'tz',
  'Первый кадр: Стас в кадре + плашка «Химзавод проще, чем маленький ресторан». Без «Поймите, что…», финал сразу с «Малый бизнес — самый тяжёлый бизнес». Выкладывать как новый пробный.');

// ТЗ записи 23.10: текст утверждён Стасом 24.10.
const html = readFileSync(tzPath, 'utf8');
await brief('t2310', 0, 'Запись 23.10 · 5 роликов', '23.10',
  'Текст утверждён 24.10. Порядок монтажа 01, 02, 07, 05. Ролик 03 после того, как пришлёшь фразу про второй зал и фото туалета.',
  'wait', 'ТЗ готово, у монтажёра', html);

const REELS = [
  ['01', 'Гость уже заплатил. Как его можно потерять?', true, null],
  ['02', 'Почему простое работает лучше', false, null],
  ['07', 'Зачем ресторану ИИ', true, null],
  ['05', 'С первого раза ничего не бывает', false, null],
  ['03', 'Самый дорогой туалет в моей жизни', true, 'Ждёт от Стаса фразу про второй зал и фото туалета'],
];
let order = 400;
for (const [n, title, long, note] of REELS) {
  const vs = ['short'].concat(long ? ['long'] : []).flatMap((l) => [`${l}-gg`, `${l}-broll`]);
  for (const v of vs) await version(`z2310-${n}-${v}`, 't2310', n, title, `${n}-${v}.mp4`, order++, 'tz', note);
}

const check = await client.query(
  `SELECT brief_id, stage, count(*)::int AS n FROM reel_versions WHERE telegram_id = $1 GROUP BY 1, 2 ORDER BY 1, 2`,
  [TELEGRAM_ID],
);
console.table(check.rows);
await client.end();
