// Seeds «Студия» with the briefs already sent to Danya and their items:
//   - 12 family-reaction reels (brief 08.11): 4 edits × 3 copies
//   - 7 carousels for 09–15.11 (brief 04.11), one per day
//   - 7 reels from the 06.11 shoot (brief 06.11): 4 copies each, no date
// plus the «Что работает» rules. Each brief HTML is stored once (studio_briefs).
//
// Idempotent: fixed ids, existing items are left as they are (Danya may have
// moved them on). A planned item whose post already came out (matched by
// caption keywords against posts the sync created) takes over that post
// instead of duplicating it.
//
// Run: node scripts/studio-seed.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import pg from 'pg';

const GSD = '/Users/sashatoyz/Documents/ClaudeCode/Projects/GSD-BRAND/clients/sasha';
const VAULT = '/Users/sashatoyz/Documents/Vault/Работа/Карусели/Карусели/November/Nov 8 - Nov 15 (2026';

const BRIEFS = [
  { id: 'rodnye-2026-11-08', title: '12 роликов: реакции родных на заработок', sentAt: '2026-11-08', tgRef: 'msg 3520',
    file: `${GSD}/reels-trial-2026-10-20/semya-2026-11-07/TZ-Danya-rodnye-12-2026-11-08.html` },
  { id: 'karuseli-2026-11-08', title: 'Семь каруселей, 8–15 ноября', sentAt: '2026-11-04', tgRef: 'topic 6, msg 3388',
    file: `${VAULT}/brief-nov-8-nov-15-2026.html` },
  { id: 'rilsy-2026-11-06', title: '7 рилсов со съёмки 06.11', sentAt: '2026-11-06', tgRef: 'topic 2, msg 3465',
    file: `${GSD}/05-content/rilsy-kallaway-2026-11-06/TZ-Danya-rilsy-2026-11-06.html` },
];

const FAMILY = [
  { variant: 'mama-vyrez', title: 'Мама: вырез 13,3–25,0',
    text: 'Основа DfPdRztO_E7. Вырезать 13,3–25,0 с, плашку и призыв оставить. Копии уникализировать без нового начала и рамки.' },
  { variant: 'ded-plashka', title: 'Дед: плашка „У каждого есть дед, которого невозможно впечатлить"',
    text: 'Основа DfKTYs8OMed. Монтаж не трогаем, меняем только плашку в начале.' },
  { variant: 'semya-celye-frazy', title: 'Вся семья: целые фразы, призыв после денег',
    text: 'Пересборка из Dfcqv_OuC4N: каждый договаривает фразу на своём лице, призыв после денег.' },
  { variant: 'babushka-v5', title: 'Бабушка v5: перезалив',
    text: 'Перезалив DfAegdQOoxt.', copies: ['сабы без зеркала', 'другие сабы', 'зеркало + фильтр'] },
];

// title, first slide, caption keywords (all must appear)
const CAROUSELS = [
  ['Зачем платить тебе', 'зачем платить тебе, если есть ИИ?', ['зачем платить']],
  ['Основатель должен быть блогером', 'основатель должен быть блогером, это база', ['основатель', 'блогер']],
  ['Низкие просмотры, идите в жопу', 'низкие просмотры в рилс, идите в жопу', ['низкие просмотры']],
  ['Смелость выкладывать это мышца', 'смелость выкладывать контент это мышца, качай её каждый день', ['смелость', 'мышца']],
  ['Время успешного успеха закончилось', 'время успешного успеха закончилось. а что дальше?', ['успешного успеха']],
  ['Легальный способ выложить рилс', 'легальный способ выложить 1 рилс 100 раз', ['легальный способ']],
  ['Маленький блог, который кормит', 'маленький блог, который стабильно кормит, стал новым неприличным успехом', ['маленький блог']],
];

const REELS = [
  ['rils-01', 'Одна запись: 146 и 63 325', ['146', '63']],
  ['rils-02', 'Залил один рилс 20 раз', ['20 раз']],
  ['rils-03', 'Все говорят: заливай одно и то же', ['все говорят']],
  ['rils-04', 'Кто делает ролики директору пастилы', ['пастил']],
  ['rils-05', 'Просто публикуйте все подряд', ['публикуйте']],
  ['rils-06', 'Золотая лихорадка вернулась', ['лихорадка']],
  ['rils-07', 'Если рилсы набирают 200-300', ['200-300']],
];

const RULES = [
  ['Новое начало при перезаливе не делать', '0 и 555 просмотров в двух заливках, 24-26.10'],
  ['Рамку на фоне не делать', '5 из 5 заливок ниже обычных копий, 28-29.10'],
  ['Работает уникализация: новые сабы без зеркала, зеркало + фильтр, вырез куска', 'v3 44 тыс., De9iQf7uP-i 19 тыс., v5 70 тыс.'],
  ['Призыв с кодовым словом голосом не резать', 'без него 0-5 комментариев и 1-4 подписки, 21.10'],
  ['Призыв после денег даёт больше подписок, до денег больше охвата', '7,8 против 4,8 подписки на 1000, 27.10'],
  ['Судить правку по группе копий, не по одной заливке', 'та же открывашка дала 141 и 3,3 тыс.; v3 22,8 тыс. против v4 2,3 тыс.'],
  ['В одной правке менять одну вещь', 'решение Саши 08.11'],
];

