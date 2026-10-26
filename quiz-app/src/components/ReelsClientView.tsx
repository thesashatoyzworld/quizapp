'use client';

import { type ReactNode } from 'react';
import { addDays, ddmm, fmt, SAME_REEL_GAP_DAYS, type ReelBriefView, type ReelVersionView } from '@/lib/reels/plan';

// «Ролики» глазами клиента: что выложить сейчас, что готово, что в монтаже,
// что уже выложено. Без внутренней кухни (номера ТЗ, версии файлов, этапы),
// её Саша видит на своей доске (ReelsBoard).

interface Props {
  briefs: ReelBriefView[];
  versions: ReelVersionView[];
  today: string;
  /** Кнопка «выложил» и форма ссылки, их подставляет страница. */
  publish: (v: ReelVersionView) => ReactNode;
  onOpenBrief?: (b: ReelBriefView) => void;
}

/** «04-short-gg.mp4» → «короткая, в начале ты в кадре». */
export function versionLabel(version: string): string {
  const m = version.match(/(short|long)-(gg|broll)/);
  if (m) return `${m[1] === 'short' ? 'короткая' : 'длинная'}, ${m[2] === 'gg' ? 'в начале ты в кадре' : 'в начале видео без тебя'}`;
  return version === 'одна версия' ? '' : version;
}

/** «25.09 v3» → «запись 25.09». */
function recordLabel(b: ReelBriefView | undefined): string {
  const date = b?.label?.match(/\d{2}\.\d{2}/)?.[0];
  return date ? `запись ${date}` : '';
}

/** Пометки для клиента начинаются с «Нужно от тебя», остальное внутреннее. */
function clientNote(v: ReelVersionView): string {
  return v.note.startsWith('Нужно от тебя') ? v.note : '';
}

interface Reel { key: string; title: string; brief?: ReelBriefView; versions: ReelVersionView[] }

function groupReels(vs: ReelVersionView[], briefs: Map<string, ReelBriefView>): Reel[] {
  const map = new Map<string, Reel>();
  for (const v of [...vs].sort((a, b) => a.order - b.order)) {
    const key = `${v.briefId}:${v.reel}:${v.title}`;
    if (!map.has(key)) map.set(key, { key, title: v.title, brief: briefs.get(v.briefId), versions: [] });
    map.get(key)!.versions.push(v);
  }
  return [...map.values()];
}

