'use client';

// Two blocks of a run (20.11.2026):
//  - «Начало из залётов»: openings of other authors' hits tied to what this reel gives (POST /api/cabinet/optimizator/nachala);
//  - «Статистика ролика»: the student uploads screenshots of the published reel's insights, checks the numbers the model read,
//    and marks which opening was used (POST/PUT /api/cabinet/optimizator/stats).
import { useEffect, useRef, useState } from 'react';
import { METRIC_NAME, type Nachala, type ReelMetrics, type StatsEntry, type ViewerReason } from '@/lib/optimizator/view';

type Headers = () => Record<string, string>;

function Opening({ plaque, speech }: { plaque: string; speech: string }) {
  return (
    <div className="opn-open">
      {plaque && <div className="opn-plaque">{plaque}</div>}
      <div className="opn-speech">{speech}</div>
    </div>
  );
}

/** One answer instead of three variants (Sasha 21.11: «предложили самое пиздатое начало… либо сказали, что заебись»).
 * Keep the student's own opening when the reel keeps its promise and the viewer stops; else the best checked pick:
 * promise kept first, then the strongest family on the base, then the source's ratio. */
export function bestOpening(n: Nachala, stop?: ViewerReason): { keep: true; why?: string } | { keep: false; i: number } {
  if (n.best) return n.best;
  const own = n.orig.check.delivered === 'full' && (!stop || stop.answer === 'yes' || stop.score >= 7);
  if (own || !n.picks.length) return { keep: true };
  const rank = n.picks.map((p, i) => ({ i, full: p.check.delivered === 'full' ? 1 : 0, x: p.src.famX, r: p.src.ratio }))
    .sort((a, b) => b.full - a.full || b.x - a.x || b.r - a.r);
  return { keep: false, i: rank[0].i };
}

/** 23.11 «довести до верхней ступени»: the whole script with the best bundle and the body edited (telo.ts). */
function TeloCard({ t }: { t: NonNullable<Nachala['telo']> }) {
  const p = (x: number) => `${Math.round(x * 100)}%`;
  return (
    <div className={`opn-telo ${t.top ? '' : 'opn-telo-low'}`}>
      <h3>{t.top ? `Готовый сценарий: шанс ${p(t.before)} → ${p(t.share)}` : `Сценарий подтянут до ${p(t.share)} (было ${p(t.before)}), до верхней ступени не дотянул`}</h3>
      <p className="op-p opn-small op-muted">
        {t.base ? 'Начало из связки 1, тело поправлено' : 'Начало твоё, тело поправлено'}: убрано то, что по базе из 4 700 рилсов мешает залететь, добавлены приёмы залётов. Факты, кейсы, цифры и призыв в конце те же.
        {t.top ? ' 69% это верхняя ступень: так залетают лучшие тексты базы.' : ''}
      </p>
      {t.changes.length > 0 && <ul className="opn-small">{t.changes.map((c, i) => <li key={i}>{c}</li>)}</ul>}
      {!t.top && t.minus.length > 0 && <p className="op-p opn-small"><b>Ещё тянет вниз:</b> {t.minus.join(', ')}. Если это можно убрать без потерь для тебя, убери, или возьми другую тему.</p>}
      <details className="opn-src" open>
        <summary>Сценарий целиком</summary>
        <div className="opn-small">
          <div className="opn-full">{t.text}</div>
          <button type="button" className="op-copy" onClick={() => { void navigator.clipboard?.writeText(t.text); }}>Скопировать</button>
        </div>
      </details>
      <p className="op-p opn-small op-muted">Проверь, что всё звучит как ты и ничего не приписано. Связки ниже, если хочешь собрать сам.</p>
    </div>
  );
}