const db = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await db.connect();

for (const b of BRIEFS) {
  await db.query(
    `INSERT INTO studio_briefs (id, title, html, sent_at, tg_ref) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, html = EXCLUDED.html, sent_at = EXCLUDED.sent_at, tg_ref = EXCLUDED.tg_ref`,
    [b.id, b.title, fs.readFileSync(b.file, 'utf8'), b.sentAt, b.tgRef],
  );
}

// Posts the sync created on its own: candidates for planned items that already came out.
const published = (await db.query(`SELECT id, kind, title FROM studio_items WHERE author = 'api'`)).rows;
const linked = [];

async function upsertItem({ id, kind, title, variant = null, copyNo = null, planDate = null, briefId, briefText, keywords }) {
  if ((await db.query('SELECT 1 FROM studio_items WHERE id = $1', [id])).rowCount) return 0;
  const hit = keywords && published.find((p) => p.kind === kind && keywords.every((k) => p.title.toLowerCase().includes(k.toLowerCase())));
  await db.query(
    `INSERT INTO studio_items (id, kind, title, variant, copy_no, stage, plan_date, brief_id, brief_text, author, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'edit', $6, $7, $8, 'sasha', CURRENT_TIMESTAMP)`,
    [id, kind, title, variant, copyNo, planDate, briefId, briefText],
  );
  if (hit) {
    // Take over the auto-created post: its link, date and numbers move to the planned item.
    const p = (await db.query('DELETE FROM studio_items WHERE id = $1 RETURNING *', [hit.id])).rows[0];
    await db.query(
      `UPDATE studio_items SET stage = 'published', shortcode = $2, media_id = $3, permalink = $4, published_at = $5, plan_date = $6 WHERE id = $1`,
      [id, p.shortcode, p.media_id, p.permalink, p.published_at, p.plan_date],
    );
    published.splice(published.indexOf(hit), 1);
    linked.push(`${title} → ${p.shortcode}`);
  }
  return 1;
}

let items = 0;
for (const v of FAMILY) {
  for (let n = 1; n <= 3; n++) {
    const copy = v.copies?.[n - 1];
    items += await upsertItem({
      id: `seed-${v.variant}-${n}`, kind: 'reel', title: v.title, variant: v.variant, copyNo: n,
      briefId: 'rodnye-2026-11-08', briefText: copy ? `${v.text} Копия ${n}: ${copy}.` : v.text,
    });
  }
}
// Family reels seeded before briefs existed: point them at the shared brief, drop the per-item copy.
await db.query(`UPDATE studio_items SET brief_id = 'rodnye-2026-11-08', brief_html = NULL WHERE id LIKE 'seed-%' AND brief_html IS NOT NULL`);

for (const [i, [title, slide, keywords]] of CAROUSELS.entries()) {
  const day = `2026-11-${String(9 + i).padStart(2, '0')}`;
  items += await upsertItem({
    id: `seed-karusel-2026-11-${i + 1}`, kind: 'carousel', title, planDate: day, briefId: 'karuseli-2026-11-08',
    briefText: `Карусель ${i + 1} из брифа 8–15 ноября. Слайд 1: «${slide}».`, keywords,
  });
}

for (const [variant, title, keywords] of REELS) {
  for (let n = 1; n <= 4; n++) {
    items += await upsertItem({
      id: `seed-${variant}-${n}`, kind: 'reel', title, variant, copyNo: n, briefId: 'rilsy-2026-11-06',
      briefText: `Рилс ${variant.slice(-1)} из ТЗ 06.11, версия ${n} из 4: уникализирует Даня.`, keywords: n === 1 ? keywords : null,
    });
  }
}

let rules = 0;
for (const [i, [text, evidence]] of RULES.entries()) {
  const r = await db.query(
    `INSERT INTO studio_rules (id, kind, text, evidence, "order", updated_at)
     VALUES ($1, 'reel', $2, $3, $4, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING`,
    [`seed-rule-${i + 1}`, text, evidence, i + 1],
  );
  rules += r.rowCount;
}

const total = (await db.query(`SELECT (SELECT count(*) FROM studio_items) AS items, (SELECT count(*) FROM studio_briefs) AS briefs,
  (SELECT count(*) FROM studio_items WHERE brief_html IS NOT NULL) AS legacy_html, (SELECT count(*) FROM studio_rules) AS rules`)).rows[0];
console.log(`добавлено: карточек ${items}, правил ${rules}`);
console.log(linked.length ? `привязаны к вышедшим постам: ${linked.join('; ')}` : 'вышедших среди плановых нет');
console.log('всего:', total);
await db.end();
