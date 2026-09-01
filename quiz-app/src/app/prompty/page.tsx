'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import { trackSection, trackMaterial } from '@/lib/cabinet-track';
import OpenInBrowser from '@/components/OpenInBrowser';

// Раздел «Промпты» — инструменты к урокам курса. Человек копирует промпт
// целиком, вставляет в нейронку и отвечает голосовыми.
//
// Доступ проверяется на сервере (/api/cabinet/prompty), тексты приезжают сюда
// уже после проверки — в клиентском бандле промптов нет.
// Устроено как /kurs: то же опознание, тот же ключ доступа.

interface Prompt {
  slug: string;
  badge: string;
  lesson: string;
  time: string;
  outcome: string;
  title: string;
  intro: string;
  body: string;
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
  return <div ref={ref} className="pr-tg-login" />;
}

function PromptyInner() {
  const [state, setState] = useState<'load' | 'guest' | 'locked' | 'ok'>('load');
  const [items, setItems] = useState<Prompt[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tgId, setTgId] = useState<number | null>(null);

  useEffect(() => {
    const prev = new URLSearchParams(window.location.search).get('preview') || '';
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
        if (prev) qs.set('preview', prev);
        const res = await fetch(`/api/cabinet/prompty${qs.toString() ? `?${qs}` : ''}`);
        const data = await res.json();
        if (stop) return;
        if (!data.identified) setState('guest');
        else if (!data.allowed) setState('locked');
        else { setItems(data.items || []); setState('ok'); trackSection('prompty', id); }
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  async function copy(p: Prompt) {
    // Промпт скопировали — значит взяли в работу. Это и есть «прочитал» для раздела.
    trackMaterial('prompty', p.slug, p.title, tgId);
    try {
      await navigator.clipboard.writeText(p.body);
    } catch {
      // Clipboard API просит защищённый контекст и жест пользователя. В вебвью
      // Telegram она иногда недоступна — тогда старый способ через textarea.
      const ta = document.createElement('textarea');
      ta.value = p.body;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
    setCopied(p.slug);
    setTimeout(() => setCopied((c) => (c === p.slug ? null : c)), 2000);
  }

  return (
    <main className="pr-wrap">
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

      <header className="pr-top">
        <a className="pr-back" href="/dostup">‹ Кабинет</a>
        <div className="pr-brand">Промпты</div>
        <div className="pr-sub">Инструменты к урокам. Копируешь целиком, вставляешь в нейронку и отвечаешь на её вопросы</div>
        {/* Промпты копируют и вставляют в другую программу, поэтому из Телеграма
            логично сразу уйти в браузер. */}
        <OpenInBrowser path="/prompty" className="pr-browser" />
      </header>

      {state === 'load' && (
        <div className="pr-state"><div className="pr-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="pr-card pr-login">
          <div className="pr-login-title">Вход</div>
          <div className="pr-login-sub">
            Доступ привязан к твоему Telegram. Войди — и промпты откроются.
          </div>
          <TelegramLoginButton />
          <a className="pr-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">
            Или открыть в боте →
          </a>
        </div>
      )}

      {state === 'locked' && (
        <div className="pr-card pr-locked">
          <div className="pr-lock-badge">🔒 Закрытый раздел</div>
          <h1 className="pr-lock-h1">Промпты курса</h1>
          <p className="pr-lock-p">
            Семь инструментов к урокам: разобрать свою жизнь и вытащить, зачем тебе всё это;
            понять, почему бросил в прошлый раз; найти свою сильную сторону и свои смыслы;
            проверить готовый пост перед публикацией.
          </p>
          <a className="pr-cta" href="https://thesashatoyz.com/uroven">Посмотреть тарифы →</a>
        </div>
      )}

      {state === 'ok' && (
        <>
          <div className="pr-note">
            <div className="pr-note-h">Работай в Claude</div>
            <p>
              Промпты собраны под <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">claude.ai</a> —
              там они работают заметно лучше. Разговор идёт долгий, на 15-20 сообщений,
              и Claude держит его целиком: не забывает, что ты говорил в начале, не сваливается
              в советы и не начинает хвалить каждый ответ. В других нейронках промпт тоже
              запустится, но к середине разговора поедет.
            </p>
          </div>

          <div className="pr-note pr-note-soft">
            <div className="pr-note-h">Как это работает</div>
            <p>
              Копируешь промпт целиком и отправляешь первым сообщением. Дальше нейронка сама
              задаёт тему и ждёт ответа. <b>Отвечай голосовыми на 4-6 минут</b> и кидай расшифровку —
              короткие ответы дают короткий результат. Говори как говорится: сбивчиво, с повторами,
              возвращаясь назад. Это нормально, промпт под такую речь и написан.
            </p>
            <p>
              «Не знаю» — нормальный ответ. Не выдумывай, чтобы заполнить паузу.
            </p>
          </div>

          <div className="pr-count">{items.length} промптов · порядок как в курсе</div>
        </>
      )}

      {state === 'ok' && items.map((p, i) => {
        const isOpen = open === p.slug;
        return (
          <div className={`pr-card pr-item${isOpen ? ' pr-open' : ''}`} key={p.slug}>
            <div className="pr-item-head">
              <span className="pr-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="pr-badge">{p.badge}</span>
              <span className="pr-meta">{p.time}</span>
            </div>
            <h2 className="pr-item-title">{p.title}</h2>
            <div className="pr-lesson">{p.lesson}</div>
            <p className="pr-item-sub">{p.intro}</p>
            <p className="pr-outcome"><b>На выходе:</b> {p.outcome}</p>

            <div className="pr-actions">
              <button className="pr-copy" onClick={() => copy(p)}>
                {copied === p.slug ? '✓ Скопировано' : 'Скопировать промпт'}
              </button>
              <button className="pr-toggle" onClick={() => setOpen(isOpen ? null : p.slug)}>
                {isOpen ? 'Свернуть текст' : 'Посмотреть текст'}
              </button>
            </div>

            {isOpen && <pre className="pr-body">{p.body}</pre>}
          </div>
        );
      })}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        .pr-wrap {
          --pr-bg: oklch(0.97 0.006 75); --pr-text: oklch(0.16 0.015 55);
          --pr-muted: oklch(0.46 0.012 55); --pr-accent: oklch(0.60 0.19 52);
          --pr-accent-soft: oklch(0.93 0.04 52); --pr-surface: oklch(1 0 0);
          --pr-line: oklch(0.90 0.008 75);
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--pr-text);
          background: var(--pr-bg); min-height: 100svh;
        }
        .pr-wrap * { box-sizing: border-box; }
        .pr-top { margin-bottom: 16px; }
        .pr-back {
          display: inline-block; text-decoration: none; color: var(--pr-muted);
          font-size: 13px; font-weight: 600; margin-bottom: 10px;
        }
        .pr-back:hover { color: var(--pr-accent); }
        .pr-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; line-height: 1.1; }
        .pr-sub { color: var(--pr-muted); font-size: 13px; margin-top: 5px; line-height: 1.4; }
        .pr-browser {
          display: inline-block; margin-top: 12px; cursor: pointer;
          background: none; border: 1px solid var(--pr-line); color: var(--pr-muted);
          font-family: inherit; font-weight: 600; font-size: 13px;
          padding: 8px 13px; border-radius: 10px;
        }
        .pr-browser:hover { border-color: var(--pr-accent); color: var(--pr-accent); }
        .pr-browser:disabled { opacity: 0.6; cursor: default; }
        .pr-note {
          background: var(--pr-surface); border: 1px solid var(--pr-accent);
          border-radius: 18px; padding: 16px 18px; margin-bottom: 12px;
        }
        .pr-note-soft { border-color: var(--pr-line); }
        .pr-note-h {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px;
          color: var(--pr-accent); margin-bottom: 7px;
        }
        .pr-note-soft .pr-note-h { color: var(--pr-text); }
        .pr-note p { font-size: 13.5px; line-height: 1.5; margin: 0 0 8px; }
        .pr-note p:last-child { margin-bottom: 0; }
        .pr-note a { color: var(--pr-accent); font-weight: 700; }
        .pr-count {
          font-size: 12px; font-weight: 700; color: var(--pr-muted);
          margin: 18px 0 12px; letter-spacing: 0.01em;
        }
        .pr-card {
          display: block; width: 100%; text-align: left; background: var(--pr-surface);
          border: 1px solid var(--pr-line); border-radius: 18px; padding: 18px; margin-bottom: 14px;
          color: inherit; font-family: inherit;
        }
        .pr-open { border-color: var(--pr-accent); }
        .pr-item-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .pr-num {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 13px;
          color: var(--pr-accent); letter-spacing: 0.02em;
        }
        .pr-badge {
          font-size: 11.5px; font-weight: 700; background: var(--pr-accent-soft);
          color: var(--pr-accent); padding: 4px 9px; border-radius: 999px;
        }
        .pr-meta { font-size: 12px; color: var(--pr-muted); margin-left: auto; }
        .pr-item-title {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 20px;
          letter-spacing: -0.02em; line-height: 1.16; margin: 11px 0 0;
        }
        .pr-lesson { font-size: 12px; font-weight: 700; color: var(--pr-accent); margin-top: 5px; }
        .pr-item-sub { color: var(--pr-muted); font-size: 13.5px; line-height: 1.45; margin: 8px 0 0; }
        .pr-outcome { font-size: 12.5px; line-height: 1.45; margin: 10px 0 0; color: var(--pr-text); }
        .pr-outcome b { color: var(--pr-accent); }
        .pr-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
        .pr-copy {
          flex: 1 1 auto; cursor: pointer; border: none; background: var(--pr-accent);
          color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
          font-size: 14px; padding: 12px 16px; border-radius: 11px;
        }
        .pr-copy:active { transform: translateY(1px); }
        .pr-toggle {
          flex: 0 0 auto; cursor: pointer; background: none; border: 1px solid var(--pr-line);
          color: var(--pr-muted); font-family: inherit; font-weight: 600; font-size: 13px;
          padding: 12px 14px; border-radius: 11px;
        }
        .pr-toggle:hover { border-color: var(--pr-accent); color: var(--pr-accent); }
        .pr-body {
          margin: 14px 0 0; padding: 14px; background: var(--pr-bg);
          border: 1px solid var(--pr-line); border-radius: 12px;
          font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
          font-size: 12px; line-height: 1.55; white-space: pre-wrap; word-break: break-word;
          max-height: 420px; overflow-y: auto;
        }
        .pr-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
        .pr-login-sub { color: var(--pr-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
        .pr-tg-login { margin-top: 4px; min-height: 46px; }
        .pr-login-alt {
          display: inline-block; margin-top: 12px; text-decoration: none;
          color: var(--pr-muted); font-size: 13px; font-weight: 600;
        }
        .pr-login-alt:hover { color: var(--pr-accent); }
        .pr-lock-badge {
          display: inline-block; font-size: 12px; font-weight: 700; color: var(--pr-muted);
          background: var(--pr-bg); border: 1px solid var(--pr-line); padding: 5px 10px; border-radius: 999px;
        }
        .pr-lock-h1 {
          font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px;
          letter-spacing: -0.02em; margin: 12px 0 8px;
        }
        .pr-lock-p { font-size: 14.5px; line-height: 1.55; color: var(--pr-text); margin: 0 0 18px; }
        .pr-cta {
          display: block; text-align: center; text-decoration: none; background: var(--pr-accent);
          color: oklch(1 0 0); font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
          font-size: 15px; padding: 13px 18px; border-radius: 11px;
        }
        .pr-cta:active { transform: translateY(1px); }
        .pr-state { text-align: center; padding: 48px 16px; }
        .pr-state p { color: var(--pr-muted); margin: 0; }
        .pr-spinner {
          width: 24px; height: 24px; border: 3px solid var(--pr-line); border-top-color: var(--pr-accent);
          border-radius: 50%; margin: 0 auto 12px; animation: pr-spin .8s linear infinite; display: inline-block;
        }
        @keyframes pr-spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

export default function PromptyPage() {
  return <Suspense fallback={null}><PromptyInner /></Suspense>;
}
