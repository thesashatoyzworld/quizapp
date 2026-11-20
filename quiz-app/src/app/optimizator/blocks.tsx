'use client';

// Two blocks of a run (20.11.2026):
//  - «Начало из залётов»: openings of other authors' hits tied to what this reel gives (POST /api/cabinet/optimizator/nachala);
//  - «Статистика ролика»: the student uploads screenshots of the published reel's insights, checks the numbers the model read,
//    and marks which opening was used (POST/PUT /api/cabinet/optimizator/stats).
import { useEffect, useState } from 'react';
import { METRIC_NAME, type Nachala, type NachalaPick, type PromiseCheck, type ReelMetrics, type StatsEntry } from '@/lib/optimizator/view';

type Headers = () => Record<string, string>;

const KEPT: Record<string, [string, string]> = {
  full: ['ok', 'обещание выполняется'], partial: ['part', 'выполняется частично'], no: ['bad', 'не выполняется'],
  none: ['part', 'начало ничего не обещает'], unknown: ['part', 'не проверено'],
};
function Kept({ c }: { c: PromiseCheck }) {
  const [cls, t] = KEPT[c.delivered] || KEPT.unknown;
  return <span className={`opn-badge opn-${cls}`}>{t}</span>;
}

function Opening({ plaque, speech }: { plaque: string; speech: string }) {
  return (
    <div className="opn-open">
      {plaque && <div className="opn-plaque">{plaque}</div>}
      <div className="opn-speech">{speech}</div>
    </div>
  );
}

function Pick({ p }: { p: NachalaPick }) {
  const full = p.check.delivered === 'full';
  return (
    <div className={full ? 'opn-pick' : 'opn-pick opn-weak'}>
      <Kept c={p.check} />
      <Opening plaque={p.plaque} speech={p.speech} />
      <p className="op-p opn-small">Обещает: {p.promise}{p.keptIn ? <><br />Выполняется: «{p.keptIn}»</> : null}</p>
      {!full && p.check.gap && <p className="op-p opn-small opn-gap">Чего не хватает в ролике: {p.check.gap}</p>}
      <p className="op-p op-muted opn-small">
        Образец: <a href={p.src.url} target="_blank" rel="noopener noreferrer">@{p.src.author}</a> ×{Math.round(p.src.ratio)} к своей медиане
        <br />{p.src.famName} · ×{p.src.famX.toFixed(1)}{p.src.confirmed ? ' · подтверждено на базе' : ''}
        <br /><i>«{p.src.first.length > 140 ? p.src.first.slice(0, 139) + '…' : p.src.first}»</i>
      </p>
    </div>
  );
}

export function NachalaBlock({ runId, initial, headers, readOnly }: { runId: string; initial: Nachala | null | undefined; headers: Headers; readOnly?: boolean }) {
  const [n, setN] = useState<Nachala | null>(initial ?? null);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const [now, setNow] = useState(0);
  useEffect(() => { setN(initial ?? null); setErr(''); }, [runId, initial]);
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
  if (!n) {
    if (readOnly) return null;
    return (
      <section className="op-card">
        <h2 className="op-h2">Начало из залётов</h2>
        <p className="op-p">
          Подберу 3 начала из роликов, которые уже залетели у других экспертов по твоей теме, и пересажу их на твой текст так,
          чтобы начало обещало ровно то, что ролик даёт. По базе 4 481 рилса: когда ролик выполняет обещание начала, он залетает
          в 1,5 раза чаще, когда не выполняет, в 2 раза реже.
        </p>
        {busy !== null ? (
          <p className="op-p op-muted">Подбираю и проверяю каждое начало… {Math.max(0, Math.round((now - busy) / 1000))} с, обычно около 1,5 минуты</p>
        ) : (
          <button type="button" className="op-copy op-copy-primary" onClick={go}>Подобрать начало</button>
        )}
        {err && <div className="op-error" role="alert">{err}</div>}
      </section>
    );
  }
  const anyFull = n.picks.some((p) => p.check.delivered === 'full');
  return (
    <section className="op-card">
      <h2 className="op-h2">Начало из залётов</h2>
      <div className="opn-pay">
        <div className="op-label">Что ролик реально даёт зрителю</div>
        <p className="op-p">{n.payoff.payoff}</p>
        {n.payoff.notGiven && <p className="op-p opn-small opn-gap">Не даёт: {n.payoff.notGiven}</p>}
      </div>
      <div className="opn-cur">
        <div className="op-label">Твоё начало <Kept c={n.orig.check} /></div>
        <Opening plaque={n.orig.plaque} speech={n.orig.speech} />
        {n.orig.check.gap && <p className="op-p opn-small opn-gap">{n.orig.check.gap}</p>}
      </div>
      {n.empty || !n.picks.length ? (
        <p className="op-p op-muted">В базе пока мало залётов по твоей теме, чтобы подобрать начало.</p>
      ) : (
        <>
          {!anyFull && (
            <p className="op-p opn-fix">
              Ни одно проверенное начало не выполняется полностью: ролик сам недодаёт. Добавь в ролик то, чего не хватает, или сузь обещание начала.
            </p>
          )}
          <div className="opn-picks">{n.picks.map((p, i) => <Pick key={i} p={p} />)}</div>
          <p className="op-p op-muted opn-small">
            Это варианты для проверки, а не замена: залей ролик с одним из них в пробные и загрузи статистику ниже, так будет видно, что сработало.
          </p>
        </>
      )}
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

export function StatsBlock({ runId, initial, nachala, headers }: { runId: string; initial: StatsEntry[] | undefined; nachala: Nachala | null | undefined; headers: Headers }) {
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
            {(nachala?.picks || []).map((p, i) => (
              <label key={i}><input type="radio" name="opn-o" checked={opening === `bank:${i}`} onChange={() => setOpening(`bank:${i}`)} /> «{p.speech}»</label>
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
