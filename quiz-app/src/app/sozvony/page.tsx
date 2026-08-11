'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';

// Раздел «Групповые созвоны» — записи регулярных групповых встреч с конспектами.
// Доступ: активный «Новый уровень контента» тарифа 2 или 3. Проверка живёт на
// сервере (/api/cabinet/sozvony), сюда контент приезжает уже после проверки —
// в клиентском бандле записей нет.

interface Card {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  duration: string;
  tags: string[];
  participants: string[];
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

function SozvonyInner() {
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'ok'>('load');
  const kbAutoOpen = useRef<string | null>(null);
  const kbOpened = useRef(false);
  const [tier, setTier] = useState(0);
  const [items, setItems] = useState<Card[]>([]);
  const [tgId, setTgId] = useState<number | null>(null);
  // Открытый созвон: HTML конспекта рендерим в iframe, чтобы его стили не
  // смешивались со стилями кабинета.
  const [open, setOpen] = useState<{ title: string; html: string } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    // ?preview=1 — превью вёрстки при локальной разработке (сервер пускает
    // только вне продакшена).
    const preview = new URLSearchParams(window.location.search).get('preview') === '1';
    // ?open=<slug> - переход из бота сразу в нужный материал.
    kbAutoOpen.current = new URLSearchParams(window.location.search).get('open');
    setPreview(preview);

    let stop = false;
    (async () => {
      // SDK подключён с defer — ждём его, иначе потеряли бы опознание по initData.
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const id = tg?.initDataUnsafe?.user?.id ?? null;
      setTgId(id);
      try {
        const qs = new URLSearchParams();
        if (id) qs.set('telegramId', String(id));
        if (preview) qs.set('preview', '1');
        const res = await fetch(`/api/cabinet/sozvony${qs.toString() ? `?${qs}` : ''}`);
        const data = await res.json();
        if (stop) return;
        setTier(data.tier || 0);
        if (!data.identified) setState('guest');
        else if (!data.allowed) setState('locked');
        else { setItems(data.items || []); setState('ok'); }
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  // Пришли по ссылке из бота - открываем материал, как только список загрузился.
  useEffect(() => {
    if (state !== 'ok' || kbOpened.current || !kbAutoOpen.current) return;
    const card = items.find((i) => i.slug === kbAutoOpen.current);
    if (card) {
      kbOpened.current = true;
      openSozvon(card);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, items]);

  async function openSozvon(card: Card) {
    setOpening(card.slug);
    try {
      const qs = new URLSearchParams({ slug: card.slug });
      if (tgId) qs.set('telegramId', String(tgId));
      if (preview) qs.set('preview', '1');
      const res = await fetch(`/api/cabinet/sozvony?${qs}`);
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
        <div className="rz-brand">Групповые созвоны</div>
        <div className="rz-sub">Записи встреч и конспекты по таймкодам: что разбирали и что делать дальше</div>
      </header>

      {state === 'load' && (
        <div className="rz-state"><div className="rz-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="rz-card rz-login">
          <div className="rz-login-title">Вход в раздел</div>
          <div className="rz-login-sub">
            Созвоны привязаны к твоему Telegram. Войди, и раздел откроется, если у тебя тариф 2 или 3.
          </div>
          <TelegramLoginButton />
          <a className="rz-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">
            Или открыть в боте →
          </a>
        </div>
      )}

      {state === 'locked' && (
        <div className="rz-card rz-locked">
          <div className="rz-lock-badge">🔒 Закрытый раздел</div>
          <h1 className="rz-lock-h1">Групповые созвоны</h1>
          <p className="rz-lock-p">
            Здесь лежат записи регулярных групповых встреч с конспектами по таймкодам.
            Раздел открыт на тарифах <b>2</b> и <b>3</b> «Нового уровня контента».
            {tier > 0 && <> Сейчас у тебя тариф {tier}.</>}
          </p>
          <a className="rz-cta" href="https://thesashatoyz.com/uroven">Посмотреть тарифы →</a>
        </div>
      )}

      {state === 'ok' && items.length === 0 && (
        <div className="rz-card"><p className="rz-empty">Запись первого созвона появится здесь совсем скоро.</p></div>
      )}

      {state === 'ok' && items.map((c) => (
        <button className="rz-card rz-item" key={c.slug} onClick={() => openSozvon(c)}>
          <div className="rz-item-head">
            <span className="rz-item-kind">{c.hasVideo ? '🎥 запись + конспект' : '📝 конспект'}</span>
            <span className="rz-item-date">{ru(c.date)} · {c.duration}</span>
          </div>
          <h2 className="rz-item-title">{c.title}</h2>
          <p className="rz-item-sub">{c.subtitle}</p>
          {c.participants?.length > 0 && (
            <p className="rz-item-who">Разбирали: {c.participants.join(', ')}</p>
          )}
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
        .rz-item-who { font-size: 12.5px; color: var(--rz-text); font-weight: 600; margin: 8px 0 0; }
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
        .rz-lock-badge {
          display: inline-block; font-size: 12px; font-weight: 700; color: var(--rz-muted);
          background: var(--rz-bg); border: 1px solid var(--rz-line); padding: 5px 10px; border-radius: 999px;
        }
        .rz-lock-h1 {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px;
          letter-spacing: -0.02em; margin: 12px 0 8px;
        }
        .rz-lock-p { font-size: 14.5px; line-height: 1.55; color: var(--rz-text); margin: 0 0 18px; }
        .rz-cta {
          display: block; text-align: center; text-decoration: none; background: var(--rz-accent);
          color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
          font-size: 15px; padding: 13px 18px; border-radius: 11px;
        }
        .rz-cta:active { transform: translateY(1px); }
        .rz-empty { color: var(--rz-muted); font-size: 14px; margin: 0; }
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

export default function SozvonyPage() {
  return <Suspense fallback={null}><SozvonyInner /></Suspense>;
}
