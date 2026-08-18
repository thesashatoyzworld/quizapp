// Заливает маршрутную карту клиента из GSD-BRAND в базу админки.
//
// Источник: GSD-BRAND/clients/<slug>/roadmap.json — там карта собирается руками
// вместе с досье. База это рабочая копия: после заливки правки идут в
// /admin/roadmaps, а json остаётся исходником на случай пересборки.
//
// Повторный запуск не плодит дубли: карта ищется по slug, метрики и ступени
// сверяются по ключу и позиции, задачи и заметки по тексту.
//
// clientIntro из json едет в roadmaps.client_intro — вступительная строка над
// картой в кабинете. Замок client_visible отсюда не трогаем: решение показать
// карту человеку принимается кнопкой в админке, а не заливкой файла.
//
// Запуск: node scripts/roadmap-import.mjs azamat-gimaev
//         GSD_BRAND_PATH=... node scripts/roadmap-import.mjs azamat-gimaev
import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/roadmap-import.mjs <client-slug>');
  process.exit(1);
}

const gsd = process.env.GSD_BRAND_PATH
  || path.resolve(process.cwd(), '../../GSD-BRAND');
const file = path.join(gsd, 'clients', slug, 'roadmap.json');

if (!fs.existsSync(file)) {
  console.error(`Нет файла карты: ${file}`);
  process.exit(1);
}

const card = JSON.parse(fs.readFileSync(file, 'utf8'));
const db = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await db.connect();

const date = (v) => (v ? new Date(v) : null);

// ── карта ──────────────────────────────────────
const existing = await db.query('SELECT id FROM roadmaps WHERE slug = $1', [card.slug]);
let roadmapId = existing.rows[0]?.id;

if (roadmapId) {
  await db.query(
    `UPDATE roadmaps SET client_name=$2, telegram_id=$3, username=$4, tier=$5,
       paid_amount=$6, returned=$7, started_at=$8, access_until=$9,
       goal=$10, period_goal=$11, client_intro=COALESCE($12, client_intro), updated_at=now()
     WHERE id=$1`,
    [roadmapId, card.clientName, card.telegramId || null, card.username || null, card.tier || null,
     card.paidAmount ?? null, card.returned ?? 0, date(card.startedAt), date(card.accessUntil),
     card.goal || null, card.periodGoal || null, card.clientIntro || null]
  );
} else {
  roadmapId = randomUUID();
  await db.query(
    `INSERT INTO roadmaps (id, slug, client_name, telegram_id, username, tier,
       paid_amount, returned, started_at, access_until, goal, period_goal, client_intro, last_touch_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())`,
    [roadmapId, card.slug, card.clientName, card.telegramId || null, card.username || null,
     card.tier || null, card.paidAmount ?? null, card.returned ?? 0, date(card.startedAt),
     date(card.accessUntil), card.goal || null, card.periodGoal || null, card.clientIntro || null]
  );
}

// ── метрики: ключ уникален в пределах карты ────
for (const [i, m] of (card.metrics || []).entries()) {
  await db.query(
    `INSERT INTO roadmap_metrics (id, roadmap_id, key, label, start_value, current_value, unit, position)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (roadmap_id, key) DO UPDATE SET
       label=EXCLUDED.label, start_value=EXCLUDED.start_value,
       current_value=EXCLUDED.current_value, unit=EXCLUDED.unit,
       position=EXCLUDED.position, updated_at=now()`,
    [randomUUID(), roadmapId, m.key, m.label, m.startValue ?? null, m.currentValue ?? null, m.unit || null, i]
  );
}

// ── ступени: сверяем по позиции ────────────────
for (const s of card.steps || []) {
  const hit = await db.query(
    'SELECT id FROM roadmap_steps WHERE roadmap_id=$1 AND position=$2',
    [roadmapId, s.position]
  );
  if (hit.rows[0]) {
    await db.query(
      'UPDATE roadmap_steps SET title=$2, status=$3, evidence=$4, updated_at=now() WHERE id=$1',
      [hit.rows[0].id, s.title, s.status, s.evidence || null]
    );
  } else {
    await db.query(
      'INSERT INTO roadmap_steps (id, roadmap_id, position, title, status, evidence) VALUES ($1,$2,$3,$4,$5,$6)',
      [randomUUID(), roadmapId, s.position, s.title, s.status, s.evidence || null]
    );
  }
}

// ── задачи и заметки: сверяем по тексту ────────
let newTasks = 0;
let closedTasks = 0;
for (const [i, t] of (card.tasks || []).entries()) {
  const hit = await db.query(
    'SELECT id FROM roadmap_tasks WHERE roadmap_id=$1 AND title=$2',
    [roadmapId, t.title]
  );
  if (hit.rows[0]) {
    // Статус живёт в админке и в кабинете клиента, поэтому json может только
    // закрыть задачу (done/dropped), но не открыть заново уже закрытую —
    // иначе отметка человека потерялась бы при следующем импорте.
    const closes = t.status === 'done' || t.status === 'dropped';
    await db.query(
      `UPDATE roadmap_tasks SET why=$2, owner=$3, due_on=$4, position=$5,
         status = CASE WHEN $6::boolean AND status = 'todo' THEN $7 ELSE status END,
         done_at = CASE WHEN $6::boolean AND status = 'todo' AND $7 = 'done' THEN now() ELSE done_at END,
         updated_at = now()
       WHERE id=$1`,
      [hit.rows[0].id, t.why || null, t.owner || 'client', t.dueOn || null, i, closes, t.status || 'todo']
    );
    if (closes) closedTasks++;
  } else {
    await db.query(
      `INSERT INTO roadmap_tasks (id, roadmap_id, position, title, why, owner, status, due_on)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), roadmapId, i, t.title, t.why || null, t.owner || 'client', t.status || 'todo', t.dueOn || null]
    );
    newTasks++;
  }
}

let newNotes = 0;
for (const n of card.notes || []) {
  const hit = await db.query(
    'SELECT id FROM roadmap_notes WHERE roadmap_id=$1 AND body=$2',
    [roadmapId, n.body]
  );
  if (hit.rows[0]) continue;
  await db.query(
    `INSERT INTO roadmap_notes (id, roadmap_id, kind, body, source, happened_on)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [randomUUID(), roadmapId, n.kind || 'insight', n.body, n.source || null, n.happenedOn || null]
  );
  newNotes++;
}

const counts = await db.query(
  `SELECT
     (SELECT count(*) FROM roadmap_metrics WHERE roadmap_id=$1) AS metrics,
     (SELECT count(*) FROM roadmap_steps   WHERE roadmap_id=$1) AS steps,
     (SELECT count(*) FROM roadmap_tasks   WHERE roadmap_id=$1) AS tasks,
     (SELECT count(*) FROM roadmap_notes   WHERE roadmap_id=$1) AS notes`,
  [roadmapId]
);

console.log(`карта ${card.clientName} (${card.slug}) залита`);
console.table(counts.rows);
console.log(`новых задач: ${newTasks}, закрыто по json: ${closedTasks}, новых заметок: ${newNotes}`);
console.log(`смотреть: /admin/roadmaps/${card.slug}`);

await db.end();
