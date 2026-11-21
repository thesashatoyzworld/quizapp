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
export function bestOpening(n: Nachala, stop?: ViewerReason): { keep: true } | { keep: false; i: number } {
  const own = n.orig.check.delivered === 'full' && (!stop || stop.answer === 'yes' || stop.score >= 7);
  if (own || !n.picks.length) return { keep: true };
  const rank = n.picks.map((p, i) => ({ i, full: p.check.delivered === 'full' ? 1 : 0, x: p.src.famX, r: p.src.ratio }))
    .sort((a, b) => b.full - a.full || b.x - a.x || b.r - a.r);
  return { keep: false, i: rank[0].i };
}

export function NachalaBlock({ runId, initial, headers, readOnly, stop }: { runId: string; initial: Nachala | null | undefined; headers: Headers; readOnly?: boolean; stop?: ViewerReason }) {
  const [n, setN] = useState<Nachala | null>(initial ?? null);
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
      const res = await fetch('/api/cabinet/optimizator/nachala', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...headers() }, body: JSON.stringify({ id: runId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.nachala) throw new Error(data.error || 'Не получилось подобрать начало.');
      setN(data.nachala);
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
            <span className="op-spinner op-spinner-sm" /> Сверяю твоё начало с залётами по теме и подбираю лучшее… {busy !== null ? Math.max(0, Math.round((now - busy) / 1000)) : 0} с, обычно около минуты
          </p>
        )}
      </section>
    );
  }
  const b = bestOpening(n, stop);
  if (b.keep) {
    return (
      <section className="op-card opn-keep">
        <div className="opn-verdict opn-verdict-ok">Начало сильное, не трогаем</div>
        <Opening plaque={n.orig.plaque} speech={n.orig.speech} />
        <p className="op-p opn-small">
          {n.picks.length ? 'Ролик выполняет то, что обещает начало' : 'По твоей теме в базе мало залётов для сравнения'}
          {stop ? `, остановятся: ${stop.score}/10.` : '.'}
        </p>
      </section>
    );
  }
  const p = n.picks[b.i];
  const full = p.check.delivered === 'full';
  return (
    <section className="op-card opn-best">
      <div className="opn-verdict">Бери это начало</div>
      <Opening plaque={p.plaque} speech={p.speech} />
      <p className="op-p opn-small">
        Так начинаются залёты в твоей теме: «{p.src.famName}» залетает в {String(Math.round(p.src.famX * 10) / 10).replace('.', ',')} раза чаще.
        {full ? ' Ролик выполняет это обещание.' : ''}
      </p>
      {!full && p.check.gap && <p className="op-p opn-small opn-gap">Чтобы начало сработало, добавь в ролик: {p.check.gap}</p>}
      <details className="opn-was">
        <summary>Твоё было</summary>
        <Opening plaque={n.orig.plaque} speech={n.orig.speech} />
        {n.orig.check.gap && <p className="op-p opn-small opn-gap">{n.orig.check.gap}</p>}
        <p className="op-p op-muted opn-small">
          Образец: <a href={p.src.url} target="_blank" rel="noopener noreferrer">@{p.src.author}</a>, ×{Math.round(p.src.ratio)} к его обычным роликам
        </p>
      </details>
    </section>
  );
}

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
  if (v.startsWith('bank:')) {
    const i = Number(v.slice(5));
    const p = n?.picks[i];
    return p ? `начало из залётов: «${p.speech}»` : 'начало из залётов';
  }
  return v;
}

export function StatsBlock({ runId, initial, nachala, headers, stop }: { runId: string; initial: StatsEntry[] | undefined; nachala: Nachala | null | undefined; headers: Headers; stop?: ViewerReason }) {
  const best = nachala ? bestOpening(nachala, stop) : null;
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
            {best && !best.keep && nachala && (
              <label><input type="radio" name="opn-o" checked={opening === `bank:${best.i}`} onChange={() => setOpening(`bank:${best.i}`)} /> предложенное: «{nachala.picks[best.i].speech}»</label>
            )}
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
