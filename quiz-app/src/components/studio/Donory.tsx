'use client';

// «Доноры»: the bank of donors. Themes that took off for other authors on carousels, reels,
// YouTube and Shorts, ranked by the bank (bank-donorov on GitHub). Sasha and Danya both take
// a theme into a carousel, mark it «мимо», rename or merge it; every edit lands in the journal,
// goes back to the bank on the next sync, and Danya's reach Sasha in Telegram.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SOURCES, SOURCE_LABEL, who, type DonorExhibit, type ThemeView } from '@/lib/studio/donory';
import Sheet from './Sheet';
import s from './studio.module.css';

interface LogRow { themeId: string; theme: string; action: string; value: string | null; note: string | null; actor: string; at: string }

const ACTION: Record<string, string> = {
  take: 'взял', hide: 'убрал как «мимо»', unhide: 'вернул', rename: 'переименовал', merge: 'склеил', unmerge: 'расклеил',
};

async function post(op: string, payload: Record<string, unknown>) {
  const res = await fetch('/api/studio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op, ...payload }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `ошибка ${res.status}`);
  return data;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { timeZone: 'Asia/Almaty', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const xLabel = (x: number | null) => (x ? `×${x >= 10 ? Math.round(x) : x.toFixed(1)}` : '');

export default function Donory() {
  const [themes, setThemes] = useState<ThemeView[] | null>(null);
  const [log, setLog] = useState<LogRow[]>([]);
  const [synced, setSynced] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('');
  const [query, setQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/studio?part=donory', { cache: 'no-store' });
      if (!res.ok) throw new Error(`ошибка ${res.status}`);
      const d = await res.json();
      setThemes(d.themes);
      setLog(d.log);
      setSynced(d.syncedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (themes ?? []).filter((t) => (showHidden || !t.hidden) && (!platform || t.platforms[platform])
      && (!q || t.name.toLowerCase().includes(q) || (t.best?.hook ?? '').toLowerCase().includes(q)));
  }, [themes, platform, query, showHidden]);

  if (!themes) return <p className={error ? s.error : s.muted}>{error || 'загружаю…'}</p>;
  if (!themes.length) return <p className={s.note}>Банк ещё не прислал темы: они приходят после утреннего прогона на сервере.</p>;
  const open = themes.find((t) => t.id === openId) ?? null;
  const hiddenCount = themes.filter((t) => t.hidden).length;

  return (
    <div className={s.donory}>
      <p className={s.note}>
        Темы, которые залетели у разных авторов. Сверху то, что повторяется у многих и на нескольких площадках:
        вес = авторов + 2 за каждую площадку сверх первой + 3 за наш залёт − 1 за наш провал. Твоя нейронка видит
        то же через MCP (podbor_temy). Код банка: github.com/thesashatoyzworld/bank-donorov.
        {synced && <> Обновлено {when(synced)}.</>}
      </p>
      <div className={s.toolbar}>
        <div className={s.segmented} role="group" aria-label="Площадка">
          {[['', 'Все'], ...SOURCES.map((k) => [k, SOURCE_LABEL[k]])].map(([k, label]) => (
            <button key={k} className={s.segment} aria-pressed={platform === k} onClick={() => setPlatform(k)}>{label}</button>
          ))}
        </div>
        <input className={s.input} placeholder="поиск по теме или заходу" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Поиск" />
        {hiddenCount > 0 && (
          <button className={s.btnGhost} onClick={() => setShowHidden(!showHidden)}>
            {showHidden ? 'скрыть «мимо»' : `показать «мимо» (${hiddenCount})`}
          </button>
        )}
      </div>
      {error && <p className={s.error} role="alert">{error}</p>}

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>#</th><th>Тема</th><th className={s.num}>Вес</th><th className={s.num}>Авторов</th>
              {SOURCES.map((k) => <th key={k} className={s.num}>{SOURCE_LABEL[k]}</th>)}
              <th>У нас</th><th className={s.num}>Макс</th><th>Лучший пример</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t, i) => (
              <tr key={t.id} className={t.hidden ? s.donorHidden : undefined}>
                <td className={s.num}>{i + 1}</td>
                <th scope="row">
                  <button className={s.linkBtn} onClick={() => setOpenId(t.id)}>{t.name}</button>
                  {t.taken.length > 0 && <span className={s.donorTaken}> взяли {t.taken.length}</span>}
                  {t.hidden && <span className={s.muted}> мимо</span>}
                </th>
                <td className={s.num}><b>{t.ves}</b></td>
                <td className={s.num}>{t.authors}</td>
                {SOURCES.map((k) => <td key={k} className={s.num}>{t.platforms[k] || ''}</td>)}
                <td className={s.nowrap}>{t.ours}</td>
                <td className={s.num}>{xLabel(t.maxX)}</td>
                <td>{t.best && <Example e={t.best} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!shown.length && <p className={s.empty}>ничего не нашлось</p>}

      <h3 className={s.sectionHead}>Журнал правок</h3>
      {log.length ? (
        <ul className={s.donorLog}>
          {log.map((r, i) => (
            <li key={i}>
              <span className={s.muted}>{when(r.at)}</span> <b>{who(r.actor)}</b> {ACTION[r.action] ?? r.action} «{r.theme}»
              {r.action === 'take' && r.value && <> заходом «{r.value}» в {r.note}</>}
              {r.action === 'rename' && <> → «{r.value ?? 'исходное'}»</>}
              {r.action === 'merge' && r.value && <> в {themes.find((t) => t.id === r.value)?.name ?? r.value}</>}
              {r.action !== 'take' && r.note && <span className={s.muted}> ({r.note})</span>}
            </li>
          ))}
        </ul>
      ) : <p className={s.muted}>Правок пока нет.</p>}

      {open && <ThemeSheet theme={open} themes={themes} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
}

function Example({ e }: { e: DonorExhibit }) {
  return (
    <span className={s.donorEx}>
      {e.url ? <a href={e.url} target="_blank" rel="noreferrer">{e.hook || '(без текста)'}</a> : e.hook}
      <span className={s.muted}> @{e.author}, {SOURCE_LABEL[e.source] ?? e.source} {xLabel(e.x)}</span>
    </span>
  );
}

function ThemeSheet({ theme, themes, onClose, onChanged }: { theme: ThemeView; themes: ThemeView[]; onClose: () => void; onChanged: () => Promise<void> }) {
  const [full, setFull] = useState<ThemeView | null>(null);
  const [mode, setMode] = useState<'' | 'take' | 'hide' | 'rename' | 'merge'>('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/studio?part=donory-tema&id=${encodeURIComponent(theme.id)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`ошибка ${r.status}`))))
      .then(setFull).catch((e) => setError(e instanceof Error ? e.message : 'ошибка'));
  }, [theme.id]);

  async function act(op: string, payload: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      await post(op, { id: theme.id, ...payload });
      setMode('');
      setA('');
      setB('');
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ошибка');
    } finally {
      setBusy(false);
    }
  }
  const start = (m: typeof mode, first = '') => { setMode(m); setA(first); setB(''); setError(''); };
  const items = full?.examples ?? theme.examples;

  return (
    <Sheet label={theme.name} onClose={onClose}>
      <h3 className={s.guideTitle}>{theme.name}</h3>
      {theme.originalName && <p className={s.muted}>в банке: {theme.originalName}</p>}
      <p className={s.muted}>
        вес {theme.ves} · авторов {theme.authors} · {Object.entries(theme.platforms).map(([k, n]) => `${SOURCE_LABEL[k] ?? k} ${n}`).join(', ')} · у нас {theme.ours}
      </p>
      {theme.taken.length > 0 && (
        <ul className={s.donorLog}>
          {theme.taken.map((t, i) => <li key={i}><b>{who(t.actor)}</b> {t.date}: «{t.zahod}» → {t.karusel}</li>)}
        </ul>
      )}

      <div className={s.cgActions}>
        <button className={s.btnPrimary} onClick={() => start('take')} disabled={busy}>Беру в карусель</button>
        <button className={s.btnGhost} onClick={() => (theme.hidden ? act('donor-hide', { hidden: false }) : start('hide'))} disabled={busy}>
          {theme.hidden ? 'Вернуть' : 'Мимо'}
        </button>
        <button className={s.btnGhost} onClick={() => start('rename', theme.name)} disabled={busy}>Переименовать</button>
        <button className={s.btnGhost} onClick={() => start('merge')} disabled={busy}>Склеить с…</button>
      </div>

      {mode === 'take' && (
        <div className={s.cgEditor}>
          <label className={s.field}>Заход (обложка)<input className={s.input} value={a} onChange={(e) => setA(e.target.value)} /></label>
          <label className={s.field}>Карусель (коротко латиницей)<input className={s.input} value={b} onChange={(e) => setB(e.target.value)} placeholder="nedelya-2026-12-06-pokazyvat" /></label>
          <button className={s.btnPrimary} disabled={busy || !a.trim() || !b.trim()} onClick={() => act('donor-take', { zahod: a, karusel: b })}>Записать</button>
        </div>
      )}
      {mode === 'hide' && (
        <div className={s.cgEditor}>
          <label className={s.field}>Почему мимо<input className={s.input} value={a} onChange={(e) => setA(e.target.value)} /></label>
          <button className={s.btnPrimary} disabled={busy || !a.trim()} onClick={() => act('donor-hide', { hidden: true, reason: a })}>Убрать</button>
        </div>
      )}
      {mode === 'rename' && (
        <div className={s.cgEditor}>
          <label className={s.field}>Название (пусто = как в банке)<input className={s.input} value={a} onChange={(e) => setA(e.target.value)} /></label>
          <label className={s.field}>Зачем (по желанию)<input className={s.input} value={b} onChange={(e) => setB(e.target.value)} /></label>
          <button className={s.btnPrimary} disabled={busy} onClick={() => act('donor-rename', { name: a, note: b })}>Сохранить</button>
        </div>
      )}
      {mode === 'merge' && (
        <div className={s.cgEditor}>
          <label className={s.field}>В какую тему
            <select className={s.input} value={a} onChange={(e) => setA(e.target.value)}>
              <option value="">выбери тему</option>
              {themes.filter((t) => t.id !== theme.id && !t.hidden).map((t) => <option key={t.id} value={t.id}>{t.name} (вес {t.ves})</option>)}
            </select>
          </label>
          <label className={s.field}>Почему это одна тема (по желанию)<input className={s.input} value={b} onChange={(e) => setB(e.target.value)} /></label>
          <button className={s.btnPrimary} disabled={busy || !a} onClick={() => act('donor-merge', { into: a, note: b })}>Склеить</button>
        </div>
      )}
      {theme.mergedFrom.length > 0 && <p className={s.muted}>сюда склеены: {theme.mergedFrom.join(', ')}</p>}
      {error && <p className={s.error} role="alert">{error}</p>}

      <h4 className={s.sectionHead}>Примеры ({items.length})</h4>
      <ul className={s.donorExamples}>
        {items.map((e) => (
          <li key={e.id}>
            <Example e={e} />
            {e.his && <div className={s.muted}>у Саши: {e.his}</div>}
            {e.ourCode && <div className={s.muted}>наша: instagram.com/p/{e.ourCode} {xLabel(e.ourX)}</div>}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
