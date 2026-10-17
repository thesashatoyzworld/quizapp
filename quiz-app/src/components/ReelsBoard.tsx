'use client';

import { useState, type ReactNode } from 'react';
import {
  COLUMNS, columnOf, ddmm, fmt, summarize, weekday,
  type Column, type ReelBriefView, type ReelVersionView,
} from '@/lib/reels/plan';

// Доска роликов клиента: от ТЗ монтажёру до выложенного рилса. Один рендер
// на кабинет (/roliki) и админку: Саша видит ровно то, что видит клиент,
// а кнопки каждая сторона подставляет свои.

interface Props {
  briefs: ReelBriefView[];
  versions: ReelVersionView[];
  today: string;
  onOpenBrief?: (b: ReelBriefView) => void;
  briefExtra?: (b: ReelBriefView) => ReactNode;
  versionExtra?: (v: ReelVersionView, col: Column) => ReactNode;
  doneExtra?: ReactNode;
}

const DOT: Record<Column, string> = { tz: 'var(--rl-tz)', done: 'var(--rl-done)', plan: 'var(--rl-plan)', up: 'var(--rl-up)' };
const PILL: Record<string, string> = { ok: 'rl-p-ok', go: 'rl-p-go', wait: 'rl-p-wait' };
/** Сколько карточек «в ТЗ» видно сразу: их бывает два десятка. */
const TZ_VISIBLE = 8;

