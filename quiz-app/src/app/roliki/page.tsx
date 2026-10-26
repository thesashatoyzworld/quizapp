'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import { trackSection } from '@/lib/cabinet-track';
import ReelsBoard, { REELS_BOARD_CSS } from '@/components/ReelsBoard';
import { codeOf, todayIso, type Column, type ReelBriefView, type ReelVersionView } from '@/lib/reels/plan';

// Раздел «Ролики» — для клиентов лички: ТЗ монтажёру, что смонтировано,
// что когда выкладываем и сколько набрало выложенное. Доступ строго по
// Telegram id, данные приезжают уже отфильтрованными (/api/cabinet/reels).
// Клиент здесь только смотрит и отмечает выложенное ссылкой на рилс.
// Саша видит переключатель клиентов: API отдаёт ему доски всех, у кого они есть.

interface Space {
  clientName: string;
  igHandle: string;
  briefs: ReelBriefView[];
  versions: ReelVersionView[];
}

const BOT_URL = 'https://t.me/testtoyzbot';
const FAIL = 'Не сохранилось. Открой раздел через бота и попробуй ещё раз.';

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
  return <div ref={ref} className="rk-tg-login" />;
}

function RolikiInner() {
  const [state, setState] = useState<'load' | 'guest' | 'empty' | 'ok'>('load');
  const [space, setSpace] = useState<Space | null>(null);
  const initData = useRef('');
  const [open, setOpen] = useState<{ title: string; html: string } | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  // Только у админа: чьи доски есть и чья открыта.
  const [clients, setClients] = useState<{ telegramId: string; name: string }[] | null>(null);
  const [client, setClient] = useState<string | undefined>(undefined);

  async function load(pick?: string) {
    const qs = pick ? `?client=${encodeURIComponent(pick)}` : '';
    const res = await fetch(`/api/cabinet/reels${qs}`, { headers: authHeaders(), credentials: 'same-origin' });
    const data = await res.json();
    setClients(Array.isArray(data.clients) ? data.clients : null);
    setClient(data.client);
    setPublishing(null);
    if (!data.identified) setState('guest');
    else if (!data.hasReels) { setSpace(null); setState('empty'); }
    else { setSpace(data.space); setState('ok'); }
    return data;
  }

  useEffect(() => {
    let stop = false;
    (async () => {
      // SDK подключён с defer — ждём его, иначе потеряли бы опознание по initData.
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const id = tg?.initDataUnsafe?.user?.id ?? null;
      initData.current = typeof tg?.initData === 'string' ? tg.initData : '';
      try {
        const data = await load();
        if (!stop && data.hasReels && !data.clients) trackSection('roliki', id);
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  // Опознание только подписанное: initData из Mini App, в браузере сессия-cookie.
  function authHeaders(): Record<string, string> {
    return initData.current ? { 'x-tg-init-data': initData.current } : {};
  }

  async function openBrief(b: ReelBriefView) {
    try {
      const qs = new URLSearchParams({ brief: b.id });
      if (client) qs.set('client', client);
      const res = await fetch(`/api/cabinet/reels?${qs}`, { headers: authHeaders(), credentials: 'same-origin' });
      const data = await res.json();
      if (data.html) setOpen({ title: b.title, html: data.html });
    } catch { /* noop */ }
  }

  async function publish(v: ReelVersionView) {
    const code = codeOf(link);
    if (!code) { setErr('Нужна ссылка вида instagram.com/reel/…'); return; }
    setSaving(true);
    setErr('');
    try {
      const headers = { ...authHeaders(), 'Content-Type': 'application/json' };
      const res = await fetch('/api/cabinet/reels', {
        method: 'POST', headers, credentials: 'same-origin',
        body: JSON.stringify({ versionId: v.id, link, client }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(res.status === 400 && data.error ? data.error : FAIL);
      setSpace((s) => s && {
        ...s,
        versions: s.versions.map((x) => x.id === v.id
          ? { ...x, stage: 'up', code: data.code, uploadedAt: data.uploadedAt, planDate: null,
              ...(x.code === data.code ? {} : { plays: null, likes: null, comments: null, statsAt: null }) }
          : x),
      });
      setPublishing(null);
      setLink('');
    } catch (e) {
      setErr(e instanceof Error && e.message ? e.message : FAIL);
    }
    setSaving(false);
  }

  function versionExtra(v: ReelVersionView, col: Column) {
    if (col === 'up') return null;
    if (publishing !== v.id) {
      return (
        <div className="rl-acts">
          <button type="button" className="rl-btn" onClick={() => { setPublishing(v.id); setLink(''); setErr(''); }}>
            выложил
          </button>
        </div>
      );
    }
    return (
      <form className="rl-form" onSubmit={(e) => { e.preventDefault(); publish(v); }}>
        <input className="rl-input" value={link} onChange={(e) => setLink(e.target.value)}
          placeholder="ссылка на рилс" autoComplete="off" inputMode="url" autoFocus />
        <button className="rl-btn rl-btn-primary" type="submit" disabled={saving}>{saving ? '…' : 'ок'}</button>
        <button className="rl-btn" type="button" onClick={() => setPublishing(null)} aria-label="Отмена">×</button>
        {err && <div className="rl-err">{err}</div>}
      </form>
    );
  }

  return (
    <main className="rk-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Неблокирующая загрузка шрифтов: недоступный fonts.googleapis.com не должен
          оставлять экран белым (см. кабинет /dostup). */}
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700;800&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />
      <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700;800&subset=cyrillic,latin&display=swap" rel="stylesheet" />
      </noscript>

      <header className="rk-top">
        <a className="rk-back" href="/dostup">‹ Кабинет</a>
        <div className="rk-brand">Ролики</div>
        <div className="rk-sub">
          {space?.igHandle ? `@${space.igHandle} · ` : ''}от ТЗ монтажёру до выложенного рилса
        </div>
      </header>

      {clients && clients.length > 0 && (
        <nav className="rk-clients" aria-label="Клиент">
          {clients.map((c) => (
            <button key={c.telegramId} type="button" aria-pressed={c.telegramId === client}
              className={`rk-chip${c.telegramId === client ? ' rk-chip-on' : ''}`}
              onClick={() => { if (c.telegramId !== client) load(c.telegramId).catch(() => setState('guest')); }}>
              {c.name}
            </button>
          ))}
        </nav>
      )}

      {state === 'load' && (
        <div className="rk-state"><div className="rk-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="rk-card">
          <div className="rk-login-title">Вход в раздел</div>
          <div className="rk-login-sub">Ролики привязаны к твоему Telegram. Войди, и здесь откроются твои.</div>
          <TelegramLoginButton />
          <a className="rk-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">Или открыть в боте →</a>
        </div>
      )}

      {state === 'empty' && (
        <div className="rk-card">
          <p className="rk-empty">Здесь появятся твои ролики: ТЗ монтажёру, что смонтировано и когда выкладываем. Пока пусто.</p>
        </div>
      )}

      {state === 'ok' && space && (
        <>
          <ReelsBoard briefs={space.briefs} versions={space.versions} today={todayIso()}
            onOpenBrief={openBrief} versionExtra={versionExtra} />
          <p className="rk-rule">
            В пробные выкладываем одну версию в день, следующую версию того же ролика не раньше чем через день.
            Выложил версию: нажми «выложил» и вставь ссылку на рилс. Просмотры подтягиваются раз в день.
          </p>
        </>
      )}

      {open && (
        <div className="rk-viewer" role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="rk-viewer-bar">
            <button className="rk-viewer-back" onClick={() => setOpen(null)} aria-label="Назад">‹ Назад</button>
            <span className="rk-viewer-title">{open.title}</span>
            <span className="rk-viewer-pad" />
          </div>
          <iframe className="rk-viewer-frame" srcDoc={open.html} title={open.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture" />
        </div>
      )}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .rk-wrap {
          --rk-bg: oklch(0.97 0.006 75); --rk-text: oklch(0.16 0.015 55);
          --rk-muted: oklch(0.46 0.012 55); --rk-accent: oklch(0.60 0.19 52);
          --rk-surface: oklch(1 0 0); --rk-line: oklch(0.90 0.008 75);
          max-width: 1240px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--rk-text);
          background: var(--rk-bg); min-height: 100svh;
        }
        .rk-wrap * { box-sizing: border-box; }
        .rk-top { margin-bottom: 20px; }
        .rk-back { display: inline-block; text-decoration: none; color: var(--rk-muted); font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .rk-back:hover { color: var(--rk-accent); }
        .rk-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; }
        .rk-sub { color: var(--rk-muted); font-size: 13px; margin-top: 3px; line-height: 1.4; }
        .rk-clients { display: flex; flex-wrap: wrap; gap: 8px; margin: -6px 0 18px; }
        .rk-chip {
          cursor: pointer; border: 1px solid var(--rk-line); background: var(--rk-surface); color: var(--rk-text);
          font: 600 13px 'Manrope', system-ui, sans-serif; padding: 7px 14px; border-radius: 999px; min-height: 36px;
        }
        .rk-chip:hover { border-color: var(--rk-accent); }
        .rk-chip-on { background: var(--rk-text); color: var(--rk-surface); border-color: var(--rk-text); }
        .rk-card { max-width: 540px; background: var(--rk-surface); border: 1px solid var(--rk-line); border-radius: 18px; padding: 18px; }
        .rk-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .rk-login-sub { color: var(--rk-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .rk-tg-login { margin-top: 4px; min-height: 46px; }
        .rk-login-alt { display: inline-block; margin-top: 12px; text-decoration: none; color: var(--rk-muted); font-size: 13px; font-weight: 600; }
        .rk-empty { color: var(--rk-muted); font-size: 14px; margin: 0; line-height: 1.5; }
        .rk-rule { color: var(--rk-muted); font-size: 13.5px; line-height: 1.5; max-width: 70ch; margin: 24px 0 0; }
        .rk-state { text-align: center; padding: 48px 16px; }
        .rk-state p { color: var(--rk-muted); margin: 0; }
        .rk-spinner {
          width: 24px; height: 24px; border: 3px solid var(--rk-line); border-top-color: var(--rk-accent);
          border-radius: 50%; margin: 0 auto 12px; animation: rk-spin .8s linear infinite; display: inline-block;
        }
        @keyframes rk-spin { to { transform: rotate(360deg); } }
        .rk-viewer { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; background: var(--rk-bg); }
        .rk-viewer-bar {
          flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; padding-top: max(10px, env(safe-area-inset-top));
          background: var(--rk-surface); border-bottom: 1px solid var(--rk-line);
        }
        .rk-viewer-back {
          flex: 0 0 auto; cursor: pointer; border: none; background: none; color: var(--rk-accent);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 4px 2px;
        }
        .rk-viewer-title {
          flex: 1; min-width: 0; text-align: center; font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 800; font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rk-viewer-pad { flex: 0 0 auto; width: 60px; }
        .rk-viewer-frame { flex: 1 1 auto; width: 100%; border: none; background: var(--rk-bg); }
        ${REELS_BOARD_CSS}
      `}</style>
    </main>
  );
}

export default function RolikiPage() {
  return <Suspense fallback={null}><RolikiInner /></Suspense>;
}
