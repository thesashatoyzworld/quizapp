'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import { trackSection, trackMaterial, trackVideo } from '@/lib/cabinet-track';

// Раздел «Новый уровень контента» — основной курс: десять частей, у каждой
// видеозапись и статья с картинками и интерактивами.
//
// Доступ проверяется на сервере (/api/cabinet/kurs), статья приезжает сюда
// уже после проверки — в клиентском бандле курса нет.
// Открытый урок рендерим в iframe: у статей своя вёрстка (Times, системный
// стиль 1998), смешивать её со стилями кабинета нельзя.

interface Card {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  task: string;
  duration: string;
  kinescopeId: string;
  ready: boolean;
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
  return <div ref={ref} className="kr-tg-login" />;
}

function KursInner() {
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'ok'>('load');
  const kbAutoOpen = useRef<string | null>(null);
  const kbOpened = useRef(false);
  const [items, setItems] = useState<Card[]>([]);
  const [tgId, setTgId] = useState<number | null>(null);
  const [wm, setWm] = useState('');
  const [open, setOpen] = useState<{ title: string; html: string } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [preview, setPreview] = useState('');
  // Пройденные уроки. Приезжают с сервера, дополняются на лету, когда человек
  // домотал статью до конца.
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    // ?preview=… — превью для ревью: значение просто пробрасываем на сервер,
    // пускать или нет решает он (локальная разработка либо ревью-ссылка).
    const prev = new URLSearchParams(window.location.search).get('preview') || '';
    // ?open=<slug> — переход из бота сразу в нужный материал.
    kbAutoOpen.current = new URLSearchParams(window.location.search).get('open');
    setPreview(prev);

    let stop = false;
    (async () => {
      // SDK подключён с defer — ждём его, иначе потеряли бы опознание по initData.
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const user = tg?.initDataUnsafe?.user;
      const id = user?.id ?? null;
      setTgId(id);
      if (user) {
        const who = user.username ? '@' + user.username : user.first_name || '';
        setWm(who ? `${who} · ${user.id}` : String(user.id));
      }
      try {
        const qs = new URLSearchParams();
        if (id) qs.set('telegramId', String(id));
        if (prev) qs.set('preview', prev);
        const res = await fetch(`/api/cabinet/kurs${qs.toString() ? `?${qs}` : ''}`);
        const data = await res.json();
        if (stop) return;
        if (!data.identified) setState('guest');
        else if (!data.allowed) setState('locked');
        else {
          setItems(data.items || []);
          setDone(data.done || []);
          setState('ok');
          trackSection('kurs', id);
        }
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  // Статья живёт в iframe и стучится наверх: дочитал до конца, открой следующий,
  // вернись к списку.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data as {
        kurs?: string;
        slug?: string;
        kvideo?: { kind: string; slug: string; percent: number; seconds: number };
      };
      if (!d || typeof d !== 'object') return;
      // Веха досмотра от плеера внутри статьи.
      if (d.kvideo && d.kvideo.slug) {
        trackVideo('kurs', d.kvideo.slug, d.kvideo.percent, d.kvideo.seconds, tgId);
        return;
      }
      if (!d.kurs) return;
      if (d.kurs === 'done' && d.slug) {
        const slug = d.slug;
        setDone((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
        // Отметка переживает перезаход только при опознанном Telegram —
        // по ревью-ссылке галка живёт до перезагрузки.
        if (tgId) {
          fetch('/api/cabinet/kurs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, telegramId: tgId }),
          }).catch(() => { /* noop */ });
        }
      }
      if (d.kurs === 'back') setOpen(null);
      if (d.kurs === 'open' && d.slug) {
        const card = items.find((i) => i.slug === d.slug);
        if (card) { setOpen(null); openLesson(card); }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // openLesson читает tgId/preview/wm — держим слушателя в курсе свежих значений
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, tgId, preview, wm]);

  // Пришли по ссылке из бота — открываем материал, как только список загрузился.
  useEffect(() => {
    if (state !== 'ok' || kbOpened.current || !kbAutoOpen.current) return;
    const card = items.find((i) => i.slug === kbAutoOpen.current);
    if (card && card.ready) {
      kbOpened.current = true;
      openLesson(card);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, items]);

  async function openLesson(card: Card) {
    if (!card.ready) return;
    setOpening(card.slug);
    trackMaterial('kurs', card.slug, card.title, tgId);
    try {
      const qs = new URLSearchParams({ slug: card.slug });
      if (tgId) qs.set('telegramId', String(tgId));
      if (preview) qs.set('preview', preview);
      if (wm) qs.set('wm', wm);
      const res = await fetch(`/api/cabinet/kurs?${qs}`);
      const data = await res.json();
      if (data.html) setOpen({ title: card.title, html: data.html });
    } catch { /* noop */ }
    setOpening(null);
  }

  const ready = items.filter((i) => i.ready).length;
  const passed = items.filter((i) => done.includes(i.slug)).length;

  return (
    <main className="kr-wrap">
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

      <header className="kr-top">
        <a className="kr-back" href="/dostup">‹ Кабинет</a>
        <div className="kr-brand">Новый уровень контента</div>
        <div className="kr-sub">Шесть уровней навыка. Каждый урок — запись и та же мысль текстом, с картинками и разборами</div>
      </header>

      {state === 'load' && (
        <div className="kr-state"><div className="kr-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="kr-card kr-login">
          <div className="kr-login-title">Вход в курс</div>
          <div className="kr-login-sub">
            Доступ привязан к твоему Telegram. Войди — и курс откроется.
          </div>
          <TelegramLoginButton />
          <a className="kr-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">
            Или открыть в боте →
          </a>
        </div>
      )}

      {state === 'locked' && (
        <div className="kr-card kr-locked">
          <div className="kr-lock-badge">🔒 Закрытый раздел</div>
          <h1 className="kr-lock-h1">Новый уровень контента</h1>
          <p className="kr-lock-p">
            Курс из шести уровней навыка: от «хочу, но не делаю» до «всё работает, хочу больше».
            Каждый уровень решает свою задачу, и вы идёте с того, на котором стоите сейчас.
          </p>
          <a className="kr-cta" href="https://thesashatoyz.com/uroven">Посмотреть тарифы →</a>
        </div>
      )}

      {state === 'ok' && (
        <div className="kr-count">
          {ready} из {items.length} частей открыто
          {passed > 0 ? ` · пройдено ${passed}` : ' · остальные выходят по мере съёмки'}
        </div>
      )}

      {state === 'ok' && items.map((c, i) => {
        const isDone = done.includes(c.slug);
        return (
          <button
            className={`kr-card kr-item${c.ready ? '' : ' kr-soon'}${isDone ? ' kr-passed' : ''}`}
            key={c.slug}
            onClick={() => openLesson(c)}
            disabled={!c.ready}
          >
            <div className="kr-item-head">
              <span className="kr-num">{String(i).padStart(2, '0')}</span>
              <span className="kr-badge">{c.badge}</span>
              {isDone && <span className="kr-done">✓ пройдено</span>}
              <span className="kr-meta">
                {c.ready ? `🎥 запись ${c.duration} + текст` : 'скоро'}
              </span>
            </div>
            <h2 className="kr-item-title">{c.title}</h2>
            <p className="kr-item-sub">{c.subtitle}</p>
            <p className="kr-item-task"><b>Задача:</b> {c.task}</p>
            {c.ready && (
              <span className="kr-item-arr">
                {opening === c.slug ? 'открываю…' : isDone ? 'Открыть ещё раз ↗' : 'Открыть урок ↗'}
              </span>
            )}
          </button>
        );
      })}

      {open && (
        <div className="kr-viewer" role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="kr-viewer-bar">
            <button className="kr-viewer-back" onClick={() => setOpen(null)} aria-label="Назад">
              <span className="kr-viewer-chev">{'‹'}</span> Назад
            </button>
            <span className="kr-viewer-title">{open.title}</span>
            <span className="kr-viewer-pad" />
          </div>
          <iframe className="kr-viewer-frame" srcDoc={open.html} title={open.title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture" />
        </div>
      )}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .kr-wrap {
          --kr-bg: oklch(0.97 0.006 75); --kr-text: oklch(0.16 0.015 55);
          --kr-muted: oklch(0.46 0.012 55); --kr-accent: oklch(0.60 0.19 52);
          --kr-accent-soft: oklch(0.93 0.04 52); --kr-surface: oklch(1 0 0);
          --kr-line: oklch(0.90 0.008 75);
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--kr-text);
          background: var(--kr-bg); min-height: 100svh;
        }
        .kr-wrap * { box-sizing: border-box; }
        .kr-top { margin-bottom: 16px; }
        .kr-back {
          display: inline-block; text-decoration: none; color: var(--kr-muted);
          font-size: 13px; font-weight: 600; margin-bottom: 10px;
        }
        .kr-back:hover { color: var(--kr-accent); }
        .kr-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; line-height: 1.1; }
        .kr-sub { color: var(--kr-muted); font-size: 13px; margin-top: 5px; line-height: 1.4; }
        .kr-count {
          font-size: 12px; font-weight: 700; color: var(--kr-muted);
          margin: 0 0 12px; letter-spacing: 0.01em;
        }
        .kr-card {
          display: block; width: 100%; text-align: left; background: var(--kr-surface);
          border: 1px solid var(--kr-line); border-radius: 18px; padding: 18px; margin-bottom: 14px;
          color: inherit; font-family: inherit;
        }
        .kr-item { cursor: pointer; transition: border-color .12s, transform .12s; }
        .kr-item:hover:not(:disabled) { border-color: var(--kr-accent); }
        .kr-item:active:not(:disabled) { transform: translateY(1px); }
        .kr-soon { opacity: 0.55; cursor: default; }
        .kr-item-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .kr-num {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 13px;
          color: var(--kr-accent); letter-spacing: 0.02em;
        }
        .kr-badge {
          font-size: 11.5px; font-weight: 700; background: var(--kr-accent-soft);
          color: var(--kr-accent); padding: 4px 9px; border-radius: 999px;
        }
        .kr-done {
          font-size: 11.5px; font-weight: 700; color: oklch(0.52 0.14 150);
          background: oklch(0.94 0.05 150); padding: 4px 9px; border-radius: 999px;
        }
        .kr-meta { font-size: 12px; color: var(--kr-muted); margin-left: auto; }
        .kr-passed { border-color: oklch(0.85 0.06 150); }
        .kr-passed .kr-item-title { color: var(--kr-muted); }
        .kr-item-title {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 20px;
          letter-spacing: -0.02em; line-height: 1.16; margin: 11px 0 0;
        }
        .kr-item-sub { color: var(--kr-muted); font-size: 13.5px; line-height: 1.45; margin: 6px 0 0; }
        .kr-item-task { font-size: 12.5px; line-height: 1.4; margin: 10px 0 0; color: var(--kr-text); }
        .kr-item-task b { color: var(--kr-accent); }
        .kr-item-arr {
          display: inline-block; margin-top: 14px; color: var(--kr-accent);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14px;
        }
        .kr-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .kr-login-sub { color: var(--kr-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .kr-tg-login { margin-top: 4px; min-height: 46px; }
        .kr-login-alt {
          display: inline-block; margin-top: 12px; text-decoration: none;
          color: var(--kr-muted); font-size: 13px; font-weight: 600;
        }
        .kr-login-alt:hover { color: var(--kr-accent); }
        .kr-lock-badge {
          display: inline-block; font-size: 12px; font-weight: 700; color: var(--kr-muted);
          background: var(--kr-bg); border: 1px solid var(--kr-line); padding: 5px 10px; border-radius: 999px;
        }
        .kr-lock-h1 {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px;
          letter-spacing: -0.02em; margin: 12px 0 8px;
        }
        .kr-lock-p { font-size: 14.5px; line-height: 1.55; color: var(--kr-text); margin: 0 0 18px; }
        .kr-cta {
          display: block; text-align: center; text-decoration: none; background: var(--kr-accent);
          color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
          font-size: 15px; padding: 13px 18px; border-radius: 11px;
        }
        .kr-cta:active { transform: translateY(1px); }
        .kr-state { text-align: center; padding: 48px 16px; }
        .kr-state p { color: var(--kr-muted); margin: 0; }
        .kr-spinner {
          width: 24px; height: 24px; border: 3px solid var(--kr-line); border-top-color: var(--kr-accent);
          border-radius: 50%; margin: 0 auto 12px; animation: kr-spin .8s linear infinite; display: inline-block;
        }
        @keyframes kr-spin { to { transform: rotate(360deg); } }
        .kr-viewer {
          position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column;
          background: #fff; animation: kr-fade .18s ease;
        }
        @keyframes kr-fade { from { opacity: 0; } to { opacity: 1; } }
        .kr-viewer-bar {
          flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; padding-top: max(10px, env(safe-area-inset-top));
          background: var(--kr-surface); border-bottom: 1px solid var(--kr-line);
        }
        .kr-viewer-back {
          flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; cursor: pointer;
          border: none; background: none; color: var(--kr-accent);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 4px 2px;
        }
        .kr-viewer-chev { font-size: 22px; line-height: 1; margin-top: -1px; }
        .kr-viewer-title {
          flex: 1; min-width: 0; text-align: center; color: var(--kr-text);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14.5px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .kr-viewer-pad { flex: 0 0 auto; width: 34px; }
        .kr-viewer-frame { flex: 1 1 auto; width: 100%; border: none; background: #fff; }
      `}</style>
    </main>
  );
}

export default function KursPage() {
  return <Suspense fallback={null}><KursInner /></Suspense>;
}