export default function ReelsClientView({ briefs, versions, today, publish, onOpenBrief }: Props) {
  const briefMap = new Map(briefs.map((b) => [b.id, b]));
  const live = versions.filter((v) => v.stage !== 'skip');
  const up = live.filter((v) => v.stage === 'up').sort((a, b) => ((a.uploadedAt ?? '') < (b.uploadedAt ?? '') ? 1 : -1));
  const ready = live.filter((v) => v.stage === 'done');
  const inWork = live.filter((v) => v.stage === 'tz');

  // Следующей идёт готовая версия ролика, который не выкладывали последние дни.
  const recent = new Set(up.filter((v) => v.uploadedAt && v.uploadedAt > addDays(today, -SAME_REEL_GAP_DAYS))
    .map((v) => `${v.briefId}:${v.reel}`));
  const queue = [...ready].sort((a, b) => (a.planDate ?? '9') < (b.planDate ?? '9') ? -1 : (a.planDate ?? '9') > (b.planDate ?? '9') ? 1 : a.order - b.order);
  const next = queue.find((v) => !recent.has(`${v.briefId}:${v.reel}`)) ?? queue[0];

  const plays = up.reduce((s, v) => s + (v.plays ?? 0), 0);
  const readyReels = groupReels(ready, briefMap);
  const workReels = groupReels(inWork, briefMap);

  return (
    <div className="rc">
      {next ? (
        <section className="rc-next">
          <div className="rc-kicker">Выложить следующим</div>
          <div className="rc-next-t">{next.title}</div>
          <div className="rc-next-v">{[versionLabel(next.version), recordLabel(briefMap.get(next.briefId))].filter(Boolean).join(' · ')}</div>
          {publish(next)}
          <p className="rc-hint">В пробные по одному ролику в день. Другую версию того же ролика не раньше чем через день.</p>
        </section>
      ) : (
        <section className="rc-next rc-next-empty">
          <div className="rc-kicker">Выложить следующим</div>
          <div className="rc-next-v">Готовых роликов пока нет, монтажёр собирает следующие.</div>
        </section>
      )}

      {readyReels.length > 0 && (
        <section>
          <h2 className="rc-h">Готово к выкладке <span>{readyReels.length}</span></h2>
          {readyReels.map((r) => (
            <details className="rc-reel" key={r.key}>
              <summary>
                <span className="rc-reel-t">{r.title}</span>
                <span className="rc-reel-m">{r.versions.length} {r.versions.length === 1 ? 'версия' : 'версии'}</span>
              </summary>
              {r.versions.map((v) => (
                <div className="rc-ver" key={v.id}>
                  <span>{versionLabel(v.version) || 'единственная версия'}</span>
                  {publish(v)}
                </div>
              ))}
            </details>
          ))}
        </section>
      )}

      {workReels.length > 0 && (
        <section>
          <h2 className="rc-h">В монтаже <span>{workReels.length}</span></h2>
          <div className="rc-list">
            {workReels.map((r) => {
              const note = r.versions.map(clientNote).find(Boolean);
              return (
                <div className="rc-row" key={r.key}>
                  <div className="rc-row-t">{r.title}</div>
                  <div className="rc-row-m">
                    {recordLabel(r.brief)}
                    {r.brief?.hasHtml && onOpenBrief && (
                      <> · <button type="button" className="rc-link" onClick={() => onOpenBrief(r.brief!)}>ТЗ монтажёру</button></>
                    )}
                  </div>
                  {note && <div className="rc-need">{note}</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="rc-h">Выложено <span>{up.length}</span></h2>
        {up.length === 0 ? (
          <div className="rc-row-m">Пока ничего. Выложишь первый, и здесь появятся просмотры.</div>
        ) : (
          <>
            <div className="rc-total"><b>{fmt(plays)}</b> просмотров всего</div>
            <div className="rc-list">
              {up.map((v) => (
                <a className="rc-row rc-up" key={v.id} href={v.code ? `https://www.instagram.com/reel/${v.code}/` : undefined}
                  target="_blank" rel="noopener noreferrer">
                  <div className="rc-row-t">{v.title}</div>
                  <div className="rc-row-m">
                    {v.uploadedAt ? `выложен ${ddmm(v.uploadedAt)}` : 'выложен'}
                    {v.statsAt ? <> · <b>{fmt(v.plays)}</b> просмотров</> : ' · просмотры подтянутся завтра'}
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export const REELS_CLIENT_CSS = `
  .rc { max-width: 640px; display: flex; flex-direction: column; gap: 28px; }
  .rc-next { background: var(--rk-surface); border: 1px solid var(--rk-line); border-radius: 18px; padding: 18px; }
  .rc-kicker { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--rk-accent); }
  .rc-next-t { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 22px; line-height: 1.2; margin: 6px 0 4px; text-wrap: balance; }
  .rc-next-v { color: var(--rk-muted); font-size: 14px; line-height: 1.45; margin-bottom: 12px; }
  .rc-next-empty .rc-next-v { margin: 6px 0 0; }
  .rc-next .rl-btn { min-height: 44px; padding: 10px 22px; font-size: 15px; font-weight: 700; border-radius: 12px;
    background: var(--rk-accent); color: #fff; border-color: var(--rk-accent); }
  .rc-next .rl-btn:hover { filter: brightness(1.05); }
  .rc-next .rl-form .rl-btn { background: var(--rk-surface); color: var(--rk-text); border-color: var(--rk-line); }
  .rc-next .rl-form .rl-btn-primary { background: var(--rk-accent); color: #fff; border-color: var(--rk-accent); }
  .rc-hint { color: var(--rk-muted); font-size: 12.5px; line-height: 1.45; margin: 12px 0 0; }
  .rc-h { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 17px; margin: 0 0 10px; }
  .rc-h span { color: var(--rk-muted); font-weight: 600; margin-left: 4px; }
  .rc-reel { background: var(--rk-surface); border: 1px solid var(--rk-line); border-radius: 14px; margin-bottom: 8px; }
  .rc-reel summary { cursor: pointer; list-style: none; display: flex; align-items: baseline; gap: 10px; padding: 14px 16px; min-height: 48px; }
  .rc-reel summary::-webkit-details-marker { display: none; }
  .rc-reel summary::after { content: '›'; margin-left: auto; color: var(--rk-muted); transition: transform .15s; }
  .rc-reel[open] summary::after { transform: rotate(90deg); }
  .rc-reel-t { font-weight: 700; font-size: 15px; line-height: 1.3; }
  .rc-reel-m { color: var(--rk-muted); font-size: 13px; white-space: nowrap; }
  .rc-ver { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px;
    padding: 10px 16px; border-top: 1px solid var(--rk-line); font-size: 14px; }
  .rc-list { display: flex; flex-direction: column; gap: 8px; }
  .rc-row { display: block; background: var(--rk-surface); border: 1px solid var(--rk-line); border-radius: 14px; padding: 12px 16px;
    color: inherit; text-decoration: none; }
  a.rc-up:hover { border-color: var(--rk-accent); }
  .rc-row-t { font-weight: 700; font-size: 15px; line-height: 1.3; }
  .rc-row-m { color: var(--rk-muted); font-size: 13px; margin-top: 3px; }
  .rc-row-m b { color: var(--rk-text); }
  .rc-need { margin-top: 8px; font-size: 13px; font-weight: 600; color: var(--rk-accent); }
  .rc-link { border: none; background: none; padding: 0; cursor: pointer; color: var(--rk-accent); font: inherit; font-weight: 600; }
  .rc-total { font-size: 14px; color: var(--rk-muted); margin: -4px 0 10px; }
  .rc-total b { font-family: 'Archivo', system-ui, sans-serif; font-size: 20px; color: var(--rk-text); margin-right: 4px; }
`;
