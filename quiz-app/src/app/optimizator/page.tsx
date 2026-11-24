'use client';

import { Fragment, Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import { trackSection } from '@/lib/cabinet-track';
import OpenInBrowser from '@/components/OpenInBrowser';
import { BLOCKS_CSS, NachalaBlock, StatsBlock } from './blocks';
import InstagramBlock from './InstagramBlock';
import {
  DEMAND_STATUS, FORMAT_NAME, REASON_ANSWER, SCRIPT_MAX, SCRIPT_MIN, SHARE_KIND, firstLine, ladderVerdict, sourceUrl,
  type DemandLink, type Ladder, type ViewerReason, type HistoryItem, type SavedRun, type Shans, type StudentAnalysis,
} from '@/lib/optimizator/view';

// Раздел «Оптимизатор рилсов»: ученик вставляет только текст ролика, сервер ищет
// спрос в базе выбросов и разбирает текст по методике Каллавея (цель и формат
// модель определяет сама). Промпт живёт только на сервере (/api/cabinet/optimizator),
// сюда приходит готовый разбор без внутренней математики.

const BOT_URL = 'https://t.me/testtoyzbot';

const STEPS = [
  'Ищу тему в базе залетевших постов',
  'Сравниваю с роликами, где результат уже известен',
  'Определяю цель и формат ролика',
  'Оцениваю тему и угол',
  'Проверяю первую фразу',
  'Смотрю, есть ли причина досмотреть и переслать',
  'Смотрю доказательства и удержание',
  'Пишу три новых хука',
  'Переписываю сценарий',
  'Собираю список правок',
];
/** Typical run is 70-135 s; steps are spread over ~110 s. */
const STEP_MS = 14_000;

const READINESS: Record<string, string> = {
  ready: 'Можно выкладывать', needs_work: 'Нужны правки', rewrite: 'Лучше переписать',
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

type TgShare = { Telegram?: { WebApp?: { initData?: string; openTelegramLink?: (url: string) => void } } };

// Sends the read-only link to a friend, student or client: Telegram share sheet inside the bot,
// the system share sheet on phones, otherwise copies the link.
function ShareRun({ url }: { url: string }) {
  const [done, setDone] = useState(false);
  const text = 'Разбор сценария рилса';
  async function share() {
    const tg = (window as unknown as TgShare).Telegram?.WebApp;
    if (tg?.initData && tg.openTelegramLink) {
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
      return;
    }
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title: text, url }); return; } catch (e) { if ((e as Error)?.name === 'AbortError') return; }
    }
    await copyText(url);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }
  return (
    <section className="op-card op-share">
      <p className="op-p">Разбор можно отправить другу, ученику или клиенту: по ссылке он откроется без входа.</p>
      <div className="op-row">
        <button type="button" className="op-copy op-copy-primary" onClick={share}>{done ? '✓ Ссылка скопирована' : 'Поделиться разбором'}</button>
        <CopyButton text={url} label="Скопировать ссылку" />
      </div>
    </section>
  );
}

function Source({ source }: { source: string | null }) {
  const url = sourceUrl(source);
  if (!url) return null;
  return (
    <a className="op-src" href={url} target="_blank" rel="noopener noreferrer">▶ ролик Каллавея</a>
  );
}

/** Material only the student has: [вставь ...], [твоя цифра ...]. */
const FILL_RE = /^\[(вставь|твоя|твой|твоё|твои)(?![а-яё])/i;

/**
 * Placeholders like [вставь цифру: ...] are highlighted: the student must fill them.
 * Other brackets ([Текст на экране: ...], old editing-plan directives) are instructions
 * and get a calmer style; one on its own line becomes a block.
 */
function WithPlaceholders({ text, fill }: { text: string; fill: string[] }) {
  const isFill = (p: string) => FILL_RE.test(p) || fill.includes(p) || fill.includes(p.slice(1, -1));
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const t = line.trim();
        const last = i === lines.length - 1;
        if (/^\[[^\]]*\]$/.test(t) && !isFill(t)) {
          return <span key={i} className="op-edit-line">{t.slice(1, -1)}</span>;
        }
        return (
          <Fragment key={i}>
            {line.split(/(\[[^\]]*\])/g).map((p, j) => {
              if (!(p.startsWith('[') && p.endsWith(']'))) return <Fragment key={j}>{p}</Fragment>;
              if (!isFill(p)) return <span key={j} className="op-edit">{p.slice(1, -1)}</span>;
              return <mark key={j} className="op-ph">{p}</mark>;
            })}
            {last ? '' : '\n'}
          </Fragment>
        );
      })}
    </>
  );
}

function scoreTone(score: number, max: number) {
  const r = score / max;
  return r >= 0.75 ? 'op-good' : r >= 0.5 ? 'op-mid' : 'op-low';
}

