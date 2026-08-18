'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';

// Раздел «Карта» — маршрутная карта клиента менторства: где он стоит, куда
// идёт и что делает на этой неделе. Доступ строго по Telegram id, содержимое
// приезжает уже отфильтрованным (/api/cabinet/roadmap): внутренние диагнозы
// и задачи Саши в клиентский бандл не попадают.

interface Metric { key: string; label: string; startValue: string; currentValue: string; unit: string }
interface Step { position: number; title: string; status: string; evidence: string }
interface Task { id: string; title: string; why: string; owner: string; status: string; dueOn: string }
interface Note { kind: string; body: string; happenedOn: string }

interface Card {
  clientName: string;
  intro: string;
  goal: string;
  periodGoal: string;
  currentStep: number | null;
  metrics: Metric[];
  steps: Step[];
  tasks: Task[];
  notes: Note[];
}

const BOT_URL = 'https://t.me/testtoyzbot';

const STEP_MARK: Record<string, string> = { done: '✓', partial: '◐', blocked: '!', todo: '' };
const STEP_NOTE: Record<string, string> = {
  done: 'пройдено', partial: 'наполовину', blocked: 'здесь стоим', todo: 'впереди',
};

function TelegramLoginButton() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.childElementCount > 0) return;
    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', 'testtoyzbot');
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-radius', '10');
    s.setAttribute('data-auth-url', 'https://world.thesashatoyz.com/api/cabinet/auth-telegram');
    el.appendChild(s);
  }, []);
  return <div ref={ref} className="km-tg-login" />;
}

function KartaInner() {
  const [state, setState] = useState<'load' | 'guest' | 'empty' | 'ok'>('load');
  const [card, setCard] = useState<Card | null>(null);
  const [tgId, setTgId] = useState<number | null>(null);
  // Задачи, по которым сейчас летит отметка — чтобы не жать дважды.
  const [pending, setPending] = useState<string[]>([]);

  useEffect(() => {
    let stop = false;
    (async () => {
      // SDK подключён с defer — ждём его, иначе потеряли бы опознание по initData.
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const id = tg?.initDataUnsafe?.user?.id ?? null;
      setTgId(id);
      try {
        const qs = id ? `?telegramId=${id}` : '';
        const res = await fetch(`/api/cabinet/roadmap${qs}`);
        const data = await res.json();
        if (stop) return;
        if (!data.identified) setState('guest');
        else if (!data.hasRoadmap) setState('empty');
        else { setCard(data.card); setState('ok'); }
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  // Отметка «сделал». Локально переключаем сразу, сервер догоняет: карта
  // должна отзываться мгновенно, иначе галочку жмут второй раз.
  async function toggleTask(task: Task) {
    if (pending.includes(task.id)) return;
    const next = task.status === 'done' ? 'todo' : 'done';
    setPending((p) => [...p, task.id]);
    setCard((c) => c && {
      ...c,
      tasks: c.tasks.map((t) => (t.id === task.id ? { ...t, status: next } : t)),
    });
    try {
      const res = await fetch('/api/cabinet/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, status: next, telegramId: tgId }),
      });
      if (!res.ok) throw new Error('not saved');
    } catch {
      // Не сохранилось — возвращаем как было, чтобы карта не врала.
      setCard((c) => c && {
        ...c,
        tasks: c.tasks.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      });
    }
    setPending((p) => p.filter((id) => id !== task.id));
  }

  const myTasks = card?.tasks.filter((t) => t.owner === 'client' && t.status !== 'dropped') ?? [];
  const sashaTasks = card?.tasks.filter((t) => t.owner === 'sasha' && t.status !== 'dropped') ?? [];
  const doneCount = myTasks.filter((t) => t.status === 'done').length;

  return (
    <main className="km-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Неблокирующая загрузка шрифтов: недоступный fonts.googleapis.com не должен
          оставлять экран белым (см. кабинет /dostup). */}
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />
      <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap" rel="stylesheet" />
      </noscript>

      <header className="km-top">
        <a className="km-back" href="/dostup">‹ Кабинет</a>
        <div className="km-brand">Карта</div>
        <div className="km-sub">Где ты сейчас, куда идём и что делаем на этой неделе</div>
      </header>

      {state === 'load' && (
        <div className="km-state"><div className="km-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="km-card km-login">
          <div className="km-login-title">Вход в раздел</div>
          <div className="km-login-sub">
            Карта привязана к твоему Telegram. Войди — и здесь откроется твоя.
          </div>
          <TelegramLoginButton />
          <a className="km-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">
            Или открыть в боте →
          </a>
        </div>
      )}

      {state === 'empty' && (
        <div className="km-card">
          <p className="km-empty">
            Карта соберётся после первого созвона: разложим, где ты сейчас и что делаем дальше.
            Как будет готова — она появится здесь.
          </p>
        </div>
      )}

      {state === 'ok' && card && (
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
                      className="km-check"
                      onClick={() => toggleTask(t)}
                      aria-label={t.status === 'done' ? 'Снять отметку' : 'Отметить сделанным'}
                      aria-pressed={t.status === 'done'}
                    >
                      {t.status === 'done' ? '✓' : ''}
                    </button>
                    <span className="km-task-body">
                      <span className="km-task-title">{t.title}</span>
                      {t.why && <span className="km-task-why">{t.why}</span>}
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
      )}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
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
      `}</style>
    </main>
  );
}

export default function KartaPage() {
  return <Suspense fallback={null}><KartaInner /></Suspense>;
}
