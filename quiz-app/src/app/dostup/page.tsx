'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SECTIONS } from '@/content/rooms';

const ICONS: Record<string, string> = {
  live: '\u{1F3A5}', recording: '\u{1F4FC}', slides: '\u{1F4D1}', chat: '\u{1F4AC}',
  article: '\u{1F4DD}', podcast: '\u{1F399}\u{FE0F}', link: '\u{1F517}',
};

function DostupInner() {
  const params = useSearchParams();
  const [unlocked, setUnlocked] = useState<string[] | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void; initDataUnsafe?: { user?: { id: number } } } } }).Telegram?.WebApp;
    if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
    const tgId = tg?.initDataUnsafe?.user?.id;
    const token = params.get('t');
    const qs = tgId ? `telegramId=${tgId}` : token ? `token=${encodeURIComponent(token)}` : '';

    let stop = false;
    async function load() {
      try {
        const res = await fetch(`/api/cabinet/rooms?${qs}`);
        const data = await res.json();
        if (stop) return;
        if (data.pending) { setPending(true); setTimeout(load, 5000); return; }
        setPending(false);
        setUnlocked(data.unlockedRoles || []);
      } catch {
        if (!stop) setUnlocked([]);
      }
    }
    // даже без qs грузим — гость увидит бесплатное + витрину под замком
    load();
    return () => { stop = true; };
  }, [params]);

  const has = (role: string | null) => role === null || (unlocked?.includes(role) ?? false);

  return (
    <main className="wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap" rel="stylesheet" />

      <header className="top">
        <div className="brand">Кабинет</div>
        <div className="sub">TOYZ · пространство участника</div>
      </header>

      {pending && (
        <div className="banner">
          <div className="spinner" />
          Оплата обрабатывается — раздел откроется через пару секунд.
        </div>
      )}

      {!unlocked && !pending && (
        <div className="state"><div className="spinner" /><p>Загрузка…</p></div>
      )}

      {unlocked && SECTIONS.map((s) => {
        const open = has(s.role);
        return (
          <section className={`card ${open ? 'card-open' : 'card-locked'}`} key={s.key}>
            <div className="card-head">
              <div className="card-titles">
                <h2>{!open && <span className="lock">{'\u{1F512}'}</span>}{s.title}</h2>
                <p className="card-sub">{s.subtitle}</p>
              </div>
              <span className={`badge ${open ? 'badge-open' : 'badge-price'}`}>
                {open ? 'Открыто' : s.badge}
              </span>
            </div>

            {open ? (
              <div className="materials">
                {s.materials.map((m, i) => {
                  const ready = !!m.url;
                  const Tag = ready ? 'a' : 'div';
                  return (
                    <Tag key={i} className={`mat ${ready ? 'mat-ready' : 'mat-soon'}`}
                      {...(ready ? { href: m.url, target: '_blank', rel: 'noopener' } : {})}>
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
            ) : (
              <div className="locked-body">
                {s.lockedPreview && (
                  <ul className="preview">
                    {s.lockedPreview.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
                {s.lockedCta && (
                  <a className="buy" href={s.lockedCta.href} target="_blank" rel="noopener">
                    {s.lockedCta.text}
                  </a>
                )}
              </div>
            )}
          </section>
        );
      })}

      <style>{`
        :root {
          --bg: oklch(0.97 0.006 75); --text: oklch(0.16 0.015 55);
          --muted: oklch(0.46 0.012 55); --accent: oklch(0.60 0.19 52);
          --accent-soft: oklch(0.93 0.04 52); --ok: oklch(0.55 0.13 155);
          --ok-soft: oklch(0.94 0.05 155); --surface: oklch(1 0 0); --line: oklch(0.90 0.008 75);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }
        .wrap {
          max-width: 540px; margin: 0 auto; padding: 26px 16px 60px;
          font-family: 'Manrope', system-ui, sans-serif; color: var(--text); min-height: 100svh;
        }
        .top { margin-bottom: 22px; }
        .brand { font-family: 'Archivo', sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; }
        .sub { color: var(--muted); font-size: 13px; margin-top: 2px; }
        .banner {
          display: flex; align-items: center; gap: 10px; background: var(--accent-soft);
          color: var(--text); border-radius: 12px; padding: 12px 14px; font-size: 13.5px; margin-bottom: 16px;
        }
        .card {
          background: var(--surface); border: 1px solid var(--line); border-radius: 18px;
          padding: 18px 18px; margin-bottom: 14px;
        }
        .card-locked { background: oklch(0.985 0.004 75); }
        .card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .card-titles { flex: 1; min-width: 0; }
        .card h2 {
          font-family: 'Archivo', sans-serif; font-weight: 800; font-size: 19px;
          letter-spacing: -0.02em; line-height: 1.15; display: flex; align-items: center; gap: 7px;
        }
        .lock { font-size: 14px; }
        .card-sub { color: var(--muted); font-size: 13px; margin-top: 3px; }
        .badge {
          flex: 0 0 auto; font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 999px; white-space: nowrap;
        }
        .badge-open { background: var(--ok-soft); color: var(--ok); }
        .badge-price { background: var(--accent-soft); color: var(--accent); }
        .materials { display: grid; gap: 9px; margin-top: 14px; }
        .mat {
          display: flex; align-items: center; gap: 13px; text-decoration: none; color: inherit;
          background: var(--bg); border: 1px solid var(--line); border-radius: 13px; padding: 13px 14px;
          transition: transform .12s, border-color .12s;
        }
        .mat-ready:hover { border-color: var(--accent); }
        .mat-ready:active { transform: translateY(1px); }
        .mat-soon { opacity: .58; }
        .mat-icon { font-size: 20px; flex: 0 0 auto; }
        .mat-body { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
        .mat-title { font-weight: 700; font-size: 14.5px; }
        .mat-note { color: var(--muted); font-size: 12px; line-height: 1.4; }
        .mat-arr { flex: 0 0 auto; font-size: 13px; color: var(--accent); font-weight: 700; }
        .mat-soon .mat-arr { color: var(--muted); font-weight: 500; }
        .locked-body { margin-top: 14px; }
        .preview { list-style: none; display: grid; gap: 8px; margin-bottom: 16px; }
        .preview li {
          position: relative; padding-left: 24px; font-size: 13.5px; color: var(--text);
        }
        .preview li::before {
          content: ""; position: absolute; left: 0; top: 4px; width: 16px; height: 16px; border-radius: 50%;
          background: var(--accent-soft);
          -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/></svg>") center/11px no-repeat;
                  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='black' d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/></svg>") center/11px no-repeat;
        }
        .buy {
          display: block; text-align: center; text-decoration: none; background: var(--accent);
          color: oklch(1 0 0); font-family: 'Archivo', sans-serif; font-weight: 800; font-size: 15px;
          padding: 14px 18px; border-radius: 11px; transition: opacity .15s;
        }
        .buy:hover { opacity: .9; } .buy:active { transform: translateY(1px); }
        .state { text-align: center; padding: 48px 16px; }
        .state p { color: var(--muted); }
        .spinner {
          width: 24px; height: 24px; border: 3px solid var(--line); border-top-color: var(--accent);
          border-radius: 50%; margin: 0 auto 12px; animation: spin .8s linear infinite; display: inline-block;
        }
        .banner .spinner { margin: 0; width: 18px; height: 18px; border-width: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

export default function DostupPage() {
  return <Suspense fallback={null}><DostupInner /></Suspense>;
}
