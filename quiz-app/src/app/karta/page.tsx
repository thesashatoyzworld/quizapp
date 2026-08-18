'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import RoadmapView, { ROADMAP_VIEW_CSS, type RoadmapCard, type RoadmapTaskView } from '@/components/RoadmapView';

// Раздел «Карта» — маршрутная карта клиента менторства: где он стоит, куда
// идёт и что делает на этой неделе. Доступ строго по Telegram id, содержимое
// приезжает уже отфильтрованным (/api/cabinet/roadmap): внутренние диагнозы
// и задачи Саши в клиентский бандл не попадают.
//
// Сама вёрстка живёт в @/components/RoadmapView — тот же компонент рисует
// предпросмотр в админке.

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
  return <div ref={ref} className="km-tg-login" />;
}

function KartaInner() {
  const [state, setState] = useState<'load' | 'guest' | 'empty' | 'ok'>('load');
  const [card, setCard] = useState<RoadmapCard | null>(null);
  const [tgId, setTgId] = useState<number | null>(null);
  // Задачи, по которым сейчас летит отметка — чтобы не жать дважды.
  const [pending, setPending] = useState<string[]>([]);

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
        const res = await fetch(`/api/cabinet/roadmap${qs}`);
        const data = await res.json();
        if (stop) return;
        if (!data.identified) setState('guest');
        else if (!data.hasRoadmap) setState('empty');
        else { setCard(data.card); setState('ok'); }
      } catch {
        if (!stop) setState('guest');
      }
    })();
    return () => { stop = true; };
  }, []);

  // Отметка «сделал». Локально переключаем сразу, сервер догоняет: карта
  // должна отзываться мгновенно, иначе галочку жмут второй раз.
  async function toggleTask(task: RoadmapTaskView) {
    if (pending.includes(task.id)) return;
    const next = task.status === 'done' ? 'todo' : 'done';
    setPending((p) => [...p, task.id]);
    setCard((c) => c && {
      ...c,
      tasks: c.tasks.map((t) => (t.id === task.id ? { ...t, status: next } : t)),
    });
    try {
      const res = await fetch('/api/cabinet/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, status: next, telegramId: tgId }),
      });
      if (!res.ok) throw new Error('not saved');
    } catch {
      // Не сохранилось — возвращаем как было, чтобы карта не врала.
      setCard((c) => c && {
        ...c,
        tasks: c.tasks.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      });
    }
    setPending((p) => p.filter((id) => id !== task.id));
  }

  return (
    <main className="km-wrap">
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

      <header className="km-top">
        <a className="km-back" href="/dostup">‹ Кабинет</a>
        <div className="km-brand">Карта</div>
        <div className="km-sub">Где ты сейчас, куда идём и что делаем на этой неделе</div>
      </header>

      {state === 'load' && (
        <div className="km-state"><div className="km-spinner" /><p>Загрузка…</p></div>
      )}

      {state === 'guest' && (
        <div className="km-card km-login">
          <div className="km-login-title">Вход в раздел</div>
          <div className="km-login-sub">
            Карта привязана к твоему Telegram. Войди — и здесь откроется твоя.
          </div>
          <TelegramLoginButton />
          <a className="km-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">
            Или открыть в боте →
          </a>
        </div>
      )}

      {state === 'empty' && (
        <div className="km-card">
          <p className="km-empty">
            Карта соберётся после первого созвона: разложим, где ты сейчас и что делаем дальше.
            Как будет готова — она появится здесь.
          </p>
        </div>
      )}

      {state === 'ok' && card && <RoadmapView card={card} onToggleTask={toggleTask} />}

      <style>{`
        html, body {
          background: oklch(0.97 0.006 75) !important;
          height: auto !important; min-height: 100% !important;
          overflow-y: auto !important; position: static !important;
        }
        ${ROADMAP_VIEW_CSS}
      `}</style>
    </main>
  );
}

export default function KartaPage() {
  return <Suspense fallback={null}><KartaInner /></Suspense>;
}
