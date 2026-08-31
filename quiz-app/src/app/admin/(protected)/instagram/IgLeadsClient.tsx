'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IgLead, IgAutomationOption, IgMessage, IgStatusValue } from '@/lib/ig-leads';

const STATUS: { value: IgStatusValue; label: string; color: string }[] = [
  { value: 'new', label: 'новый', color: '#8a94a6' },
  { value: 'filled', label: 'анкета, не писать', color: '#b085f5' },
  { value: 'written', label: 'написали', color: '#00f0ff' },
  { value: 'replied', label: 'ответил', color: '#ffd166' },
  { value: 'bought', label: 'купил', color: '#06d6a0' },
  { value: 'rejected', label: 'слился', color: '#ef476f' },
];
const LABEL = Object.fromEntries(STATUS.map((s) => [s.value, s])) as Record<IgStatusValue, (typeof STATUS)[number]>;

// Как называется поток, из которого пришла анкета.
const FORM_KIND: Record<string, string> = {
  mentor: 'менторство',
  t2: 'лист ожидания, тариф 2',
  t3: 'лист ожидания, тариф 3',
};

const CHAT_STATE: Record<string, { label: string; color: string }> = {
  active: { label: 'диалог живой', color: '#06d6a0' },
  stopped: { label: 'молчит', color: '#8a94a6' },
  unsubscribe: { label: 'отписался', color: '#ef476f' },
};

