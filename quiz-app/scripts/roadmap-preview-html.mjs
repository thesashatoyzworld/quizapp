// Статичный клон маршрутной карты клиентским видом: то, что человек увидит
// в кабинете, если карту открыть. Нужен, чтобы показать карту Саше одним
// файлом, а не скриншотом админки (см. feedback_roadmap-review-protocol).
//
// Запуск из TheSasha/quiz-app (там лежат .env.local и pg):
//   node ../../GSD-BRAND/scripts/roadmap-preview-html.mjs <slug> <out.html>
import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import fs from 'node:fs';

const slug = process.argv[2];
const out = process.argv[3];
if (!slug || !out) {
  console.error('node roadmap-preview-html.mjs <slug> <out.html>');
  process.exit(1);
}

const c = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const map = (await c.query(`SELECT * FROM roadmaps WHERE slug=$1`, [slug])).rows[0];
if (!map) throw new Error(`карта ${slug} не найдена`);
const metrics = (await c.query(`SELECT * FROM roadmap_metrics WHERE roadmap_id=$1 ORDER BY position`, [map.id])).rows;
const steps = (await c.query(`SELECT * FROM roadmap_steps WHERE roadmap_id=$1 ORDER BY position`, [map.id])).rows;
const tasks = (await c.query(`SELECT * FROM roadmap_tasks WHERE roadmap_id=$1 ORDER BY position`, [map.id])).rows;
await c.end();

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const human = (d) => `${new Date(d).getUTCDate()} ${MONTHS[new Date(d).getUTCMonth()]}`;
const short = (d) => `${String(new Date(d).getUTCDate()).padStart(2,'0')}.${String(new Date(d).getUTCMonth()+1).padStart(2,'0')}.${String(new Date(d).getUTCFullYear()).slice(2)}`;

// Недели берём из дедлайнов задач: сколько разных дат, столько недель.
const weekDates = [...new Set(tasks.map((t) => (t.due_on ? new Date(t.due_on).toISOString().slice(0, 10) : 'нет')))].sort();

const DOT = { done: '<div class="dot done">✓</div>', partial: '<div class="dot partial">~</div>', blocked: '<div class="dot here">●</div>', todo: '<div class="dot todo"></div>' };

const stepsHtml = steps
  .map((s) => `      <div class="step${s.status === 'blocked' ? ' here' : ''}">
        ${DOT[s.status] || DOT.todo}
        <div>
          <div class="st-title">${esc(s.title)}</div>
          <div class="st-evidence">${esc(s.evidence)}</div>
          ${s.status === 'blocked' ? '<div class="here-flag">ТЫ ЗДЕСЬ</div>' : ''}
        </div>
      </div>`)
  .join('\n');

const metricsHtml = metrics
  .map((m) => `      <div class="metric">
        <div class="m-label">${esc(m.label)}</div>
        <div class="m-val">${esc(m.current_value ?? m.start_value)}</div>
        <div class="m-was">было ${esc(m.start_value)}</div>
      </div>`)
  .join('\n');

const weeksHtml = weekDates
  .map((date, i) => {
    const own = tasks.filter((t) => (t.due_on ? new Date(t.due_on).toISOString().slice(0, 10) : 'нет') === date);
    const body = own
      .map((t) => `      <div class="task">
        <div class="box"></div>
        <div>
          <div class="t-title">${esc(t.title)}</div>
          <div class="t-why">${esc(t.why)}</div>
          ${t.link_label ? `<span class="t-link">🔗 ${esc(t.link_label)}</span>` : ''}
          ${t.owner === 'sasha' ? '<span class="t-owner">👤 делает Саша</span>' : ''}
        </div>
      </div>`)
      .join('\n');
    return `    <div class="week-title">Неделя ${i + 1} <span>· до ${human(date)}</span></div>
    <div class="tasks">
${body}
    </div>`;
  })
  .join('\n\n');