export default function ReelsBoard({ briefs, versions, today, onOpenBrief, briefExtra, versionExtra, doneExtra }: Props) {
  const [showAllTz, setShowAllTz] = useState(false);
  const live = versions.filter((v) => v.stage !== 'skip');
  const sum = summarize(versions);
  const briefLabel = new Map(briefs.map((b) => [b.id, b.label]));

  function card(v: ReelVersionView, col: Column) {
    const label = [briefLabel.get(v.briefId), v.version].filter(Boolean).join(' · ');
    return (
      <div className="rl-card" key={v.id}>
        <div className="rl-card-top"><span className="rl-num">{v.reel}</span><span className="rl-title">{v.title}</span></div>
        {label && <div className="rl-ver">{label}</div>}
        {col === 'plan' && v.planDate && (
          <div className="rl-date">{weekday(v.planDate)} {ddmm(v.planDate)}{v.planDate < today ? ' · просрочено' : ''}</div>
        )}
        {col === 'up' && (
          <>
            <div className="rl-nums">
              {v.statsAt
                ? <><b>{fmt(v.plays)}</b> просм. · {fmt(v.likes)} лайк. · {fmt(v.comments)} комм.</>
                : 'просмотры: не проверено'}
            </div>
            <div className="rl-note">
              {v.uploadedAt ? `выложен ${ddmm(v.uploadedAt)}` : 'выложен'}
              {v.code && <> · <a href={`https://www.instagram.com/reel/${v.code}/`} target="_blank" rel="noopener noreferrer">открыть</a></>}
            </div>
          </>
        )}
        {v.note && <div className="rl-note">{v.note}</div>}
        {versionExtra?.(v, col)}
      </div>
    );
  }

  return (
    <div className="rl-board-wrap">
      {versions.length > 0 && (
        <div className="rl-strip">
          <div className="rl-stat"><b>{sum.uploaded} / {sum.total}</b><span>версий выложено</span></div>
          <div className="rl-stat">
            <b>{sum.plays == null ? 'не проверено' : fmt(sum.plays)}</b>
            <span>просмотров всего{sum.statsAt ? `, на ${ddmm(sum.statsAt)}` : ''}{sum.unchecked ? `, без проверки ${sum.unchecked}` : ''}</span>
          </div>
          {sum.best && <div className="rl-stat"><b>{fmt(sum.best.plays)}</b><span>лучший: {sum.best.title}</span></div>}
          <div className="rl-stat">
            <b>{sum.next?.planDate ? `${weekday(sum.next.planDate)} ${ddmm(sum.next.planDate)}` : 'не назначена'}</b>
            <span>{sum.next ? `следующая: ${sum.next.title}` : 'следующая выкладка'}</span>
          </div>
        </div>
      )}

      <section>
        <h2 className="rl-h2">ТЗ монтажёру</h2>
        <div className="rl-briefs">
          {briefs.length === 0 && <div className="rl-empty">ТЗ пока не внесены.</div>}
          {briefs.map((b) => {
            const vs = live.filter((v) => v.briefId === b.id);
            const cnt = (c: Column) => vs.filter((v) => columnOf(v) === c).length;
            return (
              <div className="rl-brief" key={b.id}>
                {b.stateLabel && <span className={`rl-pill ${PILL[b.state] ?? 'rl-p-wait'}`}>{b.stateLabel}</span>}
                <div className="rl-brief-t">{b.title}</div>
                {b.summary && <div className="rl-m">{b.summary}</div>}
                <div className="rl-m">{vs.length} верс. · в ТЗ {cnt('tz')} · смонт. {cnt('done') + cnt('plan')} · выложено {cnt('up')}</div>
                {b.hasHtml && onOpenBrief && (
                  <button type="button" className="rl-link" onClick={() => onOpenBrief(b)}>открыть ТЗ</button>
                )}
                {briefExtra?.(b)}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="rl-h2">Ролики по этапам</h2>
        <div className="rl-board">
          {COLUMNS.map((c) => {
            const items = live.filter((v) => columnOf(v) === c.key);
            if (c.key === 'plan') items.sort((a, b) => ((a.planDate ?? '') < (b.planDate ?? '') ? -1 : 1));
            else if (c.key === 'up') items.sort((a, b) => ((a.uploadedAt ?? '') < (b.uploadedAt ?? '') ? 1 : -1));
            else items.sort((a, b) => a.order - b.order);
            const lim = c.key === 'tz' && !showAllTz ? TZ_VISIBLE : items.length;
            return (
              <div className="rl-col" key={c.key}>
                <header><b><span className="rl-dot" style={{ background: DOT[c.key] }} />{c.name}</b><span>{items.length}</span></header>
                {c.key === 'done' && items.length > 0 && doneExtra}
                {items.length === 0 && <div className="rl-empty">пусто</div>}
                {items.slice(0, lim).map((v) => card(v, c.key))}
                {items.length > lim && (
                  <button type="button" className="rl-more" onClick={() => setShowAllTz(true)}>ещё {items.length - lim}</button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export const REELS_BOARD_CSS = `
  .rl-board-wrap {
    --rl-bg: oklch(0.97 0.006 75); --rl-text: oklch(0.16 0.015 55);
    --rl-muted: oklch(0.46 0.012 55); --rl-accent: oklch(0.60 0.19 52);
    --rl-accent-soft: oklch(0.93 0.04 52); --rl-surface: oklch(1 0 0);
    --rl-line: oklch(0.90 0.008 75);
    --rl-tz: oklch(0.52 0.16 285); --rl-tz-soft: oklch(0.94 0.03 285);
    --rl-done: oklch(0.55 0.11 80); --rl-done-soft: oklch(0.95 0.04 85);
    --rl-plan: oklch(0.50 0.11 245); --rl-plan-soft: oklch(0.94 0.03 245);
    --rl-up: oklch(0.52 0.12 155); --rl-up-soft: oklch(0.94 0.04 155);
    display: grid; gap: 24px; color: var(--rl-text); font-family: 'Manrope', system-ui, sans-serif;
    font-size: 15px; line-height: 1.45;
  }
  .rl-board-wrap * { box-sizing: border-box; }
  .rl-board-wrap a { color: var(--rl-accent); }
  .rl-h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--rl-muted); margin: 0 0 10px; }
  .rl-strip { display: flex; flex-wrap: wrap; gap: 10px; }
  .rl-stat { background: var(--rl-surface); border: 1px solid var(--rl-line); border-radius: 12px; padding: 10px 14px; min-width: 0; }
  .rl-stat b { display: block; font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .rl-stat span { color: var(--rl-muted); font-size: 12px; }
  .rl-briefs { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
  .rl-brief { background: var(--rl-surface); border: 1px solid var(--rl-line); border-radius: 14px; padding: 14px 16px; display: grid; gap: 6px; min-width: 0; align-content: start; }
  .rl-brief-t { font-weight: 700; }
  .rl-m { color: var(--rl-muted); font-size: 13px; }
  .rl-pill { justify-self: start; font-size: 12px; font-weight: 700; border-radius: 999px; padding: 3px 10px; }
  .rl-p-wait { color: var(--rl-done); background: var(--rl-done-soft); }
  .rl-p-go { color: var(--rl-plan); background: var(--rl-plan-soft); }
  .rl-p-ok { color: var(--rl-up); background: var(--rl-up-soft); }
  .rl-link { justify-self: start; border: none; background: none; padding: 4px 0; color: var(--rl-accent); font: inherit; font-weight: 700; font-size: 14px; cursor: pointer; }
  .rl-board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: start; }
  .rl-col { background: oklch(0.985 0.004 75); border: 1px solid var(--rl-line); border-radius: 14px; padding: 12px; display: grid; gap: 8px; min-width: 0; }
  .rl-col > header { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 2px 4px 4px; }
  .rl-col > header b { font-weight: 700; font-size: 14px; }
  .rl-col > header span { font-weight: 700; font-size: 13px; color: var(--rl-muted); }
  .rl-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: 1px; }
  .rl-card { background: var(--rl-surface); border: 1px solid var(--rl-line); border-radius: 10px; padding: 10px 12px; display: grid; gap: 5px; min-width: 0; }
  .rl-card-top { display: flex; gap: 8px; align-items: baseline; min-width: 0; }
  .rl-num { font-size: 12px; font-weight: 700; color: var(--rl-accent); background: var(--rl-accent-soft); border-radius: 5px; padding: 1px 6px; flex: none; }
  .rl-title { font-weight: 600; font-size: 14px; min-width: 0; overflow-wrap: anywhere; }
  .rl-ver { font-size: 12px; color: var(--rl-muted); overflow-wrap: anywhere; }
  .rl-nums { font-size: 13px; font-variant-numeric: tabular-nums; color: var(--rl-muted); }
  .rl-nums b { color: var(--rl-text); }
  .rl-date { font-size: 13px; font-weight: 700; color: var(--rl-plan); }
  .rl-note { font-size: 12px; color: var(--rl-muted); }
  .rl-empty { color: var(--rl-muted); border: 1px dashed var(--rl-line); border-radius: 10px; padding: 12px; font-size: 13px; }
  .rl-more { border: none; background: none; color: var(--rl-muted); font: inherit; font-size: 13px; padding: 4px; cursor: pointer; text-align: left; }
  .rl-acts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
  .rl-btn { font: inherit; font-size: 13px; font-weight: 600; border: 1px solid var(--rl-line); background: transparent; color: var(--rl-text); border-radius: 8px; padding: 6px 10px; cursor: pointer; }
  .rl-btn-primary { background: var(--rl-accent); border-color: var(--rl-accent); color: #fff; }
  .rl-btn:disabled { opacity: .5; cursor: default; }
  .rl-form { display: flex; flex-wrap: wrap; gap: 6px; }
  .rl-input { flex: 1 1 160px; min-width: 0; font: inherit; font-size: 16px; color: var(--rl-text); background: var(--rl-bg); border: 1px solid var(--rl-line); border-radius: 8px; padding: 6px 9px; }
  .rl-err { color: oklch(0.55 0.19 30); font-size: 12px; width: 100%; }
  @media (max-width: 980px) { .rl-board { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 600px) { .rl-board { grid-template-columns: 1fr; } }
`;
