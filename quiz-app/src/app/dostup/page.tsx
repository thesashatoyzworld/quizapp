'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface Material {
  kind: string;
  title: string;
  url: string;
  note?: string;
}
interface Room {
  role: string;
  title: string;
  subtitle: string;
  materials: Material[];
  expiresAt: string | null;
}

const ICONS: Record<string, string> = {
  live: '\u{1F3A5}',
  recording: '\u{1F4FC}',
  slides: '\u{1F4D1}',
  chat: '\u{1F4AC}',
  link: '\u{1F517}',
};

function DostupInner() {
  const params = useSearchParams();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Если открыто внутри Telegram — берём id оттуда, иначе токен из ссылки (оплата картой).
    const tg = (window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void; initDataUnsafe?: { user?: { id: number } } } } }).Telegram?.WebApp;
    if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
    const tgId = tg?.initDataUnsafe?.user?.id;
    const token = params.get('t');

    const qs = tgId ? `telegramId=${tgId}` : token ? `token=${encodeURIComponent(token)}` : '';
    if (!qs) { setError(true); return; }

    let stop = false;
    async function load() {
      try {
        const res = await fetch(`/api/cabinet/rooms?${qs}`);
        const data = await res.json();
        if (stop) return;
        if (!data.success) { setError(true); return; }
        if (data.pending) {
          setPending(true);
          setTimeout(load, 5000); // оплата ещё обрабатывается — перепроверим
          return;
        }
        setPending(false);
        setRooms(data.rooms);
      } catch {
        if (!stop) setError(true);
      }
    }
    load();
    return () => { stop = true; };
  }, [params]);

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">Кабинет</div>
        <div className="sub">TOYZ · пространство участника</div>
      </header>

      {error && (
        <div className="state">
          <p>Не получилось определить доступ.</p>
          <p className="muted">Если ты оплатил — открой ссылку из письма Продамуса или напиши в бот.</p>
        </div>
      )}

      {pending && (
        <div className="state">
          <div className="spinner" />
          <p>Оплата обрабатывается…</p>
          <p className="muted">Страница откроется сама через несколько секунд.</p>
        </div>
      )}

      {rooms && rooms.length === 0 && (
        <div className="state">
          <p>Пока здесь пусто.</p>
          <p className="muted">Доступные продукты появятся тут после оплаты.</p>
        </div>
      )}

      {rooms && rooms.map((room) => (
        <section className="room" key={room.role}>
          <div className="room-head">
            <h1>{room.title}</h1>
            <p className="room-sub">{room.subtitle}</p>
          </div>
          <div className="materials">
            {room.materials.map((m, i) => {
              const ready = !!m.url;
              const Tag = ready ? 'a' : 'div';
              return (
                <Tag
                  key={i}
                  className={`mat ${ready ? 'mat-ready' : 'mat-soon'}`}
                  {...(ready ? { href: m.url, target: '_blank', rel: 'noopener' } : {})}
                >
                  <span className="mat-icon">{ICONS[m.kind] || ICONS.link}</span>
                  <span className="mat-body">
                    <span className="mat-title">{m.title}</span>
                    {m.note && <span className="mat-note">{m.note}</span>}
                  </span>
                  <span className="mat-arr">{ready ? '→' : 'скоро'}</span>
                </Tag>
              );
            })}
          </div>
        </section>
      ))}

      {!rooms && !pending && !error && (
        <div className="state"><div className="spinner" /><p>Загрузка…</p></div>
      )}

      <style>{`
        :root {
          --bg: oklch(0.97 0.006 75); --text: oklch(0.16 0.015 55);
          --muted: oklch(0.46 0.012 55); --accent: oklch(0.60 0.19 52);
          --surface: oklch(1 0 0); --line: oklch(0.89 0.008 75);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        .wrap {
          max-width: 520px; margin: 0 auto; padding: 28px 18px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--text);
          min-height: 100svh;
        }
        .top { margin-bottom: 24px; }
        .brand {
          font-family: 'Archivo', sans-serif; font-weight: 900; font-size: 26px;
          letter-spacing: -0.02em;
        }
        .sub { color: var(--muted); font-size: 13px; margin-top: 2px; }
        .room { margin-bottom: 28px; }
        .room-head { margin-bottom: 14px; }
        .room h1 {
          font-family: 'Archivo', sans-serif; font-weight: 800; font-size: 22px;
          letter-spacing: -0.02em; line-height: 1.1;
        }
        .room-sub { color: var(--muted); font-size: 13px; margin-top: 4px; }
        .materials { display: grid; gap: 10px; }
        .mat {
          display: flex; align-items: center; gap: 14px; text-decoration: none;
          background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
          padding: 16px 16px; color: inherit; transition: transform .12s, border-color .12s;
        }
        .mat-ready { cursor: pointer; }
        .mat-ready:active { transform: translateY(1px); }
        .mat-ready:hover { border-color: var(--accent); }
        .mat-soon { opacity: .62; }
        .mat-icon { font-size: 22px; flex: 0 0 auto; }
        .mat-body { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .mat-title { font-weight: 700; font-size: 15px; }
        .mat-note { color: var(--muted); font-size: 12.5px; line-height: 1.4; }
        .mat-arr {
          flex: 0 0 auto; font-size: 13px; color: var(--accent); font-weight: 700;
        }
        .mat-soon .mat-arr { color: var(--muted); font-weight: 500; }
        .state { text-align: center; padding: 48px 16px; color: var(--text); }
        .state .muted, .muted { color: var(--muted); font-size: 13.5px; margin-top: 6px; }
        .spinner {
          width: 26px; height: 26px; border: 3px solid var(--line);
          border-top-color: var(--accent); border-radius: 50%;
          margin: 0 auto 14px; animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

export default function DostupPage() {
  return (
    <Suspense fallback={null}>
      <DostupInner />
    </Suspense>
  );
}