export function NachalaBlock({ runId, initial, headers, readOnly, stop, onReady }: { runId: string; initial: Nachala | null | undefined; headers: Headers; readOnly?: boolean; stop?: ViewerReason; onReady?: (n: Nachala) => void }) {
  // Picks saved before v2 (three variants, no single answer) are rebuilt once by the owner.
  const [n, setN] = useState<Nachala | null>(initial && ((initial.v ?? 0) >= 5 || readOnly) ? initial : null);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const [now, setNow] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (busy === null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [busy]);
  async function go() {
    setBusy(Date.now()); setErr('');
    try {
      // 23.11: the build runs in the background on the server (2-4 min); the first call starts it, then we ask every 6 s
      const t0 = Date.now();
      for (;;) {
        const res = await fetch('/api/cabinet/optimizator/nachala', {
          method: 'POST', credentials: 'same-origin', cache: 'no-store',
          headers: { 'Content-Type': 'application/json', ...headers() }, body: JSON.stringify({ id: runId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.pending) {
          if (Date.now() - t0 > 15 * 60_000) throw new Error('Подбор идёт дольше обычного. Обнови страницу через пару минут.');
          await new Promise((r) => setTimeout(r, 6000));
          continue;
        }
        if (!res.ok || !data.nachala) throw new Error(data.error || 'Не получилось подобрать начало.');
        setN(data.nachala);
        onReady?.(data.nachala);
        break;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Не получилось подобрать начало.');
    } finally { setBusy(null); }
  }
  // Starts by itself: the student should get an answer, not a button.
  useEffect(() => {
    if (n || readOnly || started.current) return;
    started.current = true;
    const t = setTimeout(() => { void go(); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  if (!n) {
    if (readOnly) return null;
    return (
      <section className="op-card">
        <h2 className="op-h2">Начало</h2>
        {err ? (
          <>
            <div className="op-error" role="alert">{err}</div>
            <button type="button" className="op-copy op-copy-primary opn-retry" onClick={go}>Попробовать ещё раз</button>
          </>
        ) : (
          <p className="op-p op-muted">
            <span className="op-spinner op-spinner-sm" /> Подбираю связки из залётов по твоей теме и проверяю каждую… {busy !== null ? Math.max(0, Math.round((now - busy) / 1000)) : 0} с, обычно 4-6 минут
          </p>
        )}
      </section>
    );
  }
  const b = bestOpening(n, stop);
  const bundles = bundlesOf(n);
  // 23.11 bundles (Sasha: «связка»): always up to 3 ready openings, the editor's best first, each with what goes right after
  // and what to cut; the old single answer stays only for runs saved before v3 that have no bundles.
  if (!bundles.length) {
    return (
      <section className="op-card opn-keep">
        <div className="opn-verdict opn-verdict-ok">Начало сильное, не трогаем</div>
        <Opening plaque={n.orig.plaque} speech={n.orig.speech} />
        {n.orig.check.gap && <p className="op-p opn-small opn-gap">Чтобы начало сработало, добавь в ролик: {n.orig.check.gap}</p>}
      </section>
    );
  }
  // 23.11: variants the editor judged weaker than the student's own opening go under a fold, never on top
  const strong = bundles.filter((x) => !x.weak);
  const weak = bundles.filter((x) => x.weak);
  return (
    <section className="op-card opn-bundles">
      <h2 className="op-h2">Начало: связки из залётов</h2>
      {(() => {
        const top = strong[0]?.share; const was = n.origShare;
        if (n.telo && was !== undefined && n.telo.share > was) return <div className="opn-verdict">Шанс на залёт: {pct(was)} → {pct(n.telo.share)}</div>;
        if (!strong.length) return <div className="opn-verdict opn-verdict-ok">Твоё начало сильнее вариантов из залётов, оставляем{was !== undefined ? ` (шанс ${pct(was)})` : ''}</div>;
        if (top === undefined || was === undefined) return null;
        return top > was
          ? <div className="opn-verdict">Шанс на залёт: {pct(was)} → {pct(top)}</div>
          : <div className="opn-verdict opn-verdict-ok">Шанс на залёт {pct(was)}: связки его не поднимают</div>;
      })()}
      {n.telo && <TeloCard t={n.telo} />}
      <p className="op-p op-muted opn-small">
        {b.keep
          ? 'Твоё начало рабочее. Если хочешь сильнее, вот готовые связки: сними одну из них пробным и сравни.'
          : 'Бери первую. Остальные две сними пробными, если хочешь сравнить.'}
        {' '}Связка = начало по формуле чужого залёта + что сказать сразу после него. Шанс посчитан по всему сценарию с этой связкой.
      </p>
      <details className="opn-was">
        <summary>Твоё начало сейчас</summary>
        <Opening plaque={n.orig.plaque} speech={n.orig.speech} />
      </details>
      {[strong, weak].map((list, li) => list.length > 0 && (
      <details key={li} className="opn-group" open={li === 0}>
      <summary className={li === 0 ? 'opn-group-open' : ''}>{li === 0 ? 'Связки' : `Ещё варианты: редактор считает их слабее твоего начала (${list.length})`}</summary>
      <div className="opn-picks">
        {list.map((x, i) => (
          <div key={i} className="opn-pick">
            <div className="opn-ptop">
              <span className="opn-num">{li === 0 ? i + 1 : '·'}</span>
              {x.badge && <span className={`opn-badge ${x.badgeOk ? 'opn-ok' : 'opn-part'}`}>{x.badge}</span>}
              {x.share !== undefined && (
                <span className={`opn-share ${n.origShare !== undefined && x.share > n.origShare ? 'opn-share-up' : ''}`}>
                  шанс {pct(x.share)}{n.origShare !== undefined ? <span> (было {pct(n.origShare)})</span> : null}
                </span>
              )}
            </div>
            <Opening plaque={x.plaque} speech={x.speech} />
            {x.next && <p className="op-p opn-small"><b>Сразу после:</b> «{x.next}»</p>}
            {x.drop && <p className="op-p opn-small"><b>Убери или перенеси в конец:</b> «{clip(x.drop, 200)}»</p>}
            {x.gap && <p className="op-p opn-small opn-gap">Чтобы начало сработало, добавь в ролик: {x.gap}</p>}
            {x.text && (
              <details className="opn-src">
                <summary>Сценарий с этой связкой</summary>
                <div className="opn-small">
                  <div className="opn-full">{x.text}</div>
                  <button type="button" className="op-copy" onClick={() => { void navigator.clipboard?.writeText(x.text || ''); }}>Скопировать</button>
                </div>
              </details>
            )}
            {x.src && (
              <details className="opn-src">
                <summary>Откуда</summary>
                <div className="opn-small">
                  {x.src.plaque && <div className="opn-plaque">{x.src.plaque}</div>}
                  «{clip(x.src.first, 160)}»
                  {x.src.tmpl && <div className="opn-formula">{x.src.tmpl}</div>}
                  <div className="op-muted">
                    <a href={x.src.url} target="_blank" rel="noopener noreferrer">@{x.src.author}</a>, ×{fmt(x.src.ratio)} к его обычным роликам
                  </div>
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
      </details>
      ))}
    </section>
  );
}

const fmt = (x: number) => String(x >= 10 ? Math.round(x) : Math.round(x * 10) / 10).replace('.', ',');
const clip = (t: string, n: number) => (t.length > n ? t.slice(0, n).trimEnd() + '…' : t);

type Bundle = {
  plaque: string; speech: string; next?: string; drop?: string; gap?: string; badge?: string; badgeOk?: boolean; key: string;
  text?: string; share?: number;
  /** the editor judge said the author should not film it instead of his own opening */
  weak?: boolean;
  src?: { author: string; ratio: number; url: string; first: string; plaque: string | null; tmpl?: string | null };
};

/** Picks of the generator (ranked by the editor) topped up to 3 by the repaired own opening and a confirmed form. */
export function bundlesOf(n: Nachala): Bundle[] {
  const out: Bundle[] = n.picks.slice(0, 3).map((p, i) => ({
    key: `bank:${i}`, plaque: p.plaque, speech: p.speech, next: p.next, drop: p.drop, text: p.text, share: p.shans?.hitShare, weak: p.editor?.usable === false,
    gap: p.check.delivered !== 'full' ? p.check.gap || p.bodyGap : undefined,
    // the gate odds only when they say something (x1.2 and up); a neutral thesis gets no badge
    badge: p.src.own ? 'твой залёт' : p.src.gate && (p.src.gateX ?? 0) >= 1.2 ? `${p.src.gate} ×${fmt(p.src.gateX!)}` : undefined,
    badgeOk: !!p.src.own || (p.src.gateX ?? 1) >= 1.2,
    src: { author: p.src.author, ratio: p.src.ratio, url: p.src.url, first: p.src.first, plaque: p.src.plaque, tmpl: p.src.tmpl },
  }));
  for (const [j, v] of (n.fallback?.versions || []).entries()) {
    if (out.length >= 3) break;
    if (v.kind === 'own') continue;
    out.push({ key: `fb:${j}`, plaque: v.plaque, speech: v.speech, text: v.text, share: v.shans?.hitShare, gap: v.check && v.check.delivered !== 'full' ? v.check.gap : undefined,
      badge: v.kind === 'repair' ? 'твоё, починенное' : v.famName ? `${v.famName}${v.famX ? ` ×${fmt(v.famX)}` : ''}` : 'подтверждённая форма', badgeOk: v.kind !== 'repair' });
  }
  // highest «шанс на залёт» first (the same model as the run's own number)
  return out.sort((a, b) => Number(!!a.weak) - Number(!!b.weak) || (b.share ?? -1) - (a.share ?? -1));
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Long side to 1600 px, JPEG: screenshots go to the vision model and the database. */
async function compress(f: File): Promise<Blob> {
  const url = URL.createObjectURL(f);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const k = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((ok) => c.toBlob((b) => ok(b || f), 'image/jpeg', 0.85));
  } finally { URL.revokeObjectURL(url); }
}

const SHOWN: (keyof ReelMetrics)[] = ['views', 'skip_rate', 'avg_watch_s', 'duration_s', 'reach', 'nonfollowers_pct', 'likes', 'comments', 'shares', 'saves', 'reposts', 'follows', 'watch_total_s', 'published'];

function openingLabel(v: string | null, n: Nachala | null | undefined): string {
  if (!v || v === 'orig') return 'своё начало';
  if (v.startsWith('bank:') || v.startsWith('fb:')) {
    const x = n ? bundlesOf(n).find((b) => b.key === v) : undefined;
    return x ? `связка из залётов: «${x.speech}»` : 'связка из залётов';
  }
  return v;
}

export function StatsBlock({ runId, initial, nachala, headers, stop }: { runId: string; initial: StatsEntry[] | undefined; nachala: Nachala | null | undefined; headers: Headers; stop?: ViewerReason }) {
  const [list, setList] = useState<StatsEntry[]>(initial || []);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [opening, setOpening] = useState('orig');
  const [own, setOwn] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [draft, setDraft] = useState<{ id: string; metrics: ReelMetrics } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { setList(initial || []); setDraft(null); setFiles([]); setOpen(false); setErr(''); }, [runId, initial]);

  const openingValue = opening === 'own' ? (own.trim() || 'своё другое начало') : opening;

  async function upload() {
    if (!files.length || busy) return;
    setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.set('runId', runId); fd.set('opening', openingValue); fd.set('reelUrl', reelUrl);
      for (const f of files) fd.append('files', await compress(f), 'shot.jpg');
      const res = await fetch('/api/cabinet/optimizator/stats', { method: 'POST', credentials: 'same-origin', headers: headers(), body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Не получилось загрузить.');
      setDraft({ id: data.id, metrics: data.metrics || {} });
    } catch (e) { setErr(e instanceof Error ? e.message : 'Не получилось загрузить.'); } finally { setBusy(false); }
  }
  async function save() {
    if (!draft || busy) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/cabinet/optimizator/stats', {
        method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ id: draft.id, runId, opening: openingValue, reelUrl, metrics: draft.metrics }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Не получилось сохранить.');
      if (data.stats) setList(data.stats);
      setDraft(null); setFiles([]); setOpen(false); setReelUrl(''); setOwn('');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Не получилось сохранить.'); } finally { setBusy(false); }
  }
  function setMetric(k: keyof ReelMetrics, v: string) {
    if (!draft) return;
    const m = { ...draft.metrics } as Record<string, unknown>;
    if (v.trim() === '') delete m[k]; else m[k] = k === 'published' ? v : Number(v.replace(',', '.'));
    setDraft({ ...draft, metrics: m as ReelMetrics });
  }

  return (
    <section className="op-card">
      <h2 className="op-h2">Статистика ролика</h2>
      <p className="op-p op-muted">
        Выложил ролик? Через 2-3 дня загрузи скрины статистики из Инстаграма: просмотры, доля пропусков, среднее время просмотра,
        отправки и сохранения. Цифры прочитаются сами, проверь их и сохрани. Так будет видно, какое начало реально держит зрителя.
      </p>
      {list.length > 0 && (
        <ul className="opn-stats">
          {list.map((s) => (
            <li key={s.id}>
              <div className="op-label">{new Date(s.createdAt).toLocaleDateString('ru-RU')} · {openingLabel(s.opening, nachala)}</div>
              <div className="opn-mrow">
                {SHOWN.filter((k) => s.metrics[k] !== undefined).map((k) => (
                  <span key={k} className="opn-m"><b>{typeof s.metrics[k] === 'number' ? (s.metrics[k] as number).toLocaleString('ru-RU') : s.metrics[k]}</b> {METRIC_NAME[k].toLowerCase()}</span>
                ))}
              </div>
              {s.reelUrl && <a className="opn-small" href={s.reelUrl} target="_blank" rel="noopener noreferrer">ролик ↗</a>}
            </li>
          ))}
        </ul>
      )}
      {!open ? (
        <button type="button" className="op-copy op-copy-primary" onClick={() => setOpen(true)}>Загрузить скрины статистики</button>
      ) : !draft ? (
        <div className="opn-form">
          <label className="op-label">С каким началом выложил</label>
          <div className="opn-radios">
            <label><input type="radio" name="opn-o" checked={opening === 'orig'} onChange={() => setOpening('orig')} /> своё начало из сценария</label>
            {nachala && bundlesOf(nachala).map((x, i) => (
              <label key={x.key}><input type="radio" name="opn-o" checked={opening === x.key} onChange={() => setOpening(x.key)} /> связка {i + 1}: «{x.speech}»</label>
            ))}
            <label><input type="radio" name="opn-o" checked={opening === 'own'} onChange={() => setOpening('own')} /> другое</label>
            {opening === 'own' && <input className="opn-input" placeholder="Первая фраза, с которой выложил" value={own} onChange={(e) => setOwn(e.target.value)} />}
          </div>
          <label className="op-label">Ссылка на ролик (необязательно)</label>
          <input className="opn-input" placeholder="https://www.instagram.com/reel/..." value={reelUrl} onChange={(e) => setReelUrl(e.target.value)} />
          <label className="op-label">Скрины статистики (до 4)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 4))} />
          <div className="op-row">
            <button type="button" className="op-copy op-copy-primary" disabled={!files.length || busy} onClick={upload}>{busy ? 'Читаю цифры…' : 'Прочитать цифры'}</button>
            <button type="button" className="op-copy" onClick={() => setOpen(false)}>Отмена</button>
          </div>
        </div>
      ) : (
        <div className="opn-form">
          <p className="op-p">Проверь цифры. Пустое поле = не было на скринах, можно вписать руками.</p>
          <div className="opn-grid">
            {SHOWN.map((k) => (
              <label key={k} className="opn-field">
                <span>{METRIC_NAME[k]}</span>
                <input className="opn-input" inputMode={k === 'published' ? 'text' : 'decimal'} placeholder={k === 'published' ? 'ГГГГ-ММ-ДД' : '—'}
                  value={draft.metrics[k] === undefined ? '' : String(draft.metrics[k])} onChange={(e) => setMetric(k, e.target.value)} />
              </label>
            ))}
          </div>
          <div className="op-row">
            <button type="button" className="op-copy op-copy-primary" disabled={busy} onClick={save}>{busy ? 'Сохраняю…' : 'Сохранить'}</button>
            <button type="button" className="op-copy" onClick={() => { setDraft(null); setOpen(false); }}>Отмена</button>
          </div>
        </div>
      )}
      {err && <div className="op-error" role="alert">{err}</div>}
    </section>
  );
}

export const BLOCKS_CSS = `
  .opn-badge { display: inline-block; font-size: 12px; border-radius: 20px; padding: 1px 9px; margin-left: 6px; font-weight: 600; text-transform: none; letter-spacing: 0; }
  .opn-ok { background: oklch(0.93 0.05 150); color: oklch(0.42 0.11 150); }
  .opn-part { background: oklch(0.94 0.05 75); color: oklch(0.50 0.12 60); }
  .opn-bad { background: oklch(0.92 0.05 25); color: oklch(0.48 0.15 25); }
  .opn-verdict { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 19px; letter-spacing: -0.015em; margin-bottom: 10px; color: oklch(0.60 0.19 52); }
  .opn-telo { border: 1.5px solid oklch(0.62 0.14 150); border-radius: 12px; padding: 12px 14px; margin: 10px 0 14px; }
  .opn-telo-low { border-color: oklch(0.75 0.12 70); }
  .opn-telo h3 { margin: 0 0 6px; font-size: 16px; }
  .opn-telo ul { margin: 6px 0; padding-left: 18px; }
  .opn-telo li { margin: 2px 0; }
  .opn-verdict-ok { color: oklch(0.55 0.13 150); }
  .opn-best .opn-open, .opn-keep .opn-open { background: oklch(0.95 0.04 150); border-radius: 12px; padding: 12px 14px; }
  .opn-keep .opn-open { background: oklch(0.955 0.01 75); }
  .opn-was { margin-top: 12px; border-top: 1px solid oklch(0.90 0.008 75); padding-top: 10px; }
  .opn-was summary { cursor: pointer; font-size: 13px; font-weight: 700; color: oklch(0.46 0.012 55); list-style: none; }
  .opn-was summary::-webkit-details-marker { display: none; }
  .opn-was summary::before { content: '+ '; }
  .opn-was[open] summary::before { content: '− '; }
  .opn-was .opn-open { margin-top: 8px; background: oklch(0.955 0.01 75); border-radius: 10px; padding: 10px 12px; }
  .opn-retry { margin-top: 10px; }
  .opn-pay, .opn-cur { border-radius: 12px; padding: 12px 14px; margin: 10px 0; background: oklch(0.955 0.01 75); }
  .opn-pay { background: oklch(0.95 0.02 250); }
  .opn-open { margin-top: 6px; }
  .opn-plaque { font-weight: 800; font-size: 13px; text-transform: uppercase; margin-bottom: 4px; }
  .opn-speech { font-weight: 600; }
  .opn-picks { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 10px; }
  @media (min-width: 760px) { .opn-picks { grid-template-columns: repeat(3, 1fr); } }
  .opn-pick { border: 1px solid oklch(0.88 0.01 75); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
  .opn-pick > .opn-badge { align-self: flex-start; margin-left: 0; }
  .opn-pick .opn-open { background: oklch(0.95 0.04 150); border-radius: 8px; padding: 8px 10px; }
  .opn-weak { opacity: .65; }
  .opn-weak .opn-open { background: oklch(0.955 0.005 75); }
  .opn-small { font-size: 13px; }
  .opn-ptop { display: flex; align-items: center; gap: 8px; }
  .opn-num { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 18px; color: oklch(0.60 0.19 52); }
  .opn-pick .opn-badge { margin-left: 0; }
  .opn-src summary { cursor: pointer; font-size: 12.5px; font-weight: 700; color: oklch(0.46 0.012 55); list-style: none; }
  .opn-src summary::-webkit-details-marker { display: none; }
  .opn-src summary::before { content: '+ '; }
  .opn-src[open] summary::before { content: '− '; }
  .opn-src > div { margin-top: 6px; display: flex; flex-direction: column; gap: 4px; }
  .opn-formula { font-family: ui-monospace, Menlo, monospace; font-size: 12px; background: oklch(0.955 0.005 75); border-radius: 6px; padding: 6px 8px; }
  .opn-bundles .opn-was { margin: 4px 0 2px; border-top: none; padding-top: 0; }
  .opn-bundles .opn-picks { grid-template-columns: 1fr !important; }
  .opn-group > summary { list-style: none; cursor: pointer; font-size: 13px; font-weight: 700; color: oklch(0.46 0.012 55); margin-top: 10px; }
  .opn-group > summary::-webkit-details-marker { display: none; }
  .opn-group > summary.opn-group-open { display: none; }
  .opn-share { margin-left: auto; font-size: 13px; font-weight: 800; color: oklch(0.46 0.012 55); white-space: nowrap; }
  .opn-share span { font-weight: 500; }
  .opn-share-up { color: oklch(0.50 0.14 150); }
  .opn-full { white-space: pre-wrap; background: oklch(0.975 0.004 75); border-radius: 8px; padding: 8px 10px; font-size: 14px; line-height: 1.5; }
  .opn-bundles .opn-pick { min-width: 0; }
  .opn-gap { color: oklch(0.50 0.12 50); }
  .opn-fix { background: oklch(0.96 0.03 70); border-radius: 10px; padding: 10px 12px; }
  .opn-stats { list-style: none; padding: 0; margin: 8px 0 12px; display: flex; flex-direction: column; gap: 10px; }
  .opn-stats li { border: 1px solid oklch(0.88 0.01 75); border-radius: 12px; padding: 10px 12px; }
  .opn-mrow { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 14px; margin-top: 4px; }
  .opn-form { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
  .opn-radios { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
  .opn-radios label { display: flex; gap: 8px; align-items: flex-start; }
  .opn-input { width: 100%; box-sizing: border-box; border: 1px solid oklch(0.85 0.01 75); border-radius: 8px; padding: 8px 10px; font: inherit; font-size: 15px; background: oklch(1 0 0); }
  .opn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
  .opn-field { display: flex; flex-direction: column; justify-content: flex-end; gap: 3px; font-size: 13px; }
`;
