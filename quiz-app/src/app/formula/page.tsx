'use client';

import { useEffect, useState } from 'react';
import type { Content } from '@/content/formula/types';
import contentJson from '@/content/formula/content.json';
import FormulaApp from './FormulaApp';

const content = contentJson as unknown as Content;
const ROLE = 'uroven'; // бонус для купивших «Новый уровень контента»

export default function FormulaPage() {
  const [unlocked, setUnlocked] = useState<string[] | null>(null);
  const [pending, setPending] = useState(false);
  const [askEmail, setAskEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { ready: () => void; expand: () => void; initDataUnsafe?: { user?: { id: number } } } } }).Telegram?.WebApp;
    if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
    const tgId = tg?.initDataUnsafe?.user?.id;
    const urlToken = new URLSearchParams(window.location.search).get('t');
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('kb_token') : null;
    const token = urlToken || savedToken;
    const qs = tgId ? `telegramId=${tgId}` : token ? `token=${encodeURIComponent(token)}` : '';

    let stop = false;
    async function load() {
      if (!qs) { setAskEmail(true); setUnlocked([]); return; }
      try {
        const res = await fetch(`/api/cabinet/rooms?${qs}`);
        const data = await res.json();
        if (stop) return;
        if (data.pending) { setPending(true); setTimeout(load, 5000); return; }
        setPending(false);
        if (data.token && typeof window !== 'undefined') localStorage.setItem('kb_token', data.token);
        if ((data.unlockedRoles || []).length === 0 && !tgId) setAskEmail(true);
        setUnlocked(data.unlockedRoles || []);
      } catch {
        if (!stop) { setAskEmail(true); setUnlocked([]); }
      }
    }
    load();
    return () => { stop = true; };
  }, []);

  async function loginByEmail(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setLoginErr('');
    try {
      const res = await fetch(`/api/cabinet/rooms?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if ((data.unlockedRoles || []).length > 0) {
        if (data.token && typeof window !== 'undefined') localStorage.setItem('kb_token', data.token);
        setUnlocked(data.unlockedRoles);
        setAskEmail(false);
      } else {
        setLoginErr('По этой почте оплату не нашли. Введи почту, которой платил.');
      }
    } catch {
      setLoginErr('Не получилось проверить. Попробуй ещё раз.');
    }
    setBusy(false);
  }

  // Превью для ревью. ?preview=1 — только локально. ?preview=<секрет> — работает
  // и на деплое (временно, чтобы Саша прокликал перед запуском; убрать перед продом).
  const [devPreview, setDevPreview] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('preview');
    if ((q === '1' && process.env.NODE_ENV !== 'production') || q === 'fvk-2026-sasha') {
      setDevPreview(true);
    }
  }, []);

  const hasAccess = devPreview || (unlocked?.includes(ROLE) ?? false);

  // Гейт от hydration-mismatch: до монтирования (и на сервере) отдаём один и тот
  // же лоадер, дальше уже решаем по опознанию — серверный и клиентский HTML совпадают.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="fx-root">
        <div className="fx-center"><div className="fx-spin" /></div>
        <style>{FX_CSS}</style>
      </div>
    );
  }

  return (
    <div className="fx-root">
      {!hasAccess && unlocked === null && !pending && (
        <div className="fx-center"><div className="fx-spin" /><p>Загрузка…</p></div>
      )}

      {!hasAccess && pending && (
        <div className="fx-center"><div className="fx-spin" /><p>Оплата обрабатывается — раздел откроется через пару секунд.</p></div>
      )}

      {hasAccess && <FormulaApp content={content} />}

      {!hasAccess && unlocked !== null && !pending && (
        <div className="fx-lock">
          <div className="fx-lock-card">
            <div className="fx-lock-badge">🔒 Бонусный материал</div>
            <h1 className="fx-lock-h1">Формула вирусного контента</h1>
            <p className="fx-lock-p">
              Полный видеокурс по контенту — часть продукта <b>«Новый уровень контента»</b>.
              Открывается всем, кто его купил.
            </p>

            {askEmail && (
              <form className="fx-lock-form" onSubmit={loginByEmail}>
                <div className="fx-lock-form-title">Уже покупал? Войди по почте</div>
                <div className="fx-lock-form-sub">Введи почту, которой платил — доступ откроется, браузер запомнит.</div>
                <div className="fx-lock-form-row">
                  <input
                    className="fx-lock-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="твоя почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="fx-lock-btn" type="submit" disabled={busy}>
                    {busy ? '…' : 'Войти'}
                  </button>
                </div>
                {loginErr && <div className="fx-lock-err">{loginErr}</div>}
              </form>
            )}

            <a className="fx-lock-cta" href="https://thesashatoyz.com/uroven">
              Получить «Новый уровень контента» →
            </a>
          </div>
        </div>
      )}

      <style>{FX_CSS}</style>
    </div>
  );
}

const FX_CSS = `
/* quiz-app лочит html/body под Telegram Mini App — разлочиваем, как /dostup. */
html,body{background:#fbfaf8 !important;height:auto !important;min-height:100% !important;overflow-y:auto !important;position:static !important;}
.fx-root{
  --accent:#e8590c; --ink:#14140f; --paper:#fbfaf8; --line:#14140f;
  --c-red:#d1352b; --c-orange:#e8590c; --c-yellow:#c98a00; --c-green:#2f9e44; --c-blue:#2b6cb0; --c-gray:#8a8578;
  font-family:Georgia,'Times New Roman','PT Serif',serif; color:var(--ink); background:var(--paper);
  min-height:100svh;
}
.fx-root *{box-sizing:border-box;}
.fx-center{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70svh;gap:12px;color:#6b6658;}
.fx-spin{width:26px;height:26px;border:3px solid #e4e0d6;border-top-color:var(--accent);border-radius:50%;animation:fxspin .8s linear infinite;}
@keyframes fxspin{to{transform:rotate(360deg);}}

/* ── Замок ── */
.fx-lock{display:flex;align-items:center;justify-content:center;min-height:100svh;padding:24px;}
.fx-lock-card{max-width:520px;width:100%;background:#fff;border:2px solid var(--line);box-shadow:8px 8px 0 var(--ink);padding:30px 26px;}
.fx-lock-badge{display:inline-block;font-family:'Courier New',monospace;font-size:12px;letter-spacing:.05em;border:1.5px solid var(--line);padding:4px 9px;margin-bottom:14px;}
.fx-lock-h1{font-size:30px;line-height:1.08;margin:0 0 12px;letter-spacing:-.01em;}
.fx-lock-p{font-size:17px;line-height:1.55;margin:0 0 20px;}
.fx-lock-form{border-top:1.5px dashed var(--line);padding-top:18px;margin-bottom:20px;}
.fx-lock-form-title{font-weight:700;font-size:16px;}
.fx-lock-form-sub{color:#6b6658;font-size:13.5px;margin:4px 0 12px;line-height:1.4;}
.fx-lock-form-row{display:flex;gap:8px;}
.fx-lock-input{flex:1;min-width:0;font-family:inherit;font-size:16px;color:var(--ink);background:var(--paper);border:1.5px solid var(--line);padding:11px 12px;}
.fx-lock-input:focus{outline:none;border-color:var(--accent);}
.fx-lock-btn{flex:0 0 auto;border:1.5px solid var(--line);cursor:pointer;background:var(--accent);color:#fff;font-family:inherit;font-weight:700;font-size:15px;padding:11px 20px;box-shadow:3px 3px 0 var(--ink);}
.fx-lock-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink);}
.fx-lock-btn:disabled{opacity:.6;}
.fx-lock-err{color:var(--c-red);font-size:13px;margin-top:10px;}
.fx-lock-cta{display:block;text-align:center;text-decoration:none;background:var(--accent);color:#fff;font-weight:700;font-size:16px;padding:14px;border:2px solid var(--line);box-shadow:5px 5px 0 var(--ink);}
.fx-lock-cta:active{transform:translate(2px,2px);box-shadow:3px 3px 0 var(--ink);}

/* ── Каркас ── */
.fx-shell{display:flex;align-items:flex-start;min-height:100svh;}
.fx-side{flex:0 0 288px;position:sticky;top:0;height:100svh;overflow-y:auto;border-right:2px solid var(--line);background:#fff;padding:20px 0 40px;}
.fx-side-brand{display:block;text-decoration:none;color:var(--ink);font-weight:700;font-size:21px;line-height:1.12;letter-spacing:-.01em;padding:0 20px 16px;border-bottom:1.5px solid var(--line);margin-bottom:10px;}
.fx-nav-list{list-style:none;margin:0;padding:0;}
.fx-nav-item{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);font-size:15.5px;line-height:1.25;padding:7px 20px;border-left:3px solid transparent;}
.fx-nav-item:hover{background:#f2efe7;}
.fx-nav-active{background:#f2efe7;border-left-color:var(--accent);font-weight:700;}
.fx-d1 .fx-nav-title,.fx-nav-item.fx-d1{padding-left:34px;font-size:14.5px;}
.fx-d2 .fx-nav-title,.fx-nav-item.fx-d2{padding-left:48px;font-size:14px;color:#4a463c;}
.fx-nav-chip{flex:0 0 auto;width:9px;height:9px;border:1px solid var(--line);}
.fx-c-red .fx-nav-chip,.fx-c-red_bg .fx-nav-chip{background:var(--c-red);}
.fx-c-orange .fx-nav-chip,.fx-c-orange_bg .fx-nav-chip{background:var(--c-orange);}
.fx-c-yellow .fx-nav-chip,.fx-c-yellow_bg .fx-nav-chip{background:var(--c-yellow);}
.fx-c-green .fx-nav-chip,.fx-c-green_bg .fx-nav-chip{background:var(--c-green);}
.fx-c-blue .fx-nav-chip,.fx-c-blue_bg .fx-nav-chip{background:var(--c-blue);}

/* ── Контент ── */
.fx-main{flex:1 1 auto;min-width:0;}
.fx-article{max-width:760px;margin:0 auto;padding:40px 32px 80px;}
.fx-title{font-size:34px;line-height:1.1;letter-spacing:-.015em;margin:0 0 24px;padding-bottom:12px;border-bottom:2px solid var(--line);}
.fx-c-red.fx-title{border-bottom-color:var(--c-red);}
.fx-c-orange.fx-title{border-bottom-color:var(--c-orange);}
.fx-c-yellow.fx-title{border-bottom-color:var(--c-yellow);}
.fx-c-green.fx-title{border-bottom-color:var(--c-green);}
.fx-c-blue.fx-title{border-bottom-color:var(--c-blue);}
.fx-p{font-size:17px;line-height:1.65;margin:0 0 15px;}
.fx-h2{font-size:24px;line-height:1.2;margin:34px 0 12px;letter-spacing:-.01em;}
.fx-h3{font-size:19px;line-height:1.25;margin:26px 0 10px;}
.fx-link{color:var(--accent);text-decoration:underline;text-underline-offset:2px;}
.fx-link:hover{background:#fbe7d9;}
.fx-ul,.fx-ol{margin:0 0 15px;padding-left:26px;}
.fx-ul li,.fx-ol li{font-size:17px;line-height:1.6;margin-bottom:6px;}
.fx-li-children{margin-top:6px;}
.fx-hr{border:none;border-top:1.5px solid var(--line);margin:26px 0;}

.fx-video{position:relative;width:100%;aspect-ratio:16/9;border:2px solid var(--line);box-shadow:6px 6px 0 var(--ink);margin:18px 0 22px;background:#000;}
.fx-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}
.fx-img{display:block;max-width:100%;height:auto;border:2px solid var(--line);box-shadow:5px 5px 0 var(--ink);margin:18px 0;}

.fx-childpage{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);background:#fff;border:2px solid var(--line);box-shadow:4px 4px 0 var(--ink);padding:13px 15px;margin:10px 0;font-weight:700;font-size:16px;}
.fx-childpage:hover{background:#fbe7d9;}
.fx-childpage:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--ink);}
.fx-childpage-ic{color:var(--accent);}
.fx-childpage-title{flex:1;min-width:0;}
.fx-childpage-arr{color:var(--accent);}

.fx-file{display:flex;align-items:center;gap:10px;border:1.5px solid var(--line);background:#fff;padding:11px 14px;margin:14px 0;font-size:15px;}
.fx-file-soon{opacity:.6;}
.fx-file-name{flex:1;min-width:0;}
.fx-file-arr{font-family:'Courier New',monospace;font-size:13px;color:var(--accent);}

.fx-toggle{border:1.5px solid var(--line);margin:14px 0;background:#fff;}
.fx-toggle-sum{cursor:pointer;padding:12px 15px;font-weight:700;font-size:17px;list-style:none;}
.fx-toggle-sum::-webkit-details-marker{display:none;}
.fx-toggle-sum::before{content:'▸ ';color:var(--accent);}
.fx-toggle[open] .fx-toggle-sum::before{content:'▾ ';}
.fx-toggle-body{padding:4px 15px 12px;border-top:1.5px solid var(--line);}

.fx-callout{display:flex;gap:10px;border:1.5px solid var(--line);background:#f7f4ec;padding:12px 14px;margin:14px 0;}
.fx-callout-ic{flex:0 0 auto;color:var(--accent);font-weight:700;}
.fx-callout-body>.fx-p:last-child{margin-bottom:0;}

.fx-index{display:grid;gap:10px;}
.fx-index-card{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);background:#fff;border:2px solid var(--line);box-shadow:4px 4px 0 var(--ink);padding:15px 16px;font-weight:700;font-size:17px;}
.fx-index-card:hover{background:#fbe7d9;}
.fx-index-card:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--ink);}
.fx-index-title{flex:1;min-width:0;}
.fx-index-arr{color:var(--accent);}

.fx-prevnext{display:flex;justify-content:space-between;gap:14px;margin-top:44px;padding-top:22px;border-top:2px solid var(--line);}
.fx-pn{flex:1 1 0;display:flex;flex-direction:column;gap:3px;text-decoration:none;color:var(--ink);border:1.5px solid var(--line);padding:12px 14px;background:#fff;max-width:48%;}
.fx-pn:hover{background:#fbe7d9;}
.fx-pn-next{text-align:right;align-items:flex-end;}
.fx-pn-lab{font-family:'Courier New',monospace;font-size:12px;color:var(--accent);}
.fx-pn-title{font-weight:700;font-size:15px;line-height:1.2;}

.fx-burger{display:none;}

@media (max-width:860px){
  .fx-burger{display:inline-flex;align-items:center;gap:6px;position:fixed;top:12px;left:12px;z-index:60;background:var(--accent);color:#fff;border:2px solid var(--line);box-shadow:3px 3px 0 var(--ink);font-family:inherit;font-weight:700;font-size:15px;padding:8px 13px;cursor:pointer;}
  .fx-side{position:fixed;top:0;left:0;z-index:55;transform:translateX(-100%);transition:transform .22s ease;box-shadow:8px 0 0 rgba(0,0,0,.08);width:280px;flex-basis:280px;}
  .fx-side-open{transform:translateX(0);}
  .fx-main{height:auto;overflow:visible;}
  .fx-article{padding:64px 18px 70px;}
  .fx-title{font-size:27px;}
  .fx-pn{max-width:none;}
}
`;
