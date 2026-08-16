'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import { trackSection, trackMaterial } from '@/lib/cabinet-track';
import OpenInBrowser from '@/components/OpenInBrowser';

// Раздел «Поток спроса» — раздача из двух файлов: методичка ученику и правила,
// которые он отдаёт программе.
//
// Файлы отдаёт сервер (/api/cabinet/potok) после проверки доступа: материал платный,
// в public их класть нельзя, иначе они лежат по прямой ссылке в обход гейта.

interface FileItem {
  key: string;
  name: string;
  label: string;
  note: string;
  bytes: number;
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
  return <div ref={ref} className="pt-tg-login" />;
}

function PotokInner() {
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'ok'>('load');
  const [items, setItems] = useState<FileItem[]>([]);
  const [tgId, setTgId] = useState<number | null>(null);
  // Метку превью читаем один раз при создании состояния: на сервере window нет,
  // а ссылки с ней рисуются только после загрузки, то есть уже на клиенте.
  const [preview] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('preview') || '');
  const [viewer, setViewer] = useState(false);

  useEffect(() => {
    const prev = preview;
    let stop = false;
    (async () => {
      const tg = await waitForTelegramWebApp();
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      const id = tg?.initDataUnsafe?.user?.id ?? null;
      setTgId(id);
      try {
        const qs = new URLSearchParams();
        if (id) qs.set('telegramId', String(id));
        if (prev) qs.set('preview', prev);
        const res = await fetch(`/api/cabinet/potok${qs.toString() ? `?${qs}` : ''}`);
        const data = await res.json();
        if (stop) return;
        if (!data.identified) setState('guest');
        else if (!data.allowed) setState('locked');
        else { setItems(data.items || []); setState('ok'); trackSection('potok', id); }
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  /** Ссылка на файл: доступ проверяется на сервере, метка нужна для опознания. */
  function href(extra: Record<string, string>) {
    const qs = new URLSearchParams(extra);
    if (tgId) qs.set('telegramId', String(tgId));
    if (preview) qs.set('preview', preview);
    return `/api/cabinet/potok?${qs}`;
  }

  const zip = items.find((i) => i.key === 'zip');
  const rest = items.filter((i) => i.key !== 'zip');

  return (
    <main className="pt-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />
      <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap" rel="stylesheet" />
      </noscript>

      <header className="pt-top">
        <a className="pt-back" href="/dostup">‹ Кабинет</a>
        <div className="pt-brand">Поток спроса</div>
        <div className="pt-sub">Как находить заходы, которые уже сработали, и наливать внутрь свой смысл</div>
        {/* Файлы качать из вебвью Телеграма неудобно, поэтому выход в браузер здесь
            нужнее всего. Метод всё равно требует компьютера. */}
        <OpenInBrowser path="/potok" className="pt-browser" />
      </header>

      {state === 'load' && (
        <div className="pt-state"><div className="pt-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="pt-card pt-login">
          <div className="pt-login-title">Вход</div>
          <div className="pt-login-sub">Доступ привязан к твоему Telegram. Войди — и материал откроется.</div>
          <TelegramLoginButton />
          <a className="pt-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">Или открыть в боте →</a>
        </div>
      )}

      {state === 'locked' && (
        <div className="pt-card pt-locked">
          <div className="pt-lock-badge">🔒 Закрытый раздел</div>
          <h1 className="pt-lock-h1">Поток спроса</h1>
          <p className="pt-lock-p">
            Метод поиска рабочих заходов по данным: не выдумывать хук, а найти тот, который уже
            собрал реакцию у других авторов в твоей теме, и дать внутри свои смыслы.
          </p>
          <a className="pt-cta" href="https://thesashatoyz.com/uroven">Посмотреть тарифы →</a>
        </div>
      )}

      {state === 'ok' && (
        <>
          <div className="pt-card pt-about">
            <p>
              Заход — это первые три секунды ролика или первый слайд карусели. Самая сильная часть
              упаковки и единственная, которую можно честно взять у другого автора.
            </p>
            <p>
              Метод простой: находим то, что <b>уже собрало реакцию</b> в твоей теме, и раскрываем через
              этот заход свои смыслы. Искать вручную долго, поэтому вся черновая работа отдана программе:
              она сама листает ленту, считает цифры и показывает находки сеткой. Ты только выбираешь.
            </p>
            <p className="pt-warn">
              Нужен компьютер. С телефона метод не работает.
            </p>
          </div>

          <div className="pt-card">
            <div className="pt-h">Порядок шагов</div>
            <ol className="pt-steps">
              <li>Поставить программу — способ оплаты из России есть в инструкции</li>
              <li>Завести на компьютере рабочую папку и открыть её в программе</li>
              <li>Поставить браузерный доступ — готовая команда копипастом в инструкции</li>
              <li>Перетащить в папку «Правила для Claude.txt» и попросить сохранить их как CLAUDE.md</li>
              <li>Залогиниться в инстаграм в открывшемся браузере</li>
              <li>Написать готовый промпт из инструкции: «найди карусели по теме …»</li>
            </ol>
            <p className="pt-note">Порядок важен, местами не менять.</p>
          </div>

          {zip && (
            <a className="pt-zip" href={href({ file: 'zip' })}
              onClick={() => trackMaterial('potok', 'zip', 'Поток спроса — архив', tgId)}>
              <span className="pt-zip-k">Скачать всё одним архивом</span>
              <span className="pt-zip-n">{Math.round(zip.bytes / 1024)} КБ · оба файла</span>
            </a>
          )}

          <div className="pt-count">Или по отдельности</div>

          {rest.map((f) => (
            <div className="pt-card pt-file" key={f.key}>
              <div className="pt-file-head">
                <span className="pt-file-name">{f.label}</span>
                <span className="pt-file-size">{Math.round(f.bytes / 1024)} КБ</span>
              </div>
              <p className="pt-file-note">{f.note}</p>
              <div className="pt-file-actions">
                <a className="pt-dl" href={href({ file: f.key })}
                  onClick={() => trackMaterial('potok', f.key, f.label, tgId)}>Скачать</a>
                {f.key === 'html' && (
                  <button className="pt-view"
                    onClick={() => { setViewer(true); trackMaterial('potok', 'html-view', f.label, tgId); }}>
                    Смотреть здесь
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="pt-card pt-both">
            <div className="pt-h">Нужны оба файла</div>
            <p>
              Без правил инструкция бесполезна: прочитаешь и не сможешь повторить. Правила читать не надо,
              они написаны не для человека — просто положи файл в рабочую папку и отдай программе.
            </p>
          </div>
        </>
      )}

      {viewer && (
        <div className="pt-viewer" role="dialog" aria-modal="true" aria-label="Инструкция">
          <div className="pt-viewer-bar">
            <button className="pt-viewer-back" onClick={() => setViewer(false)}>
              <span className="pt-viewer-chev">{'‹'}</span> Назад
            </button>
            <span className="pt-viewer-title">Инструкция</span>
            <span className="pt-viewer-pad" />
          </div>
          <iframe className="pt-viewer-frame" src={href({ view: 'html' })} title="Инструкция" />
        </div>
      )}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .pt-wrap {
          --pt-bg: oklch(0.97 0.006 75); --pt-text: oklch(0.16 0.015 55);
          --pt-muted: oklch(0.46 0.012 55); --pt-accent: oklch(0.60 0.19 52);
          --pt-accent-soft: oklch(0.93 0.04 52); --pt-surface: oklch(1 0 0);
          --pt-line: oklch(0.90 0.008 75);
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--pt-text);
          background: var(--pt-bg); min-height: 100svh;
        }
        .pt-wrap * { box-sizing: border-box; }
        .pt-top { margin-bottom: 16px; }
        .pt-back { display: inline-block; text-decoration: none; color: var(--pt-muted); font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .pt-back:hover { color: var(--pt-accent); }
        .pt-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; line-height: 1.1; }
        .pt-sub { color: var(--pt-muted); font-size: 13px; margin-top: 5px; line-height: 1.4; }
        .pt-browser {
          display: inline-block; margin-top: 12px; cursor: pointer;
          background: none; border: 1px solid var(--pt-line); color: var(--pt-muted);
          font-family: inherit; font-weight: 600; font-size: 13px;
          padding: 8px 13px; border-radius: 10px;
        }
        .pt-browser:hover { border-color: var(--pt-accent); color: var(--pt-accent); }
        .pt-browser:disabled { opacity: 0.6; cursor: default; }
        .pt-card {
          display: block; width: 100%; text-align: left; background: var(--pt-surface);
          border: 1px solid var(--pt-line); border-radius: 18px; padding: 18px; margin-bottom: 14px;
          color: inherit; font-family: inherit;
        }
        .pt-about p { font-size: 14px; line-height: 1.55; margin: 0 0 10px; }
        .pt-about p:last-child { margin-bottom: 0; }
        .pt-warn { color: var(--pt-accent); font-weight: 700; }
        .pt-h { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; margin-bottom: 10px; }
        /* Нумерация обязательна: порядок шагов менять нельзя, а глобальный
           reset кабинета убирает маркеры у списков. */
        .pt-steps { margin: 0; padding-left: 22px; list-style: decimal; }
        .pt-steps li { font-size: 13.5px; line-height: 1.5; margin-bottom: 7px; padding-left: 2px; }
        .pt-steps li::marker { color: var(--pt-accent); font-weight: 800; font-family: 'Archivo', system-ui, sans-serif; }
        .pt-note { font-size: 12.5px; color: var(--pt-muted); margin: 10px 0 0; }
        .pt-zip {
          display: block; text-decoration: none; background: var(--pt-accent); color: oklch(1 0 0);
          border-radius: 18px; padding: 18px; margin-bottom: 14px;
        }
        .pt-zip:active { transform: translateY(1px); }
        .pt-zip-k { display: block; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 17px; }
        .pt-zip-n { display: block; font-size: 12.5px; opacity: 0.85; margin-top: 3px; }
        .pt-count { font-size: 12px; font-weight: 700; color: var(--pt-muted); margin: 18px 0 12px; }
        .pt-file-head { display: flex; align-items: baseline; gap: 8px; }
        .pt-file-name { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .pt-file-size { font-size: 12px; color: var(--pt-muted); margin-left: auto; }
        .pt-file-note { font-size: 13px; line-height: 1.45; color: var(--pt-muted); margin: 8px 0 0; }
        .pt-file-actions { display: flex; gap: 8px; margin-top: 14px; }
        .pt-dl {
          flex: 1 1 auto; text-align: center; text-decoration: none; background: var(--pt-accent-soft);
          color: var(--pt-accent); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
          font-size: 14px; padding: 11px 16px; border-radius: 11px;
        }
        .pt-view {
          flex: 0 0 auto; cursor: pointer; background: none; border: 1px solid var(--pt-line);
          color: var(--pt-muted); font-family: inherit; font-weight: 600; font-size: 13px;
          padding: 11px 14px; border-radius: 11px;
        }
        .pt-view:hover { border-color: var(--pt-accent); color: var(--pt-accent); }
        .pt-both p { font-size: 13.5px; line-height: 1.5; margin: 0; color: var(--pt-muted); }
        .pt-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .pt-login-sub { color: var(--pt-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .pt-tg-login { margin-top: 4px; min-height: 46px; }
        .pt-login-alt { display: inline-block; margin-top: 12px; text-decoration: none; color: var(--pt-muted); font-size: 13px; font-weight: 600; }
        .pt-lock-badge { display: inline-block; font-size: 12px; font-weight: 700; color: var(--pt-muted); background: var(--pt-bg); border: 1px solid var(--pt-line); padding: 5px 10px; border-radius: 999px; }
        .pt-lock-h1 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px; letter-spacing: -0.02em; margin: 12px 0 8px; }
        .pt-lock-p { font-size: 14.5px; line-height: 1.55; margin: 0 0 18px; }
        .pt-cta { display: block; text-align: center; text-decoration: none; background: var(--pt-accent); color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 13px 18px; border-radius: 11px; }
        .pt-state { text-align: center; padding: 48px 16px; }
        .pt-state p { color: var(--pt-muted); margin: 0; }
        .pt-spinner { width: 24px; height: 24px; border: 3px solid var(--pt-line); border-top-color: var(--pt-accent); border-radius: 50%; margin: 0 auto 12px; animation: pt-spin .8s linear infinite; display: inline-block; }
        @keyframes pt-spin { to { transform: rotate(360deg); } }
        .pt-viewer { position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column; background: #fff; }
        .pt-viewer-bar {
          flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; padding-top: max(10px, env(safe-area-inset-top));
          background: var(--pt-surface); border-bottom: 1px solid var(--pt-line);
        }
        .pt-viewer-back { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; cursor: pointer; border: none; background: none; color: var(--pt-accent); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 4px 2px; }
        .pt-viewer-chev { font-size: 22px; line-height: 1; margin-top: -1px; }
        .pt-viewer-title { flex: 1; min-width: 0; text-align: center; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14.5px; }
        .pt-viewer-pad { flex: 0 0 auto; width: 34px; }
        .pt-viewer-frame { flex: 1 1 auto; width: 100%; border: none; background: #fff; }
      `}</style>
    </main>
  );
}

export default function PotokPage() {
  return <Suspense fallback={null}><PotokInner /></Suspense>;
}
