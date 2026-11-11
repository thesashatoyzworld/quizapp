'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp, type TelegramWebAppLike } from '@/lib/telegram-ready';
import { trackSection } from '@/lib/cabinet-track';
import { previewAs } from '@/lib/uniq/preview';
import OpenInBrowser from '@/components/OpenInBrowser';

// Section «Уникализатор»: one reel in, up to 5 slightly different versions out.
// The cabinet only hands a signed token (/api/cabinet/uniq); upload, ffmpeg work,
// the queue and the 5-per-video limit live on the VPS (uniq.thesashatoyz.com).

const BOT_URL = 'https://t.me/testtoyzbot';
const POLL_MS = 2000;
const ACCEPT = 'video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi';

type Version = { i: number; size: number; url: string };
type Job = {
  id: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  position: number;
  total: number;
  done: number;
  failed: number;
  versions: Version[];
  error?: string;
};
type RefStats = { link: string; invited: number; credited: number; cap: number };
type Plan = { w: number; v: number };
type Week = { limit: number; used: number; nextAt: number | null };
type Offer = 'uroven' | 'potok' | '360';
type Access = { token: string; url: string; max: number; free?: boolean; plan?: Plan; ref?: RefStats | null; offer?: Offer | null };

const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};
const roliki = (n: number) => `${n} ${plural(n, 'ролик', 'ролика', 'роликов')}`;
function inDays(ms: number) {
  const h = Math.max(1, Math.ceil(ms / 3600e3));
  if (h < 24) return `${h} ${plural(h, 'час', 'часа', 'часов')}`;
  const d = Math.ceil(h / 24);
  return `${d} ${plural(d, 'день', 'дня', 'дней')}`;
}

const isActive = (j: Job | null) => !!j && (j.status === 'queued' || j.status === 'running');

function mb(bytes: number): string {
  const v = bytes / (1024 * 1024);
  return `${v < 10 ? v.toFixed(1).replace('.', ',') : Math.round(v)} МБ`;
}

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
  return <div ref={ref} className="un-tg-login" />;
}

