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
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (k: string) => setExpanded((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));

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
    load();
    return () => { stop = true; };
  }, [params]);

  const has = (role: string | null) => role === null || (unlocked?.includes(role) ?? false);

  return (
    <main className="kb-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap" rel="stylesheet" />

      <header className="kb-top">
        <div className="kb-brand">Кабинет</div>
        <div className="kb-sub">TOYZ · пространство участника</div>
      </header>

      {pending && (
        <div className="kb-banner">
          <div className="kb-spinner" />
          Оплата обрабатывается — раздел откроется через пару секунд.
        </div>
      )}

      {!unlocked && !pending && (
        <div className="kb-state"><div className="kb-spinner" /><p>Загрузка…</p></div>
      )}

      {unlocked && SECTIONS.map((s) => {
        const open = has(s.role);

        if (open) {
          return (
            <section className="kb-card kb-open" key={s.key}>
              <div className="kb-head">
                <div className="kb-titles">
                  <h2 className="kb-h2">{s.title}</h2>
                  <p className="kb-csub">{s.subtitle}</p>
                </div>
                <span className="kb-badge kb-badge-open">Открыто</span>
              </div>
              <div className="kb-materials">
                {s.materials.map((m, i) => {
                  const ready = !!m.url;
                  const Tag = ready ? 'a' : 'div';
                  return (
                    <Tag key={i} className={`kb-mat ${ready ? 'kb-mat-ready' : 'kb-mat-soon'}`}
                      {...(ready ? { href: m.url, target: '_blank', rel: 'noopener' } : {})}>
                      <span className="kb-mat-icon">{ICONS[m.kind] || ICONS.link}</span>
                      <span className="kb-mat-body">
                        <span className="kb-mat-title">{m.title}</span>
                        {m.note && <span className="kb-mat-note">{m.note}</span>}
                      </span>
                      <span className="kb-mat-arr">{ready ? '→' : 'скоро'}</span>
                    </Tag>
                  );
                })}
              </div>
            </section>
          );
        }

        // Закрытый раздел: замок, но можно развернуть и посмотреть, что внутри —
        // список материалов под замками. Продажа — на лендинге (ссылка снизу).
        const isExp = expanded.includes(s.key);
        return (
          <section className="kb-card kb-locked" key={s.key}>
            <div className="kb-head kb-head-toggle" role="button" tabIndex={0}
              onClick={() => toggle(s.key)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(s.key); } }}>
              <div className="kb-titles">
                <h2 className="kb-h2"><span className="kb-lock">{'\u{1F512}'}</span>{s.title}</h2>
                <p className="kb-csub">{s.subtitle}</p>
              </div>
              <span className={`kb-chev ${isExp ? 'kb-chev-open' : ''}`}>{'›'}</span>
            </div>

            {isExp && (
              <div className="kb-locked-inner">
                <div className="kb-materials">
                  {s.materials.map((m, i) => (
                    <div key={i} className="kb-mat kb-mat-locked">
                      <span className="kb-mat-icon">{ICONS[m.kind] || ICONS.link}</span>
                      <span className="kb-mat-body">
                        <span className="kb-mat-title">{m.title}</span>
                        {m.note && <span className="kb-mat-note">{m.note}</span>}
                      </span>
                      <span className="kb-mat-arr kb-mat-lock">{'\u{1F512}'}</span>
                    </div>
                  ))}
                </div>
                {s.landingUrl && (
                  <a className="kb-getaccess" href={s.landingUrl} target="_blank" rel="noopener">
                    Получить доступ →
                  </a>
                )}
              </div>
            )}
          </section>
        );
      })}

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
        .kb-brand { font-family: 'Archivo', sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; margin: 0; }
        .kb-sub { color: var(--kb-muted); font-size: 13px; margin-top: 2px; }
        .kb-banner {
          display: flex; align-items: center; gap: 10px; background: var(--kb-accent-soft);
          color: var(--kb-text); border-radius: 12px; padding: 12px 14px; font-size: 13.5px; margin-bottom: 16px;
        }
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
          font-family: 'Archivo', sans-serif; font-weight: 800; font-size: 19px; margin: 0;
          letter-spacing: -0.02em; line-height: 1.15; display: flex; align-items: center; gap: 7px; color: var(--kb-text);
        }
        .kb-lock { font-size: 14px; }
        .kb-csub { color: var(--kb-muted); font-size: 13px; margin-top: 3px; }
        .kb-badge { flex: 0 0 auto; font-size: 12px; font-weight: 700; padding: 5px 10px; border-radius: 999px; white-space: nowrap; }
        .kb-badge-open { background: var(--kb-ok-soft); color: var(--kb-ok); }
        .kb-badge-closed { background: oklch(0.93 0.004 75); color: var(--kb-muted); }
        .kb-materials { display: grid; gap: 9px; margin-top: 14px; }
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
          background: var(--kb-accent); color: oklch(1 0 0); font-family: 'Archivo', sans-serif;
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
      `}</style>
    </main>
  );
}

export default function DostupPage() {
  return <Suspense fallback={null}><DostupInner /></Suspense>;
}
