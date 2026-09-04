// Подтягивает карту в базе к состоянию JSON-файла из GSD-BRAND.
//
//   node scripts/roadmap-sync-json.mjs <путь к roadmap.json> [--apply]
//
// Метрики сверяются по key, ступени по position, задачи по key, заметки по
// тексту (новые добавляются, старые не трогаем). Без --apply только показывает
// разницу. Видимость и client_visible не меняются: карту открывает человек.
import fs from 'node:fs';
import pg from 'pg';

const [file, flag] = process.argv.slice(2);
if (!file) { console.error('нужен путь к roadmap.json'); process.exit(1); }
const apply = flag === '--apply';

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.trim().match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const { rows: [map] } = await c.query('select id, slug, client_visible from roadmaps where slug = $1', [d.slug]);
if (!map) { console.error(`карты ${d.slug} в базе нет`); process.exit(1); }
console.log(`карта ${map.slug}, открыта клиенту: ${map.client_visible}`);

const changes = [];
const run = async (sql, args, label) => {
  changes.push(label);
  if (apply) await c.query(sql, args);
};

for (const m of d.metrics || []) {
  const { rows: [cur] } = await c.query('select current_value from roadmap_metrics where roadmap_id = $1 and key = $2', [map.id, m.key]);
  if (!cur) { console.log(`  метрики ${m.key} в базе нет, пропускаю`); continue; }
  if (cur.current_value !== m.currentValue)
    await run('update roadmap_metrics set current_value = $1, updated_at = now() where roadmap_id = $2 and key = $3',
      [m.currentValue, map.id, m.key], `метрика ${m.key}: ${cur.current_value} → ${m.currentValue}`);
}

for (const s of d.steps || []) {
  const { rows: [cur] } = await c.query('select status, evidence from roadmap_steps where roadmap_id = $1 and position = $2', [map.id, s.position]);
  if (!cur) continue;
  if (cur.status !== s.status || cur.evidence !== s.evidence)
    await run('update roadmap_steps set status = $1, evidence = $2, updated_at = now() where roadmap_id = $3 and position = $4',
      [s.status, s.evidence, map.id, s.position], `ступень ${s.position} «${s.title}»: ${cur.status} → ${s.status}`);
}

const { rows: [{ max: lastPos }] } = await c.query('select coalesce(max(position), -1) as max from roadmap_tasks where roadmap_id = $1', [map.id]);
let nextPos = Number(lastPos) + 1;

for (const t of d.tasks || []) {
  const { rows: [cur] } = await c.query('select status, title from roadmap_tasks where roadmap_id = $1 and key = $2', [map.id, t.key]);
  if (!cur) {
    // Новых задач в базе нет: карта пополняется после созвона. Видимость даём
    // ту же, что у остальных задач клиента на этой карте.
    const visibility = map.client_visible && t.owner === 'client' ? 'shared' : 'internal';
    const pos = nextPos++;
    await run(
      `insert into roadmap_tasks (id, roadmap_id, position, title, why, owner, status, due_on, key, link_url, link_label, visibility)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [crypto.randomUUID(), map.id, pos, t.title, t.why || null, t.owner || 'client', t.status || 'todo',
       t.dueOn || null, t.key, t.linkUrl || null, t.linkLabel || null, visibility],
      `новая задача «${t.title.slice(0, 45)}»`
    );
    continue;
  }
  if (cur.status !== t.status)
    await run('update roadmap_tasks set status = $1, done_at = case when $1 = \'done\' then coalesce(done_at, now()) else null end, updated_at = now() where roadmap_id = $2 and key = $3',
      [t.status, map.id, t.key], `задача «${cur.title.slice(0, 40)}»: ${cur.status} → ${t.status}`);
}

for (const n of d.notes || []) {
  const { rows } = await c.query('select id from roadmap_notes where roadmap_id = $1 and body = $2', [map.id, n.body]);
  if (rows.length) continue;
  await run('insert into roadmap_notes (id, roadmap_id, kind, body, source, happened_on, visibility) values ($1, $2, $3, $4, $5, $6, $7)',
    [crypto.randomUUID(), map.id, n.kind, n.body, n.source || null, n.happenedOn || null, 'internal'], `заметка (${n.kind}): ${n.body.slice(0, 50)}…`);
}

if (apply) await c.query('update roadmaps set last_touch_at = now(), updated_at = now() where id = $1', [map.id]);
await c.end();

console.log(apply ? `\nприменено, изменений: ${changes.length}` : `\nразница (запусти с --apply), изменений: ${changes.length}`);
for (const x of changes) console.log(' -', x);
