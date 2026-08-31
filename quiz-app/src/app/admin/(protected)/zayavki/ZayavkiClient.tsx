'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LEAD_STATUSES, STATUS_LABEL, STATUS_COLOR, type LeadStatus,
} from '@/content/lead-status';

export type LeadRowDto = {
  id: number;
  name: string;
  username: string | null;
  contact: string | null;
  instagram: string | null;
  phone: string | null;
  kindLabel: string;
  kind: string | null;
  source: string | null;
  status: LeadStatus;
  note: string | null;
  createdAt: string;
  formsCount: number;
  inBot: boolean;
  paid: boolean;
};

export type Facets = {
  kinds: { value: string; count: number; label: string }[];
  sources: { value: string; count: number }[];
};

const th: React.CSSProperties = {
  textAlign: 'left', padding: '10px 12px', fontSize: '0.72rem', letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top',
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export default function ZayavkiClient({
  leads: initial,
  facets,
  filters,
}: {
  leads: LeadRowDto[];
  facets: Facets;
  filters: { kind: string; source: string; status: string; q: string };
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initial);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [q, setQ] = useState(filters.q);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of LEAD_STATUSES) c[s] = leads.filter((l) => l.status === s).length;
    return c;
  }, [leads]);

  /** Фильтры живут в адресе: ссылку на «менторство, новые» можно кинуть ассистенту. */
  function go(patch: Partial<typeof filters>) {
    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
    const qs = params.toString();
    router.push(qs ? `/admin/zayavki?${qs}` : '/admin/zayavki');
  }

  async function save(lead: LeadRowDto, patch: { status?: LeadStatus; note?: string }) {
    setSaving((s) => ({ ...s, [lead.id]: true }));
    setLeads((ls) => ls.map((x) => (x.id === lead.id ? { ...x, ...patch } : x)));
    try {
      await fetch('/api/admin/dwy-lead-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, ...patch }),
      });
    } finally {
      setSaving((s) => ({ ...s, [lead.id]: false }));
    }
  }

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-primary)', color: 'var(--text-secondary)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
    padding: '6px 10px', fontSize: '0.82rem', maxWidth: 260,
  };

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)',
        fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: 4,
      }}>
        ЗАЯВКИ С САЙТА
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>
        Кто заполнил анкету на менторство или встал в лист ожидания. Жми на имя — откроется всё,
        что о человеке известно: ответы, воронка, бот, покупки. Статус видят и Саша, и ассистент.
      </p>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <select value={filters.kind} onChange={(e) => go({ kind: e.target.value })} style={selectStyle}>
          <option value="">все потоки</option>
          {facets.kinds.map((k) => (
            <option key={k.value} value={k.value}>{k.label} ({k.count})</option>
          ))}
        </select>

        <select value={filters.source} onChange={(e) => go({ source: e.target.value })} style={selectStyle}>
          <option value="">все источники</option>
          {facets.sources.map((s) => (
            <option key={s.value} value={s.value}>{s.value} ({s.count})</option>
          ))}
        </select>

        <form
          onSubmit={(e) => { e.preventDefault(); go({ q }); }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="имя, ник, телефон, заметка"
            style={{ ...selectStyle, width: 240, maxWidth: 240 }}
          />
          <button type="submit" style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(0,240,255,0.4)',
            background: 'rgba(0,240,255,0.08)', color: 'var(--neon-cyan)', fontSize: '0.82rem', cursor: 'pointer',
          }}>
            искать
          </button>
          {(filters.q || filters.kind || filters.source || filters.status) && (
            <button
              type="button"
              onClick={() => { setQ(''); router.push('/admin/zayavki'); }}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              сбросить
            </button>
          )}
        </form>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
          в выборке {leads.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['', ...LEAD_STATUSES] as const).map((v) => {
          const active = filters.status === v;
          const label = v === '' ? 'все' : STATUS_LABEL[v];
          const color = v === '' ? 'var(--neon-cyan)' : STATUS_COLOR[v];
          return (
            <button key={v || 'all'} onClick={() => go({ status: v })} style={{
              padding: '5px 12px', borderRadius: 6,
              border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
              background: active ? `${color}22` : 'transparent',
              color: active ? color : 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
            }}>
              {label}{v === '' && <span style={{ opacity: 0.6 }}> {counts.all}</span>}
              {v !== '' && <span style={{ opacity: 0.6 }}> {counts[v] ?? 0}</span>}
            </button>
          );
        })}
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid rgba(0,240,255,0.12)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <th style={th}>Кто</th>
              <th style={th}>Контакт</th>
              <th style={th}>Поток</th>
              <th style={th}>Источник</th>
              <th style={th}>Пришла</th>
              <th style={th}>Статус</th>
              <th style={th}>Заметка</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} style={{ background: saving[l.id] ? 'rgba(0,240,255,0.04)' : undefined }}>
                <td style={{ ...td, maxWidth: 240 }}>
                  <Link href={`/admin/zayavki/${l.id}`} style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontWeight: 600 }}>
                    {l.name}
                  </Link>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                    {l.formsCount > 1 && (
                      <span style={{ color: '#b085f5', fontSize: '0.72rem' }}>приходил {l.formsCount} раза</span>
                    )}
                    {l.paid && <span style={{ color: '#06d6a0', fontSize: '0.72rem' }}>покупал</span>}
                    {!l.paid && l.inBot && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>в боте</span>}
                  </div>
                </td>
                <td style={{ ...td, fontSize: '0.82rem' }}>
                  {l.username ? (
                    <a href={`https://t.me/${l.username}`} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--neon-cyan)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      @{l.username}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>{l.contact || '—'}</span>
                  )}
                  {l.phone && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{l.phone}</div>
                  )}
                </td>
                <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{l.kindLabel}</td>
                <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{l.source || '—'}</td>
                <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(l.createdAt)}
                </td>
                <td style={td}>
                  <select
                    value={l.status}
                    onChange={(e) => save(l, { status: e.target.value as LeadStatus })}
                    style={{
                      background: 'var(--bg-primary)', color: STATUS_COLOR[l.status],
                      border: `1px solid ${STATUS_COLOR[l.status]}55`, borderRadius: 6,
                      padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer',
                    }}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </td>
                <td style={td}>
                  <input
                    defaultValue={l.note || ''}
                    placeholder="…"
                    onBlur={(e) => { if (e.target.value !== (l.note || '')) save(l, { note: e.target.value }); }}
                    style={{
                      background: 'var(--bg-primary)', color: 'var(--text-secondary)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                      padding: '5px 8px', fontSize: '0.8rem', width: 160,
                    }}
                  />
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                  Пусто в этом фильтре
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
