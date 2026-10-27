'use client';

import { Fragment, Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import { trackSection } from '@/lib/cabinet-track';
import OpenInBrowser from '@/components/OpenInBrowser';
import {
  FIELD_MAX, SCRIPT_MAX, SCRIPT_MIN, sourceUrl,
  type Goal, type HistoryItem, type SavedRun, type StudentAnalysis,
} from '@/lib/optimizator/view';

// Раздел «Оптимизатор рилсов»: ученик вставляет сценарий, сервер разбирает его
// по методике Каллавея. Промпт живёт только на сервере (/api/cabinet/optimizator),
// сюда приходит готовый разбор без внутренней математики.

const BOT_URL = 'https://t.me/testtoyzbot';

const STEPS = [
  'Ищу главную мысль ролика',
  'Оцениваю тему и угол',
  'Проверяю первую фразу',
  'Смотрю доказательства и удержание',
  'Пишу три новых хука',
  'Переписываю сценарий',
  'Собираю список правок',
];
/** Typical run is 70-135 s; steps are spread over ~110 s. */
const STEP_MS = 16_000;

const READINESS: Record<string, string> = {
  ready: 'Можно снимать',
  needs_work: 'Нужны правки',
  rewrite: 'Лучше переписать',
};
const FORMAT_LEVEL: Record<string, string> = {
  facts: 'факты', explanation: 'объяснение', application: 'применение', story: 'история',
};
const HOOK_FORMAT: Record<string, string> = {
  secret: 'секрет', case: 'кейс', comparison: 'сравнение', question: 'вопрос', teaching: 'обучение',
  list: 'список', contrarian: 'против течения', personal: 'личное', problem: 'проблема', none: 'нет формата',
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
  return <div ref={ref} className="op-tg-login" />;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Telegram webview sometimes has no Clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* noop */ }
    document.body.removeChild(ta);
  }
}

function CopyButton({ text, label, primary }: { text: string; label: string; primary?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={primary ? 'op-copy op-copy-primary' : 'op-copy'}
      onClick={async () => { await copyText(text); setDone(true); setTimeout(() => setDone(false), 1800); }}
    >
      {done ? '✓ Скопировано' : label}
    </button>
  );
}

function Source({ source }: { source: string | null }) {
  const url = sourceUrl(source);
  if (!url) return null;
  return (
    <a className="op-src" href={url} target="_blank" rel="noopener noreferrer">▶ ролик Каллавея</a>
  );
}

/** Placeholders like [вставь цифру: ...] are highlighted: the student must fill them. */
function WithPlaceholders({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]*\])/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith('[') && p.endsWith(']')
        ? <mark key={i} className="op-ph">{p}</mark>
        : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