function UniqInner() {
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'subscribe' | 'broken' | 'ok'>('load');
  const [channel, setChannel] = useState('https://t.me/sashatoyz');
  const [subBusy, setSubBusy] = useState(false);
  const [subMsg, setSubMsg] = useState<string | null>(null);
  const [brokenMsg, setBrokenMsg] = useState('');
  const [max, setMax] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(5);
  const [drag, setDrag] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [week, setWeek] = useState<Week | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initData = useRef('');
  const tgRef = useRef<TelegramWebAppLike | null>(null);
  // Ref for callbacks (always the latest token), state for rendering download links.
  const access = useRef<Access | null>(null);
  const [acc, setAcc] = useState<Access | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fresh token from the cabinet. Returns the HTTP status for the caller to branch on.
  const loadAccess = useCallback(async (checked = false): Promise<{ status: number; error?: string; code?: string }> => {
    const headers: Record<string, string> = initData.current ? { 'x-tg-init-data': initData.current } : {};
    const p = new URLSearchParams();
    if (previewAs()) {
      p.set('as', 'free');
      const cta = new URLSearchParams(window.location.search).get('cta');
      if (cta) p.set('cta', cta);
    }
    if (checked) p.set('checked', '1');
    const res = await fetch(`/api/cabinet/uniq${p.toString() ? `?${p}` : ''}`, { headers, credentials: 'same-origin', cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.token) {
      access.current = { token: data.token, url: String(data.url).replace(/\/+$/, ''), max: data.max || 5, free: !!data.free, plan: data.plan, ref: data.ref || null, offer: ['uroven', 'potok', '360'].includes(data.offer) ? data.offer : null };
      setAcc(access.current);
      setMax(access.current.max);
    }
    if (data.channel) setChannel(String(data.channel));
    return { status: res.status, error: data.error, code: data.code };
  }, []);

  // GET to the VPS with the Bearer token; one retry with a new token on 401 (it lives 2 h).
  const vpsGet = useCallback(async (path: string): Promise<{ status: number; data: Record<string, unknown> }> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const a = access.current;
      if (!a) break;
      const res = await fetch(`${a.url}${path}`, { headers: { Authorization: `Bearer ${a.token}` }, cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 && attempt === 0) { await loadAccess(); continue; }
      return { status: res.status, data };
    }
    return { status: 0, data: {} };
  }, [loadAccess]);

  // Behaviour log on the VPS (feeds the morning digest). Fire-and-forget, never blocks the page.
  const track = useCallback((ev: string) => {
    const a = access.current;
    if (!a) return;
    fetch(`${a.url}/api/ev`, {
      method: 'POST', headers: { Authorization: `Bearer ${a.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ev }), keepalive: true,
    }).catch(() => { /* analytics only */ });
  }, []);

  useEffect(() => {
    let stop = false;
    (async () => {
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      tgRef.current = tg;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const id = tg?.initDataUnsafe?.user?.id ?? null;
      initData.current = typeof tg?.initData === 'string' ? tg.initData : '';
      try {
        const r = await loadAccess();
        if (stop) return;
        if (r.status === 401) { setState('guest'); return; }
        if (r.status === 403) { setState(r.code === 'subscribe' ? 'subscribe' : 'locked'); return; }
        if (!access.current) { setBrokenMsg(r.error || 'Не получилось открыть раздел. Обнови страницу.'); setState('broken'); return; }
        setState('ok');
        trackSection('uniq', id);
        track('open');
        // Resume a job that is still in work (page reopened mid-processing).
        const me = await vpsGet('/api/me').catch(() => null);
        if (!stop && me?.status === 200) setWeek((me.data.week as Week) || null);
        if (!stop && me?.status === 200 && me.data.active) setJob(me.data.active as Job);
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, [loadAccess, vpsGet]);

  // Poll the job every 2 s while it is queued or running.
  const jobId = job?.id;
  const jobActive = isActive(job);
  useEffect(() => {
    if (!jobId || !jobActive) return;
    let stop = false;
    const timer = window.setInterval(async () => {
      try {
        const r = await vpsGet(`/api/jobs/${encodeURIComponent(jobId)}`);
        if (stop) return;
        if (r.status === 200) setJob(r.data as unknown as Job);
        else if (r.status === 404) { setJob(null); setError(String(r.data.error || 'Задача не найдена.')); }
      } catch { /* network blip: next tick */ }
    }, POLL_MS);
    return () => { stop = true; window.clearInterval(timer); };
  }, [jobId, jobActive, vpsGet]);

  function pick(f: File | null | undefined) {
    if (!f) return;
    setError(null);
    if (!f.type.startsWith('video/') && !/\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(f.name)) {
      setError('Нужен видеофайл: mp4 или mov.');
      return;
    }
    setFile(f);
    setRemaining(null);
  }

  function upload(f: File, n: number, retried = false) {
    const a = access.current;
    if (!a) return;
    setError(null);
    setUploadPct(0);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${a.url}/api/jobs?count=${n}`);
    xhr.setRequestHeader('Authorization', `Bearer ${a.token}`);
    xhr.setRequestHeader('X-Filename', encodeURIComponent(f.name));
    if (f.type) xhr.setRequestHeader('Content-Type', f.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadPct(Math.min(100, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onload = async () => {
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(xhr.responseText || '{}'); } catch { /* keep empty */ }
      if (xhr.status === 401 && !retried) {
        await loadAccess();
        upload(f, n, true);
        return;
      }
      setUploadPct(null);
      if (xhr.status === 200 && data.jobId) {
        setRemaining(typeof data.remaining === 'number' ? data.remaining : null);
        setJob({
          id: String(data.jobId), status: 'queued', position: Number(data.position) || 0,
          total: Number(data.count) || n, done: 0, failed: 0, versions: [],
        });
        return;
      }
      setError(String(data.error || `Не получилось загрузить ролик (ошибка ${xhr.status}). Попробуй ещё раз.`));
    };
    xhr.onerror = () => {
      setUploadPct(null);
      setError('Загрузка прервалась. Проверь интернет и попробуй ещё раз.');
    };
    xhr.send(f);
  }

  function download(e: React.MouseEvent<HTMLAnchorElement>, href: string, name: string) {
    track('download');
    const tg = tgRef.current as (TelegramWebAppLike & {
      downloadFile?: (p: { url: string; file_name: string }) => void;
      initData?: string;
    }) | null;
    if (!tg?.initData) return; // plain browser: the link itself downloads
    e.preventDefault();
    // Inside the Mini App a plain link does nothing on phones: use the native download,
    // older clients open the file in the browser instead.
    try {
      if (typeof tg.downloadFile === 'function') { tg.downloadFile({ url: href, file_name: name }); return; }
    } catch { /* fall back */ }
    if (typeof tg.openLink === 'function') tg.openLink(href);
    else window.open(href, '_blank');
  }

  // One tap for every ready version. Telegram shows its own save dialog per file, so they go
  // one after another (the next starts when the previous dialog is answered); a declined
  // dialog stops the chain. In a plain browser each link is an attachment, so they just queue.
  const [bulk, setBulk] = useState(false);
  async function downloadAll(items: { href: string; name: string }[]) {
    if (bulk || items.length === 0) return;
    track('download_all');
    setBulk(true);
    const tg = tgRef.current as (TelegramWebAppLike & {
      downloadFile?: (p: { url: string; file_name: string }, cb?: (ok: boolean) => void) => void;
      initData?: string;
    }) | null;
    try {
      for (const it of items) {
        if (tg?.initData && typeof tg.downloadFile === 'function') {
          const ok = await new Promise<boolean>((resolve) => {
            let settled = false;
            const done = (v: boolean) => { if (!settled) { settled = true; resolve(v); } };
            try { tg.downloadFile!({ url: it.href, file_name: it.name }, (accepted) => done(accepted !== false)); }
            catch { done(false); }
            // Older clients never call back: don't hang the whole chain on them.
            setTimeout(() => done(true), 60_000);
          });
          if (!ok) break;
        } else if (tg?.initData) {
          if (typeof tg.openLink === 'function') tg.openLink(it.href); else window.open(it.href, '_blank');
          break; // without downloadFile each file opens a browser tab: one is enough
        } else {
          const a = document.createElement('a');
          a.href = it.href; a.download = it.name; a.rel = 'noopener';
          document.body.appendChild(a); a.click(); a.remove();
          await new Promise((r) => setTimeout(r, 900));
        }
      }
    } finally {
      setBulk(false);
    }
  }

  function startNew() {
    setJob(null);
    setFile(null);
    setRemaining(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const busy = uploadPct !== null || jobActive;
  return (
    <main className="un-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />

      <header className="un-top">
        <a className="un-back" href="/dostup">‹ Кабинет</a>
        <div className="un-brand">Уникализатор</div>
        <div className="un-sub">Из одного ролика несколько разных версий для пробных рилсов</div>
        <OpenInBrowser path="/uniq" className="un-browser" />
      </header>

      {state === 'load' && (
        <div className="un-state"><div className="un-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="un-card">
          <div className="un-login-title">Вход</div>
          <div className="un-login-sub">Доступ привязан к твоему Telegram. Войди, и уникализатор откроется.</div>
          <TelegramLoginButton />
          <a className="un-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">Или открыть в боте →</a>
        </div>
      )}

      {state === 'subscribe' && (
        <div className="un-card">
          <h1 className="un-lock-h1">Сначала подпишись на канал</h1>
          <p className="un-lock-p">
            Уникализатор бесплатный для подписчиков моего канала. Подпишись, вернись сюда и нажми «Я подписался».
          </p>
          <button
            type="button"
            className="un-cta"
            onClick={() => {
              const tg = tgRef.current as (TelegramWebAppLike & { openTelegramLink?: (u: string) => void }) | null;
              if (tg?.openTelegramLink) tg.openTelegramLink(channel);
              else window.open(channel, '_blank', 'noopener');
            }}
          >
            Подписаться на канал
          </button>
          <button
            type="button"
            className="un-new"
            disabled={subBusy}
            onClick={async () => {
              setSubBusy(true);
              setSubMsg(null);
              const r = await loadAccess(true).catch(() => ({ status: 0 } as { status: number; code?: string }));
              setSubBusy(false);
              if (access.current) {
                setState('ok');
                trackSection('uniq', tgRef.current?.initDataUnsafe?.user?.id ?? null);
                track('open');
                const me = await vpsGet('/api/me').catch(() => null);
                if (me?.status === 200) setWeek((me.data.week as Week) || null);
                return;
              }
              setSubMsg(r.code === 'subscribe' ? 'Пока не вижу подписку. Подпишись и нажми ещё раз.' : 'Не получилось проверить. Попробуй ещё раз.');
            }}
          >
            {subBusy ? 'Проверяю…' : 'Я подписался'}
          </button>
          {subMsg && <div className="un-error" role="alert">{subMsg}</div>}
        </div>
      )}

      {state === 'locked' && (
        <div className="un-card">
          <div className="un-lock-badge">🔒 Закрытый раздел</div>
          <h1 className="un-lock-h1">Уникализатор</h1>
          <p className="un-lock-p">
            Загружаешь один ролик и получаешь до 5 немного разных версий, чтобы выложить его пробными рилсами.
            Открыт ученикам курса «Новый уровень».
          </p>
          <a className="un-cta" href="https://thesashatoyz.com/uroven">Посмотреть тарифы →</a>
        </div>
      )}

      {state === 'broken' && (
        <div className="un-card"><div className="un-error" role="alert">{brokenMsg}</div></div>
      )}

      {state === 'ok' && acc && (
        <>
          {!job && acc.free && acc.plan && <PlanMeter plan={acc.plan} week={week} />}
          {!job && (
            <details className="un-acc">
              <summary>Какой ролик брать</summary>
              <p>
                Тот, что уже дал результат: больше обычных просмотров, сохранения или заявки, но не выстрелил.
                Тема цепляет, версии дадут ей ещё попытки. Совсем не зашедший лучше переснять.
              </p>
            </details>
          )}
          {!job && (
            <section className="un-card">
              <input
                ref={inputRef}
                id="un-file"
                type="file"
                accept={ACCEPT}
                className="un-file"
                disabled={busy}
                onChange={(e) => pick(e.target.files?.[0])}
              />
              <label
                htmlFor="un-file"
                className={`un-drop${drag ? ' un-drop-on' : ''}${file ? ' un-drop-has' : ''}${busy ? ' un-drop-off' : ''}`}
                onDragOver={(e) => { e.preventDefault(); if (!busy) setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) pick(e.dataTransfer.files?.[0]); }}
              >
                {file ? (
                  <>
                    <span className="un-drop-name">{file.name}</span>
                    <span className="un-drop-meta">{mb(file.size)} · нажми, чтобы выбрать другой</span>
                  </>
                ) : (
                  <>
                    <span className="un-drop-title">Выбрать ролик</span>
                    <span className="un-drop-meta">mp4 или mov, можно перетащить сюда</span>
                  </>
                )}
              </label>
              <p className="un-hint">до 3 минут и 500 МБ · версия минутного ролика около минуты, страницу можно закрыть</p>

              <div className="un-label" id="un-count-label">Сколько версий</div>
              <div className="un-count" role="radiogroup" aria-labelledby="un-count-label">
                {Array.from({ length: 5 }, (_, k) => k + 1).map((n) => (
                  n <= max ? (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={count === n}
                      className={count === n ? 'un-count-btn un-count-on' : 'un-count-btn'}
                      onClick={() => setCount(n)}
                      disabled={busy}
                    >{n}</button>
                  ) : (
                    <span key={n} className="un-count-btn un-count-lock" aria-hidden="true">{n}<LockIcon /></span>
                  )
                ))}
              </div>
              {max < 5 && <p className="un-count-note">3–5 версий на тарифах 2 и 3 «Нового уровня». <a href="https://thesashatoyz.com/uroven">Про курс</a></p>}

              {uploadPct !== null ? (
                <div className="un-progress" aria-live="polite">
                  <div className="un-progress-row"><span>Загружаю ролик</span><b>{uploadPct}%</b></div>
                  <div className="un-bar"><i style={{ width: `${uploadPct}%` }} /></div>
                </div>
              ) : (
                <button type="button" className="un-run" disabled={!file || busy} onClick={() => file && upload(file, count)}>
                  уникализировать
                </button>
              )}
              {error && <div className="un-error" role="alert">{error}</div>}
            </section>
          )}

          {job && <JobCard job={job} access={acc} remaining={remaining} onNew={startNew} onDownload={download} onDownloadAll={downloadAll} bulk={bulk} />}
          {job && error && <div className="un-error" role="alert">{error}</div>}
          {job && job.status === 'done' && job.done > 0 && acc.offer && <OfferCard key={job.id} kind={acc.offer} uid={tgRef.current?.initDataUnsafe?.user?.id ?? null} tg={tgRef.current} onTrack={track} />}
          {acc.free && acc.ref && acc.plan && <Invite ref_={acc.ref} perWeek={acc.plan.w} tg={tgRef.current} onTrack={track} />}
          <Guide />
          <Feedback initData={initData.current} />
        </>
      )}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .un-wrap {
          --un-bg: oklch(0.97 0.006 75); --un-text: oklch(0.16 0.015 55);
          --un-muted: oklch(0.46 0.012 55); --un-accent: oklch(0.60 0.19 52);
          --un-accent-soft: oklch(0.93 0.04 52); --un-surface: oklch(1 0 0);
          --un-line: oklch(0.90 0.008 75);
          --un-good: oklch(0.55 0.13 150); --un-good-soft: oklch(0.95 0.04 150);
          --un-low: oklch(0.56 0.19 28); --un-low-soft: oklch(0.95 0.035 28);
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--un-text);
          background: var(--un-bg); min-height: 100svh;
        }
        .un-wrap * { box-sizing: border-box; }
        .un-top { margin-bottom: 16px; }
        .un-back { display: inline-block; text-decoration: none; color: var(--un-muted); font-size: 13px; font-weight: 600; margin-bottom: 10px; padding: 4px 0; }
        .un-back:hover { color: var(--un-accent); }
        .un-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; line-height: 1.1; }
        .un-sub { color: var(--un-muted); font-size: 13px; margin-top: 5px; line-height: 1.4; }
        .un-browser {
          display: inline-block; margin-top: 12px; cursor: pointer; background: none;
          border: 1px solid var(--un-line); color: var(--un-muted); font-family: inherit;
          font-weight: 600; font-size: 13px; padding: 8px 13px; border-radius: 10px;
        }
        .un-card { background: var(--un-surface); border: 1px solid var(--un-line); border-radius: 18px; padding: 18px; margin-bottom: 12px; }
        .un-label { font-size: 12px; font-weight: 700; color: var(--un-muted); letter-spacing: 0.01em; margin: 18px 0 8px; }

        .un-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
        .un-drop {
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          min-height: 128px; padding: 18px 14px; text-align: center; cursor: pointer;
          border: 2px dashed var(--un-line); border-radius: 14px; background: var(--un-bg);
          transition: border-color .15s, background-color .15s;
        }
        .un-file:focus-visible + .un-drop { outline: 2px solid var(--un-accent); outline-offset: 2px; }
        .un-drop:hover, .un-drop-on { border-color: var(--un-accent); background: var(--un-accent-soft); }
        .un-drop-has { border-style: solid; border-color: var(--un-accent); }
        .un-drop-off { cursor: default; opacity: .6; }
        .un-drop-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 17px; color: var(--un-accent); }
        .un-drop-name { font-weight: 700; font-size: 15px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .un-drop-meta { font-size: 12.5px; color: var(--un-muted); }
        .un-hint { margin: 8px 0 0; font-size: 12.5px; line-height: 1.4; color: var(--un-muted); }

        .un-count { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .un-count-btn {
          min-height: 48px; border-radius: 12px; cursor: pointer; font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 800; font-size: 18px; color: var(--un-text); background: var(--un-bg); border: 1px solid var(--un-line);
          font-variant-numeric: tabular-nums;
        }
        .un-count-on { background: var(--un-accent); border-color: var(--un-accent); color: oklch(1 0 0); }
        .un-count-btn:disabled { cursor: default; opacity: .6; }

        .un-run, .un-cta, .un-dl, .un-new, .un-all, .un-fb-send {
          display: flex; align-items: center; justify-content: center; width: 100%; min-height: 52px;
          text-decoration: none; cursor: pointer; border: none; border-radius: 12px;
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px;
        }
        .un-run, .un-cta { margin-top: 18px; background: var(--un-accent); color: oklch(1 0 0); }
        .un-run:disabled { background: var(--un-line); color: var(--un-muted); cursor: default; }

        .un-progress { margin-top: 18px; }
        .un-progress-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .un-progress-row b { font-variant-numeric: tabular-nums; }
        .un-bar { height: 10px; border-radius: 99px; background: var(--un-line); overflow: hidden; }
        .un-bar i { display: block; height: 100%; background: var(--un-accent); border-radius: 99px; transition: width .3s; }
        .un-bar-done i { background: var(--un-good); transition: none; }

        .un-status { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.015em; margin: 0 0 4px; }
        .un-status-sub { font-size: 13px; color: var(--un-muted); margin: 0 0 14px; line-height: 1.4; }
        .un-files { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .un-dl { background: var(--un-good-soft); color: var(--un-good); justify-content: space-between; padding: 0 16px; }
        .un-dl span { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; color: var(--un-muted); }
        .un-all { margin-top: 16px; background: var(--un-good); color: oklch(1 0 0); justify-content: space-between; padding: 0 16px; }
        .un-all:disabled { opacity: .7; cursor: default; }
        .un-all span { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; opacity: .85; }
        .un-new { margin-top: 14px; background: none; border: 1px solid var(--un-line); color: var(--un-text); }

        /* Free plan meter */
        .un-plan {
          display: flex; align-items: stretch; justify-content: space-between; gap: 12px;
          margin: 0 0 12px; padding: 14px 16px; border-radius: 18px;
          background: var(--un-surface); border: 1px solid var(--un-line);
        }
        .un-plan-k { font-size: 11.5px; font-weight: 700; color: var(--un-muted); letter-spacing: 0.02em; margin-bottom: 8px; }
        .un-plan-slots { display: flex; align-items: center; gap: 6px; }
        .un-slot { width: 22px; height: 30px; border-radius: 7px; background: var(--un-line); }
        .un-slot-free { background: var(--un-accent); }
        .un-plan-num { margin-left: 8px; font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 26px; line-height: 1; font-variant-numeric: tabular-nums; }
        .un-plan-num span { font-family: 'Manrope', system-ui, sans-serif; font-weight: 600; font-size: 13px; color: var(--un-muted); }
        .un-plan-side { text-align: right; padding-left: 14px; border-left: 1px solid var(--un-line); }
        .un-timer { display: flex; align-items: baseline; justify-content: flex-end; gap: 2px; }
        .un-timer b { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 26px; line-height: 1; font-variant-numeric: tabular-nums; }
        .un-timer span { font-size: 13px; font-weight: 700; color: var(--un-muted); margin-right: 6px; }
        .un-timer span:last-child { margin-right: 0; }

        /* Locked version counts */
        .un-count-lock { display: flex; align-items: center; justify-content: center; gap: 4px; color: var(--un-muted); opacity: .55; cursor: default; background: transparent; border-style: dashed; }
        .un-lock-ic { flex: none; }
        .un-count-note { margin: 8px 0 0; font-size: 12.5px; color: var(--un-muted); }
        .un-count-note a { color: var(--un-accent); font-weight: 700; text-decoration: none; }

        /* Accordions */
        .un-acc { margin: 0 0 12px; border-radius: 16px; background: var(--un-surface); border: 1px solid var(--un-line); }
        .un-acc summary {
          list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px;
          min-height: 52px; padding: 0 16px; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15.5px;
        }
        .un-acc summary::-webkit-details-marker { display: none; }
        .un-acc summary::after {
          content: ''; flex: none; width: 9px; height: 9px; margin-top: -4px;
          border-right: 2.5px solid var(--un-muted); border-bottom: 2.5px solid var(--un-muted); transform: rotate(45deg);
          transition: transform .25s cubic-bezier(.22,1,.36,1);
        }
        .un-acc[open] summary::after { transform: rotate(225deg); margin-top: 4px; }
        .un-acc summary:focus-visible { outline: 2px solid var(--un-accent); outline-offset: 2px; border-radius: 16px; }
        .un-acc > p { margin: 0; padding: 0 16px 16px; font-size: 14px; line-height: 1.5; }
        .un-acc-guide { margin-top: 22px; }

        /* Guide steps with drawings */
        .un-steps { list-style: none; margin: 0; padding: 4px 16px 18px; display: flex; flex-direction: column; gap: 14px; }
        .un-steps li { display: grid; grid-template-columns: 56px 1fr; gap: 14px; align-items: center; }
        .un-step-art {
          position: relative; width: 56px; height: 56px; border-radius: 16px;
          display: grid; place-items: center; background: var(--un-accent-soft); color: var(--un-accent);
        }
        .un-step-art svg { width: 40px; height: 40px; }
        .un-step-art span {
          position: absolute; top: -6px; left: -6px; width: 22px; height: 22px; border-radius: 50%;
          display: grid; place-items: center; background: var(--un-text); color: var(--un-bg);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 12px;
        }
        .un-steps b { display: block; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; }
        .un-steps p { margin: 2px 0 0; font-size: 13.5px; line-height: 1.45; color: var(--un-muted); }

        /* Referral */
        .un-offer { margin: 0 0 12px; border: 1.5px solid var(--un-text); border-radius: 14px; overflow: hidden; background: var(--un-accent-soft); box-shadow: 4px 4px 0 var(--un-text); }
        .un-offer-bar { display: flex; justify-content: space-between; align-items: center; padding: 7px 12px; background: var(--un-text); color: oklch(0.95 0.01 75); font-size: 12.5px; font-weight: 700; letter-spacing: 0.02em; }
        .un-offer-bar i { font-style: normal; opacity: .7; letter-spacing: 0.15em; }
        .un-offer-body { padding: 16px 16px 14px; }
        .un-offer h2 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 21px; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 8px; }
        .un-offer p { margin: 0 0 14px; font-size: 14.5px; line-height: 1.5; }
        .un-offer-cta {
          display: flex; align-items: center; justify-content: center; min-height: 52px; border-radius: 12px;
          background: var(--un-accent); color: oklch(0.99 0.005 75); text-decoration: none;
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 16px;
        }
        .un-offer-cta:active { transform: translateY(1px); }
        .un-offer-note { margin-top: 8px; text-align: center; font-size: 12.5px; font-weight: 600; color: var(--un-muted); }
        .un-inv {
          margin-top: 22px; padding: 22px 18px 18px; border-radius: 22px;
          background: oklch(0.21 0.02 52); color: oklch(0.97 0.01 75);
        }
        .un-inv-eyebrow { font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: oklch(0.78 0.15 60); }
        .un-inv h2 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px; line-height: 1.12; letter-spacing: -0.02em; margin: 8px 0 18px; }
        .un-ladder { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; align-items: end; }
        .un-step { display: flex; flex-direction: column; align-items: stretch; gap: 6px; }
        .un-step i {
          position: relative; display: block; border-radius: 10px 10px 6px 6px;
          background: oklch(0.32 0.02 52);
        }
        .un-step-on i { background: var(--un-accent); }
        .un-step-next i { background: transparent; border: 2px dashed oklch(0.78 0.15 60); }
        .un-step-next em {
          position: absolute; inset: 0; display: grid; place-items: center; font-style: normal;
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 16px; color: oklch(0.82 0.14 60);
        }
        .un-step span { text-align: center; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14px; color: oklch(0.70 0.02 75); font-variant-numeric: tabular-nums; }
        .un-step-on span { color: oklch(0.97 0.01 75); }
        .un-ladder-cap { margin-top: 4px; text-align: center; font-size: 12px; color: oklch(0.70 0.02 75); }
        .un-inv-share {
          display: flex; align-items: center; justify-content: center; width: 100%; min-height: 54px; margin-top: 18px;
          border: none; border-radius: 14px; cursor: pointer; background: var(--un-accent); color: oklch(0.99 0.005 75);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 17px;
        }
        .un-inv-copy {
          display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; min-height: 46px; margin-top: 8px;
          padding: 0 14px; border-radius: 12px; cursor: pointer; background: oklch(0.27 0.02 52); border: 1px solid oklch(0.34 0.02 52);
          color: oklch(0.85 0.01 75); font-family: inherit; font-size: 12.5px;
        }
        .un-inv-copy span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .un-inv-copy b { flex: none; font-weight: 800; color: oklch(0.82 0.14 60); }
        .un-inv-rule { margin: 12px 0 0; font-size: 12.5px; line-height: 1.45; color: oklch(0.72 0.02 75); }
        .un-fb-body { padding: 0 16px 16px; }
        .un-fb-body p { margin: 0 0 12px; font-size: 13.5px; line-height: 1.45; color: var(--un-muted); }
        .un-fb-text {
          width: 100%; box-sizing: border-box; resize: vertical; min-height: 96px; padding: 12px 13px;
          border: 1px solid var(--un-line); border-radius: 12px; background: var(--un-bg); color: var(--un-text);
          font: 500 16px/1.45 'Manrope', system-ui, sans-serif;
        }
        .un-fb-text:focus { outline: 2px solid var(--un-accent); outline-offset: 1px; }
        .un-fb-send { margin-top: 10px; background: var(--un-text); color: var(--un-bg); }
        .un-fb-send:disabled { background: var(--un-line); color: var(--un-muted); cursor: default; }
        .un-fb-ok { font-size: 14.5px; font-weight: 600; color: var(--un-good); background: var(--un-good-soft); border-radius: 12px; padding: 12px 14px; }
        .un-fb-ok button { margin-left: 6px; border: none; background: none; padding: 0; color: var(--un-muted); font: inherit; text-decoration: underline; cursor: pointer; }
        .un-error { margin-top: 12px; font-size: 14px; line-height: 1.45; color: var(--un-low); background: var(--un-low-soft); border-radius: 10px; padding: 11px 13px; }
        .un-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .un-login-sub { color: var(--un-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .un-tg-login { margin-top: 4px; min-height: 46px; }
        .un-login-alt { display: inline-block; margin-top: 12px; text-decoration: none; color: var(--un-muted); font-size: 13px; font-weight: 600; }
        .un-lock-badge { display: inline-block; font-size: 12px; font-weight: 700; color: var(--un-muted); background: var(--un-bg); border: 1px solid var(--un-line); padding: 5px 10px; border-radius: 999px; }
        .un-lock-h1 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px; letter-spacing: -0.02em; margin: 12px 0 8px; }
        .un-lock-p { font-size: 14.5px; line-height: 1.55; margin: 0; }
        .un-state { text-align: center; padding: 48px 16px; }
        .un-state p { color: var(--un-muted); margin: 0; }
        .un-spinner { width: 24px; height: 24px; border: 3px solid var(--un-line); border-top-color: var(--un-accent); border-radius: 50%; margin: 0 auto 12px; animation: un-spin .8s linear infinite; display: inline-block; }
        @keyframes un-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .un-spinner { animation: none; }
          .un-bar i, .un-drop, .un-acc summary::after { transition: none; }
        }
      `}</style>
    </main>
  );
}

function Feedback({ initData }: { initData: string }) {
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');
  async function submit() {
    if (!text.trim() || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/cabinet/uniq/feedback', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...(initData ? { 'x-tg-init-data': initData } : {}) },
        body: JSON.stringify({ text }),
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
    <details className="un-acc un-fb">
      <summary>Пожелания и баги</summary>
      <div className="un-fb-body">
      <p>Что-то не работает или хочется новую функцию, напиши. Придёт Саше лично.</p>
      {state === 'sent' ? (
        <div className="un-fb-ok">
          Спасибо, получил! <button type="button" onClick={() => setState('idle')}>написать ещё</button>
        </div>
      ) : (
        <>
          <textarea
            className="un-fb-text"
            rows={4}
            maxLength={2000}
            placeholder="Например: версии скачались, но в галерее не видно, айфон 13"
            value={text}
            onChange={(e) => { setText(e.target.value); if (state === 'error') setState('idle'); }}
          />
          <button type="button" className="un-fb-send" disabled={!text.trim() || state === 'sending'} onClick={submit}>
            {state === 'sending' ? 'отправляю…' : 'отправить'}
          </button>
          {state === 'error' && <div className="un-error" role="alert">{err}</div>}
        </>
      )}
      </div>
    </details>
  );
}

function LockIcon() {
  return (
    <svg className="un-lock-ic" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="2" fill="currentColor" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function useNow(everyMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), everyMs);
    return () => window.clearInterval(t);
  }, [everyMs]);
  return now;
}

/** Free plan at a glance: this week's slots and, when they are spent, a countdown to the next one. */
function PlanMeter({ plan, week }: { plan: Plan; week: Week | null }) {
  const now = useNow(30_000);
  const used = week?.used ?? 0;
  const left = Math.max(0, plan.w - used);
  const waitMs = left === 0 && week?.nextAt ? Math.max(0, week.nextAt - now) : 0;
  const d = Math.floor(waitMs / 86_400_000);
  const h = Math.floor((waitMs % 86_400_000) / 3_600_000);
  const m = Math.floor((waitMs % 3_600_000) / 60_000);
  return (
    <section className="un-plan" aria-label="Твой лимит">
      <div className="un-plan-main">
        <div className="un-plan-k">Роликов на этой неделе</div>
        <div className="un-plan-slots">
          {Array.from({ length: plan.w }, (_, k) => (
            <i key={k} className={k < left ? 'un-slot un-slot-free' : 'un-slot'} />
          ))}
          <b className="un-plan-num">{left}<span> из {plan.w}</span></b>
        </div>
      </div>
      {left === 0 && waitMs > 0 ? (
        <div className="un-plan-side" aria-live="polite">
          <div className="un-plan-k">Новый через</div>
          <div className="un-timer">
            {d > 0 && <><b>{d}</b><span>д</span></>}
            <b>{h}</b><span>ч</span>
            {d === 0 && <><b>{m}</b><span>м</span></>}
          </div>
        </div>
      ) : (
        <div className="un-plan-side">
          <div className="un-plan-k">Версий на ролик</div>
          <div className="un-timer"><b>{plan.v}</b></div>
        </div>
      )}
    </section>
  );
}

function Invite({ ref_, perWeek, tg, onTrack }: { ref_: RefStats; perWeek: number; tg: TelegramWebAppLike | null; onTrack: (ev: string) => void }) {
  const [copied, setCopied] = useState(false);
  const shareText = 'Бесплатный уникализатор: из одного ролика несколько версий для пробных рилсов';
  const share = () => {
    onTrack('share');
    const url = `https://t.me/share/url?url=${encodeURIComponent(ref_.link)}&text=${encodeURIComponent(shareText)}`;
    const t = tg as (TelegramWebAppLike & { openTelegramLink?: (u: string) => void }) | null;
    if (t?.openTelegramLink) t.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener');
  };
  const copy = async () => {
    onTrack('copy');
    try { await navigator.clipboard.writeText(ref_.link); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* user can select the link */ }
  };
  const max = 5;
  const full = perWeek >= max;
  return (
    <section className="un-inv">
      <div className="un-inv-eyebrow">Приведи друга</div>
      <h2>{full ? 'У тебя максимум: 5 роликов в неделю' : <>+1 ролик в неделю<br />за каждого друга. Навсегда.</>}</h2>
      <ol className="un-ladder" aria-label={`Сейчас ${roliki(perWeek)} в неделю из ${max}`}>
        {Array.from({ length: max }, (_, k) => k + 1).map((n) => (
          <li key={n} className={n <= perWeek ? 'un-step un-step-on' : n === perWeek + 1 ? 'un-step un-step-next' : 'un-step'}>
            <i style={{ height: `${28 + n * 14}px` }}>{n === perWeek + 1 && <em>+1</em>}</i>
            <span>{n}</span>
          </li>
        ))}
      </ol>
      <div className="un-ladder-cap">роликов в неделю{n0(ref_.credited)}</div>
      {!full && (
        <>
          <button type="button" className="un-inv-share" onClick={share}>Позвать друга</button>
          <button type="button" className="un-inv-copy" onClick={copy}>
            <span>{ref_.link.replace('https://', '')}</span>
            <b>{copied ? 'скопировано' : 'копировать'}</b>
          </button>
          <p className="un-inv-rule">Друг засчитается, когда подпишется на канал и сделает свой первый ролик.</p>
        </>
      )}
    </section>
  );
}

// A/B offer on the final screen. Copy is taken from the live landings and the /huki card.
const OFFERS: Record<Offer, { file: string; title: string; text: string; cta: string; note: string; url: string }> = {
  uroven: {
    file: 'новый_уровень.exe',
    title: 'Новый уровень контента',
    text: 'Курс Саши по контенту: 6 уровней навыка, чтобы вывести блог и личный бренд на следующую ступень. Записан целиком, доступ сразу после оплаты.',
    cta: 'Смотреть курс',
    note: 'от 6 550 ₽',
    // from= is what the course landing and /pay/<tier> record as the source of a sale.
    url: 'https://thesashatoyz.com/uroven?from=uniq-a&utm_source=kabinet&utm_medium=uniq_a&utm_campaign=uroven',
  },
  potok: {
    file: 'поток_спроса.exe',
    title: 'Ролик есть. Теперь нужна тема, которая уже залетела',
    text: 'В «Потоке Спроса» показываю, где брать заходы, которые собрали просмотры в твоей нише, и как налить в них свой смысл.',
    cta: 'Забрать «Поток Спроса»',
    note: 'сначала видео на 6 минут, потом решаешь',
    url: 'https://thesashatoyz.com/potok-sprosa?utm_source=kabinet&utm_medium=uniq_b&utm_campaign=potok',
  },
  '360': {
    file: 'личный_бренд_360.exe',
    title: 'Личный бренд на 360',
    text: 'Выведем твой контент, продукт и продажи на новый уровень. Через 3 месяца есть результат под твой запрос или вернём деньги. Уникализатор там без лимита и на 5 версий.',
    cta: 'Смотреть программу',
    note: '10 000 ₽ в месяц · отменить можно в любой момент',
    url: 'https://thesashatoyz.com/360?from=uniq-c&utm_source=kabinet&utm_medium=uniq_c&utm_campaign=360',
  },
};

function OfferCard({ kind, uid, tg, onTrack }: { kind: Offer; uid: number | null; tg: TelegramWebAppLike | null; onTrack: (ev: string) => void }) {
  const base = OFFERS[kind];
  // ?u= lets the course landing bind the checkout to this Telegram account.
  const o = kind === 'uroven' && uid ? { ...base, url: `${base.url}&u=${uid}` } : base;
  useEffect(() => { onTrack(`cta_view_${kind}`); }, [kind, onTrack]);
  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onTrack(`cta_click_${kind}`);
    const t = tg as (TelegramWebAppLike & { openLink?: (u: string) => void }) | null;
    if (t?.openLink) { e.preventDefault(); t.openLink(o.url); }
  };
  return (
    <section className="un-offer" aria-label={o.title}>
      <div className="un-offer-bar"><span>{o.file}</span><i aria-hidden="true">_ □ ✕</i></div>
      <div className="un-offer-body">
        <h2>{o.title}</h2>
        <p>{o.text}</p>
        <a className="un-offer-cta" href={o.url} target="_blank" rel="noopener" onClick={open}>{o.cta} →</a>
        <div className="un-offer-note">{o.note}</div>
      </div>
    </section>
  );
}

const n0 = (credited: number) => (credited ? ` · друзей засчитано: ${credited}` : '');

const GUIDE: { t: string; d: string; art: 'save' | 'plus' | 'toggle' | 'spread' | 'bars' }[] = [
  { t: 'Скачай все версии', d: 'Кнопка «скачать все», файлы лягут в галерею.', art: 'save' },
  { t: 'Инстаграм: «+» → Reels', d: 'Выбери одну версию и нажми «Далее».', art: 'plus' },
  { t: 'Включи «Пробная версия»', d: 'Рилс увидят только те, кто на тебя не подписан. Нужен профессиональный аккаунт.', art: 'toggle' },
  { t: 'Каждую версию отдельно', d: 'С промежутком пару часов, до шести пробных в день.', art: 'spread' },
  { t: 'Через сутки сравни', d: 'Версию, которая набрала больше, переноси в ленту.', art: 'bars' },
];

function GuideArt({ kind }: { kind: (typeof GUIDE)[number]['art'] }) {
  const c = 'currentColor';
  if (kind === 'save') return (
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 10v20m-8-8 8 8 8-8" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 34v4h24v-4" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" /></svg>
  );
  if (kind === 'plus') return (
    <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="11" y="11" width="26" height="26" rx="8" fill="none" stroke={c} strokeWidth="3.2" /><path d="M24 18v12M18 24h12" stroke={c} strokeWidth="3.2" strokeLinecap="round" /></svg>
  );
  if (kind === 'toggle') return (
    <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="16" width="32" height="16" rx="8" fill={c} /><circle cx="32" cy="24" r="5.5" fill="var(--un-surface)" /></svg>
  );
  if (kind === 'spread') return (
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 30h34" stroke={c} strokeWidth="2.4" strokeLinecap="round" opacity=".35" />{[10, 19, 28, 37].map((x) => <circle key={x} cx={x} cy="30" r="3.6" fill={c} />)}<path d="M10 20h9" stroke={c} strokeWidth="2.4" strokeLinecap="round" /><text x="14.5" y="15" textAnchor="middle" fontSize="10" fontWeight="800" fill={c}>2ч</text></svg>
  );
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="26" width="7" height="12" rx="2" fill={c} opacity=".35" /><rect x="20.5" y="13" width="7" height="25" rx="2" fill={c} /><rect x="32" y="21" width="7" height="17" rx="2" fill={c} opacity=".35" /></svg>
  );
}

function Guide() {
  return (
    <details className="un-acc un-acc-guide">
      <summary>Как выложить пробными рилсами</summary>
      <ol className="un-steps">
        {GUIDE.map((g, k) => (
          <li key={g.t}>
            <div className="un-step-art"><GuideArt kind={g.art} /><span>{k + 1}</span></div>
            <div><b>{g.t}</b><p>{g.d}</p></div>
          </li>
        ))}
      </ol>
    </details>
  );
}

function JobCard({ job, access, remaining, onNew, onDownload, onDownloadAll, bulk }: {
  job: Job;
  access: Access;
  remaining: number | null;
  onNew: () => void;
  onDownload: (e: React.MouseEvent<HTMLAnchorElement>, href: string, name: string) => void;
  onDownloadAll: (items: { href: string; name: string }[]) => void;
  bulk: boolean;
}) {
  const items = job.versions.map((v) => ({
    i: v.i, size: v.size,
    href: `${access.url}${v.url}?t=${encodeURIComponent(access.token)}`,
    name: `${v.i}.mp4`,
  }));
  const total = job.total || 1;
  const finished = job.status === 'done' || job.done + job.failed >= total;
  const pct = finished ? 100 : Math.round(((job.done + job.failed) / total) * 100);
  let title: string;
  let sub: string;
  if (job.status === 'queued') {
    title = job.position > 0 ? `в очереди: ${job.position}` : 'начинаю';
    sub = 'Можно закрыть страницу: когда вернёшься, готовые версии будут здесь.';
  } else if (job.status === 'running') {
    title = `готово ${job.done} из ${total}`;
    sub = 'Делаю версии по одной. Можно закрыть страницу и вернуться.';
  } else if (job.status === 'done') {
    title = `готово ${job.done} из ${total}`;
    sub = job.failed > 0
      ? `${job.failed} не получилось сделать. Скачай готовые, файлы хранятся сутки.`
      : 'Скачай версии, файлы хранятся сутки.';
  } else {
    title = 'не получилось';
    sub = job.error || 'Версии не собрались. Попробуй другой файл или напиши Саше.';
  }

  return (
    <section className="un-card" aria-live="polite">
      <h2 className="un-status">{title}</h2>
      <p className="un-status-sub">{sub}</p>
      {job.status !== 'failed' && (
        <div className={finished ? 'un-bar un-bar-done' : 'un-bar'}><i style={{ width: `${Math.max(job.status === 'queued' ? 0 : 4, pct)}%` }} /></div>
      )}
      {items.length > 1 && finished && (
        <button type="button" className="un-all" disabled={bulk} onClick={() => onDownloadAll(items)}>
          {bulk ? 'скачиваю…' : `скачать все ${items.length}`}
          <span>{mb(items.reduce((n, it) => n + it.size, 0))}</span>
        </button>
      )}
      {items.length > 0 && (
        <ul className="un-files">
          {items.map(({ i, size, href, name }) => (
            <li key={i}>
              <a className="un-dl" href={href} download={name} onClick={(e) => onDownload(e, href, name)}>
                скачать {name} <span>{mb(size)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {(job.status === 'done' || job.status === 'failed') && (
        <>
          {remaining !== null && (
            <p className="un-status-sub" style={{ margin: '14px 0 0' }}>
              {remaining > 0 ? `По этому ролику можно сделать ещё ${remaining}.` : 'Лимит версий по этому ролику исчерпан.'}
            </p>
          )}
          <button type="button" className="un-new" onClick={onNew}>загрузить другой ролик</button>
        </>
      )}
    </section>
  );
}

export default function UniqPage() {
  return <Suspense fallback={null}><UniqInner /></Suspense>;
}
