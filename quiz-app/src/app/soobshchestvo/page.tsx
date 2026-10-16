'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import { trackSection } from '@/lib/cabinet-track';
import OpenInBrowser from '@/components/OpenInBrowser';

// Сообщество — форум кабинета по образцу Skool. Каждый запрос — своя ветка,
// обсуждение идёт комментариями под ней. Сервер: /api/cabinet/forum.
//
// Опознание: в Mini App шлём подписанную initData заголовком x-tg-init-data,
// в браузере работает сессия-cookie после Login Widget.

interface Author { id: string; name: string; username: string | null; isAdmin: boolean }
interface Category { key: string; label: string; emoji: string; adminOnly?: boolean }
interface Card {
  id: string; category: string; title: string; excerpt: string;
  images: string[]; imageCount: number; pinned: boolean; solved: boolean;
  commentCount: number; createdAt: string; lastActivityAt: string; waiting: boolean;
  author: Author; repliers: Author[];
}
interface Post {
  id: string; category: string; title: string; body: string; images: string[];
  pinned: boolean; solved: boolean; createdAt: string; commentCount: number;
  waiting: boolean; author: Author;
}
interface Comment {
  id: string; parentId: string | null; createdAt: string; deleted: boolean;
  body: string; images: string[]; author: Author;
}
interface Me { id: string; isAdmin: boolean }
interface Upload { key: string; id?: string; preview: string; failed?: boolean }

type TgApp = {
  initData?: string;
  openLink?: (u: string) => void;
  BackButton?: { show: () => void; hide: () => void; onClick: (f: () => void) => void; offClick: (f: () => void) => void };
  HapticFeedback?: { notificationOccurred: (t: string) => void };
};

const BOT_URL = 'https://t.me/testtoyzbot';
const ALL = 'all';
const WAITING = 'waiting';
const MINE = 'mine';

const FALLBACK_CATEGORIES: Category[] = [
  { key: 'question', label: 'Вопрос', emoji: '❓' },
  { key: 'review', label: 'На проверку', emoji: '👀' },
  { key: 'win', label: 'Победа', emoji: '🏆' },
  { key: 'report', label: 'Отчёт', emoji: '📈' },
  { key: 'announce', label: 'Анонс', emoji: '📣', adminOnly: true },
];

/** Заголовок для фильтров во множественном числе. */
const PLURAL: Record<string, string> = {
  question: 'Вопросы', review: 'На проверку', win: 'Победы', report: 'Отчёты', announce: 'Анонсы',
};

let initDataRaw = '';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (initDataRaw) headers.set('x-tg-init-data', initDataRaw);
  const res = await fetch(path, { ...init, headers, credentials: 'same-origin' });
  return res.json() as Promise<T>;
}

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
  return <div ref={ref} className="sq-tg-login" />;
}

// ─── мелочи отображения ───────────────────────────────────────

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'только что';
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
  const d = Math.floor(s / 86400);
  if (d === 1) return 'вчера';
  if (d < 7) return `${d} дн назад`;
  const M = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const dt = new Date(iso);
  return `${dt.getDate()} ${M[dt.getMonth()]}`;
}

function plural(n: number, one: string, few: string, many: string) {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}

const HUES = [25, 52, 95, 150, 190, 235, 285, 330];
function hueOf(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HUES[h % HUES.length];
}

function Avatar({ a, size = 36 }: { a: Author; size?: number }) {
  const letters = a.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '·';
  const style = a.isAdmin
    ? { width: size, height: size, fontSize: size * 0.38, background: 'var(--sq-text)', color: 'var(--sq-bg)' }
    : { width: size, height: size, fontSize: size * 0.38, background: `oklch(0.90 0.06 ${hueOf(a.id)})`, color: `oklch(0.38 0.10 ${hueOf(a.id)})` };
  return <span className="sq-ava" style={style} aria-hidden>{letters}</span>;
}

function Name({ a }: { a: Author }) {
  return (
    <span className="sq-name">
      {a.name}
      {a.isAdmin && <span className="sq-admin">автор курса</span>}
    </span>
  );
}

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,:;!?)"'»])/g;

