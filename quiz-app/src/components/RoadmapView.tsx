'use client';

// Как маршрутная карта выглядит для клиента. Один и тот же рендер работает
// в кабинете (/karta) и в предпросмотре админки — чтобы Саша видел ровно то,
// что увидит человек, а не похожую верстку.

export interface RoadmapMetricView { key: string; label: string; startValue: string; currentValue: string; unit: string }
export interface RoadmapStepView { position: number; title: string; status: string; evidence: string }
export interface RoadmapTaskView {
  id: string; title: string; why: string; owner: string; status: string; dueOn: string;
  /** материал к задаче: воркшоп, разбор, запись созвона */
  linkUrl?: string; linkLabel?: string;
}
export interface RoadmapNoteView { kind: string; body: string; happenedOn: string }

export interface RoadmapCard {
  clientName: string;
  intro: string;
  goal: string;
  periodGoal: string;
  currentStep: number | null;
  metrics: RoadmapMetricView[];
  steps: RoadmapStepView[];
  tasks: RoadmapTaskView[];
  notes: RoadmapNoteView[];
}

const STEP_MARK: Record<string, string> = { done: '✓', partial: '◐', blocked: '!', todo: '' };
const STEP_NOTE: Record<string, string> = {
  done: 'пройдено', partial: 'наполовину', blocked: 'здесь стоим', todo: 'впереди',
};