function scoreTone(score: number, max: number) {
  const r = score / max;
  return r >= 0.75 ? 'op-good' : r >= 0.5 ? 'op-mid' : 'op-low';
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function Result({ run, onNew }: { run: SavedRun; onNew: () => void }) {
  const a: StudentAnalysis = run.result;
  if (!a.input_ok) {
    return (
      <section className="op-card op-result">
        <div className="op-eyebrow">Разбор не получился</div>
        <p className="op-verdict">{a.verdict}</p>
        <button type="button" className="op-ghost" onClick={onNew}>Вставить другой сценарий</button>
      </section>
    );
  }
  const g = a.hook_gate;
  const checks: [string, boolean][] = [
    ['про зрителя', g.subject], ['есть ставки', g.stakes], ['понятно', g.clear], ['быстро', g.fast],
  ];
  return (
    <div className="op-result">
      <section className="op-card op-hero">
        <div className="op-eyebrow">
          Разбор · {run.goal === 'conversion' ? 'цель: заявки' : 'цель: охват'} · {fmtDate(run.createdAt)}
        </div>
        <div className="op-scores">
          <div className={`op-score ${scoreTone(a.overall_score, 100)}`}>
            <div className="op-score-n">{a.overall_score}</div>
            <div className="op-score-l">Общая оценка<br /><span>{READINESS[a.readiness] || ''}</span></div>
          </div>
          <div className={`op-score op-score-alt ${scoreTone(a.reach_potential, 100)}`}>
            <div className="op-score-n">{a.reach_potential}</div>
            <div className="op-score-l">Потенциал охвата<br /><span>тема, угол и хук</span></div>
          </div>
        </div>
        <p className="op-verdict">{a.verdict}</p>
        <div className="op-core">
          <div className="op-label">Главная мысль ролика</div>
          <p>{a.core_idea}</p>
        </div>
        {a.assumptions.length > 0 && (
          <div className="op-assume">
            <div className="op-label">Что додумано за тебя</div>
            <ul>{a.assumptions.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </section>

      <section className="op-card">
        <h2 className="op-h2">Тема и угол</h2>
        <dl className="op-dl">
          <dt>Тема</dt><dd>{a.topic_angle.topic}</dd>
          <dt>Угол</dt><dd>{a.topic_angle.angle}</dd>
        </dl>
        <div className="op-facts">
          <span>Подача: {FORMAT_LEVEL[a.topic_angle.format_level] || a.topic_angle.format_level}</span>
          <span>Новое для зрителя: {a.topic_angle.shock_score} из 100</span>
        </div>
        <p className="op-p">{a.topic_angle.verdict}</p>
        {a.topic_angle.better_angle && (
          <div className="op-better">
            <div className="op-label">Угол сильнее</div>
            <p>{a.topic_angle.better_angle}</p>
          </div>
        )}
        <Source source={a.topic_angle.source} />
      </section>

      <section className="op-card">
        <div className="op-gate-head">
          <h2 className="op-h2">Первая фраза</h2>
          <span className={g.pass ? 'op-stamp op-stamp-ok' : 'op-stamp op-stamp-no'}>
            {g.pass ? 'Проходит' : 'Не проходит'}
          </span>
        </div>
        <blockquote className="op-quote">{g.first_sentence}</blockquote>
        <div className="op-checks">
          {checks.map(([label, ok]) => (
            <span key={label} className={ok ? 'op-chk op-chk-ok' : 'op-chk op-chk-no'}>{ok ? '✓' : '✕'} {label}</span>
          ))}
        </div>
        <p className="op-p">{g.reason}</p>
        <Source source={g.source} />
      </section>

      <section className="op-card">
        <h2 className="op-h2">По критериям</h2>
        <div className="op-crit-list">
          {a.criteria.map((c) => (
            <div className="op-crit" key={c.id}>
              <div className="op-crit-head">
                <span className="op-crit-name">{c.name}</span>
                <span className={`op-crit-score ${scoreTone(c.score, 10)}`}>{c.score}<small>/10</small></span>
              </div>
              <div className="op-bar"><i className={scoreTone(c.score, 10)} style={{ width: `${c.score * 10}%` }} /></div>
              <p className="op-p">{c.reasoning}</p>
              {c.quote && <blockquote className="op-quote op-quote-sm">{c.quote}</blockquote>}
              {c.source_type === 'kallaway' && <Source source={c.source} />}
            </div>
          ))}
        </div>
      </section>

      <section className="op-card">
        <h2 className="op-h2">Три новых хука</h2>
        <div className="op-hooks">
          {a.hooks.map((h, i) => (
            <div className="op-hook" key={i}>
              <div className="op-hook-top">
                <span className="op-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="op-badge">{HOOK_FORMAT[h.format] || h.format}</span>
              </div>
              <p className="op-hook-text">{h.text}</p>
              {h.on_screen_text && (
                <div className="op-onscreen"><span>На экране</span>{h.on_screen_text}</div>
              )}
              <p className="op-p op-muted">{h.why}</p>
              <div className="op-row">
                <CopyButton text={h.text} label="Скопировать хук" />
                <Source source={h.source} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="op-card">
        <h2 className="op-h2">Переписанный сценарий</h2>
        {a.rewrite.placeholders.length > 0 && (
          <p className="op-p op-muted">
            Жёлтым отмечено то, что знаешь только ты: впиши свой пример, цифру или лид-магнит.
          </p>
        )}
        <pre className="op-script"><WithPlaceholders text={a.rewrite.script} /></pre>
        <div className="op-row">
          <CopyButton text={a.rewrite.script} label="Скопировать сценарий" primary />
        </div>
        {a.rewrite.changes.length > 0 && (
          <div className="op-changes">
            <div className="op-label">Что поменялось</div>
            <ul>{a.rewrite.changes.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </section>

      {a.to_fix.length > 0 && (
        <section className="op-card">
          <h2 className="op-h2">Что сделать</h2>
          <ol className="op-fix">
            {[...a.to_fix].sort((x, y) => x.priority - y.priority).map((f, i) => (
              <li key={i}>
                <span className={f.kind === 'bring' ? 'op-kind op-kind-bring' : 'op-kind'}>
                  {f.kind === 'bring' ? 'Принести' : 'Исправить'}
                </span>
                <p className="op-p">{f.text}</p>
                <Source source={f.source} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {a.warnings.length > 0 && (
        <section className="op-card op-warn">
          <div className="op-label">Обрати внимание</div>
          <ul>{a.warnings.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}

      <button type="button" className="op-ghost op-again" onClick={onNew}>Разобрать другой сценарий</button>
    </div>
  );
}

function Waiting({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const elapsed = now - startedAt;
  const step = Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_MS));
  const pct = Math.min(95, (elapsed / 120_000) * 100);
  const sec = Math.floor(elapsed / 1000);
  return (
    <section className="op-card op-wait" aria-live="polite">
      <div className="op-eyebrow">Разбор идёт · {Math.floor(sec / 60)}:{String(sec % 60).padStart(2, '0')}</div>
      <ol className="op-steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'op-step-done' : i === step ? 'op-step-now' : ''}>{s}</li>
        ))}
      </ol>
      <div className="op-progress"><i style={{ width: `${pct}%` }} /></div>
      <p className="op-p op-muted">
        Обычно занимает 1-2 минуты. Не закрывай страницу. Готовый разбор сохранится в «Прошлых разборах».
      </p>
    </section>
  );
}

function OptimizatorInner() {
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'ok'>('load');
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [script, setScript] = useState('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [busySince, setBusySince] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<SavedRun | null>(null);
  const initData = useRef('');
  const resultRef = useRef<HTMLDivElement>(null);

  function authHeaders(): Record<string, string> {
    return initData.current ? { 'x-tg-init-data': initData.current } : {};
  }

  async function loadRun(id: string) {
    try {
      const res = await fetch(`/api/cabinet/optimizator?id=${encodeURIComponent(id)}`, { headers: authHeaders(), credentials: 'same-origin' });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        window.history.replaceState(null, '', `/optimizator?run=${id}`);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    } catch { /* noop */ }
  }

  useEffect(() => {
    let stop = false;
    (async () => {
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const id = tg?.initDataUnsafe?.user?.id ?? null;
      initData.current = typeof tg?.initData === 'string' ? tg.initData : '';
      try {
        const res = await fetch('/api/cabinet/optimizator', { headers: authHeaders(), credentials: 'same-origin' });
        const data = await res.json();
        if (stop) return;
        if (!data.identified) { setState('guest'); return; }
        if (!data.access) { setState('locked'); return; }
        setUsed(data.used); setLimit(data.limit); setItems(data.history || []);
        setState('ok');
        trackSection('optimizator', id);
        const want = new URLSearchParams(window.location.search).get('run');
        if (want) loadRun(want);
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const len = script.trim().length;
  const left = Math.max(0, limit - used);
  const canRun = !busySince && goal !== null && len >= SCRIPT_MIN && len <= SCRIPT_MAX && left > 0;

  async function submit() {
    if (!canRun) return;
    setError(null);
    setRun(null);
    setBusySince(Date.now());
    try {
      const res = await fetch('/api/cabinet/optimizator', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        credentials: 'same-origin',
        body: JSON.stringify({ script, goal, niche, audience }),
      });
      const data = await res.json().catch(() => ({}));
      if (typeof data.used === 'number') setUsed(data.used);
      if (!res.ok || !data.run) {
        setError(data.error || 'Разбор не получился. Попробуй ещё раз через минуту.');
        return;
      }
      setRun(data.run);
      if (data.run.id) {
        window.history.replaceState(null, '', `/optimizator?run=${data.run.id}`);
        setItems((prev) => [{
          id: data.run.id, createdAt: data.run.createdAt, goal: data.run.goal,
          score: data.run.result.overall_score,
          firstLine: (script.split('\n').map((s) => s.trim()).find(Boolean) || '').slice(0, 90),
        }, ...prev].slice(0, 10));
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setError('Связь оборвалась. Если разбор успел пройти, он появится в «Прошлых разборах» после обновления страницы.');
    } finally {
      setBusySince(null);
    }
  }

  function startNew() {
    setRun(null);
    window.history.replaceState(null, '', '/optimizator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="op-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />
      <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap" rel="stylesheet" />
      </noscript>

      <header className="op-top">
        <a className="op-back" href="/dostup">‹ Кабинет</a>
        <div className="op-brand">Оптимизатор рилсов</div>
        <div className="op-sub">Разбор сценария по методике Каллавея: тема, угол, хук, доказательство и призыв. На выходе три новых хука и переписанный текст</div>
        <OpenInBrowser path="/optimizator" className="op-browser" />
      </header>

      {state === 'load' && (
        <div className="op-state"><div className="op-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="op-card">
          <div className="op-login-title">Вход</div>
          <div className="op-login-sub">Доступ привязан к твоему Telegram. Войди, и оптимизатор откроется.</div>
          <TelegramLoginButton />
          <a className="op-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">Или открыть в боте →</a>
        </div>
      )}

      {state === 'locked' && (
        <div className="op-card">
          <div className="op-lock-badge">🔒 Закрытый раздел</div>
          <h1 className="op-lock-h1">Оптимизатор рилсов</h1>
          <p className="op-lock-p">
            Вставляешь сценарий рилса и получаешь разбор по методике Каллавея: что с темой и углом,
            цепляет ли первая фраза, где не хватает доказательства. Плюс три новых хука и переписанный сценарий.
            Открыт ученикам курса «Новый Уровень».
          </p>
          <a className="op-cta" href="https://thesashatoyz.com/uroven">Посмотреть тарифы →</a>
        </div>
      )}

      {state === 'ok' && (
        <>
          <section className="op-card op-form">
            <div className="op-form-head">
              <label className="op-label" htmlFor="op-script">Сценарий рилса</label>
              <span className={left > 0 ? 'op-quota' : 'op-quota op-quota-out'}>
                {limit >= 100000 ? 'без лимита' : `осталось ${left} из ${limit} в этом месяце`}
              </span>
            </div>
            <textarea
              id="op-script"
              className="op-textarea"
              placeholder="Вставь текст ролика целиком, как говоришь его в кадр: с первой фразы до призыва"
              value={script}
              maxLength={SCRIPT_MAX}
              onChange={(e) => setScript(e.target.value)}
              disabled={!!busySince}
            />
            <div className="op-count">
              {len < SCRIPT_MIN ? `ещё ${SCRIPT_MIN - len} символов до минимума` : `${len} / ${SCRIPT_MAX}`}
            </div>

            <div className="op-label op-mt">Зачем этот ролик</div>
            <div className="op-goals" role="radiogroup">
              <button type="button" role="radio" aria-checked={goal === 'conversion'}
                className={goal === 'conversion' ? 'op-goal op-goal-on' : 'op-goal'}
                onClick={() => setGoal('conversion')} disabled={!!busySince}>
                <b>Заявки</b><span>ролик должен приводить клиентов</span>
              </button>
              <button type="button" role="radio" aria-checked={goal === 'virality'}
                className={goal === 'virality' ? 'op-goal op-goal-on' : 'op-goal'}
                onClick={() => setGoal('virality')} disabled={!!busySince}>
                <b>Охват</b><span>просмотры и новые подписчики</span>
              </button>
            </div>

            <details className="op-more">
              <summary>Ниша и аудитория <span>необязательно, но разбор точнее</span></summary>
              <label className="op-field">
                <span>Ниша</span>
                <input value={niche} maxLength={FIELD_MAX} onChange={(e) => setNiche(e.target.value)}
                  placeholder="например: нутрициолог для женщин после 35" disabled={!!busySince} />
              </label>
              <label className="op-field">
                <span>Кто идеальный зритель</span>
                <input value={audience} maxLength={FIELD_MAX} onChange={(e) => setAudience(e.target.value)}
                  placeholder="кто должен посмотреть и написать тебе" disabled={!!busySince} />
              </label>
            </details>

            <button type="button" className="op-run" onClick={submit} disabled={!canRun}>
              {busySince ? 'Разбираю…' : left > 0 ? 'Разобрать сценарий' : 'Лимит на месяц исчерпан'}
            </button>
            {!busySince && goal === null && len >= SCRIPT_MIN && (
              <div className="op-hint">Выбери, зачем ролик: от этого зависят все оценки.</div>
            )}
            {error && <div className="op-error" role="alert">{error}</div>}
          </section>

          {busySince && <Waiting startedAt={busySince} />}

          <div ref={resultRef} className="op-anchor">
            {run && <Result run={run} onNew={startNew} />}
          </div>

          {items.length > 0 && (
            <section className="op-history">
              <div className="op-label">Прошлые разборы</div>
              {items.map((h) => (
                <button type="button" key={h.id} className={run?.id === h.id ? 'op-hist op-hist-on' : 'op-hist'}
                  onClick={() => loadRun(h.id)}>
                  <span className={`op-hist-score ${h.score !== null ? scoreTone(h.score, 100) : ''}`}>{h.score ?? '·'}</span>
                  <span className="op-hist-body">
                    <span className="op-hist-line">{h.firstLine || 'Без текста'}</span>
                    <span className="op-hist-meta">{fmtDate(h.createdAt)} · {h.goal === 'conversion' ? 'заявки' : 'охват'}</span>
                  </span>
                </button>
              ))}
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
        .op-wrap {
          --op-bg: oklch(0.97 0.006 75); --op-text: oklch(0.16 0.015 55);
          --op-muted: oklch(0.46 0.012 55); --op-accent: oklch(0.60 0.19 52);
          --op-accent-soft: oklch(0.93 0.04 52); --op-surface: oklch(1 0 0);
          --op-line: oklch(0.90 0.008 75);
          --op-good: oklch(0.55 0.13 150); --op-good-soft: oklch(0.95 0.04 150);
          --op-mid: oklch(0.62 0.14 75); --op-mid-soft: oklch(0.95 0.05 85);
          --op-low: oklch(0.56 0.19 28); --op-low-soft: oklch(0.95 0.035 28);
          --op-mark: oklch(0.93 0.11 95);
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--op-text);
          background: var(--op-bg); min-height: 100svh;
        }
        .op-wrap * { box-sizing: border-box; }
        .op-top { margin-bottom: 16px; }
        .op-back { display: inline-block; text-decoration: none; color: var(--op-muted); font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .op-back:hover { color: var(--op-accent); }
        .op-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; line-height: 1.1; }
        .op-sub { color: var(--op-muted); font-size: 13px; margin-top: 5px; line-height: 1.4; }
        .op-browser {
          display: inline-block; margin-top: 12px; cursor: pointer; background: none;
          border: 1px solid var(--op-line); color: var(--op-muted); font-family: inherit;
          font-weight: 600; font-size: 13px; padding: 8px 13px; border-radius: 10px;
        }
        .op-card {
          background: var(--op-surface); border: 1px solid var(--op-line);
          border-radius: 18px; padding: 18px; margin-bottom: 12px;
        }
        .op-label { font-size: 12px; font-weight: 700; color: var(--op-muted); letter-spacing: 0.01em; margin-bottom: 7px; display: block; }
        .op-mt { margin-top: 16px; }
        .op-eyebrow { font-size: 12px; font-weight: 700; color: var(--op-accent); letter-spacing: 0.01em; }
        .op-h2 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -0.015em; margin: 0 0 10px; }
        .op-p { font-size: 14px; line-height: 1.5; margin: 8px 0 0; }
        .op-muted { color: var(--op-muted); font-size: 13px; }

        .op-form-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .op-quota { font-size: 12px; font-weight: 700; color: var(--op-accent); background: var(--op-accent-soft); padding: 4px 9px; border-radius: 999px; }
        .op-quota-out { color: var(--op-low); background: var(--op-low-soft); }
        .op-textarea {
          width: 100%; min-height: 220px; resize: vertical; margin-top: 4px;
          border: 1px solid var(--op-line); border-radius: 12px; padding: 12px 13px;
          font-family: inherit; font-size: 15px; line-height: 1.5; color: var(--op-text); background: var(--op-bg);
        }
        .op-textarea:focus, .op-field input:focus { outline: 2px solid var(--op-accent); outline-offset: -1px; border-color: transparent; }
        .op-count { font-size: 11.5px; color: var(--op-muted); text-align: right; margin-top: 5px; font-variant-numeric: tabular-nums; }
        .op-goals { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .op-goal {
          text-align: left; cursor: pointer; background: var(--op-bg); border: 1.5px solid var(--op-line);
          border-radius: 12px; padding: 11px 12px; font-family: inherit; color: var(--op-text);
          display: flex; flex-direction: column; gap: 3px; min-height: 64px;
        }
        .op-goal b { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; }
        .op-goal span { font-size: 12px; color: var(--op-muted); line-height: 1.3; }
        .op-goal-on { border-color: var(--op-accent); background: var(--op-accent-soft); }
        .op-goal-on b { color: var(--op-accent); }
        .op-more { margin-top: 14px; border-top: 1px dashed var(--op-line); padding-top: 12px; }
        .op-more summary { cursor: pointer; font-size: 13.5px; font-weight: 700; list-style: none; }
        .op-more summary::-webkit-details-marker { display: none; }
        .op-more summary::before { content: '+ '; color: var(--op-accent); }
        .op-more[open] summary::before { content: '− '; }
        .op-more summary span { display: block; font-weight: 500; color: var(--op-muted); font-size: 12px; margin: 2px 0 0 14px; }
        .op-field { display: block; margin-top: 10px; }
        .op-field span { display: block; font-size: 12px; font-weight: 600; color: var(--op-muted); margin-bottom: 4px; }
        .op-field input {
          width: 100%; border: 1px solid var(--op-line); border-radius: 10px; padding: 10px 12px;
          font-family: inherit; font-size: 15px; background: var(--op-bg); color: var(--op-text);
        }
        .op-run {
          width: 100%; margin-top: 16px; cursor: pointer; border: none; background: var(--op-accent);
          color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
          font-size: 16px; padding: 15px 18px; border-radius: 12px;
        }
        .op-run:disabled { background: var(--op-line); color: var(--op-muted); cursor: default; }
        .op-run:not(:disabled):active { transform: translateY(1px); }
        .op-hint { font-size: 12.5px; color: var(--op-muted); margin-top: 8px; text-align: center; }
        .op-error { margin-top: 10px; font-size: 13.5px; line-height: 1.45; color: var(--op-low); background: var(--op-low-soft); border-radius: 10px; padding: 10px 12px; }

        .op-wait { border-color: var(--op-accent); }
        .op-steps { list-style: none; padding: 0; margin: 12px 0 14px; display: grid; gap: 7px; }
        .op-steps li { font-size: 14px; color: oklch(0.70 0.01 55); padding-left: 24px; position: relative; transition: color .3s; }
        .op-steps li::before { content: ''; position: absolute; left: 4px; top: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--op-line); }
        .op-steps .op-step-done { color: var(--op-muted); }
        .op-steps .op-step-done::before { background: var(--op-good); }
        .op-steps .op-step-now { color: var(--op-text); font-weight: 700; }
        .op-steps .op-step-now::before { background: var(--op-accent); animation: op-pulse 1.1s ease-in-out infinite; }
        @keyframes op-pulse { 50% { transform: scale(1.6); opacity: .5; } }
        .op-progress { height: 5px; background: var(--op-accent-soft); border-radius: 99px; overflow: hidden; }
        .op-progress i { display: block; height: 100%; background: var(--op-accent); border-radius: 99px; transition: width .5s linear; }

        .op-anchor { scroll-margin-top: 12px; }
        .op-result { animation: op-in .45s ease-out both; }
        @keyframes op-in { from { opacity: 0; transform: translateY(8px); } }
        .op-hero { border-color: var(--op-text); }
        .op-scores { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0 4px; }
        .op-score { border-radius: 14px; padding: 12px 13px 13px; background: var(--op-bg); }
        .op-score-n { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 46px; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
        .op-score-l { font-size: 12.5px; font-weight: 700; margin-top: 6px; line-height: 1.3; }
        .op-score-l span { font-weight: 500; color: var(--op-muted); }
        .op-score.op-good { background: var(--op-good-soft); } .op-score.op-good .op-score-n { color: var(--op-good); }
        .op-score.op-mid { background: var(--op-mid-soft); } .op-score.op-mid .op-score-n { color: var(--op-mid); }
        .op-score.op-low { background: var(--op-low-soft); } .op-score.op-low .op-score-n { color: var(--op-low); }
        .op-verdict { font-size: 15.5px; line-height: 1.5; font-weight: 600; margin: 12px 0 0; }
        .op-core { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--op-line); }
        .op-core p { margin: 0; font-size: 14px; line-height: 1.5; }
        .op-assume { margin-top: 12px; }
        .op-assume ul, .op-changes ul, .op-warn ul { margin: 0; padding-left: 16px; list-style: disc; font-size: 13px; line-height: 1.5; color: var(--op-muted); }
        .op-assume li + li, .op-changes li + li, .op-warn li + li { margin-top: 4px; }

        .op-dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0; font-size: 14px; line-height: 1.45; }
        .op-dl dt { font-weight: 700; color: var(--op-muted); font-size: 12.5px; padding-top: 2px; }
        .op-dl dd { margin: 0; }
        .op-facts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .op-facts span { font-size: 12px; font-weight: 600; background: var(--op-bg); border: 1px solid var(--op-line); padding: 4px 9px; border-radius: 999px; }
        .op-better { margin-top: 12px; background: var(--op-accent-soft); border-radius: 12px; padding: 11px 13px; }
        .op-better .op-label { color: var(--op-accent); margin-bottom: 4px; }
        .op-better p { margin: 0; font-size: 14px; line-height: 1.5; font-weight: 600; }

        .op-gate-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .op-gate-head .op-h2 { margin: 0; }
        .op-stamp { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; padding: 5px 10px; border-radius: 8px; border: 2px solid; transform: rotate(-2deg); }
        .op-stamp-ok { color: var(--op-good); border-color: var(--op-good); }
        .op-stamp-no { color: var(--op-low); border-color: var(--op-low); }
        .op-quote { margin: 12px 0 0; padding: 2px 0 2px 12px; border-left: 3px solid var(--op-accent); font-size: 15px; line-height: 1.45; font-weight: 600; }
        .op-quote-sm { font-size: 13px; font-weight: 500; color: var(--op-muted); border-left-color: var(--op-line); margin-top: 8px; }
        .op-checks { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .op-chk { font-size: 12px; font-weight: 700; padding: 4px 9px; border-radius: 999px; }
        .op-chk-ok { color: var(--op-good); background: var(--op-good-soft); }
        .op-chk-no { color: var(--op-low); background: var(--op-low-soft); }

        .op-crit-list { display: grid; }
        .op-crit { padding: 12px 0; border-top: 1px solid var(--op-line); }
        .op-crit:first-child { border-top: none; padding-top: 2px; }
        .op-crit-head { display: flex; justify-content: space-between; align-items: baseline; }
        .op-crit-name { font-weight: 700; font-size: 15px; }
        .op-crit-score { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 18px; font-variant-numeric: tabular-nums; }
        .op-crit-score small { font-size: 11px; color: var(--op-muted); font-weight: 700; }
        .op-crit-score.op-good { color: var(--op-good); } .op-crit-score.op-mid { color: var(--op-mid); } .op-crit-score.op-low { color: var(--op-low); }
        .op-bar { height: 4px; background: var(--op-bg); border-radius: 99px; margin-top: 6px; overflow: hidden; }
        .op-bar i { display: block; height: 100%; border-radius: 99px; }
        .op-bar i.op-good { background: var(--op-good); } .op-bar i.op-mid { background: var(--op-mid); } .op-bar i.op-low { background: var(--op-low); }
        .op-src { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 700; color: var(--op-accent); text-decoration: none; }
        .op-src:hover { text-decoration: underline; }

        .op-hooks { display: grid; gap: 10px; }
        .op-hook { background: var(--op-bg); border-radius: 14px; padding: 13px 14px; }
        .op-hook-top { display: flex; align-items: center; gap: 8px; }
        .op-num { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 13px; color: var(--op-accent); }
        .op-badge { font-size: 11.5px; font-weight: 700; background: var(--op-accent-soft); color: var(--op-accent); padding: 3px 9px; border-radius: 999px; }
        .op-hook-text { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 17px; line-height: 1.3; letter-spacing: -0.01em; margin: 9px 0 0; }
        .op-onscreen { margin-top: 8px; font-size: 13px; line-height: 1.4; }
        .op-onscreen span { display: inline-block; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--op-muted); margin-right: 6px; }
        .op-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
        .op-row .op-src { margin-top: 0; }
        .op-copy {
          cursor: pointer; background: var(--op-surface); border: 1px solid var(--op-line); color: var(--op-text);
          font-family: inherit; font-weight: 700; font-size: 13px; padding: 9px 13px; border-radius: 10px;
        }
        .op-copy:hover { border-color: var(--op-accent); color: var(--op-accent); }
        .op-copy-primary { background: var(--op-accent); border-color: var(--op-accent); color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14px; padding: 12px 16px; flex: 1 1 auto; }
        .op-copy-primary:hover { color: oklch(1 0 0); }
        .op-script {
          margin: 12px 0 0; padding: 14px; background: var(--op-bg); border: 1px solid var(--op-line);
          border-radius: 12px; font-family: inherit; font-size: 14.5px; line-height: 1.6;
          white-space: pre-wrap; word-break: break-word;
        }
        .op-ph { background: var(--op-mark); color: var(--op-text); border-radius: 4px; padding: 1px 3px; font-weight: 600; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
        .op-changes { margin-top: 14px; }

        .op-fix { list-style: none; counter-reset: fix; padding: 0; margin: 0; }
        .op-fix li { counter-increment: fix; position: relative; padding: 10px 0 10px 34px; border-top: 1px solid var(--op-line); }
        .op-fix li:first-child { border-top: none; padding-top: 0; }
        .op-fix li::before { content: counter(fix); position: absolute; left: 0; font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 20px; color: var(--op-accent); line-height: 1.1; }
        .op-fix li:first-child::before { top: 0; }
        .op-fix .op-p { margin-top: 5px; }
        .op-kind { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--op-muted); }
        .op-kind-bring { color: var(--op-mid); }
        .op-warn { background: var(--op-mid-soft); border-color: transparent; }
        .op-warn ul { color: var(--op-text); }

        .op-ghost {
          display: block; width: 100%; cursor: pointer; background: none; border: 1px solid var(--op-line);
          color: var(--op-text); font-family: inherit; font-weight: 700; font-size: 14px; padding: 13px; border-radius: 12px; margin-top: 12px;
        }
        .op-ghost:hover { border-color: var(--op-accent); color: var(--op-accent); }
        .op-again { margin: 4px 0 12px; }

        .op-history { margin-top: 22px; }
        .op-hist {
          display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; cursor: pointer;
          background: var(--op-surface); border: 1px solid var(--op-line); border-radius: 14px;
          padding: 11px 13px; margin-bottom: 8px; font-family: inherit; color: var(--op-text);
        }
        .op-hist:hover, .op-hist-on { border-color: var(--op-accent); }
        .op-hist-score { flex: 0 0 auto; width: 40px; font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 20px; text-align: center; font-variant-numeric: tabular-nums; }
        .op-hist-score.op-good { color: var(--op-good); } .op-hist-score.op-mid { color: var(--op-mid); } .op-hist-score.op-low { color: var(--op-low); }
        .op-hist-body { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .op-hist-line { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .op-hist-meta { font-size: 11.5px; color: var(--op-muted); }

        .op-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .op-login-sub { color: var(--op-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .op-tg-login { margin-top: 4px; min-height: 46px; }
        .op-login-alt { display: inline-block; margin-top: 12px; text-decoration: none; color: var(--op-muted); font-size: 13px; font-weight: 600; }
        .op-lock-badge { display: inline-block; font-size: 12px; font-weight: 700; color: var(--op-muted); background: var(--op-bg); border: 1px solid var(--op-line); padding: 5px 10px; border-radius: 999px; }
        .op-lock-h1 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px; letter-spacing: -0.02em; margin: 12px 0 8px; }
        .op-lock-p { font-size: 14.5px; line-height: 1.55; margin: 0 0 18px; }
        .op-cta { display: block; text-align: center; text-decoration: none; background: var(--op-accent); color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 13px 18px; border-radius: 11px; }
        .op-state { text-align: center; padding: 48px 16px; }
        .op-state p { color: var(--op-muted); margin: 0; }
        .op-spinner { width: 24px; height: 24px; border: 3px solid var(--op-line); border-top-color: var(--op-accent); border-radius: 50%; margin: 0 auto 12px; animation: op-spin .8s linear infinite; display: inline-block; }
        @keyframes op-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .op-result, .op-steps .op-step-now::before, .op-spinner { animation: none; }
        }
      `}</style>
    </main>
  );
}

export default function OptimizatorPage() {
  return <Suspense fallback={null}><OptimizatorInner /></Suspense>;
}
