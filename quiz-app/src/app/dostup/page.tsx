'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { SECTIONS } from '@/content/rooms';

// Официальная кнопка «Войти через Telegram» (Login Widget). Рендерится только
// в браузере (в Mini App не нужна — там опознаём по initData). Требует, чтобы
// домен world.thesashatoyz.com был привязан к @testtoyzbot в @BotFather
// (/setdomain). После входа Telegram редиректит на data-auth-url, где мы
// проверяем подпись и ставим сессию.
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
  return <div ref={ref} className="kb-tg-login" />;
}

const ICONS: Record<string, string> = {
  live: '\u{1F3A5}', recording: '\u{1F4FC}', slides: '\u{1F4D1}', chat: '\u{1F4AC}',
  article: '\u{1F4DD}', podcast: '\u{1F399}\u{FE0F}', link: '\u{1F517}',
};

// Ссылка на бота для входа в кабинет через Telegram (капитал-URL по токену убран:
// доступ персональный, только через привязанный Telegram-аккаунт).
const BOT_URL = 'https://t.me/testtoyzbot';

// Никаких useSearchParams: их единственный вызов уводил всю страницу в
// BAILOUT_TO_CLIENT_SIDE_RENDERING — сервер отдавал пустой HTML, и до загрузки
// JS-чанков в Telegram-вебвью был чистый белый экран.
function DostupInner() {
  const [unlocked, setUnlocked] = useState<string[] | null>(null);
  const [tiers, setTiers] = useState<Record<string, number>>({});
  // Telegram id of the viewer — forwarded to gated cross-domain materials
  // (kabinet.thesashatoyz.com workshops) so their soft-gate can identify the user.
  const [tgId, setTgId] = useState<number | null>(null);
  // Вошёл через браузерный Login Widget (не Mini App) → показываем «Выйти»,
  // чтобы можно было перелогиниться под другим Telegram-аккаунтом.
  const [browserSession, setBrowserSession] = useState(false);
  // true → кабинет открыт не в Telegram (в браузере). Доступ через браузер не даём,
  // показываем экран «открой через бота».
  const [needTg, setNeedTg] = useState(false);
  // Просмотр материала внутри аппа: не уводим в новое окно, открываем во встроенном iframe.
  const [viewer, setViewer] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void; initDataUnsafe?: { user?: { id: number } } } } }).Telegram?.WebApp;
    if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
    const tgId = tg?.initDataUnsafe?.user?.id;

    let stop = false;
    (async () => {
      try {
        // В Mini App опознаёмся по initData id. В браузере id нет — эндпоинт
        // попробует подписанную сессию-cookie (вход через Telegram Login Widget).
        const qs = tgId ? `?telegramId=${tgId}` : '';
        const res = await fetch(`/api/cabinet/rooms${qs}`);
        const data = await res.json();
        if (stop) return;
        if (data.identified) {
          setTgId(tgId ?? data.telegramId ?? null);
          setBrowserSession(!tgId); // нет initData id → вошёл через браузер
          setTiers(data.tiers || {});
          setUnlocked(data.unlockedRoles || []);
        } else {
          // Не опознан (браузер без сессии) → показываем вход через Telegram.
          setNeedTg(true);
          setUnlocked([]);
        }
      } catch {
        if (!stop) { setNeedTg(true); setUnlocked([]); }
      }
    })();
    return () => { stop = true; };
  }, []);

  const has = (role: string | null) => role === null || (unlocked?.includes(role) ?? false);

  return (
    <main className="kb-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Неблокирующая загрузка: media="print" не подходит экрану, поэтому таблица
          не задерживает рендер. Когда шрифты приедут — переключаем на "all". */}
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />
      <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap" rel="stylesheet" />
      </noscript>

      <header className="kb-top">
        <div className="kb-brand">Кабинет</div>
        <div className="kb-sub">TOYZ · пространство участника</div>
      </header>

      {browserSession && tgId && (
        <div className="kb-account">
          <span className="kb-account-id">Вход выполнен · Telegram id {tgId}</span>
          <a className="kb-account-out" href="/api/cabinet/logout">Выйти</a>
        </div>
      )}

      {needTg && (
        <div className="kb-login">
          <div className="kb-login-title">Вход в кабинет</div>
          <div className="kb-login-sub">
            Доступ привязан к твоему Telegram. Войди через Telegram — там все материалы.
            {' '}которые у тебя оплачены. На телефоне удобнее открыть кабинет прямо в боте.
          </div>
          <TelegramLoginButton />
          <a className="kb-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">
            Или открыть в боте →
          </a>
        </div>
      )}

      {!unlocked && !needTg && (
        <div className="kb-state"><div className="kb-spinner" /><p>Загрузка…</p></div>
      )}

      {/* Показываем ВСЕ разделы. Открытые (бесплатные + купленные) — с материалами.
          Закрытые платные — под замком с кнопкой на лендинг: «это есть, но закрыто». */}
      {unlocked && SECTIONS.map((s) => (
        has(s.role) ? (
        <section className="kb-card kb-open" key={s.key}>
          <div className="kb-head">
            <div className="kb-titles">
              <h2 className="kb-h2">{s.title}</h2>
              <p className="kb-csub">{s.subtitle}</p>
            </div>
            <span className="kb-badge kb-badge-open">Открыто</span>
          </div>
          <div className="kb-materials">
            {(() => {
              const myTier = tiers[s.role ?? ''] ?? 0;
              return s.materials.map((m, i) => {
                // Разделитель-подзаголовок перед материалом (группировка внутри раздела).
                const sub = m.subhead ? <div className="kb-subhead">{m.subhead}</div> : null;
                // Материал старшего тарифа: виден, но под замком, если тариф ниже.
                if (m.minTier != null && myTier < m.minTier) {
                  return (
                    <Fragment key={i}>
                      {sub}
                      <div className="kb-mat kb-mat-locked">
                        <span className="kb-mat-icon">{ICONS[m.kind] || ICONS.link}</span>
                        <span className="kb-mat-body">
                          <span className="kb-mat-title">{m.title}</span>
                          <span className="kb-mat-note">{m.lockedNote || m.note}</span>
                        </span>
                        <span className="kb-mat-arr kb-mat-lock">{'\u{1F512}'}</span>
                      </div>
                    </Fragment>
                  );
                }
                const ready = !!m.url;
                // Внутренние роуты (напр. /formula) открываем полноценной навигацией,
                // чтобы работало опознание Telegram/токена.
                const internal = m.url.startsWith('/');
                // Воркшопы/библиотека на kabinet-домене: опознание по ?tg= (внутри
                // iframe их own Telegram SDK недоступен). Их открываем в ПОЛНОМ
                // браузере (openLink), а не в тесном iframe — длинные лонгриды с видео
                // в мини-аппе на десктопе читать неудобно.
                const isKabinet = m.url.includes('kabinet.thesashatoyz.com');
                const openUrl = isKabinet && tgId
                  ? `${m.url}${m.url.includes('?') ? '&' : '?'}tg=${tgId}`
                  : m.url;
                const openExternal = (e: { preventDefault: () => void }) => {
                  e.preventDefault();
                  const tgApp = (window as unknown as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
                  if (tgApp?.openLink) tgApp.openLink(openUrl);
                  else window.open(openUrl, '_blank', 'noopener');
                };
                const Tag = ready ? 'a' : 'div';
                return (
                  <Fragment key={i}>
                    {sub}
                    <Tag className={`kb-mat ${ready ? 'kb-mat-ready' : 'kb-mat-soon'}`}
                      {...(ready ? {
                        href: openUrl,
                        ...(internal ? {} : isKabinet ? {
                          target: '_blank', rel: 'noopener noreferrer', onClick: openExternal,
                        } : {
                          onClick: (e: { preventDefault: () => void }) => { e.preventDefault(); setViewer({ url: openUrl, title: m.title }); },
                        }),
                      } : {})}>
                      <span className="kb-mat-icon">{ICONS[m.kind] || ICONS.link}</span>
                      <span className="kb-mat-body">
                        <span className="kb-mat-title">{m.title}</span>
                        {m.note && <span className="kb-mat-note">{m.note}</span>}
                      </span>
                      <span className="kb-mat-arr">{ready ? '↗' : 'скоро'}</span>
                    </Tag>
                  </Fragment>
                );
              });
            })()}
          </div>
        </section>
        ) : (
        <section className="kb-card kb-locked" key={s.key}>
          <div className="kb-head">
            <div className="kb-titles">
              <h2 className="kb-h2"><span className="kb-lock">{'\u{1F512}'}</span> {s.title}</h2>
              <p className="kb-csub">{s.subtitle}</p>
            </div>
            <span className="kb-badge kb-badge-closed">Закрыто</span>
          </div>
          {s.landingUrl && (
            <a className="kb-getaccess kb-locked-inner" href={s.landingUrl} target="_blank" rel="noopener noreferrer">
              Получить доступ →
            </a>
          )}
        </section>
        )
      ))}

      {viewer && (
        <div className="kb-viewer" role="dialog" aria-modal="true" aria-label={viewer.title}>
          <div className="kb-viewer-bar">
            <button className="kb-viewer-back" onClick={() => setViewer(null)} aria-label="Назад">
              <span className="kb-viewer-chev">{'‹'}</span> Назад
            </button>
            <span className="kb-viewer-title">{viewer.title}</span>
            <a className="kb-viewer-ext" href={viewer.url} target="_blank" rel="noopener" aria-label="Открыть в браузере">{'↗'}</a>
          </div>
          <iframe className="kb-viewer-frame" src={viewer.url} title={viewer.title}
            allow="autoplay; encrypted-media; fullscreen" />
        </div>
      )}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .kb-wrap {
          --kb-bg: oklch(0.97 0.006 75); --kb-text: oklch(0.16 0.015 55);
          --kb-muted: oklch(0.46 0.012 55); --kb-accent: oklch(0.60 0.19 52);
          --kb-accent-soft: oklch(0.93 0.04 52); --kb-ok: oklch(0.50 0.13 155);
          --kb-ok-soft: oklch(0.94 0.05 155); --kb-surface: oklch(1 0 0); --kb-line: oklch(0.90 0.008 75);
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--kb-text);
          background: var(--kb-bg); min-height: 100svh;
        }
        .kb-wrap * { box-sizing: border-box; }
        .kb-top { margin-bottom: 22px; }
        .kb-account {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          background: var(--kb-surface); border: 1px solid var(--kb-line); border-radius: 12px;
          padding: 9px 14px; margin-bottom: 16px;
        }
        .kb-account-id { color: var(--kb-muted); font-size: 12.5px; }
        .kb-account-out {
          flex: 0 0 auto; text-decoration: none; color: var(--kb-accent);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 13px;
        }
        .kb-account-out:hover { opacity: .8; }
        .kb-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; margin: 0; }
        .kb-sub { color: var(--kb-muted); font-size: 13px; margin-top: 2px; }
        .kb-banner {
          display: flex; align-items: center; gap: 10px; background: var(--kb-accent-soft);
          color: var(--kb-text); border-radius: 12px; padding: 12px 14px; font-size: 13.5px; margin-bottom: 16px;
        }
        .kb-login {
          background: var(--kb-surface); border: 1px solid var(--kb-line); border-radius: 16px;
          padding: 16px; margin-bottom: 16px;
        }
        .kb-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .kb-login-sub { color: var(--kb-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .kb-login-row { display: flex; gap: 8px; }
        .kb-login-input {
          flex: 1; min-width: 0; font-family: inherit; font-size: 15px; color: var(--kb-text);
          background: var(--kb-bg); border: 1px solid var(--kb-line); border-radius: 10px; padding: 11px 13px;
        }
        .kb-login-input:focus { outline: none; border-color: var(--kb-accent); }
        .kb-login-btn {
          flex: 0 0 auto; border: none; cursor: pointer; background: var(--kb-accent); color: oklch(1 0 0);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 11px 20px; border-radius: 10px;
        }
        .kb-login-btn:disabled { opacity: .6; cursor: default; }
        .kb-login-err { color: oklch(0.55 0.18 25); font-size: 12.5px; margin-top: 10px; }
        .kb-tg-login { margin-top: 4px; min-height: 46px; }
        .kb-login-alt {
          display: inline-block; margin-top: 12px; text-decoration: none;
          color: var(--kb-muted); font-size: 13px; font-weight: 600;
        }
        .kb-login-alt:hover { color: var(--kb-accent); }
        .kb-card {
          display: block; background: var(--kb-surface); border: 1px solid var(--kb-line);
          border-radius: 18px; padding: 18px; margin-bottom: 14px;
          color: inherit; text-decoration: none;
        }
        .kb-locked { background: oklch(0.985 0.004 75); }
        .kb-head-toggle { cursor: pointer; user-select: none; }
        .kb-chev {
          flex: 0 0 auto; font-size: 22px; color: var(--kb-muted); line-height: 1;
          transition: transform .18s; transform: rotate(0deg);
        }
        .kb-chev-open { transform: rotate(90deg); color: var(--kb-accent); }
        .kb-locked-inner { margin-top: 14px; }
        .kb-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .kb-titles { flex: 1; min-width: 0; }
        .kb-h2 {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 19px; margin: 0;
          letter-spacing: -0.02em; line-height: 1.15; display: flex; align-items: center; gap: 7px; color: var(--kb-text);
        }
        .kb-lock { font-size: 14px; }
        .kb-csub { color: var(--kb-muted); font-size: 13px; margin-top: 3px; }
        .kb-badge { flex: 0 0 auto; font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 999px; white-space: nowrap; }
        .kb-badge-open { background: var(--kb-ok-soft); color: var(--kb-ok); }
        .kb-badge-closed { background: oklch(0.93 0.004 75); color: var(--kb-muted); }
        .kb-materials { display: grid; gap: 9px; margin-top: 14px; }
        .kb-subhead {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.06em; color: var(--kb-muted);
          margin: 8px 2px 1px;
        }
        .kb-subhead:first-child { margin-top: 0; }
        .kb-mat {
          display: flex; align-items: center; gap: 13px; text-decoration: none; color: inherit;
          background: var(--kb-bg); border: 1px solid var(--kb-line); border-radius: 13px; padding: 13px 14px;
          transition: transform .12s, border-color .12s;
        }
        .kb-mat-ready:hover { border-color: var(--kb-accent); }
        .kb-mat-ready:active { transform: translateY(1px); }
        .kb-mat-soon { opacity: .58; }
        .kb-mat-icon { font-size: 20px; flex: 0 0 auto; }
        .kb-mat-body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
        .kb-mat-title { font-weight: 700; font-size: 14.5px; }
        .kb-mat-note { color: var(--kb-muted); font-size: 12px; line-height: 1.4; }
        .kb-mat-arr { flex: 0 0 auto; font-size: 13px; color: var(--kb-accent); font-weight: 700; }
        .kb-mat-soon .kb-mat-arr { color: var(--kb-muted); font-weight: 500; }
        .kb-mat-locked { opacity: .85; }
        .kb-mat-locked .kb-mat-icon { filter: grayscale(0.4); }
        .kb-mat-lock { font-size: 14px; }
        .kb-getaccess {
          display: block; text-align: center; text-decoration: none; margin-top: 12px;
          background: var(--kb-accent); color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif;
          font-weight: 800; font-size: 15px; padding: 13px 18px; border-radius: 11px; transition: opacity .15s;
        }
        .kb-getaccess:hover { opacity: .9; } .kb-getaccess:active { transform: translateY(1px); }
        .kb-state { text-align: center; padding: 48px 16px; }
        .kb-state p { color: var(--kb-muted); margin: 0; }
        .kb-spinner {
          width: 24px; height: 24px; border: 3px solid var(--kb-line); border-top-color: var(--kb-accent);
          border-radius: 50%; margin: 0 auto 12px; animation: kb-spin .8s linear infinite; display: inline-block;
        }
        .kb-banner .kb-spinner { margin: 0; width: 18px; height: 18px; border-width: 2px; }
        @keyframes kb-spin { to { transform: rotate(360deg); } }
        .kb-viewer {
          position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column;
          background: var(--kb-bg); animation: kb-fade .18s ease;
        }
        @keyframes kb-fade { from { opacity: 0; } to { opacity: 1; } }
        .kb-viewer-bar {
          flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; padding-top: max(10px, env(safe-area-inset-top));
          background: var(--kb-surface); border-bottom: 1px solid var(--kb-line);
        }
        .kb-viewer-back {
          flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; cursor: pointer;
          border: none; background: none; color: var(--kb-accent);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 4px 2px;
        }
        .kb-viewer-chev { font-size: 22px; line-height: 1; margin-top: -1px; }
        .kb-viewer-title {
          flex: 1; min-width: 0; text-align: center; color: var(--kb-text);
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14.5px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .kb-viewer-ext {
          flex: 0 0 auto; text-decoration: none; color: var(--kb-muted); font-size: 20px;
          width: 34px; text-align: center; line-height: 1;
        }
        .kb-viewer-frame { flex: 1 1 auto; width: 100%; border: none; background: var(--kb-bg); }
      `}</style>
    </main>
  );
}

export default function DostupPage() {
  return <DostupInner />;
}
