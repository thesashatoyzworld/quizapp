'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp, type TelegramWebAppLike } from '@/lib/telegram-ready';
import { trackSection } from '@/lib/cabinet-track';
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
type Access = { token: string; url: string; max: number };

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
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'broken' | 'ok'>('load');
  const [brokenMsg, setBrokenMsg] = useState('');
  const [max, setMax] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(5);
  const [drag, setDrag] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initData = useRef('');
  const tgRef = useRef<TelegramWebAppLike | null>(null);
  // Ref for callbacks (always the latest token), state for rendering download links.
  const access = useRef<Access | null>(null);
  const [acc, setAcc] = useState<Access | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fresh token from the cabinet. Returns the HTTP status for the caller to branch on.
  const loadAccess = useCallback(async (): Promise<{ status: number; error?: string }> => {
    const headers: Record<string, string> = initData.current ? { 'x-tg-init-data': initData.current } : {};
    const res = await fetch('/api/cabinet/uniq', { headers, credentials: 'same-origin', cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.token) {
      access.current = { token: data.token, url: String(data.url).replace(/\/+$/, ''), max: data.max || 5 };
      setAcc(access.current);
      setMax(access.current.max);
    }
    return { status: res.status, error: data.error };
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
        if (r.status === 403) { setState('locked'); return; }
        if (!access.current) { setBrokenMsg(r.error || 'Не получилось открыть раздел. Обнови страницу.'); setState('broken'); return; }
        setState('ok');
        trackSection('uniq', id);
        // Resume a job that is still in work (page reopened mid-processing).
        const me = await vpsGet('/api/me').catch(() => null);
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
        <div className="un-sub">Загрузи ролик, получи до {max} немного разных версий для пробных рилсов</div>
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
          {!job && (
            <aside className="un-pick">
              <b>Какой ролик брать.</b> Желательно тот, что уже дал промежуточный результат: набрал больше
              твоих обычных просмотров, собрал сохранения, репосты или заявки, но до конца не выстрелил.
              Тема уже доказала, что цепляет, и версии дают ей ещё несколько попыток дойти до новых людей.
              Ролик, который не зашёл совсем, лучше переснять с другим заходом.
            </aside>
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
              <p className="un-hint">до 3 минут и 500 МБ, до {max} версий на один ролик. Одна версия минутного ролика делается около минуты, можно закрыть страницу и вернуться</p>

              <div className="un-label" id="un-count-label">Сколько версий</div>
              <div className="un-count" role="radiogroup" aria-labelledby="un-count-label">
                {Array.from({ length: max }, (_, k) => k + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={count === n}
                    className={count === n ? 'un-count-btn un-count-on' : 'un-count-btn'}
                    onClick={() => setCount(n)}
                    disabled={busy}
                  >{n}</button>
                ))}
              </div>

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

        .un-pick {
          margin: 0 0 14px; padding: 14px 16px; border-radius: 14px; font-size: 14px; line-height: 1.5;
          background: var(--un-accent-soft); color: var(--un-text);
        }
        .un-guide { margin-top: 22px; padding: 4px 4px 0; }
        .un-guide h2 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -0.01em; margin: 0 0 10px; }
        .un-guide ol { margin: 0; padding-left: 22px; display: flex; flex-direction: column; gap: 8px; font-size: 14.5px; line-height: 1.5; }
        .un-guide li::marker { font-weight: 700; color: var(--un-accent); }
        .un-guide p { margin: 14px 0 0; font-size: 13px; color: var(--un-muted); }
        .un-fb { margin-top: 26px; padding: 18px 16px; border-radius: 14px; background: var(--un-surface); border: 1px solid var(--un-line); }
        .un-fb h2 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -0.01em; margin: 0 0 4px; }
        .un-fb p { margin: 0 0 12px; font-size: 13.5px; line-height: 1.45; color: var(--un-muted); }
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
          .un-bar i, .un-drop { transition: none; }
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
    <section className="un-fb">
      <h2>Пожелания и баги</h2>
      <p>Что-то не работает, неудобно или хочется новую функцию, напиши сюда. Сообщение придёт Саше лично.</p>
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
    </section>
  );
}

function Guide() {
  return (
    <section className="un-guide">
      <h2>Как выложить пробными рилсами</h2>
      <ol>
        <li>Загрузи ролик, выбери число версий и дождись, пока все будут готовы.</li>
        <li>Нажми «скачать все», версии сохранятся в телефон. Если делал на компьютере, перекинь файлы на телефон.</li>
        <li>В Инстаграме: «+» → Reels → выбери одну версию → «Далее».</li>
        <li>
          На экране публикации включи «Пробная версия» (Trial). Такой рилс сначала показывают только тем,
          кто на тебя не подписан: в ленте профиля и у подписчиков его нет. Переключатель есть только
          у профессионального аккаунта (автор или бизнес).
        </li>
        <li>Выбери, кто переносит рилс в ленту: ты вручную или Инстаграм сам, если ролик зайдёт.</li>
        <li>
          Каждую версию выкладывай отдельным пробным рилсом, с промежутком в пару часов. До шести пробных
          в день нормально, мы так выкладывали. Подпись можно оставить ту же или чуть поменять.
        </li>
        <li>Через сутки сравни просмотры версий. Ту, что зашла лучше всех, переноси в ленту.</li>
      </ol>
      <p>Файлы хранятся сутки, лимит 5 версий на один ролик.</p>
    </section>
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