const html = `<title>Карта ${esc(map.client_name)}</title>
<style>
  :root {
    --ground: #10141a; --ground-2: #191f27; --paper: #efe7d3; --paper-2: #e6dcc3;
    --ink: #1c1912; --ink-soft: #4a4638; --muted-on-paper: #8a8168; --muted-on-ground: #7c8898;
    --accent: #21a690; --accent-soft: #cfe9e2; --flag: #d85a3e; --rule: #d9cfae; --rule-ground: #2a323d;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ground: #0a0d11; --ground-2: #12161d; } }
  :root[data-theme="dark"] { --ground: #0a0d11; --ground-2: #12161d; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--ground); color: var(--muted-on-ground); font-family: "IBM Plex Sans", -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
  .context { max-width: 640px; margin: 0 auto; padding: 28px 20px 18px; }
  .context .eyebrow { font-family: "Manrope", sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent); }
  .context .lede { margin-top: 6px; font-size: 14px; line-height: 1.5; }
  .context .lede b { color: #d8dee6; font-weight: 600; }
  .frame { max-width: 640px; margin: 0 auto 64px; padding: 0 20px; }
  .card { background: var(--paper); color: var(--ink); border-radius: 22px; padding: 30px 26px 36px; box-shadow: 0 30px 60px -30px rgba(0,0,0,0.6); }
  .card h1 { font-family: "Manrope", sans-serif; font-weight: 800; font-size: 32px; letter-spacing: -0.01em; margin: 0; text-wrap: balance; }
  .card .subtitle { margin: 6px 0 0; font-size: 15px; color: var(--ink-soft); }
  .lead-box { margin-top: 22px; padding: 18px; background: #fff9ec; border: 1px solid var(--rule); border-radius: 14px; font-size: 15px; line-height: 1.6; }
  .label { font-family: "Manrope", sans-serif; font-weight: 700; font-size: 11.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted-on-paper); margin: 32px 0 10px; }
  .goal-box { padding: 16px 18px; background: var(--accent-soft); border-radius: 14px; font-size: 14.5px; line-height: 1.6; }
  .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .metric { padding: 12px 14px; border: 1px solid var(--rule); border-radius: 12px; }
  .metric .m-label { font-size: 12px; color: var(--muted-on-paper); line-height: 1.35; min-height: 32px; }
  .metric .m-val { margin-top: 6px; font-family: "Manrope", sans-serif; font-weight: 700; font-size: 18px; font-variant-numeric: tabular-nums; }
  .metric .m-was { margin-top: 2px; font-size: 11.5px; color: var(--muted-on-paper); }
  .steps { display: flex; flex-direction: column; gap: 10px; }
  .step { display: flex; gap: 12px; padding: 13px 14px; border: 1px solid var(--rule); border-radius: 12px; }
  .step.here { border-color: var(--flag); background: #fff3ee; }
  .dot { flex: none; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-top: 1px; }
  .dot.done { background: var(--accent); color: #fff; }
  .dot.here { background: var(--flag); color: #fff; }
  .dot.partial { background: #e3b23c; color: #fff; }
  .dot.todo { background: transparent; border: 1.5px solid var(--rule); color: transparent; }
  .step .st-title { font-size: 14.5px; font-weight: 600; line-height: 1.4; }
  .step .st-evidence { margin-top: 3px; font-size: 12.5px; color: var(--ink-soft); line-height: 1.5; }
  .here-flag { display: inline-block; margin-top: 5px; font-family: "Manrope", sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; color: var(--flag); }
  .weeks-head { display: flex; align-items: baseline; justify-content: space-between; }
  .weeks-count { font-size: 12px; color: var(--muted-on-paper); }
  .week-title { margin: 22px 0 10px; font-family: "Manrope", sans-serif; font-weight: 700; font-size: 13px; }
  .week-title span { color: var(--muted-on-paper); font-weight: 500; }
  .tasks { display: flex; flex-direction: column; gap: 9px; }
  .task { display: flex; gap: 11px; padding: 12px 13px; border: 1px solid var(--rule); border-radius: 12px; }
  .task .box { flex: none; width: 18px; height: 18px; margin-top: 2px; border: 1.5px solid #b9ad86; border-radius: 5px; }
  .task .t-title { font-size: 14px; font-weight: 600; line-height: 1.4; }
  .task .t-why { margin-top: 4px; font-size: 12.5px; color: var(--ink-soft); line-height: 1.55; }
  .task .t-link { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 600; color: var(--accent); border-bottom: 1px solid var(--accent-soft); }
  .task .t-owner { display: inline-block; margin-top: 8px; margin-left: 8px; font-size: 11px; color: var(--muted-on-paper); }
  .foot { margin-top: 30px; padding-top: 16px; border-top: 1px solid var(--rule); font-size: 12.5px; color: var(--muted-on-paper); }
</style>

<div class="context">
  <div class="eyebrow">Предпросмотр · глазами ${esc(map.client_name)}</div>
  <div class="lede">
    Ровно то, что он увидит в кабинете, если карту открыть.
    <b>Сейчас карта закрыта</b> — этот файл её не открывает, только показывает.
    ${esc(map.tier?.replace('uroven-t', 'Тариф '))} · @${esc(map.username)} · доступ ${short(map.started_at)}–${short(map.access_until)}.
  </div>
</div>

<div class="frame">
  <div class="card">
    <h1>Карта</h1>
    <p class="subtitle">Где ты сейчас, куда идём и что делаем на этой неделе</p>

    <div class="lead-box">${esc(map.client_intro)}</div>

    <div class="label">Куда идём</div>
    <div class="goal-box">${esc(map.goal)}</div>

    <div class="label">Цель месяца</div>
    <div class="goal-box">${esc(map.period_goal)}</div>

    <div class="label">Было → стало</div>
    <div class="metrics">
${metricsHtml}
    </div>

    <div class="label">Путь</div>
    <div class="steps">
${stepsHtml}
    </div>

    <div class="weeks-head">
      <div class="label" style="margin-bottom:0;">Твои шаги</div>
      <div class="weeks-count">0 из ${tasks.length}</div>
    </div>

${weeksHtml}

    <div class="foot">Ссылки в живой карте ведут прямо в материал в кабинете — здесь они не кликабельны, это только предпросмотр.</div>
  </div>
</div>
`;

fs.writeFileSync(out, html, 'utf8');
console.log(`${out}: ${html.length} символов, ${steps.length} ступеней, ${tasks.length} задач, недель ${weekDates.length}`);
