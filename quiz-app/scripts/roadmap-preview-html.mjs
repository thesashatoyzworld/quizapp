// Собирает предпросмотр карты глазами клиента одним HTML-файлом.
//
//   node scripts/roadmap-preview-html.mjs <slug> <out.html> ["строка про тариф и доступ"]
//
// Стили берём из первой такой страницы (карта Ани), тело рисуем по данным из
// базы: цель периода, метрики кроме возврата денег, путь и задачи клиента,
// разложенные по неделям. Внутренние заметки сюда не идут — их Саша смотрит
// в админке. Файл ничего не открывает клиенту, только показывает.
import fs from 'node:fs';
import pg from 'pg';

const [slug, out, note] = process.argv.slice(2);
if (!slug || !out) { console.error('нужны slug и путь к файлу'); process.exit(1); }

const TEMPLATE = 'C:/Users/OTVAJE/Documents/ClaudeCode/Projects/GSD-BRAND/clients/anna-samoilenko/preview-client-view.html';

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.trim().match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const c = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const { rows: [r] } = await c.query('select * from roadmaps where slug = $1', [slug]);
if (!r) { console.error(`карты ${slug} нет`); process.exit(1); }
const { rows: metrics } = await c.query(`select * from roadmap_metrics where roadmap_id = $1 and key <> 'revenue' order by position`, [r.id]);
const { rows: steps } = await c.query('select * from roadmap_steps where roadmap_id = $1 order by position', [r.id]);
const { rows: tasks } = await c.query(`select * from roadmap_tasks where roadmap_id = $1 and owner = 'client' order by position`, [r.id]);
// Задачи Саши в клиентский вид не идут: страница /preview?mode=defaults
// показывает только owner = 'client'. Держим то же самое.
await c.end();

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const M = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const ru = (d) => d ? `${d.getDate()} ${M[d.getMonth()]}` : '';

// Задачи с датой ложатся в календарные недели, остальные — в хвост «фоном».
const weeks = new Map();
const always = [];
for (const t of tasks) {
  if (!t.due_on) { always.push(t); continue; }
  const d = new Date(t.due_on);
  const shift = (d.getDay() + 6) % 7;          // понедельник — начало недели
  const end = new Date(d); end.setDate(d.getDate() - shift + 6);
  const key = end.toISOString().slice(0, 10);
  if (!weeks.has(key)) weeks.set(key, { end, items: [] });
  weeks.get(key).items.push(t);
}
const ordered = [...weeks.entries()].sort(([a], [b]) => a < b ? -1 : 1);

const DOT = { done: ['done', '✓'], partial: ['partial', '~'], blocked: ['here', '●'], todo: ['todo', ''] };
const here = steps.find((s) => s.status === 'blocked') || steps.find((s) => s.status !== 'done');

const stepHtml = steps.map((s) => {
  const [cls, ch] = DOT[s.status] || DOT.todo;
  const isHere = here && s.id === here.id;
  return `      <div class="step${isHere ? ' here' : ''}">
        <div class="dot ${isHere ? 'here' : cls}">${isHere ? '●' : ch}</div>
        <div>
          <div class="st-title">${esc(s.title)}</div>
          ${s.evidence ? `<div class="st-evidence">${esc(s.evidence)}</div>` : ''}
          ${isHere ? '<div class="here-flag">ТЫ ЗДЕСЬ</div>' : ''}
        </div>
      </div>`;
}).join('\n');

const taskHtml = (t) => `      <div class="task">
        <div class="box">${t.status === 'done' ? '✓' : ''}</div>
        <div>
          <div class="t-title">${esc(t.title)}</div>
          ${t.why ? `<div class="t-why">${esc(t.why)}</div>` : ''}
          ${t.link_label ? `<span class="t-link">🔗 ${esc(t.link_label)}</span>` : ''}
          ${t.owner === 'sasha' ? '<span class="t-owner">👤 делает Саша</span>' : ''}
        </div>
      </div>`;

const blocks = ordered.map(([, w], i) => `    <div class="week-title">Неделя ${i + 1} <span>· до ${ru(w.end)}</span></div>
    <div class="tasks">
${w.items.map(taskHtml).join('\n')}
    </div>`).join('\n\n');

const tail = always.length ? `\n\n    <div class="week-title">Фоном <span>· без срока, каждый день</span></div>
    <div class="tasks">
${always.map(taskHtml).join('\n')}
    </div>` : '';

const done = tasks.filter((t) => t.status === 'done').length;
const css = fs.readFileSync(TEMPLATE, 'utf8').split('<div class="context">')[0].replace(/<title>[^<]*<\/title>/, `<title>Карта · ${esc(r.client_name.split(' ')[0])}</title>`);

const html = `<meta charset="utf-8">
${css}<div class="context">
  <div class="eyebrow">Предпросмотр · глазами клиента</div>
  <div class="lede">
    Ровно то, что ${esc(r.client_name.split(' ')[0])} увидит в кабинете, если карту открыть.
    <b>Сейчас карта ${r.client_visible ? 'открыта' : 'закрыта'}</b> — этот файл её не открывает, только показывает.${note ? ` ${esc(note)}` : ''}
  </div>
</div>

<div class="frame">
  <div class="card">
    <h1>Карта</h1>
    <p class="subtitle">Где ты сейчас, куда идём и что делаем на этой неделе</p>

    <div class="lead-box">${esc(r.client_intro || '')}</div>

    <div class="label">Цель периода</div>
    <div class="goal-box">${esc(r.period_goal || r.goal || '')}</div>

    <div class="label">Было → стало</div>
    <div class="metrics">
${metrics.map((m) => `      <div class="metric">
        <div class="m-label">${esc(m.label)}</div>
        <div class="m-val"${String(m.current_value).length > 8 ? ' style="font-size:14px;"' : ''}>${esc(m.current_value)}${m.unit ? ' ' + esc(m.unit) : ''}</div>
        <div class="m-was">было ${esc(m.start_value)}</div>
      </div>`).join('\n')}
    </div>

    <div class="label">Путь</div>
    <div class="steps">
${stepHtml}
    </div>

    <div class="weeks-head">
      <div class="label" style="margin-bottom:0;">Твои шаги</div>
      <div class="weeks-count">${done} из ${tasks.length}</div>
    </div>

${blocks}${tail}

    <div class="foot">Ссылки в живой карте ведут прямо в материал в кабинете — здесь они не кликабельны, это только предпросмотр.</div>
  </div>
</div>
`;

fs.writeFileSync(out, html);
console.log(`${out}: ступеней ${steps.length}, метрик ${metrics.length}, задач ${tasks.length}, недель ${ordered.length}`);