function RichText({ text, onLink }: { text: string; onLink: (u: string) => void }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1
        ? <a key={i} href={p} className="sq-link" onClick={(e) => { e.preventDefault(); onLink(p); }}>{p.replace(/^https?:\/\//, '').slice(0, 60)}{p.length > 68 ? '…' : ''}</a>
        : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

const img = (id: string) => `/api/cabinet/forum/image?id=${id}`;

/** Сжатие на клиенте: длинная сторона до 1600px, JPEG. Фото с телефона весит 4-8 МБ, сюда доезжает 200-400 КБ. */
async function compress(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const el = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(el.naturalWidth, el.naturalHeight));
    const width = Math.round(el.naturalWidth * scale);
    const height = Math.round(el.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(el, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', 0.85));
    return { blob, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Выбор и загрузка картинок: превью сразу, id — когда сервер принял. */
function useUploads(limit = 10) {
  const [items, setItems] = useState<Upload[]>([]);
  const count = useRef(0);
  useEffect(() => { count.current = items.length; }, [items]);
  const add = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const list = [...files].filter((f) => f.type.startsWith('image/'))
      .slice(0, Math.max(0, limit - count.current));
    count.current += list.length;
    const queued = list.map((f) => ({ f, key: Math.random().toString(36).slice(2), preview: URL.createObjectURL(f) }));
    setItems((cur) => [...cur, ...queued.map(({ key, preview }) => ({ key, preview }))]);
    for (const { f, key } of queued) {
      try {
        const { blob, width, height } = await compress(f);
        const fd = new FormData();
        fd.append('file', blob, 'image.jpg');
        fd.append('width', String(width));
        fd.append('height', String(height));
        const res = await api<{ success: boolean; id?: string }>('/api/cabinet/forum/image', { method: 'POST', body: fd });
        setItems((cur) => cur.map((u) => (u.key === key ? { ...u, id: res.id, failed: !res.success } : u)));
      } catch {
        setItems((cur) => cur.map((u) => (u.key === key ? { ...u, failed: true } : u)));
      }
    }
  }, [limit]);
  const remove = (key: string) => setItems((cur) => cur.filter((u) => u.key !== key));
  const reset = () => setItems([]);
  const busy = items.some((u) => !u.id && !u.failed);
  const ids = items.filter((u) => u.id).map((u) => u.id!) as string[];
  return { items, add, remove, reset, busy, ids };
}

function UploadStrip({ u }: { u: ReturnType<typeof useUploads> }) {
  if (!u.items.length) return null;
  return (
    <div className="sq-up-strip">
      {u.items.map((it) => (
        <div key={it.key} className={`sq-up ${it.failed ? 'sq-up-bad' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.preview} alt="" />
          {!it.id && !it.failed && <span className="sq-up-wait"><span className="sq-spinner sq-spinner-sm" /></span>}
          {it.failed && <span className="sq-up-wait">не загрузилась</span>}
          <button type="button" className="sq-up-x" onClick={() => u.remove(it.key)} aria-label="Убрать картинку">×</button>
        </div>
      ))}
    </div>
  );
}

function ImageGrid({ ids, onOpen }: { ids: string[]; onOpen: (i: number) => void }) {
  if (!ids.length) return null;
  return (
    <div className={`sq-grid sq-grid-${Math.min(ids.length, 4)}`}>
      {ids.slice(0, 4).map((id, i) => (
        <button key={id} type="button" className="sq-grid-cell" onClick={() => onOpen(i)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(id)} alt="" loading="lazy" />
          {i === 3 && ids.length > 4 && <span className="sq-grid-more">+{ids.length - 4}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── страница ─────────────────────────────────────────────────

function SoobshchestvoInner() {
  const [phase, setPhase] = useState<'load' | 'guest' | 'locked' | 'ok'>('load');
  const [tier, setTier] = useState(0);
  const [me, setMe] = useState<Me | null>(null);
  const [cats, setCats] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [posts, setPosts] = useState<Card[]>([]);
  const [filter, setFilter] = useState<string>(ALL);
  const [openId, setOpenId] = useState<string | null>(null);
  const [focusComment, setFocusComment] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ ids: string[]; i: number } | null>(null);
  const tgRef = useRef<TgApp | null>(null);

  const openLink = useCallback((u: string) => {
    const tg = tgRef.current;
    if (tg?.openLink) tg.openLink(u);
    else window.open(u, '_blank', 'noopener');
  }, []);

  const loadFeed = useCallback(async () => {
    const data = await api<{
      identified: boolean; allowed: boolean; tier?: number; me?: Me; categories?: Category[]; posts?: Card[];
    }>('/api/cabinet/forum');
    setTier(data.tier || 0);
    if (!data.identified) { setPhase('guest'); return null; }
    if (!data.allowed) { setPhase('locked'); return null; }
    setMe(data.me ?? null);
    if (data.categories) setCats(data.categories);
    setPosts(data.posts || []);
    setPhase('ok');
    return data.me ?? null;
  }, []);

  useEffect(() => {
    let stop = false;
    (async () => {
      const tg = (await waitForTelegramWebApp()) as unknown as (TgApp & { ready: () => void; expand: () => void }) | null;
      if (stop) return;
      if (tg) { try { tg.ready(); tg.expand(); } catch { /* noop */ } }
      tgRef.current = tg;
      initDataRaw = tg?.initData || '';
      try {
        const m = await loadFeed();
        if (stop) return;
        if (m) trackSection('soobshchestvo', Number(m.id));
        // Пришли по кнопке из бота: сразу открываем ветку (и комментарий).
        const qs = new URLSearchParams(window.location.search);
        const p = qs.get('post');
        if (m && p) { setOpenId(p); setFocusComment(qs.get('c')); }
      } catch {
        if (!stop) setPhase('guest');
      }
    })();
    return () => { stop = true; };
  }, [loadFeed]);

  // Вернулся во вкладку — подтягиваем свежие ответы.
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible' && phase === 'ok') loadFeed().catch(() => {}); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [phase, loadFeed]);

  // Открытая ветка живёт в адресе: «назад» в браузере и системный жест её закрывают.
  const openPost = (id: string) => {
    setOpenId(id); setFocusComment(null);
    const url = new URL(window.location.href);
    url.searchParams.set('post', id); url.searchParams.delete('c');
    window.history.pushState({ post: id }, '', url);
  };
  const closePost = useCallback(() => {
    setOpenId(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('post')) {
      url.searchParams.delete('post'); url.searchParams.delete('c');
      window.history.replaceState(null, '', url);
    }
    loadFeed().catch(() => {});
  }, [loadFeed]);
  useEffect(() => {
    const onPop = () => { if (!new URLSearchParams(window.location.search).get('post')) setOpenId(null); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Кнопка «назад» Телеграма в шапке мини-аппа.
  useEffect(() => {
    const bb = tgRef.current?.BackButton;
    if (!bb) return;
    const handler = () => { if (lightbox) setLightbox(null); else closePost(); };
    if (openId || lightbox) { bb.show(); bb.onClick(handler); }
    else bb.hide();
    return () => { bb.offClick(handler); };
  }, [openId, lightbox, closePost]);

  const waitingCount = posts.filter((p) => p.waiting).length;
  const visible = useMemo(() => posts.filter((p) => {
    if (filter === ALL) return true;
    if (filter === WAITING) return p.waiting;
    if (filter === MINE) return p.author.id === me?.id;
    return p.category === filter;
  }), [posts, filter, me]);

  const catOf = (k: string) => cats.find((c) => c.key === k);

  return (
    <main className="sq-wrap">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Manrope:wght@400;500;600;700&subset=cyrillic,latin&display=swap"
        rel="stylesheet" media="print"
        onLoad={(e) => { (e.currentTarget as HTMLLinkElement).media = 'all'; }} />

      <header className="sq-top">
        <a className="sq-back" href="/dostup">‹ Кабинет</a>
        <div className="sq-brand">Сообщество</div>
        <div className="sq-sub">Свой вопрос или работу выкладывай отдельной веткой. Когда ответят, придёт сообщение в бот.</div>
        <OpenInBrowser path="/soobshchestvo" className="sq-browser" />
      </header>

      {phase === 'load' && <div className="sq-state"><div className="sq-spinner" /><p>Загрузка…</p></div>}

      {phase === 'guest' && (
        <div className="sq-card sq-login">
          <div className="sq-login-title">Вход в сообщество</div>
          <div className="sq-login-sub">Сообщество привязано к твоему Telegram. Войди, и раздел откроется, если у тебя тариф 2 или 3.</div>
          <TelegramLoginButton />
          <a className="sq-login-alt" href={BOT_URL} target="_blank" rel="noopener noreferrer">Или открыть в боте →</a>
        </div>
      )}

      {phase === 'locked' && (
        <div className="sq-card">
          <div className="sq-lock-badge">🔒 Закрытый раздел</div>
          <h1 className="sq-lock-h1">Сообщество учеников</h1>
          <p className="sq-lock-p">
            Здесь ученики разбирают свои вопросы и работы с Сашей, у каждой темы своя ветка.
            Раздел открыт на тарифах <b>2</b> и <b>3</b> «Нового уровня контента».
            {tier > 0 && <> Сейчас у тебя тариф {tier}.</>}
          </p>
          <a className="sq-cta" href="https://thesashatoyz.com/uroven">Посмотреть тарифы →</a>
        </div>
      )}

      {phase === 'ok' && me && (
        <>
          <Composer me={me} cats={cats} onDone={async (id) => { await loadFeed(); openPost(id); }} />

          <nav className="sq-filters" aria-label="Фильтр веток">
            {me.isAdmin && (
              <button className={`sq-chip sq-chip-wait ${filter === WAITING ? 'on' : ''}`} onClick={() => setFilter(WAITING)}>
                Ждут ответа{waitingCount > 0 && <span className="sq-chip-n">{waitingCount}</span>}
              </button>
            )}
            <button className={`sq-chip ${filter === ALL ? 'on' : ''}`} onClick={() => setFilter(ALL)}>Все</button>
            {cats.map((c) => (
              <button key={c.key} className={`sq-chip ${filter === c.key ? 'on' : ''}`} onClick={() => setFilter(c.key)}>
                {c.emoji} {PLURAL[c.key] ?? c.label}
              </button>
            ))}
            {!me.isAdmin && (
              <button className={`sq-chip ${filter === MINE ? 'on' : ''}`} onClick={() => setFilter(MINE)}>Мои</button>
            )}
          </nav>

          {visible.length === 0 && (
            <div className="sq-card sq-empty">
              {posts.length === 0
                ? 'Пока тихо. Создай первую ветку: вопрос, работу на проверку или свою победу.'
                : filter === WAITING ? 'Все ответы даны 🙌' : 'Здесь пока пусто.'}
            </div>
          )}

          {visible.map((p) => {
            const c = catOf(p.category);
            const mine = p.author.id === me.id;
            return (
              <article key={p.id} className={`sq-card sq-post ${p.pinned ? 'sq-pinned' : ''}`}
                onClick={() => openPost(p.id)} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') openPost(p.id); }}>
                {p.pinned && <div className="sq-pin-label">📌 Закреплено</div>}
                <div className="sq-post-head">
                  <Avatar a={p.author} />
                  <div className="sq-post-meta">
                    <Name a={p.author} />
                    <span className="sq-meta-line">{ago(p.createdAt)} · {c ? `${c.emoji} ${c.label}` : p.category}</span>
                  </div>
                  {p.solved && <span className="sq-badge sq-badge-ok">✓ Решено</span>}
                  {!p.solved && p.waiting && (me.isAdmin || mine) && (
                    <span className="sq-badge sq-badge-wait">{me.isAdmin ? 'Ждёт ответа' : 'Ждём ответа'}</span>
                  )}
                </div>
                <h2 className="sq-post-title">{p.title}</h2>
                {p.excerpt && <p className="sq-post-excerpt">{p.excerpt}</p>}
                {p.images.length > 0 && (
                  <div className="sq-thumbs">
                    {p.images.map((id, i) => (
                      <span key={id} className="sq-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img(id)} alt="" loading="lazy" />
                        {i === 3 && p.imageCount > 4 && <span className="sq-grid-more">+{p.imageCount - 4}</span>}
                      </span>
                    ))}
                  </div>
                )}
                <div className="sq-post-foot">
                  <span className="sq-count">
                    💬 {p.commentCount > 0 ? `${p.commentCount} ${plural(p.commentCount, 'ответ', 'ответа', 'ответов')}` : 'Ответить'}
                  </span>
                  {p.repliers.length > 0 && (
                    <span className="sq-repliers">
                      {p.repliers.map((r) => <Avatar key={r.id} a={r} size={22} />)}
                    </span>
                  )}
                  {p.commentCount > 0 && <span className="sq-last">последний {ago(p.lastActivityAt)}</span>}
                </div>
              </article>
            );
          })}
        </>
      )}

      {openId && me && (
        <Thread id={openId} me={me} cats={cats} focusComment={focusComment}
          onClose={() => { if (window.history.state?.post) window.history.back(); else closePost(); }}
          onDeleted={() => { setOpenId(null); closePost(); }}
          onImage={(ids, i) => setLightbox({ ids, i })} onLink={openLink} />
      )}

      {lightbox && (
        <div className="sq-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(lightbox.ids[lightbox.i])} alt="" onClick={(e) => {
            e.stopPropagation();
            setLightbox((l) => (l && l.ids.length > 1 ? { ...l, i: (l.i + 1) % l.ids.length } : null));
          }} />
          {lightbox.ids.length > 1 && <span className="sq-lb-count">{lightbox.i + 1} / {lightbox.ids.length}</span>}
          <button className="sq-lb-x" onClick={() => setLightbox(null)} aria-label="Закрыть">×</button>
        </div>
      )}

      <style>{CSS}</style>
    </main>
  );
}

// ─── новая ветка ──────────────────────────────────────────────

function Composer({ me, cats, onDone }: { me: Me; cats: Category[]; onDone: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const up = useUploads(10);
  const fileRef = useRef<HTMLInputElement>(null);
  const meAuthor: Author = { id: me.id, name: me.isAdmin ? 'Саша' : 'Я', username: null, isAdmin: me.isAdmin };

  async function submit() {
    setErr('');
    if (!category) { setErr('Выбери, что это: вопрос, работа на проверку…'); return; }
    if (!title.trim()) { setErr('Напиши заголовок: одной строкой, о чём ветка'); return; }
    setSending(true);
    try {
      const res = await api<{ success: boolean; id?: string; error?: string }>('/api/cabinet/forum', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post', category, title, body, images: up.ids }),
      });
      if (!res.success || !res.id) { setErr(res.error || 'Не получилось опубликовать'); return; }
      setOpen(false); setCategory(''); setTitle(''); setBody(''); up.reset();
      onDone(res.id);
    } catch {
      setErr('Нет связи, попробуй ещё раз');
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button className="sq-card sq-compose-closed" onClick={() => setOpen(true)}>
        <Avatar a={meAuthor} />
        <span className="sq-compose-ph">Создать ветку: вопрос, работа, победа…</span>
      </button>
    );
  }

  return (
    <div className="sq-card sq-compose">
      <div className="sq-compose-label">Что это?</div>
      <div className="sq-cat-row">
        {cats.filter((c) => !c.adminOnly || me.isAdmin).map((c) => (
          <button key={c.key} type="button" className={`sq-chip ${category === c.key ? 'on' : ''}`} onClick={() => setCategory(c.key)}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
      <input className="sq-input sq-title-input" placeholder="Заголовок: о чём ветка" maxLength={140}
        value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="sq-input sq-textarea" rows={5}
        placeholder="Подробнее: что делал, что получилось, в чём вопрос. Ссылки можно вставлять как есть."
        value={body} onChange={(e) => setBody(e.target.value)} />
      <UploadStrip u={up} />
      {err && <div className="sq-err">{err}</div>}
      <div className="sq-compose-actions">
        <button type="button" className="sq-ghost" onClick={() => fileRef.current?.click()}>📎 Картинки</button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { up.add(e.target.files); e.target.value = ''; }} />
        <span className="sq-flex" />
        <button type="button" className="sq-ghost" onClick={() => setOpen(false)}>Отмена</button>
        <button type="button" className="sq-btn" disabled={sending || up.busy} onClick={submit}>
          {sending ? 'Публикую…' : up.busy ? 'Гружу фото…' : 'Опубликовать'}
        </button>
      </div>
    </div>
  );
}

// ─── ветка целиком ────────────────────────────────────────────

function Thread({ id, me, cats, focusComment, onClose, onDeleted, onImage, onLink }: {
  id: string; me: Me; cats: Category[]; focusComment: string | null;
  onClose: () => void; onDeleted: () => void;
  onImage: (ids: string[], i: number) => void; onLink: (u: string) => void;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [missing, setMissing] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const up = useUploads(6);
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  const load = useCallback(async () => {
    const data = await api<{ success: boolean; post?: Post; comments?: Comment[] }>(`/api/cabinet/forum?post=${id}`);
    if (!data.success || !data.post) { setMissing(true); return; }
    setPost(data.post); setComments(data.comments || []);
  }, [id]);

  useEffect(() => { load().catch(() => setMissing(true)); }, [load]);

  // Пришли по уведомлению — прокручиваем к нужному комментарию и подсвечиваем.
  useEffect(() => {
    if (!focusComment || focused.current || !comments.length) return;
    const el = document.getElementById(`c-${focusComment}`);
    if (el) { focused.current = true; el.scrollIntoView({ block: 'center' }); el.classList.add('sq-flash'); }
  }, [comments, focusComment]);

  // Поле ответа растёт вместе с текстом.
  useEffect(() => {
    const a = areaRef.current;
    if (!a) return;
    a.style.height = 'auto';
    a.style.height = `${Math.min(a.scrollHeight, 180)}px`;
  }, [text]);

  async function act(payload: Record<string, unknown>) {
    const res = await api<{ success: boolean; error?: string }>('/api/cabinet/forum', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!res.success) alert(res.error || 'Не получилось');
    return res.success;
  }

  async function send() {
    if ((!text.trim() && !up.ids.length) || sending) return;
    setSending(true); setErr('');
    try {
      const res = await api<{ success: boolean; id?: string; error?: string }>('/api/cabinet/forum', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', postId: id, parentId: replyTo?.id ?? null, body: text, images: up.ids }),
      });
      if (!res.success) { setErr(res.error || 'Не отправилось'); return; }
      setText(''); setReplyTo(null); up.reset();
      await load();
      requestAnimationFrame(() => {
        const el = res.id && document.getElementById(`c-${res.id}`);
        if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    } catch {
      setErr('Нет связи, попробуй ещё раз');
    } finally {
      setSending(false);
    }
  }

  const roots = comments.filter((c) => !c.parentId);
  const childrenOf = (cid: string) => comments.filter((c) => c.parentId === cid);
  const canModerate = (a: Author) => me.isAdmin || a.id === me.id;
  const c = post ? cats.find((x) => x.key === post.category) : null;

  function renderComment(cm: Comment, nested: boolean) {
    return (
      <div key={cm.id} id={`c-${cm.id}`} className={`sq-cm ${nested ? 'sq-cm-nested' : ''}`}>
        <Avatar a={cm.author} size={nested ? 28 : 32} />
        <div className="sq-cm-main">
          <div className="sq-cm-bubble">
            <div className="sq-cm-head"><Name a={cm.author} /><span className="sq-meta-line">{ago(cm.createdAt)}</span></div>
            {cm.deleted
              ? <div className="sq-cm-deleted">Комментарий удалён</div>
              : <>
                  {cm.body && <div className="sq-cm-body"><RichText text={cm.body} onLink={onLink} /></div>}
                  <ImageGrid ids={cm.images} onOpen={(i) => onImage(cm.images, i)} />
                </>}
          </div>
          {!cm.deleted && (
            <div className="sq-cm-actions">
              <button onClick={() => { setReplyTo(cm); areaRef.current?.focus(); }}>Ответить</button>
              {canModerate(cm.author) && (
                <button onClick={async () => {
                  if (confirm('Удалить комментарий?') && await act({ action: 'delete', kind: 'comment', id: cm.id })) load();
                }}>Удалить</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sq-viewer" role="dialog" aria-modal="true" aria-label={post?.title || 'Ветка'}>
      <div className="sq-viewer-bar">
        <button className="sq-viewer-back" onClick={onClose}><span className="sq-viewer-chev">‹</span> Назад</button>
        <span className="sq-viewer-title">{post?.title ?? ''}</span>
        <span className="sq-viewer-pad" />
      </div>

      <div className="sq-viewer-scroll" ref={scrollRef}>
        <div className="sq-viewer-inner">
          {missing && <div className="sq-card sq-empty">Ветка удалена или ещё не загрузилась.</div>}
          {!post && !missing && <div className="sq-state"><div className="sq-spinner" /></div>}
          {post && (
            <>
              <article className="sq-full">
                <div className="sq-post-head">
                  <Avatar a={post.author} size={40} />
                  <div className="sq-post-meta">
                    <Name a={post.author} />
                    <span className="sq-meta-line">{ago(post.createdAt)} · {c ? `${c.emoji} ${c.label}` : post.category}</span>
                  </div>
                  {post.solved && <span className="sq-badge sq-badge-ok">✓ Решено</span>}
                </div>
                <h1 className="sq-full-title">{post.title}</h1>
                {post.body && <div className="sq-full-body"><RichText text={post.body} onLink={onLink} /></div>}
                <ImageGrid ids={post.images} onOpen={(i) => onImage(post.images, i)} />

                {canModerate(post.author) && (
                  <div className="sq-tools">
                    {post.category !== 'announce' && (
                      <button className={`sq-tool ${post.solved ? 'on' : ''}`} onClick={async () => {
                        if (await act({ action: 'solve', id: post.id, value: !post.solved })) load();
                      }}>{post.solved ? '↺ Открыть снова' : '✓ Вопрос решён'}</button>
                    )}
                    {me.isAdmin && (
                      <button className={`sq-tool ${post.pinned ? 'on' : ''}`} onClick={async () => {
                        if (await act({ action: 'pin', id: post.id, value: !post.pinned })) load();
                      }}>{post.pinned ? 'Открепить' : '📌 Закрепить'}</button>
                    )}
                    <button className="sq-tool sq-tool-danger" onClick={async () => {
                      if (confirm('Удалить ветку целиком?') && await act({ action: 'delete', kind: 'post', id: post.id })) onDeleted();
                    }}>Удалить</button>
                  </div>
                )}
              </article>

              <div className="sq-cm-title">
                {comments.filter((x) => !x.deleted).length
                  ? `${comments.filter((x) => !x.deleted).length} ${plural(comments.filter((x) => !x.deleted).length, 'ответ', 'ответа', 'ответов')}`
                  : 'Ответов пока нет'}
              </div>
              <div className="sq-cms">
                {roots.map((r) => (
                  <Fragment key={r.id}>
                    {renderComment(r, false)}
                    {childrenOf(r.id).map((ch) => renderComment(ch, true))}
                  </Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {post && (
        <div className="sq-reply">
          {replyTo && (
            <div className="sq-reply-to">
              <span>↩︎ Ответ <b>{replyTo.author.name}</b>{replyTo.body ? `: ${replyTo.body.slice(0, 60)}${replyTo.body.length > 60 ? '…' : ''}` : ''}</span>
              <button onClick={() => setReplyTo(null)} aria-label="Не отвечать на комментарий">×</button>
            </div>
          )}
          <UploadStrip u={up} />
          {err && <div className="sq-err">{err}</div>}
          <div className="sq-reply-row">
            <button className="sq-attach" onClick={() => fileRef.current?.click()} aria-label="Приложить картинки">📎</button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden
              onChange={(e) => { up.add(e.target.files); e.target.value = ''; }} />
            <textarea ref={areaRef} className="sq-input sq-reply-area" rows={1} placeholder="Написать ответ…"
              value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }} />
            <button className="sq-send" disabled={sending || up.busy || (!text.trim() && !up.ids.length)} onClick={send} aria-label="Отправить">
              {sending ? '…' : '↑'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
  html, body {
    background: oklch(0.97 0.006 75) !important;
    height: auto !important; min-height: 100% !important;
    overflow-y: auto !important; position: static !important;
  }
  .sq-wrap {
    --sq-bg: oklch(0.97 0.006 75); --sq-text: oklch(0.16 0.015 55);
    --sq-muted: oklch(0.46 0.012 55); --sq-accent: oklch(0.60 0.19 52);
    --sq-accent-soft: oklch(0.93 0.04 52); --sq-surface: oklch(1 0 0);
    --sq-line: oklch(0.90 0.008 75); --sq-ok: oklch(0.50 0.13 155); --sq-ok-soft: oklch(0.94 0.05 155);
    --sq-warn: oklch(0.55 0.15 60); --sq-warn-soft: oklch(0.95 0.05 80);
    max-width: 620px; margin: 0 auto; padding: 26px 16px 60px;
    font-family: 'Manrope', system-ui, sans-serif; color: var(--sq-text);
    background: var(--sq-bg); min-height: 100svh;
  }
  .sq-wrap * { box-sizing: border-box; }
  .sq-wrap button { font-family: inherit; }
  .sq-top { margin-bottom: 18px; }
  .sq-back { display: inline-block; text-decoration: none; color: var(--sq-muted); font-size: 13px; font-weight: 600; margin-bottom: 10px; }
  .sq-back:hover { color: var(--sq-accent); }
  .sq-brand { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 28px; letter-spacing: -0.025em; }
  .sq-sub { color: var(--sq-muted); font-size: 13px; margin-top: 3px; line-height: 1.45; max-width: 46ch; }
  .sq-browser {
    display: inline-block; margin-top: 12px; cursor: pointer; background: none; border: 1px solid var(--sq-line);
    color: var(--sq-muted); font-weight: 600; font-size: 13px; padding: 8px 13px; border-radius: 10px;
  }
  .sq-card {
    display: block; width: 100%; text-align: left; background: var(--sq-surface);
    border: 1px solid var(--sq-line); border-radius: 18px; padding: 16px; margin-bottom: 12px; color: inherit;
  }

  /* аватар и имя */
  .sq-ava {
    flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;
    font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; letter-spacing: -0.02em; line-height: 1;
  }
  .sq-name { font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .sq-admin {
    font-size: 10.5px; font-weight: 700; color: var(--sq-accent); background: var(--sq-accent-soft);
    padding: 2px 7px; border-radius: 999px;
  }
  .sq-meta-line { color: var(--sq-muted); font-size: 12px; }

  /* создание ветки */
  .sq-compose-closed { display: flex; align-items: center; gap: 12px; cursor: pointer; transition: border-color .12s; }
  .sq-compose-closed:hover { border-color: var(--sq-accent); }
  .sq-compose-ph { color: var(--sq-muted); font-size: 14.5px; font-weight: 500; }
  .sq-compose-label { font-size: 12px; font-weight: 700; color: var(--sq-muted); margin-bottom: 8px; }
  .sq-cat-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .sq-input {
    width: 100%; font-family: inherit; font-size: 15px; color: var(--sq-text); background: var(--sq-bg);
    border: 1px solid var(--sq-line); border-radius: 12px; padding: 11px 13px;
  }
  .sq-input:focus { outline: none; border-color: var(--sq-accent); }
  .sq-title-input { font-weight: 700; margin-bottom: 8px; }
  .sq-textarea { resize: vertical; min-height: 110px; line-height: 1.5; }
  .sq-compose-actions { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
  .sq-flex { flex: 1; }
  .sq-ghost {
    background: none; border: none; cursor: pointer; color: var(--sq-muted); font-weight: 600; font-size: 13.5px;
    padding: 9px 8px; border-radius: 9px;
  }
  .sq-ghost:hover { color: var(--sq-text); background: var(--sq-bg); }
  .sq-btn {
    border: none; cursor: pointer; background: var(--sq-accent); color: oklch(1 0 0);
    font-family: 'Archivo', system-ui, sans-serif !important; font-weight: 800; font-size: 14.5px; padding: 10px 18px; border-radius: 11px;
  }
  .sq-btn:disabled { opacity: .55; cursor: default; }
  .sq-err { color: oklch(0.55 0.18 25); font-size: 13px; margin-top: 10px; }

  /* загрузка картинок */
  .sq-up-strip { display: flex; gap: 8px; overflow-x: auto; margin-top: 10px; padding-bottom: 2px; }
  .sq-up { position: relative; flex: 0 0 auto; width: 72px; height: 72px; border-radius: 10px; overflow: hidden; background: var(--sq-line); }
  .sq-up img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sq-up-bad img { opacity: .35; }
  .sq-up-wait {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center;
    background: oklch(1 0 0 / .55); font-size: 10px; font-weight: 700; color: oklch(0.55 0.18 25); padding: 4px;
  }
  .sq-up-x {
    position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; border-radius: 50%; border: none; cursor: pointer;
    background: oklch(0.16 0.015 55 / .75); color: #fff; font-size: 15px; line-height: 1; padding: 0;
  }

  /* фильтры */
  .sq-filters {
    display: flex; gap: 6px; overflow-x: auto; margin: 4px -16px 12px; padding: 2px 16px 4px;
    scrollbar-width: none;
  }
  .sq-filters::-webkit-scrollbar { display: none; }
  .sq-chip {
    flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;
    background: var(--sq-surface); border: 1px solid var(--sq-line); color: var(--sq-text);
    font-weight: 600; font-size: 13px; padding: 7px 12px; border-radius: 999px; transition: border-color .12s, background .12s;
  }
  .sq-chip:hover { border-color: var(--sq-accent); }
  .sq-chip.on { background: var(--sq-text); border-color: var(--sq-text); color: var(--sq-bg); }
  .sq-chip-wait { border-color: var(--sq-accent); color: var(--sq-accent); }
  .sq-chip-wait.on { background: var(--sq-accent); border-color: var(--sq-accent); color: #fff; }
  .sq-chip-n {
    min-width: 19px; height: 19px; border-radius: 999px; background: var(--sq-accent); color: #fff;
    font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; padding: 0 5px;
  }
  .sq-chip-wait.on .sq-chip-n { background: #fff; color: var(--sq-accent); }

  /* карточка ветки */
  .sq-post { cursor: pointer; transition: border-color .12s, transform .12s; }
  .sq-post:hover { border-color: oklch(0.80 0.06 52); }
  .sq-post:active { transform: translateY(1px); }
  .sq-pinned { border-color: oklch(0.85 0.07 52); background: oklch(0.995 0.008 75); }
  .sq-pin-label { font-size: 11.5px; font-weight: 700; color: var(--sq-accent); margin-bottom: 10px; }
  .sq-post-head { display: flex; align-items: center; gap: 10px; }
  .sq-post-meta { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
  .sq-badge { flex: 0 0 auto; font-size: 11.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; white-space: nowrap; }
  .sq-badge-ok { background: var(--sq-ok-soft); color: var(--sq-ok); }
  .sq-badge-wait { background: var(--sq-warn-soft); color: var(--sq-warn); }
  .sq-post-title {
    font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 17.5px; letter-spacing: -0.015em;
    line-height: 1.22; margin: 12px 0 0; text-wrap: pretty;
  }
  .sq-post-excerpt {
    color: var(--sq-muted); font-size: 14px; line-height: 1.5; margin: 6px 0 0;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .sq-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 12px; }
  .sq-thumb { position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: var(--sq-line); }
  .sq-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sq-post-foot { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--sq-line); }
  .sq-count { font-size: 13px; font-weight: 700; color: var(--sq-text); }
  .sq-repliers { display: inline-flex; }
  .sq-repliers .sq-ava { border: 2px solid var(--sq-surface); margin-left: -6px; }
  .sq-repliers .sq-ava:first-child { margin-left: 0; }
  .sq-last { margin-left: auto; color: var(--sq-muted); font-size: 12px; }
  .sq-empty { color: var(--sq-muted); font-size: 14px; line-height: 1.5; }

  /* ветка целиком */
  .sq-viewer {
    position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column;
    background: var(--sq-bg); animation: sq-fade .16s ease;
  }
  @keyframes sq-fade { from { opacity: 0; } to { opacity: 1; } }
  .sq-viewer-bar {
    flex: 0 0 auto; display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    padding-top: max(10px, env(safe-area-inset-top)); background: var(--sq-surface); border-bottom: 1px solid var(--sq-line);
  }
  .sq-viewer-back {
    flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; cursor: pointer; border: none; background: none;
    color: var(--sq-accent); font-family: 'Archivo', system-ui, sans-serif !important; font-weight: 800; font-size: 15px; padding: 4px 2px;
  }
  .sq-viewer-chev { font-size: 22px; line-height: 1; margin-top: -1px; }
  .sq-viewer-title {
    flex: 1; min-width: 0; text-align: center; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800;
    font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sq-viewer-pad { flex: 0 0 auto; width: 60px; }
  .sq-viewer-scroll { flex: 1 1 auto; overflow-y: auto; -webkit-overflow-scrolling: touch; }
  .sq-viewer-inner { max-width: 620px; margin: 0 auto; padding: 18px 16px 24px; }
  .sq-full { background: var(--sq-surface); border: 1px solid var(--sq-line); border-radius: 18px; padding: 18px; }
  .sq-full-title {
    font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 22px; letter-spacing: -0.02em;
    line-height: 1.18; margin: 14px 0 0; text-wrap: pretty;
  }
  .sq-full-body { font-size: 15px; line-height: 1.6; margin-top: 10px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .sq-link { color: var(--sq-accent); text-decoration: underline; text-underline-offset: 2px; word-break: break-all; }
  .sq-grid { display: grid; gap: 6px; margin-top: 12px; border-radius: 12px; overflow: hidden; }
  .sq-grid-1 { grid-template-columns: 1fr; }
  .sq-grid-2, .sq-grid-4 { grid-template-columns: 1fr 1fr; }
  .sq-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .sq-grid-cell { position: relative; border: none; padding: 0; cursor: zoom-in; background: var(--sq-line); aspect-ratio: 1; overflow: hidden; }
  .sq-grid-1 .sq-grid-cell { aspect-ratio: auto; max-height: 520px; }
  .sq-grid-cell img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sq-grid-1 .sq-grid-cell img { object-fit: contain; background: var(--sq-bg); max-height: 520px; }
  .sq-grid-more {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: oklch(0.16 0.015 55 / .5); color: #fff; font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 20px;
  }
  .sq-tools { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--sq-line); }
  .sq-tool {
    cursor: pointer; background: var(--sq-bg); border: 1px solid var(--sq-line); color: var(--sq-text);
    font-weight: 600; font-size: 12.5px; padding: 7px 11px; border-radius: 9px;
  }
  .sq-tool.on { background: var(--sq-ok-soft); border-color: transparent; color: var(--sq-ok); }
  .sq-tool-danger { color: oklch(0.55 0.18 25); margin-left: auto; }
  .sq-cm-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 14px; margin: 22px 2px 12px; }
  .sq-cms { display: flex; flex-direction: column; gap: 12px; }
  .sq-cm { display: flex; gap: 9px; align-items: flex-start; border-radius: 14px; transition: background .6s; }
  .sq-cm-nested { margin-left: 41px; }
  .sq-cm-main { flex: 1; min-width: 0; }
  .sq-cm-bubble { background: var(--sq-surface); border: 1px solid var(--sq-line); border-radius: 4px 14px 14px 14px; padding: 9px 12px 11px; }
  .sq-cm-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .sq-cm-body { font-size: 14.5px; line-height: 1.55; margin-top: 3px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .sq-cm-deleted { color: var(--sq-muted); font-size: 13px; font-style: italic; margin-top: 3px; }
  .sq-cm-actions { display: flex; gap: 14px; padding: 4px 4px 0; }
  .sq-cm-actions button {
    background: none; border: none; cursor: pointer; padding: 2px 0; color: var(--sq-muted); font-size: 12.5px; font-weight: 700;
  }
  .sq-cm-actions button:hover { color: var(--sq-accent); }
  .sq-flash .sq-cm-bubble { border-color: var(--sq-accent); box-shadow: 0 0 0 3px var(--sq-accent-soft); }

  /* поле ответа */
  .sq-reply {
    flex: 0 0 auto; background: var(--sq-surface); border-top: 1px solid var(--sq-line);
    padding: 10px 12px; padding-bottom: max(10px, env(safe-area-inset-bottom));
  }
  .sq-reply > * { max-width: 620px; margin-left: auto; margin-right: auto; }
  .sq-reply-to {
    display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--sq-muted);
    background: var(--sq-bg); border-radius: 10px; padding: 7px 10px; margin-bottom: 8px;
  }
  .sq-reply-to span { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sq-reply-to button { background: none; border: none; cursor: pointer; font-size: 18px; color: var(--sq-muted); line-height: 1; padding: 0 2px; }
  .sq-reply-row { display: flex; align-items: flex-end; gap: 8px; }
  .sq-reply-area { resize: none; line-height: 1.45; padding: 10px 13px; border-radius: 20px; min-height: 42px; max-height: 180px; }
  .sq-attach {
    flex: 0 0 auto; width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--sq-line);
    background: var(--sq-bg); cursor: pointer; font-size: 17px;
  }
  .sq-send {
    flex: 0 0 auto; width: 42px; height: 42px; border-radius: 50%; border: none; cursor: pointer;
    background: var(--sq-accent); color: #fff; font-size: 20px; font-weight: 800;
  }
  .sq-send:disabled { opacity: .4; cursor: default; }

  /* просмотр картинки */
  .sq-lightbox {
    position: fixed; inset: 0; z-index: 1100; background: oklch(0.1 0.01 55 / .94);
    display: flex; align-items: center; justify-content: center; padding: 16px; animation: sq-fade .14s ease;
  }
  .sq-lightbox img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; }
  .sq-lb-count { position: absolute; bottom: max(18px, env(safe-area-inset-bottom)); color: #fff; font-size: 13px; font-weight: 700; opacity: .8; }
  .sq-lb-x {
    position: absolute; top: max(12px, env(safe-area-inset-top)); right: 12px; width: 40px; height: 40px; border-radius: 50%;
    border: none; background: oklch(1 0 0 / .14); color: #fff; font-size: 24px; cursor: pointer;
  }

  /* вход и замок */
  .sq-login-title { font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 16px; }
  .sq-login-sub { color: var(--sq-muted); font-size: 12.5px; margin: 4px 0 12px; line-height: 1.4; }
  .sq-tg-login { margin-top: 4px; min-height: 46px; }
  .sq-login-alt { display: inline-block; margin-top: 12px; text-decoration: none; color: var(--sq-muted); font-size: 13px; font-weight: 600; }
  .sq-lock-badge {
    display: inline-block; font-size: 12px; font-weight: 700; color: var(--sq-muted);
    background: var(--sq-bg); border: 1px solid var(--sq-line); padding: 5px 10px; border-radius: 999px;
  }
  .sq-lock-h1 { font-family: 'Archivo', system-ui, sans-serif; font-weight: 900; font-size: 24px; letter-spacing: -0.02em; margin: 12px 0 8px; }
  .sq-lock-p { font-size: 14.5px; line-height: 1.55; margin: 0 0 18px; }
  .sq-cta {
    display: block; text-align: center; text-decoration: none; background: var(--sq-accent); color: #fff;
    font-family: 'Archivo', system-ui, sans-serif; font-weight: 800; font-size: 15px; padding: 13px 18px; border-radius: 11px;
  }
  .sq-state { text-align: center; padding: 48px 16px; }
  .sq-state p { color: var(--sq-muted); margin: 0; }
  .sq-spinner {
    width: 24px; height: 24px; border: 3px solid var(--sq-line); border-top-color: var(--sq-accent);
    border-radius: 50%; margin: 0 auto 12px; animation: sq-spin .8s linear infinite; display: inline-block;
  }
  .sq-spinner-sm { width: 18px; height: 18px; border-width: 2px; margin: 0; }
  @keyframes sq-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .sq-viewer, .sq-lightbox { animation: none; } }
`;

export default function SoobshchestvoPage() {
  return <SoobshchestvoInner />;
}
