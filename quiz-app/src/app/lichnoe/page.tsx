'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';

// Раздел «Личное» — записи персональных созвонов с конспектами.
// Доступ строго по Telegram id: человек видит только свои материалы. Проверка
// живёт на сервере (/api/cabinet/lichnoe), сюда контент приезжает уже после
// неё — в клиентском бандле чужих созвонов нет.

interface Card {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  duration: string;
  tags: string[];
  hasVideo: boolean;
}

const BOT_URL = 'https://t.me/testtoyzbot';

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
  return <div ref={ref} className="rz-tg-login" />;
}

function ru(date: string) {
  const M = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${M[m - 1]} ${y}`;
}

function LichnoeInner() {
  const [state, setState] = useState<'load' | 'guest' | 'ok'>('load');
  const [items, setItems] = useState<Card[]>([]);
  const [tgId, setTgId] = useState<number | null>(null);
  // Открытый конспект рендерим в iframe, чтобы его стили не смешивались со
  // стилями кабинета.
  const [open, setOpen] = useState<{ title: string; html: string } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    (async () => {
      // SDK подключён с defer — ждём его, иначе потеряли бы опознание по initData.
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const id = tg?.initDataUnsafe?.user?.id ?? null;
      setTgId(id);
      try {
        const qs = id ? `?telegramId=${id}` : '';
        const res = await fetch(`/api/cabinet/lichnoe${qs}`);
        const data = await res.json();
        if (stop) return;
        if (!data.identified) setState('guest');
        else { setItems(data.items || []); setState('ok'); }
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  async function openMaterial(card: Card) {
    setOpening(card.slug);
    try {
      const qs = new URLSearchParams({ slug: card.slug });
      if (tgId) qs.set('telegramId', String(tgId));
      const res = await fetch(`/api/cabinet/lichnoe?${qs}`);
      const data = await res.json();
      if (data.html) setOpen({ title: card.title, html: data.html });
    } catch { /* noop */ }
    setOpening(null);
  }

  return (
    <main className="rz-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Неблокирующая загрузка шрифтов: недоступный fonts.googleapis.com не должен
          оставлять экран белым (см. кабинет /dostup). */}
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />
      <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap" rel="stylesheet" />
      </noscript>

      <header className="rz-top">
        <a className="rz-back" href="/dostup">‹ Кабинет</a>
        <div className="rz-brand">Личное</div>
        <div className="rz-sub">Записи твоих личных созвонов и конспекты к ним. Видишь только ты</div>
      </header>

      {state === 'load' && (
        <div className="rz-state"><div className="rz-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="rz-card rz-login">
          <div className="rz-login-title">Вход в раздел</div>
          <div className="rz-login-sub">
            Личные материалы привязаны к твоему Telegram. Войди — и здесь откроются твои созвоны.
          </div>
          <TelegramLoginButton />
          <a className="rz-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">
            Или открыть в боте →
          </a>
        </div>
      )}

      {state === 'ok' && items.length === 0 && (
        <div className="rz-card">
          <p className="rz-empty">
            Здесь появятся записи твоих личных созвонов с конспектом по таймкодам.
            Пока пусто.
          </p>
        </div>
      )}

      {state === 'ok' && items.map((c) => (
        <button className="rz-card rz-item" key={c.slug} onClick={() => openMaterial(c)}>
          <div className="rz-item-head">
            <span className="rz-item-kind">{c.hasVideo ? '🎥 запись + конспект' : '📝 конспект'}</span>
            <span className="rz-item-date">{ru(c.date)} · {c.duration}</span>
          </div>
          <h2 className="rz-item-title">{c.title}</h2>
          <p className="rz-item-sub">{c.subtitle}</p>
          <div className="rz-tags">
            {c.tags.map((t) => <span className="rz-tag" key={t}>{t}</span>)}
          </div>
          <span className="rz-item-arr">{opening === c.slug ? 'открываю…' : 'Открыть созвон ↗'}</span>
        </button>
      ))}

      {open && (
        <div className="rz-viewer" role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="rz-viewer-bar">
            <button className="rz-viewer-back" onClick={() => setOpen(null)} aria-label="Назад">
              <span className="rz-viewer-chev">{'‹'}</span> Назад
            </button>
            <span className="rz-viewer-title">{open.title}</span>
            <span className="rz-viewer-pad" />
          </div>
          <iframe className="rz-viewer-frame" srcDoc={open.html} title={open.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture" />
        </div>
      )}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .rz-wrap {
          --rz-bg: oklch(0.97 0.006 75); --rz-text: oklch(0.16 0.015 55);
          --rz-muted: oklch(0.46 0.012 55); --rz-accent: oklch(0.60 0.19 52);
          --rz-accent-soft: oklch(0.93 0.04 52); --rz-surface: oklch(1 0 0);
          --rz-line: oklch(0.90 0.008 75);
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--rz-text);
          background: var(--rz-bg); min-height: 100svh;
        }
        .rz-wrap * { box-sizing: border-box; }
        .rz-top { margin-bottom: 20px; }
        .rz-back {
          display: inline-block; text-decoration: none; color: var(--rz-muted);
          font-size: 13px; font-weight: 600; margin-bottom: 10px;
        }
        .rz-back:hover { color: var(--rz-accent); }
        .rz-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; }
        .rz-sub { color: var(--rz-muted); font-size: 13px; margin-top: 3px; line-height: 1.4; }
        .rz-card {
          display: block; width: 100%; text-align: left; background: var(--rz-surface);
          border: 1px solid var(--rz-line); border-radius: 18px; padding: 18px; margin-bottom: 14px;
          color: inherit; font-family: inherit;
        }
        .rz-item { cursor: pointer; transition: border-color .12s, transform .12s; }
        .rz-item:hover { border-color: var(--rz-accent); }
        .rz-item:active { transform: translateY(1px); }
        .rz-item-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .rz-item-kind {
          font-size: 11.5px; font-weight: 700; background: var(--rz-accent-soft);
          color: var(--rz-accent); padding: 4px 9px; border-radius: 999px;
        }
        .rz-item-date { font-size: 12px; color: var(--rz-muted); }
        .rz-item-title {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 19px;
          letter-spacing: -0.02em; line-height: 1.18; margin: 11px 0 0;
        }
        .rz-item-sub { color: var(--rz-muted); font-size: 13.5px; line-height: 1.45; margin: 6px 0 0; }
        .rz-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .rz-tag {
          font-size: 11.5px; color: var(--rz-muted); background: var(--rz-bg);
          border: 1px solid var(--rz-line); padding: 4px 9px; border-radius: 999px;
        }
        .rz-item-arr {
          display: inline-block; margin-top: 14px; color: var(--rz-accent);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14px;
        }
        .rz-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .rz-login-sub { color: var(--rz-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .rz-tg-login { margin-top: 4px; min-height: 46px; }
        .rz-login-alt {
          display: inline-block; margin-top: 12px; text-decoration: none;
          color: var(--rz-muted); font-size: 13px; font-weight: 600;
        }
        .rz-login-alt:hover { color: var(--rz-accent); }
        .rz-empty { color: var(--rz-muted); font-size: 14px; margin: 0; line-height: 1.5; }
        .rz-state { text-align: center; padding: 48px 16px; }
        .rz-state p { color: var(--rz-muted); margin: 0; }
        .rz-spinner {
          width: 24px; height: 24px; border: 3px solid var(--rz-line); border-top-color: var(--rz-accent);
          border-radius: 50%; margin: 0 auto 12px; animation: rz-spin .8s linear infinite; display: inline-block;
        }
        @keyframes rz-spin { to { transform: rotate(360deg); } }
        .rz-viewer {
          position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column;
          background: var(--rz-bg); animation: rz-fade .18s ease;
        }
        @keyframes rz-fade { from { opacity: 0; } to { opacity: 1; } }
        .rz-viewer-bar {
          flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; padding-top: max(10px, env(safe-area-inset-top));
          background: var(--rz-surface); border-bottom: 1px solid var(--rz-line);
        }
        .rz-viewer-back {
          flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; cursor: pointer;
          border: none; background: none; color: var(--rz-accent);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 4px 2px;
        }
        .rz-viewer-chev { font-size: 22px; line-height: 1; margin-top: -1px; }
        .rz-viewer-title {
          flex: 1; min-width: 0; text-align: center; color: var(--rz-text);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14.5px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rz-viewer-pad { flex: 0 0 auto; width: 34px; }
        .rz-viewer-frame { flex: 1 1 auto; width: 100%; border: none; background: var(--rz-bg); }
      `}</style>
    </main>
  );
}

export default function LichnoePage() {
  return <Suspense fallback={null}><LichnoeInner /></Suspense>;
}
