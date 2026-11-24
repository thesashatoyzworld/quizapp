'use client';

import { useCallback, useEffect, useState } from 'react';

// «Instagram» block of the optimizator (tariffs 2 and 3): connect the account via
// Meta once, then the server reads the student's own reels stats.

type Media = {
  id: string; caption: string; permalink: string | null; timestamp: string; productType: string | null;
  insights: { views?: number; reach?: number; saved?: number; shares?: number };
};
type Data = { allowed?: boolean; connected?: boolean; expired?: boolean; username?: string | null; media?: Media[]; error?: string };
type TgLink = { Telegram?: { WebApp?: { initData?: string; openLink?: (url: string) => void } } };

const REASON: Record<string, string> = {
  denied: 'Вход в Instagram отменён.',
  no_account: 'Не нашёл профессиональный аккаунт Instagram. Переключи аккаунт на «Автор» или «Бизнес» и выбери его при входе.',
  tier: 'Подключение открыто на тарифах 2 и 3.',
  login: 'Сначала войди в кабинет через Telegram.',
};

const num = (v?: number) => (typeof v === 'number' ? v.toLocaleString('ru-RU') : '·');
const day = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
const title = (m: Media) => (m.caption.split('\n').map((l) => l.trim()).find(Boolean) || 'Без подписи').slice(0, 60);

export default function InstagramBlock({ initData }: { initData: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const headers = useCallback((): Record<string, string> => (initData ? { 'x-tg-init-data': initData } : {}), [initData]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/cabinet/instagram', { headers: headers(), credentials: 'same-origin', cache: 'no-store' });
      setData(await res.json());
    } catch { setData({ allowed: true, connected: false, error: 'Не получилось загрузить Instagram.' }); }
  }, [headers]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ig = q.get('ig');
    if (ig) {
      setNote(ig === 'connected' ? 'Instagram подключён.' : REASON[q.get('reason') || ''] || 'Не получилось подключить Instagram. Попробуй ещё раз.');
      q.delete('ig'); q.delete('reason');
      window.history.replaceState(null, '', `/optimizator${q.toString() ? `?${q}` : ''}`);
    }
    load();
    // In Telegram the Meta login opens in the outside browser: refresh on return.
    const onFocus = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [load]);

  async function connect() {
    setBusy(true);
    try {
      const res = await fetch('/api/cabinet/instagram/connect?json=1', { headers: headers(), credentials: 'same-origin' });
      const r = await res.json();
      if (!r.url) { setNote(REASON[r.error] || 'Не получилось начать подключение.'); return; }
      const tg = (window as unknown as TgLink).Telegram?.WebApp;
      if (tg?.initData && tg.openLink) tg.openLink(r.url);
      else window.location.href = r.url;
    } catch { setNote('Связь оборвалась. Попробуй ещё раз.'); } finally { setBusy(false); }
  }

  async function disconnect() {
    if (!window.confirm('Отключить Instagram? Доступ и сохранённые данные удалятся.')) return;
    setBusy(true);
    try {
      await fetch('/api/cabinet/instagram', { method: 'DELETE', headers: headers(), credentials: 'same-origin' });
      setNote('Instagram отключён. Чтобы убрать доступ совсем, удали приложение SASHA TOYZ Stats в настройках Instagram или Facebook.');
      await load();
    } finally { setBusy(false); }
  }

  if (!data?.allowed) return null;
  const reels = (data.media || []).filter((m) => m.productType === 'REELS');

  return (
    <section className="op-card ig-card">
      <div className="ig-head">
        <h2 className="op-h2">Instagram</h2>
        {data.connected && <span className="ig-user">@{data.username || 'аккаунт'}</span>}
      </div>
      {note && <p className="op-p ig-note">{note}</p>}

      {!data.connected && (
        <>
          <p className="op-p">
            {data.expired ? 'Доступ к Instagram закончился. Подключи заново, чтобы снова видеть цифры.' :
              'Подключи свой Instagram, и здесь появятся просмотры, охват, сохранения и репосты твоих рилсов. Только чтение, публиковать ничего не будем.'}
          </p>
          <div className="op-row">
            <button type="button" className="op-copy op-copy-primary" onClick={connect} disabled={busy}>
              {busy ? 'Открываю…' : 'Подключить Instagram'}
            </button>
          </div>
        </>
      )}

      {data.connected && (
        <>
          {data.error && <div className="op-error">{data.error}</div>}
          {reels.length > 0 ? (
            <div className="ig-scroll">
              <table className="ig-table">
                <thead>
                  <tr><th>Рилс</th><th>Просм.</th><th>Охват</th><th>Сохр.</th><th>Репосты</th></tr>
                </thead>
                <tbody>
                  {reels.map((m) => (
                    <tr key={m.id}>
                      <td className="ig-reel">
                        <span className="ig-date">{day(m.timestamp)}</span>
                        {m.permalink ? <a href={m.permalink} target="_blank" rel="noopener noreferrer">{title(m)}</a> : title(m)}
                      </td>
                      <td>{num(m.insights.views)}</td>
                      <td>{num(m.insights.reach)}</td>
                      <td>{num(m.insights.saved)}</td>
                      <td>{num(m.insights.shares)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !data.error && <p className="op-p op-muted">Рилсов среди последних публикаций пока нет.</p>}
          <div className="op-row">
            <button type="button" className="op-copy" onClick={disconnect} disabled={busy}>Отключить</button>
          </div>
        </>
      )}

      <style>{`
        .ig-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
        .ig-head .op-h2 { margin: 0; }
        .ig-user { font-size: 13px; font-weight: 700; color: var(--op-accent); }
        .ig-note { color: var(--op-muted); }
        .ig-scroll { overflow-x: auto; margin-top: 12px; }
        .ig-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ig-table th { text-align: right; font-size: 11.5px; font-weight: 700; color: var(--op-muted); padding: 0 0 6px 8px; white-space: nowrap; }
        .ig-table th:first-child { text-align: left; padding-left: 0; }
        .ig-table td { text-align: right; padding: 8px 0 8px 8px; border-top: 1px solid var(--op-line); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .ig-table td.ig-reel { text-align: left; padding-left: 0; white-space: normal; min-width: 140px; line-height: 1.35; }
        .ig-reel a { color: var(--op-text); text-decoration: none; }
        .ig-reel a:hover { color: var(--op-accent); }
        .ig-date { display: block; font-size: 11.5px; color: var(--op-muted); }
      `}</style>
    </section>
  );
}