// Свежее этого возраста данные не перетягиваем — иначе каждый заход в раздел
// дёргает ChatPlace по всем воронкам.
const STALE_MS = 10 * 60 * 1000;

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function IgLeadsClient({
  leads: initial,
  automations,
  lastSyncAt,
  funnel,
  query,
}: {
  leads: IgLead[];
  automations: IgAutomationOption[];
  lastSyncAt: string | null;
  funnel: string;
  query: string;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [filter, setFilter] = useState<IgStatusValue | 'all'>('all');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [threads, setThreads] = useState<Record<string, IgMessage[] | 'loading' | 'error'>>({});
  const [q, setQ] = useState(query);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const autoSynced = useRef(false);

  useEffect(() => setLeads(initial), [initial]);

  // Данные устарели (или их нет вовсе) — подтягиваем сами, один раз за визит.
  useEffect(() => {
    if (autoSynced.current) return;
    const stale = !lastSyncAt || Date.now() - new Date(lastSyncAt).getTime() > STALE_MS;
    if (!stale) return;
    autoSynced.current = true;
    void sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSyncAt]);

  // Воронку фильтрует сервер (людей тысячи), статус — уже здесь.
  const shown = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of STATUS) c[s.value] = leads.filter((l) => l.status === s.value).length;
    return c;
  }, [leads]);

  const total = useMemo(
    () => (funnel === 'all' ? automations.reduce((n, a) => n + a.count, 0) : automations.find((a) => a.id === funnel)?.count ?? leads.length),
    [automations, funnel, leads.length]
  );

  async function sync(full = false) {
    setSyncing(true);
    setSyncNote(null);
    try {
      const res = await fetch(`/api/admin/ig-sync${full ? '?full=1' : ''}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setSyncNote(`Не получилось: ${data.error || res.status}`);
        return;
      }
      const failed: string[] = data.failed || [];
      setSyncNote(
        `Новых ${data.created}, обновлено ${data.updated}, воронок ${data.automations}` +
          (failed.length ? ` · не отдались: ${failed.join(', ')}` : '')
      );
      router.refresh();
    } catch (e) {
      setSyncNote(`Не получилось: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSyncing(false);
    }
  }

  async function save(l: IgLead, patch: { status?: IgStatusValue; note?: string }) {
    setSaving((s) => ({ ...s, [l.id]: true }));
    setLeads((ls) => ls.map((x) => (x.id === l.id ? { ...x, ...patch } : x)));
    try {
      await fetch('/api/admin/ig-lead-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: l.clientId, automationId: l.automationId, ...patch }),
      });
    } finally {
      setSaving((s) => ({ ...s, [l.id]: false }));
    }
  }

  async function toggle(l: IgLead) {
    const isOpen = !open[l.id];
    setOpen((o) => ({ ...o, [l.id]: isOpen }));
    if (!isOpen || !l.chatId || threads[l.id]) return;
    setThreads((t) => ({ ...t, [l.id]: 'loading' }));
    try {
      const res = await fetch(`/api/admin/ig-thread?chatId=${encodeURIComponent(l.chatId)}`);
      const data = await res.json();
      setThreads((t) => ({ ...t, [l.id]: res.ok ? data.messages : 'error' }));
    } catch {
      setThreads((t) => ({ ...t, [l.id]: 'error' }));
    }
  }

  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,240,255,0.15)',
    position: 'sticky', top: 0, background: 'var(--bg-secondary)', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = { padding: '9px 12px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: 4 }}>
        ЛЮДИ ИЗ ИНСТАГРАМА
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>
        Кто написал кодовое слово в директ или комментарий и попал в воронку @thesashatoyz. Жми на строку — раскроется переписка. Ставь статус: Саша и ассистент видят одно и то же. Кто уже оставил анкету на менторство или встал в лист ожидания, помечается сам — таким писать не надо.
      </p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <select
          value={funnel}
          onChange={(e) => {
            // Фильтр статуса не переносим на другую воронку: иначе выбираешь
            // воронку на сорок человек, а видишь двоих — тех, кто попал под
            // прошлый фильтр.
            setFilter('all');
            const params = new URLSearchParams();
            if (e.target.value !== 'all') params.set('funnel', e.target.value);
            if (query) params.set('q', query);
            const qs = params.toString();
            router.push(qs ? `/admin/instagram?${qs}` : '/admin/instagram');
          }}
          style={{
          background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6, padding: '6px 10px', fontSize: '0.82rem', maxWidth: 340,
        }}>
          <option value="all">все воронки</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.keyword ? `«${a.keyword}»` : a.name} ({a.count})
            </option>
          ))}
        </select>

        {/* Ищем в базе, а не в отданной пятисотке: человек, писавший весной,
            в свежую страницу не попадает. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams();
            if (funnel && funnel !== 'all') params.set('funnel', funnel);
            if (q.trim()) params.set('q', q.trim());
            const qs = params.toString();
            router.push(qs ? `/admin/instagram?${qs}` : '/admin/instagram');
          }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ник или имя"
            style={{
              background: 'var(--bg-primary)', color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
              padding: '6px 10px', fontSize: '0.82rem', width: 200,
            }}
          />
          <button type="submit" style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(0,240,255,0.4)',
            background: 'rgba(0,240,255,0.08)', color: 'var(--neon-cyan)', fontSize: '0.82rem', cursor: 'pointer',
          }}>
            искать
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                router.push(funnel && funnel !== 'all' ? `/admin/instagram?funnel=${funnel}` : '/admin/instagram');
              }}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              сбросить
            </button>
          )}
        </form>

        <button onClick={() => sync()} disabled={syncing} style={{
          padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(0,240,255,0.4)',
          background: 'rgba(0,240,255,0.08)', color: 'var(--neon-cyan)', fontSize: '0.82rem',
          cursor: syncing ? 'default' : 'pointer', opacity: syncing ? 0.5 : 1,
        }}>
          {syncing ? 'тяну…' : 'обновить'}
        </button>

        <button
          onClick={() => { if (confirm('Выкачать всех за всё время? Это несколько тысяч человек и минута-две ожидания.')) void sync(true); }}
          disabled={syncing}
          style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.82rem',
            cursor: syncing ? 'default' : 'pointer', opacity: syncing ? 0.5 : 1,
          }}
        >
          за всё время
        </button>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
          {syncNote || (lastSyncAt ? `последняя сверка ${fmt(lastSyncAt)}` : 'ещё ни разу не тянули')}
          {query
            ? ` · нашли ${leads.length} ${plural(leads.length, 'человека', 'человек', 'человек')} по «${query}»`
            : total > leads.length
              ? ` · показаны свежие ${leads.length} из ${total}`
              : ` · в этой выборке ${total} ${plural(total, 'человек', 'человека', 'человек')}`}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['all', ...STATUS.map((s) => s.value)] as const).map((v) => {
          const active = filter === v;
          const label = v === 'all' ? 'все' : LABEL[v].label;
          const color = v === 'all' ? 'var(--neon-cyan)' : LABEL[v].color;
          return (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding: '5px 12px', borderRadius: 6,
              border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
              background: active ? `${color}22` : 'transparent',
              color: active ? color : 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
            }}>
              {label} <span style={{ opacity: 0.6 }}>{counts[v] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid rgba(0,240,255,0.12)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 940 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 26 }}></th>
              <th style={th}>Аккаунт</th>
              <th style={th}>Имя</th>
              <th style={th}>Слово</th>
              <th style={th}>Диалог</th>
              <th style={th}>Активность</th>
              <th style={th}>Статус</th>
              <th style={th}>Заметка</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((l) => {
              const isOpen = !!open[l.id];
              const chat = l.chatStatus ? CHAT_STATE[l.chatStatus] : null;
              const thread = threads[l.id];
              return (
                <Fragment key={l.id}>
                  <tr style={{ background: saving[l.id] ? 'rgba(0,240,255,0.04)' : undefined }}>
                    <td style={{ ...td, cursor: 'pointer', color: 'var(--text-muted)', userSelect: 'none' }} onClick={() => toggle(l)}>
                      {isOpen ? '▾' : '▸'}
                    </td>
                    <td style={td}>
                      {l.username ? (
                        <a href={`https://instagram.com/${l.username}`} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--neon-cyan)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                          @{l.username}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>без юзернейма</span>
                      )}
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', maxWidth: 220 }}>
                      {l.name || '—'}
                      {l.formKind && (
                        <div
                          title={`${FORM_KIND[l.formKind] || l.formKind}${l.formName ? `, ${l.formName}` : ''}${
                            l.formFilledAt ? ` · ${fmt(l.formFilledAt)}` : ''
                          } · нашли по ${l.formMatchedBy === 'telegram' ? 'телеграму' : 'инстаграму'}`}
                          style={{ color: '#b085f5', fontSize: '0.72rem', marginTop: 2 }}
                        >
                          анкета: {FORM_KIND[l.formKind] || l.formKind}
                          {l.formFilledAt ? ` · ${fmt(l.formFilledAt)}` : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {l.keyword ? `«${l.keyword}»` : l.automationName || '—'}
                    </td>
                    <td style={{ ...td, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {chat ? <span style={{ color: chat.color }}>{chat.label}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      {l.chatHandler === 'open' && <span style={{ color: 'var(--text-muted)' }}> · у оператора</span>}
                    </td>
                    <td style={{ ...td, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{fmt(l.lastEventAt)}</td>
                    <td style={td}>
                      <select value={l.status} onChange={(e) => save(l, { status: e.target.value as IgStatusValue })} style={{
                        background: 'var(--bg-primary)', color: LABEL[l.status].color,
                        border: `1px solid ${LABEL[l.status].color}55`, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer',
                      }}>
                        {STATUS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                      </select>
                    </td>
                    <td style={td}>
                      <input defaultValue={l.note || ''} placeholder="…"
                        onBlur={(e) => { if (e.target.value !== (l.note || '')) save(l, { note: e.target.value }); }}
                        style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', width: 150 }} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td />
                      <td colSpan={7} style={{ padding: '4px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '6px 0 8px' }}>
                          Переписка
                        </div>
                        {!l.chatId && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Диалог не найден</div>}
                        {thread === 'loading' && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Гружу…</div>}
                        {thread === 'error' && <div style={{ color: '#ef476f', fontSize: '0.82rem' }}>Не удалось загрузить переписку</div>}
                        {Array.isArray(thread) && thread.length === 0 && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Сообщений нет</div>
                        )}
                        {Array.isArray(thread) && thread.map((m, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, padding: '3px 0', fontSize: '0.82rem', alignItems: 'baseline' }}>
                            <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>{fmt(m.at)}</span>
                            <span style={{ color: m.side === 'client' ? 'var(--neon-cyan)' : 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.76rem' }}>
                              {m.side === 'client' ? 'человек' : 'бот'}
                            </span>
                            <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{m.text}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {shown.length === 0 && (
              <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                {query && leads.length === 0
                  ? `По «${query}» никого. Возможно, человек ещё не выкачан — нажми «за всё время»`
                  : leads.length === 0 ? 'Пока пусто — нажми «обновить»' : 'Пусто в этом фильтре'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