/** 0-100 scores on the v4+ scale: ready from 65, weak below 45. */
function scoreTone100(score: number) {
  return score >= 65 ? 'op-good' : score >= 45 ? 'op-mid' : 'op-low';
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function DemandBlock({ demand, links }: { demand: NonNullable<StudentAnalysis['demand']>; links: DemandLink[] }) {
  return (
    <section className="op-card">
      <div className="op-gate-head">
        <h2 className="op-h2">Спрос</h2>
        <span className={`op-chip op-chip-${demand.status}`}>{DEMAND_STATUS[demand.status] || demand.status}</span>
      </div>
      <p className="op-p">{demand.summary}</p>
      {links.length > 0 && (
        <>
          <ul className="op-links">
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  <span className="op-link-top">
                    <b>{l.author.startsWith('@') ? l.author : `@${l.author}`}</b>
                    <span className="op-ratio">×{l.ratio.toLocaleString('ru-RU')}</span>
                    <span className="op-link-kind">{l.kind === 'reel' ? 'рилс' : 'карусель'} ↗</span>
                  </span>
                  <span className="op-link-text">{l.text}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="op-note">×число: во сколько раз пост обогнал обычные ролики своего автора</p>
        </>
      )}
    </section>
  );
}

const OUTCOME: Record<string, string> = { hit: 'залёт', norm: 'норма', flop: 'провал' };

function fmtRatio(r: number) {
  return `×${r.toLocaleString('ru-RU', { maximumFractionDigits: r < 10 ? 1 : 0 })}`;
}

function refOutcome(l: Ladder, r: Ladder['refs'][number]) {
  if (l.kind === 'own') {
    const plays = r.plays !== null ? `${r.plays.toLocaleString('ru-RU')} просмотров` : '';
    return [OUTCOME[r.outcome], plays].filter(Boolean).join(' · ');
  }
  return r.outcome === 'hit'
    ? `ролик эксперта по похожей теме, залетел ${fmtRatio(r.ratio)}`
    : `ролик эксперта по похожей теме, не залетел: ${fmtRatio(r.ratio)} от обычного`;
}

/** Place among 8 reels of known outcome: own past reels or expert reels on the topic. */
function LadderBlock({ l }: { l: Ladder }) {
  const share = l.total ? l.wins / l.total : 0;
  const tone = !l.confident ? 'op-neutral' : share >= 0.7 ? 'op-good' : share > 0.3 ? 'op-mid' : 'op-low';
  return (
    <section className="op-card op-ladder">
      <div className="op-ladder-top">
        <p className="op-ladder-head">
          Сильнее <b className={tone}>{l.wins} из {l.total}</b>{' '}
          {l.kind === 'own' ? 'твоих прошлых роликов' : 'роликов экспертов по твоей теме'}
        </p>
        <span className={l.confident ? 'op-conf op-conf-yes' : 'op-conf'}>
          {l.confident ? 'уверенно' : 'не уверен'}
        </span>
      </div>
      <div className="op-ladder-dots" aria-hidden="true">
        {l.refs.map((r, i) => <i key={i} className={r.won ? tone : ''} />)}
      </div>
      <p className={l.confident ? 'op-p op-ladder-verdict' : 'op-p op-ladder-verdict op-ladder-unsure'}>{ladderVerdict(l)}</p>
      <details className="op-ladder-list">
        <summary>С чем сравнивал</summary>
        <ul>
          {l.refs.map((r, i) => (
            <li key={i}>
              <span className={r.won ? 'op-ladder-res op-ladder-won' : 'op-ladder-res'}>{r.won ? 'ты сильнее' : 'ты слабее'}</span>
              <span className="op-ladder-text">«{r.label}»</span>
              <span className="op-ladder-out">{refOutcome(l, r)}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}


function Details({ a }: { a: StudentAnalysis }) {
  const g = a.hook_gate;
  const checks: [string, boolean][] = [
    ['про зрителя', g.subject], ['есть ставки', g.stakes], ['понятно', g.clear], ['быстро', g.fast],
  ];
  return (
    <details className="op-card op-details">
      <summary>Подробнее <span>балл, потенциал охвата, тема и угол, первая фраза, критерии, ещё три хука</span></summary>

      <div className="op-sect">
        <h3 className="op-h3">Общий балл</h3>
        <div className="op-reach">
          <span className={`op-reach-n ${a.reach_from_model ? scoreTone100(a.overall_score) : scoreTone(a.overall_score, 100)}`}>{a.overall_score}</span>
          <span className="op-muted">
            из 100{READINESS[a.readiness] ? `, ${READINESS[a.readiness].toLowerCase()}` : ''}. Между прогонами одного текста балл гуляет на ±5: сравнивай не цифры, а правки.
          </span>
        </div>
      </div>

      <div className="op-sect">
        <h3 className="op-h3">Потенциал охвата</h3>
        <div className="op-reach">
          <span className={`op-reach-n ${a.reach_from_model ? scoreTone100(a.reach_potential) : scoreTone(a.reach_potential, 100)}`}>{a.reach_potential}</span>
          <span className="op-muted">
            {a.reach_from_model ? 'против твоего обычного ролика. Обычный около 65, уровень залёта от 75' : 'по теме, углу и хуку'}
          </span>
        </div>
      </div>

      <div className="op-sect">
        <h3 className="op-h3">Главная мысль</h3>
        <p className="op-p">{a.core_idea}</p>
        {a.format?.why && <p className="op-p op-muted">Формат: {a.format.why}</p>}
      </div>

      <div className="op-sect">
        <h3 className="op-h3">Тема и угол</h3>
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
      </div>

      <div className="op-sect">
        <div className="op-gate-head">
          <h3 className="op-h3">Первая фраза</h3>
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
      </div>

      <div className="op-sect">
        <h3 className="op-h3">По критериям</h3>
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
      </div>

      {a.hooks.length > 0 && (
        <div className="op-sect">
          <h3 className="op-h3">Ещё три хука</h3>
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
        </div>
      )}

      {a.rewrite.changes.length > 0 && (
        <div className="op-sect">
          <h3 className="op-h3">Что поменялось в тексте</h3>
          <ul className="op-list">{a.rewrite.changes.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}

      {a.assumptions.length > 0 && (
        <div className="op-sect">
          <h3 className="op-h3">Что додумано за тебя</h3>
          <ul className="op-list">{a.assumptions.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}

    </details>
  );
}

const STEP_PARTS: Record<'stop' | 'save_share' | 'finish', string[]> = {
  stop: ['начало'],
  save_share: ['переслать', 'сохранить'],
  finish: ['середина', 'конец', 'подача', 'длина', 'формат'],
};

function fmtOr(or: number) {
  return '×' + String(Math.round(or * 100) / 100).replace('.', ',');
}

/** «Шанс на залёт»: the number first, then the verdict. Fetches the score for runs saved before it existed. */
function ShansHero({ run, verdict, headers, shared }: { run: SavedRun; verdict: string; headers?: () => Record<string, string>; shared?: boolean }) {
  const [s, setS] = useState<Shans | null>(run.shans ?? null);
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  // Mounted with key={run.id}, so this runs once per run.
  useEffect(() => {
    if (run.shans || shared || !run.id) return;
    let stop = false;
    fetch('/api/cabinet/optimizator/shans', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: { 'content-type': 'application/json', ...(headers ? headers() : {}) },
      body: JSON.stringify({ id: run.id }),
    }).then((r) => r.json()).then((d) => {
      if (stop) return;
      if (d.shans) { setS(d.shans); setState('idle'); } else setState('error');
    }).catch(() => { if (!stop) setState('error'); });
    return () => { stop = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id]);
  const tone = s ? (s.band >= 3 ? 'op-good' : s.band === 2 ? 'op-mid' : 'op-low') : '';
  return (
    <section className="op-card op-hero op-shans">
      <div className="op-eyebrow">Шанс на залёт</div>
      {s ? (
        <>
          <div className="op-shans-top">
            <span className={`op-shans-n ${tone}`}>{Math.round(s.hitShare * 100)}%</span>
            <span className="op-shans-l">{s.bandName}<span>в среднем по базе 50%</span></span>
          </div>
          <div className="op-shans-scale" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((b) => <i key={b} className={b === s.band ? tone : ''} />)}
          </div>
          <p className="op-shans-note">Столько залётов среди роликов базы с теми же приёмами. Сильнее {s.pct}% роликов.</p>
        </>
      ) : state === 'error' ? (
        <p className="op-p op-muted">Шанс не посчитался. Обнови страницу через минуту.</p>
      ) : shared ? null : (
        <p className="op-p op-muted"><span className="op-spinner op-spinner-sm" /> Считаю шанс по базе залётов…</p>
      )}
      <p className="op-verdict">{verdict}</p>
    </section>
  );
}

function ShansChips({ s, parts }: { s: Shans | null | undefined; parts: string[] }) {
  if (!s) return null;
  const plus = s.plus.filter((x) => parts.includes(x.part));
  const minus = s.minus.filter((x) => parts.includes(x.part));
  if (!plus.length && !minus.length) return null;
  return (
    <div className="op-shans-chips">
      {plus.map((x) => <span key={x.name} className="op-chk op-chk-ok">{x.name} {fmtOr(x.or)}</span>)}
      {minus.map((x) => <span key={x.name} className="op-chk op-chk-no">{x.name} {fmtOr(x.or)}</span>)}
    </div>
  );
}

function ReasonCard({ title, v, isShare }: { title: string; v: ViewerReason | undefined; isShare?: boolean }) {
  if (!v) return null;
  const tone = v.answer === 'yes' ? 'op-good' : v.answer === 'partly' ? 'op-mid' : 'op-low';
  const kind = isShare && v.kind ? SHARE_KIND[v.kind] : '';
  return (
    <div className="op-reason">
      <div className="op-crit-head">
        <span className="op-crit-name">{title}</span>
        <span className={`op-reason-ans ${tone}`}>
          {kind && v.answer !== 'no' ? kind : REASON_ANSWER[v.answer] || v.answer}
          <b>{v.score}<small>/10</small></b>
        </span>
      </div>
      <div className="op-bar"><i className={tone} style={{ width: `${v.score * 10}%` }} /></div>
      <p className="op-p">{v.reason}</p>
      {v.fix && <p className="op-p op-reason-fix">{v.fix}</p>}
    </div>
  );
}

/** Inside Telegram a plain link replaces the Mini App with Instagram; openLink keeps the run open behind it. */
function openOutside(e: React.MouseEvent) {
  const a = (e.target as HTMLElement).closest('a[target="_blank"]') as HTMLAnchorElement | null;
  const tg = (window as unknown as { Telegram?: { WebApp?: { openLink?: (u: string) => void; initData?: string } } }).Telegram?.WebApp;
  if (!a || !tg?.openLink || !tg.initData) return;
  e.preventDefault();
  tg.openLink(a.href);
}

function Result({ run, onNew, shared, headers }: { run: SavedRun; onNew?: () => void; shared?: boolean; headers?: () => Record<string, string> }) {
  const a: StudentAnalysis = run.result;
  // Mounted with key={run.id}: a new run starts at step 1.
  const [step, setStep] = useState(0);
  const [nach, setNach] = useState(run.nachala);
  const finalText = nach?.v === 2 && nach.best && !nach.best.keep && nach.text ? nach.text : run.result.rewrite?.script ?? '';
  if (!a.input_ok) {
    return (
      <section className="op-card op-result">
        <div className="op-eyebrow">Разбор не получился</div>
        <p className="op-verdict">{a.verdict}</p>
        {onNew && <button type="button" className="op-ghost" onClick={onNew}>Вставить другой сценарий</button>}
      </section>
    );
  }
  // Runs saved before v5 for an already filmed reel: the rewrite there is an editing plan.
  const oldPlan = !a.v5 && (run.stage === 'filmed' || a.stage === 'filmed');
  const format = a.format && a.format.type !== 'unknown' ? FORMAT_NAME[a.format.type] || a.format.type : null;
  const r = a.viewer_reasons;
  const hdr = headers || (() => ({}));

  const steps: { key: string; title: string; body: React.ReactNode }[] = [
    {
      key: 'stop', title: 'Начало',
      body: (
        <>
          {run.id && (!shared || run.nachala) ? (
            <NachalaBlock runId={run.id} initial={nach} headers={hdr} readOnly={shared} stop={r?.stop} onReady={setNach} />
          ) : (
            <section className="op-card"><ReasonCard title="Остановятся?" v={r?.stop} /></section>
          )}
        </>
      ),
    },
    {
      key: 'share', title: 'Пересылки',
      body: (
        <>
          <section className="op-card">
            <ReasonCard title="Сохранят или перешлют?" v={r?.save_share} isShare />
            <ShansChips s={run.shans} parts={STEP_PARTS.save_share} />
          </section>
        </>
      ),
    },
    {
      key: 'finish', title: 'Досмотр',
      body: (
        <>
          <section className="op-card">
            <ReasonCard title="Досмотрят?" v={r?.finish} />
            <ShansChips s={run.shans} parts={STEP_PARTS.finish} />
          </section>
        </>
      ),
    },
    {
      key: 'text', title: 'Текст',
      body: (
        <section className="op-card op-rewrite">
          <h2 className="op-h2">{oldPlan ? 'Монтажный план' : 'Текст со всеми правками'}</h2>
          {a.top_fixes.length > 0 && (
            <ol className="op-fix op-fix-sm">
              {a.top_fixes.slice(0, 3).map((f, i) => <li key={i}><p className="op-p">{f.text}</p></li>)}
            </ol>
          )}
          {a.rewrite.placeholders.length > 0 && (
            <p className="op-p op-muted">Жёлтым отмечено то, что знаешь только ты: впиши свой пример, цифру или лид-магнит.</p>
          )}
          {finalText !== a.rewrite.script && <p className="op-p op-muted">Начало уже заменено на то, что предложено на шаге «Начало».</p>}
          <pre className="op-script"><WithPlaceholders text={finalText} fill={a.rewrite.placeholders} /></pre>
          <p className="op-p op-muted">Это пример, а не замена: своими словами будет живее.</p>
          <div className="op-row">
            <CopyButton text={finalText} label={oldPlan ? 'Скопировать план' : 'Скопировать текст'} primary />
          </div>
        </section>
      ),
    },
  ];
  if (!shared && run.id) {
    steps.push({
      key: 'stats', title: 'Скрины',
      body: <StatsBlock runId={run.id} initial={run.stats} nachala={nach} headers={hdr} stop={r?.stop} />,
    });
  }
  // Screen 0 is the chance and the verdict; then one step per screen (Sasha 21.11: «каждый экран отдельно, а не листанием вниз»).
  const screens = [{ key: 'shans', title: 'Итог' }, ...steps.map(({ key, title }) => ({ key, title }))];
  const cur = Math.min(step, screens.length - 1);
  const last = cur === screens.length - 1;
  const go = (i: number) => {
    setStep(i);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
  };

  return (
    <div className="op-result op-screens" onClick={openOutside}>
      <div className="op-screen-top">
        {onNew && <button type="button" className="op-back op-back-btn" onClick={onNew}>‹ Все разборы</button>}
        <div className="op-dots" aria-label={`Шаг ${cur + 1} из ${screens.length}`}>
          {screens.map((s, i) => (
            <button key={s.key} type="button" className={i === cur ? 'op-dot op-dot-on' : i < cur ? 'op-dot op-dot-done' : 'op-dot'}
              onClick={() => go(i)} aria-label={s.title} />
          ))}
        </div>
        <div className="op-screen-title">{cur + 1}/{screens.length} · {screens[cur].title}</div>
      </div>

      <div className="op-step" key={screens[cur].key}>
        {cur === 0 ? (
          <>
            <ShansHero key={run.id} run={run} verdict={a.verdict} headers={headers} shared={shared} />
            <p className="op-meta-line op-meta-small">
              Цель: <b>{a.goal === 'conversion' ? 'заявки' : 'охват'}</b>
              {format && <> · Формат: <b>{format}</b></>}
            </p>
          </>
        ) : steps[cur - 1].body}
      </div>

      <div className="op-step-nav">
        {cur > 0 && <button type="button" className="op-ghost op-step-back" onClick={() => go(cur - 1)}>‹</button>}
        {!last && (
          <button type="button" className="op-run op-step-next" onClick={() => go(cur + 1)}>
            Дальше: {screens[cur + 1].title.toLowerCase()} ›
          </button>
        )}
      </div>

      {last && (
        <>
          <details className="op-card op-details">
            <summary>Подробный разбор<span>спрос на тему, предупреждения, балл, критерии, ещё хуки</span></summary>
            <div className="op-sect op-more">
              {shared && (
                <section className="op-card"><h2 className="op-h2">Сценарий</h2><pre className="op-script">{run.script}</pre></section>
              )}
              {run.ladder && <LadderBlock l={run.ladder} />}
              {a.warnings.length > 0 && (
                <section className="op-card op-warn">
                  <h2 className="op-h2">Обрати внимание</h2>
                  <ul className="op-list">{a.warnings.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </section>
              )}
              {a.v5 && a.demand && <DemandBlock demand={a.demand} links={run.demandLinks || []} />}
              <Details a={a} />
            </div>
          </details>
          {!shared && run.shareUrl && <ShareRun url={run.shareUrl} />}
          {onNew && <button type="button" className="op-ghost op-again" onClick={onNew}>Разобрать другой сценарий</button>}
          {shared && <p className="op-p op-muted op-made">Разбор сделан в Оптимизаторе рилсов SASHA TOYZ по методике Каллавея.</p>}
        </>
      )}
    </div>
  );
}

function Feedback({ initData, runId }: { initData: string; runId: string | null }) {
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  async function submit() {
    if (!text.trim() || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/cabinet/optimizator/feedback', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...(initData ? { 'x-tg-init-data': initData } : {}) },
        body: JSON.stringify({ text, runId: runId || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Не получилось отправить.');
      setText('');
      setState('sent');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Не получилось отправить.');
      setState('error');
    }
  }
  return (
    <details className="op-card op-details op-fb">
      <summary>Пожелания и баги<span>оптимизатор в тестовом режиме, напиши, что поправить</span></summary>
      <div className="op-sect">
        <p className="op-p op-muted">
          Разбор не попал, что-то сломалось или хочется новую функцию, напиши. Придёт Саше лично{runId ? ', вместе со ссылкой на открытый разбор' : ''}.
        </p>
        {state === 'sent' ? (
          <div className="op-fb-ok">
            Спасибо, получил! <button type="button" onClick={() => setState('idle')}>написать ещё</button>
          </div>
        ) : (
          <>
            <textarea
              className="op-fb-text"
              rows={4}
              maxLength={2000}
              placeholder="Например: правка про первую фразу не подходит, у меня ролик-история"
              value={text}
              onChange={(e) => { setText(e.target.value); if (state === 'error') setState('idle'); }}
            />
            <button type="button" className="op-copy op-copy-primary op-fb-send" disabled={!text.trim() || state === 'sending'} onClick={submit}>
              {state === 'sending' ? 'Отправляю…' : 'Отправить'}
            </button>
            {state === 'error' && <div className="op-error" role="alert">{err}</div>}
          </>
        )}
      </div>
    </details>
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
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'ok' | 'shared' | 'shared_bad'>('load');
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [script, setScript] = useState('');
  const [instagram, setInstagram] = useState('');
  const [ladderOn, setLadderOn] = useState(false);
  const [tier, setTier] = useState(0);
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
      // Shared link (/optimizator?r=<token>): read-only, no login.
      const shareTok = new URLSearchParams(window.location.search).get('r');
      if (shareTok) {
        try {
          const res = await fetch(`/api/optimizator/shared?t=${encodeURIComponent(shareTok)}`, { cache: 'no-store' });
          const data = await res.json().catch(() => ({}));
          if (stop) return;
          if (data.run) { setRun(data.run); setState('shared'); } else setState('shared_bad');
        } catch { if (!stop) setState('shared_bad'); }
        return;
      }
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
        setLadderOn(Boolean(data.ladder));
        setTier(Number(data.tier) || 0);
        if (data.instagram) setInstagram(`@${data.instagram}`);
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
  const canRun = !busySince && len >= SCRIPT_MIN && len <= SCRIPT_MAX && left > 0;

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
        body: JSON.stringify({ script, instagram: instagram.trim() || undefined }),
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
          score: data.run.result.overall_score, shans: data.run.shans?.hitShare ?? null,
          firstLine: firstLine(script),
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

      {state === 'shared' || state === 'shared_bad' ? (
        <header className="op-top">
          <div className="op-brand">Разбор сценария рилса</div>
          <div className="op-sub">Оптимизатор рилсов SASHA TOYZ: спрос на тему, что поправить и пример текста</div>
        </header>
      ) : (
        <header className="op-top">
          <a className="op-back" href="/dostup">‹ Кабинет</a>
          <div className="op-brand">Оптимизатор рилсов</div>
          <div className="op-sub">Вставь текст ролика. Покажу, есть ли спрос на тему, главные правки и переписанный текст</div>
          <OpenInBrowser path="/optimizator" className="op-browser" />
        </header>
      )}

      {state === 'shared' && run && <Result key={run.id} run={run} shared />}
      {state === 'shared_bad' && (
        <div className="op-card"><p className="op-p">Разбор по этой ссылке не открылся. Попроси прислать ссылку ещё раз.</p></div>
      )}

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
          {!run && (
          <section className="op-card op-form">
            <div className="op-form-head">
              <label className="op-label" htmlFor="op-script">Текст ролика</label>
              <span className={left > 0 ? 'op-quota' : 'op-quota op-quota-out'}>
                {limit >= 100000 ? 'без лимита' : `осталось ${left} из ${limit} в этом месяце`}
              </span>
            </div>
            <textarea
              id="op-script"
              className="op-textarea"
              placeholder="Вставь текст ролика целиком: с первой фразы до призыва. Можно и расшифровку уже снятого"
              value={script}
              maxLength={SCRIPT_MAX}
              onChange={(e) => setScript(e.target.value)}
              disabled={!!busySince}
            />
            <div className="op-count">
              {len < SCRIPT_MIN ? `ещё ${SCRIPT_MIN - len} символов до минимума` : `${len} / ${SCRIPT_MAX}`}
            </div>

            {ladderOn && (
              <div className="op-ig">
                <label className="op-label" htmlFor="op-ig">Ник в инстаграме <span>для сравнения с твоими роликами</span></label>
                <input
                  id="op-ig"
                  className="op-input"
                  placeholder="@твой_ник"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  disabled={!!busySince}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={64}
                />
                <p className="op-hint">Сравню текст с твоими прошлыми рилсами и скажу, сильнее он или слабее. Нужен открытый аккаунт и хотя бы 4 рилса с речью</p>
              </div>
            )}

            <button type="button" className="op-run" onClick={submit} disabled={!canRun}>
              {busySince ? 'Разбираю…' : left > 0 ? 'Разобрать' : 'Лимит на месяц исчерпан'}
            </button>
            {error && <div className="op-error" role="alert">{error}</div>}
          </section>
          )}

          {busySince && <Waiting startedAt={busySince} />}

          <div ref={resultRef} className="op-anchor">
            {run && <Result key={run.id} run={run} onNew={startNew} headers={authHeaders} />}
          </div>

          {run && <Feedback initData={initData.current} runId={run.id || null} />}

          {!run && tier >= 2 && <InstagramBlock initData={initData.current} />}

          {!run && items.length > 0 && (
            <section className="op-history">
              <div className="op-label">Прошлые разборы</div>
              {items.map((h) => (
                <button type="button" key={h.id} className="op-hist"
                  onClick={() => loadRun(h.id)}>
                  {h.shans !== null && h.shans !== undefined
                    ? <span className={`op-hist-score ${h.shans >= 0.53 ? 'op-good' : h.shans >= 0.45 ? 'op-mid' : 'op-low'}`}>{Math.round(h.shans * 100)}%</span>
                    : <span className={`op-hist-score ${h.score !== null ? scoreTone100(h.score) : ''}`}>{h.score ?? '·'}</span>}
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

      <style>{BLOCKS_CSS}</style>
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
        .op-textarea:focus { outline: 2px solid var(--op-accent); outline-offset: -1px; border-color: transparent; }
        .op-count { font-size: 11.5px; color: var(--op-muted); text-align: right; margin-top: 5px; font-variant-numeric: tabular-nums; }
        .op-ig { margin-top: 14px; }
        .op-ig .op-label span { font-weight: 500; margin-left: 4px; }
        .op-input {
          width: 100%; border: 1px solid var(--op-line); border-radius: 12px; padding: 11px 13px;
          font-family: inherit; font-size: 15px; color: var(--op-text); background: var(--op-bg);
        }
        .op-input:focus { outline: 2px solid var(--op-accent); outline-offset: -1px; border-color: transparent; }
        .op-hint { margin: 6px 0 0; font-size: 12px; line-height: 1.4; color: var(--op-muted); }

        .op-ladder { border-color: var(--op-text); }
        .op-ladder-head { margin: 0; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 19px; line-height: 1.3; letter-spacing: -0.015em; }
        .op-ladder-head b { font-weight: 900; white-space: nowrap; }
        .op-ladder-head b.op-good { color: var(--op-good); } .op-ladder-head b.op-mid { color: var(--op-mid); } .op-ladder-head b.op-low { color: var(--op-low); }
        .op-ladder-dots { display: flex; gap: 6px; margin-top: 12px; }
        .op-ladder-dots i { flex: 1 1 0; height: 8px; border-radius: 99px; background: var(--op-line); }
        .op-ladder-dots i.op-good { background: var(--op-good); } .op-ladder-dots i.op-mid { background: var(--op-mid); } .op-ladder-dots i.op-low { background: var(--op-low); }
        .op-ladder-verdict { font-weight: 700; margin-top: 12px; }
        .op-ladder-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .op-conf { flex: none; margin-top: 3px; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 700; line-height: 1.2; white-space: nowrap; background: var(--op-line); color: var(--op-muted); }
        .op-conf-yes { background: var(--op-good-soft, var(--op-line)); color: var(--op-good); }
        .op-ladder-head b.op-neutral { color: var(--op-text); }
        .op-ladder-dots i.op-neutral { background: var(--op-muted); }
        .op-ladder-unsure { font-weight: 600; color: var(--op-muted); }
        .op-summary .op-verdict { margin: 0; }
        .op-ladder-list { margin-top: 12px; border-top: 1px solid var(--op-line); padding-top: 10px; }
        .op-ladder-list summary { cursor: pointer; list-style: none; font-size: 13.5px; font-weight: 700; color: var(--op-accent); }
        .op-ladder-list summary::-webkit-details-marker { display: none; }
        .op-ladder-list summary::before { content: '+ '; }
        .op-ladder-list[open] summary::before { content: '− '; }
        .op-ladder-list ul { list-style: none; padding: 0; margin: 10px 0 0; display: grid; gap: 8px; }
        .op-ladder-list li { display: flex; flex-direction: column; gap: 3px; background: var(--op-bg); border: 1px solid var(--op-line); border-radius: 12px; padding: 10px 12px; }
        .op-ladder-res { align-self: flex-start; font-size: 11.5px; font-weight: 800; padding: 2px 8px; border-radius: 999px; color: var(--op-low); background: var(--op-low-soft); }
        .op-ladder-won { color: var(--op-good); background: var(--op-good-soft); }
        .op-ladder-text { font-size: 13.5px; line-height: 1.45; font-weight: 600; word-break: break-word; }
        .op-ladder-out { font-size: 12px; line-height: 1.4; color: var(--op-muted); }

        .op-run {
          width: 100%; margin-top: 16px; cursor: pointer; border: none; background: var(--op-accent);
          color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
          font-size: 16px; padding: 15px 18px; border-radius: 12px;
        }
        .op-run:disabled { background: var(--op-line); color: var(--op-muted); cursor: default; }
        .op-run:not(:disabled):active { transform: translateY(1px); }
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
        .op-shans-top { display: flex; align-items: center; gap: 14px; margin-top: 8px; }
        .op-shans-n { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 60px; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
        .op-shans-n.op-good { color: var(--op-good); } .op-shans-n.op-mid { color: var(--op-mid); } .op-shans-n.op-low { color: var(--op-low); }
        .op-shans-l { display: flex; flex-direction: column; gap: 3px; font-weight: 800; font-size: 16px; line-height: 1.25; }
        .op-shans-l span { font-weight: 600; font-size: 12.5px; color: var(--op-muted); }
        .op-shans-scale { display: flex; gap: 5px; margin-top: 12px; }
        .op-shans-scale i { flex: 1 1 0; height: 7px; border-radius: 99px; background: var(--op-line); }
        .op-shans-scale i.op-good { background: var(--op-good); } .op-shans-scale i.op-mid { background: var(--op-mid); } .op-shans-scale i.op-low { background: var(--op-low); }
        .op-shans-note { margin: 8px 0 0; font-size: 12px; line-height: 1.4; color: var(--op-muted); }
        .op-shans .op-verdict { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--op-line); }
        .op-shans-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .op-spinner-sm { width: 14px; height: 14px; border-width: 2px; margin: 0 6px -2px 0; }
        .op-stepper { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 4px; margin: 4px 0 12px; }
        .op-stepper::-webkit-scrollbar { display: none; }
        .op-st { min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; border: 1px solid var(--op-line); background: var(--op-surface); color: var(--op-muted); font-family: inherit; font-weight: 700; font-size: 11px; letter-spacing: -0.03em; padding: 8px 0 7px; border-radius: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 52px; }
        @media (max-width: 380px) { .op-st { font-size: 10px; letter-spacing: -0.04em; } }
        .op-st b { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--op-bg); font-size: 11.5px; font-weight: 800; }
        .op-st-on { border-color: var(--op-accent); color: var(--op-text); }
        .op-st-on b { background: var(--op-accent); color: oklch(1 0 0); }
        .op-st-done b { background: var(--op-good-soft); color: var(--op-good); }
        .op-step { animation: op-in .3s ease-out both; }
        .op-screen-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
        .op-back-btn { background: none; border: none; padding: 0; cursor: pointer; font-family: inherit; margin: 0; }
        .op-dots { display: flex; gap: 5px; flex: 1 1 100%; order: 3; }
        .op-dot { flex: 1 1 0; height: 6px; border-radius: 99px; border: none; padding: 0; cursor: pointer; background: var(--op-line); }
        .op-dot-done { background: var(--op-good); } .op-dot-on { background: var(--op-accent); }
        .op-screen-title { margin-left: auto; font-size: 12px; font-weight: 700; color: var(--op-muted); }
        .op-meta-small { font-size: 13px; color: var(--op-muted); padding: 0 4px; margin: 0 0 12px; }
        .op-step-nav .op-step-back { font-size: 18px; padding: 11px 18px; }
        .op-step-nav { display: flex; gap: 8px; margin: 4px 0 14px; }
        .op-step-nav .op-step-back { width: auto; flex: 0 0 auto; margin: 0; padding: 13px 16px; }
        .op-step-nav .op-step-next { margin: 0; flex: 1 1 auto; }
        .op-fix-sm li { padding: 7px 0 7px 28px; }
        .op-fix-sm li::before { font-size: 16px; }
        .op-more { display: grid; gap: 0; }
        .op-more > .op-card, .op-more > details { margin-bottom: 10px; }
        .op-result { animation: op-in .45s ease-out both; }
        @keyframes op-in { from { opacity: 0; transform: translateY(8px); } }
        .op-hero { border-color: var(--op-text); }
        .op-meta { padding: 4px 2px 12px; }
        .op-meta-line { margin: 6px 0 0; font-size: 15px; line-height: 1.4; }
        .op-meta-line b { font-weight: 800; }
        .op-meta-why { margin: 4px 0 0; font-size: 12.5px; line-height: 1.45; color: var(--op-muted); }
        .op-scoreline { display: flex; align-items: center; gap: 14px; }
        .op-score-n { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 56px; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
        .op-score-n.op-good { color: var(--op-good); } .op-score-n.op-mid { color: var(--op-mid); } .op-score-n.op-low { color: var(--op-low); }
        .op-score-l { font-size: 13px; font-weight: 700; line-height: 1.35; }
        .op-score-l span { font-weight: 600; color: var(--op-muted); }
        .op-verdict { font-size: 15.5px; line-height: 1.5; font-weight: 600; margin: 12px 0 0; }
        .op-list { margin: 0; padding-left: 16px; list-style: disc; font-size: 13px; line-height: 1.5; color: var(--op-muted); }
        .op-list li + li { margin-top: 4px; }

        .op-chip { font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
        .op-chip-in_flow { color: var(--op-good); background: var(--op-good-soft); }
        .op-chip-weak { color: var(--op-mid); background: var(--op-mid-soft); }
        .op-chip-none { color: var(--op-low); background: var(--op-low-soft); }
        .op-chip-no_data { color: var(--op-muted); background: var(--op-bg); border: 1px solid var(--op-line); }
        .op-links { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 8px; }
        .op-links a {
          display: block; text-decoration: none; color: var(--op-text); background: var(--op-bg);
          border: 1px solid var(--op-line); border-radius: 12px; padding: 10px 12px;
        }
        .op-links a:hover { border-color: var(--op-accent); }
        .op-link-top { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
        .op-link-top b { font-size: 13.5px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
        .op-ratio { flex: 0 0 auto; font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 13px; color: var(--op-good); font-variant-numeric: tabular-nums; }
        .op-link-kind { flex: 0 0 auto; margin-left: auto; font-size: 11.5px; font-weight: 700; color: var(--op-accent); }
        .op-link-text {
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          margin-top: 4px; font-size: 13px; line-height: 1.45; color: var(--op-muted); word-break: break-word;
        }
        .op-link-line { color: var(--op-text); font-weight: 600; }
        .op-note { margin: 8px 0 0; font-size: 11.5px; color: var(--op-muted); line-height: 1.4; }

        .op-details { padding: 0; }
        .op-details summary {
          cursor: pointer; list-style: none; padding: 16px 18px; font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 800; font-size: 16px;
        }
        .op-details summary::-webkit-details-marker { display: none; }
        .op-details summary::before { content: '+ '; color: var(--op-accent); }
        .op-details[open] summary::before { content: '− '; }
        .op-details summary span { display: block; font-family: 'Manrope', system-ui, sans-serif; font-weight: 500; color: var(--op-muted); font-size: 12px; margin: 3px 0 0 14px; line-height: 1.35; }
        .op-sect { padding: 14px 18px 16px; border-top: 1px solid var(--op-line); }
        .op-h3 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; letter-spacing: -0.01em; margin: 0 0 6px; }
        .op-gate-head .op-h3 { margin: 0; }
        .op-reach { display: flex; align-items: center; gap: 12px; }
        .op-reach-n { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 32px; line-height: 1; font-variant-numeric: tabular-nums; }
        .op-reach-n.op-good { color: var(--op-good); } .op-reach-n.op-mid { color: var(--op-mid); } .op-reach-n.op-low { color: var(--op-low); }

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
        .op-quote-ex { font-size: 14px; margin-top: 7px; }
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
        .op-reasons { display: grid; gap: 14px; margin-top: 10px; }
        .op-reason + .op-reason { padding-top: 14px; border-top: 1px solid var(--op-line); }
        .op-reason-ans { display: inline-flex; align-items: baseline; gap: 8px; font-size: 12.5px; font-weight: 700; }
        .op-reason-ans b { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 18px; font-variant-numeric: tabular-nums; }
        .op-reason-ans small { font-size: 11px; color: var(--op-muted); font-weight: 700; }
        .op-reason-ans.op-good { color: var(--op-good); } .op-reason-ans.op-mid { color: var(--op-mid); } .op-reason-ans.op-low { color: var(--op-low); }
        .op-reason-fix { color: var(--op-muted); }
        .op-reason-fix::before { content: '→ '; }
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
        .op-edit {
          font-size: 13px; font-weight: 600; color: var(--op-accent);
          border: 1px dashed var(--op-accent); border-radius: 6px; padding: 1px 5px;
          box-decoration-break: clone; -webkit-box-decoration-break: clone;
        }
        .op-edit-line {
          display: block; margin: 8px 0; padding: 7px 10px 7px 11px; border-left: 3px solid var(--op-accent);
          background: var(--op-accent-soft); border-radius: 4px 8px 8px 4px;
          font-size: 13px; line-height: 1.45; font-weight: 600; color: var(--op-text);
        }
        .op-edit-line:first-child { margin-top: 0; }
        .op-edit-line:last-child { margin-bottom: 0; }

        .op-fix { list-style: none; counter-reset: fix; padding: 0; margin: 0; }
        .op-fix li { counter-increment: fix; position: relative; padding: 10px 0 10px 34px; border-top: 1px solid var(--op-line); }
        .op-fix li:first-child { border-top: none; padding-top: 0; }
        .op-fix li::before { content: counter(fix); position: absolute; left: 0; font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 20px; color: var(--op-accent); line-height: 1.1; }
        .op-fix li:first-child::before { top: 0; }
        .op-fix .op-p { margin-top: 0; }
        .op-warn { background: var(--op-mid-soft); }
        .op-warn .op-list { color: var(--op-text); }

        .op-ghost {
          display: block; width: 100%; cursor: pointer; background: none; border: 1px solid var(--op-line);
          color: var(--op-text); font-family: inherit; font-weight: 700; font-size: 14px; padding: 13px; border-radius: 12px; margin-top: 12px;
        }
        .op-ghost:hover { border-color: var(--op-accent); color: var(--op-accent); }
        .op-again { margin: 4px 0 12px; }
        .op-share .op-row { margin-top: 12px; }
        .op-fb-text {
          width: 100%; border: 1px solid var(--op-line); border-radius: 12px; padding: 12px 14px;
          font: inherit; font-size: 15px; line-height: 1.45; color: var(--op-text); background: var(--op-bg); resize: vertical;
        }
        .op-fb-text:focus { outline: 2px solid var(--op-accent); outline-offset: 1px; }
        .op-fb-send { width: 100%; margin-top: 10px; }
        .op-fb-send:disabled { background: var(--op-line); border-color: var(--op-line); color: var(--op-muted); cursor: default; }
        .op-fb-ok { font-size: 14.5px; font-weight: 600; color: var(--op-good); background: var(--op-good-soft); border-radius: 12px; padding: 12px 14px; }
        .op-fb-ok button { margin-left: 6px; border: none; background: none; padding: 0; color: var(--op-muted); font: inherit; text-decoration: underline; cursor: pointer; }
        .op-made { text-align: center; margin: 8px 0 12px; font-size: 13px; }

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