export default function RoadmapView({
  card,
  onToggleTask,
}: {
  card: RoadmapCard;
  /** не передан → галочки не жмутся (предпросмотр) */
  onToggleTask?: (task: RoadmapTaskView) => void;
}) {
  const myTasks = card.tasks.filter((t) => t.owner === 'client' && t.status !== 'dropped');
  const sashaTasks = card.tasks.filter((t) => t.owner === 'sasha' && t.status !== 'dropped');
  const doneCount = myTasks.filter((t) => t.status === 'done').length;

  return (
    <>
      {card.intro && (
        <div className="km-card km-intro">
          <p>{card.intro}</p>
        </div>
      )}

      {card.periodGoal && (
        <section className="km-card km-goal">
          <div className="km-label">Цель периода</div>
          <p className="km-goal-text">{card.periodGoal}</p>
          {card.goal && <p className="km-goal-big">Большая цель: {card.goal}</p>}
        </section>
      )}

      {card.metrics.length > 0 && (
        <section className="km-card">
          <div className="km-label">Было · стало</div>
          <div className="km-metrics">
            {card.metrics.map((m) => (
              <div className="km-metric" key={m.key}>
                <div className="km-metric-label">{m.label}</div>
                <div className="km-metric-row">
                  <span className="km-metric-was">{m.startValue || '—'}</span>
                  <span className="km-metric-arr">→</span>
                  <span className="km-metric-now">{m.currentValue || '—'}</span>
                  {m.unit && <span className="km-metric-unit">{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {card.steps.length > 0 && (
        <section className="km-card">
          <div className="km-label">Путь</div>
          <ol className="km-steps">
            {card.steps.map((s) => {
              const here = s.position === card.currentStep;
              return (
                <li
                  className={`km-step km-step-${s.status}${here ? ' km-step-here' : ''}`}
                  key={s.position}
                >
                  <span className="km-step-dot">{STEP_MARK[s.status] || ''}</span>
                  <span className="km-step-body">
                    <span className="km-step-title">{s.title}</span>
                    {here && <span className="km-step-here-tag">ты здесь</span>}
                    <span className="km-step-note">
                      {s.evidence || STEP_NOTE[s.status] || ''}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {myTasks.length > 0 && (
        <section className="km-card">
          <div className="km-label">
            Твои шаги
            <span className="km-count">{doneCount} из {myTasks.length}</span>
          </div>
          <ul className="km-tasks">
            {myTasks.map((t) => (
              <li className={`km-task${t.status === 'done' ? ' km-task-done' : ''}`} key={t.id}>
                <button
                  className={`km-check${onToggleTask ? '' : ' km-check-static'}`}
                  onClick={() => onToggleTask?.(t)}
                  disabled={!onToggleTask}
                  aria-label={t.status === 'done' ? 'Снять отметку' : 'Отметить сделанным'}
                  aria-pressed={t.status === 'done'}
                >
                  {t.status === 'done' ? '✓' : ''}
                </button>
                <span className="km-task-body">
                  <span className="km-task-title">{t.title}</span>
                  {t.why && <span className="km-task-why">{t.why}</span>}
                  {t.linkUrl && (
                    <a className="km-task-link" href={t.linkUrl} target="_blank" rel="noopener noreferrer">
                      {t.linkLabel || 'Открыть материал'} →
                    </a>
                  )}
                  {t.dueOn && <span className="km-task-due">до {t.dueOn}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sashaTasks.length > 0 && (
        <section className="km-card">
          <div className="km-label">С меня</div>
          <ul className="km-tasks">
            {sashaTasks.map((t) => (
              <li className={`km-task km-task-sasha${t.status === 'done' ? ' km-task-done' : ''}`} key={t.id}>
                <span className="km-check km-check-static">{t.status === 'done' ? '✓' : ''}</span>
                <span className="km-task-body">
                  <span className="km-task-title">{t.title}</span>
                  {t.why && <span className="km-task-why">{t.why}</span>}
                  {t.linkUrl && (
                    <a className="km-task-link" href={t.linkUrl} target="_blank" rel="noopener noreferrer">
                      {t.linkLabel || 'Открыть материал'} →
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {card.notes.length > 0 && (
        <section className="km-card">
          <div className="km-label">Что решили</div>
          <ul className="km-notes">
            {card.notes.map((n, i) => (
              <li className="km-note" key={i}>
                <span className="km-note-body">{n.body}</span>
                {n.happenedOn && <span className="km-note-date">{n.happenedOn}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** Стили клиентского вида. Отдельной строкой, чтобы их могла подключить и админка. */
export const ROADMAP_VIEW_CSS = `
  .km-wrap {
    --km-bg: oklch(0.97 0.006 75); --km-text: oklch(0.16 0.015 55);
    --km-muted: oklch(0.46 0.012 55); --km-accent: oklch(0.60 0.19 52);
    --km-accent-soft: oklch(0.93 0.04 52); --km-surface: oklch(1 0 0);
    --km-line: oklch(0.90 0.008 75); --km-done: oklch(0.55 0.12 155);
    max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
    font-family: 'Manrope', system-ui, sans-serif; color: var(--km-text);
    background: var(--km-bg); min-height: 100svh;
  }
  .km-wrap * { box-sizing: border-box; }
  .km-top { margin-bottom: 20px; }
  .km-back {
    display: inline-block; text-decoration: none; color: var(--km-muted);
    font-size: 13px; font-weight: 600; margin-bottom: 10px;
  }
  .km-back:hover { color: var(--km-accent); }
  .km-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; }
  .km-sub { color: var(--km-muted); font-size: 13px; margin-top: 3px; line-height: 1.4; }

  .km-card {
    background: var(--km-surface); border: 1px solid var(--km-line);
    border-radius: 18px; padding: 18px; margin-bottom: 14px;
  }
  .km-label {
    display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
    font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 11.5px;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--km-muted);
    margin-bottom: 12px;
  }
  .km-count { font-size: 12px; letter-spacing: 0; text-transform: none; color: var(--km-accent); }

  .km-intro p { margin: 0; font-size: 14.5px; line-height: 1.5; }
  .km-goal { border-color: var(--km-accent); }
  .km-goal-text {
    margin: 0; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
    font-size: 17px; line-height: 1.3; letter-spacing: -0.015em;
  }
  .km-goal-big { margin: 10px 0 0; font-size: 13px; color: var(--km-muted); line-height: 1.45; }

  .km-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
  .km-metric { background: var(--km-bg); border-radius: 12px; padding: 11px 12px; }
  .km-metric-label { font-size: 12px; color: var(--km-muted); margin-bottom: 4px; }
  .km-metric-row { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
  .km-metric-was { font-size: 14px; color: var(--km-muted); text-decoration: line-through; }
  .km-metric-arr { font-size: 12px; color: var(--km-muted); }
  .km-metric-now {
    font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 19px;
    letter-spacing: -0.02em;
  }
  .km-metric-unit { font-size: 12px; color: var(--km-muted); }

  .km-steps { list-style: none; margin: 0; padding: 0; }
  .km-step { display: flex; gap: 12px; padding-bottom: 14px; position: relative; }
  .km-step:not(:last-child)::before {
    content: ''; position: absolute; left: 10px; top: 22px; bottom: 0;
    width: 2px; background: var(--km-line);
  }
  .km-step-dot {
    flex: 0 0 auto; width: 22px; height: 22px; border-radius: 50%; z-index: 1;
    border: 2px solid var(--km-line); background: var(--km-surface);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: var(--km-muted); line-height: 1;
  }
  .km-step-done .km-step-dot { background: var(--km-done); border-color: var(--km-done); color: #fff; }
  .km-step-partial .km-step-dot { border-color: var(--km-accent); color: var(--km-accent); }
  .km-step-blocked .km-step-dot { background: var(--km-accent); border-color: var(--km-accent); color: #fff; }
  .km-step-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .km-step-title { font-weight: 600; font-size: 14.5px; line-height: 1.3; }
  .km-step-done .km-step-title { color: var(--km-muted); }
  .km-step-here .km-step-title { font-weight: 700; }
  .km-step-here-tag {
    align-self: flex-start; font-size: 11px; font-weight: 700; margin-top: 3px;
    background: var(--km-accent-soft); color: var(--km-accent);
    padding: 3px 8px; border-radius: 999px;
  }
  .km-step-note { font-size: 12.5px; color: var(--km-muted); line-height: 1.4; margin-top: 2px; }

  .km-tasks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  .km-task { display: flex; gap: 11px; align-items: flex-start; }
  .km-check {
    flex: 0 0 auto; width: 24px; height: 24px; border-radius: 8px; cursor: pointer;
    border: 2px solid var(--km-line); background: var(--km-surface);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: #fff; line-height: 1;
    transition: background .12s, border-color .12s;
  }
  .km-check:hover { border-color: var(--km-accent); }
  .km-task-done .km-check { background: var(--km-done); border-color: var(--km-done); }
  .km-check-static { cursor: default; }
  .km-task-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .km-task-title { font-size: 14.5px; font-weight: 600; line-height: 1.35; }
  .km-task-done .km-task-title { color: var(--km-muted); text-decoration: line-through; }
  .km-task-why { font-size: 12.5px; color: var(--km-muted); line-height: 1.4; }
  .km-task-due { font-size: 11.5px; font-weight: 700; color: var(--km-accent); }
  .km-task-link {
    align-self: flex-start; margin-top: 3px; text-decoration: none;
    font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 12.5px;
    color: var(--km-accent); background: var(--km-accent-soft);
    padding: 5px 11px; border-radius: 999px;
  }
  .km-task-link:hover { filter: brightness(0.96); }
  .km-task-sasha .km-check { border-style: dashed; }

  .km-notes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .km-note { display: flex; flex-direction: column; gap: 2px; }
  .km-note-body { font-size: 14px; line-height: 1.45; }
  .km-note-date { font-size: 11.5px; color: var(--km-muted); }

  .km-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
  .km-login-sub { color: var(--km-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
  .km-tg-login { margin-top: 4px; min-height: 46px; }
  .km-login-alt {
    display: inline-block; margin-top: 12px; text-decoration: none;
    color: var(--km-muted); font-size: 13px; font-weight: 600;
  }
  .km-login-alt:hover { color: var(--km-accent); }
  .km-empty { color: var(--km-muted); font-size: 14px; margin: 0; line-height: 1.5; }
  .km-state { text-align: center; padding: 48px 16px; }
  .km-state p { color: var(--km-muted); margin: 0; }
  .km-spinner {
    width: 24px; height: 24px; border: 3px solid var(--km-line); border-top-color: var(--km-accent);
    border-radius: 50%; margin: 0 auto 12px; animation: km-spin .8s linear infinite; display: inline-block;
  }
  @keyframes km-spin { to { transform: rotate(360deg); } }
`;
