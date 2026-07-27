'use client';

import { Fragment, useMemo, useState } from 'react';
import type { UrovenLead, LeadStatusValue } from '@/lib/leads';

const STATUS: { value: LeadStatusValue; label: string; color: string }[] = [
  { value: 'new', label: 'новый', color: '#8a94a6' },
  { value: 'written', label: 'написали', color: '#00f0ff' },
  { value: 'replied', label: 'ответил', color: '#ffd166' },
  { value: 'bought', label: 'купил', color: '#06d6a0' },
  { value: 'rejected', label: 'слился', color: '#ef476f' },
];
const LABEL = Object.fromEntries(STATUS.map((s) => [s.value, s])) as Record<LeadStatusValue, (typeof STATUS)[number]>;

const SOURCE: Record<string, string> = {
  'casino-block': 'блок-казино',
  popup: 'попап',
  final: 'финал статьи',
  inline: 'по тексту',
  floatcta: 'плавающая кнопка',
  'urovni-article': 'статья 6 уровней',
  'chitkody-article': 'статья чит-коды',
  'article-bottom': 'низ статьи',
};

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function UrovenLeadsClient({ leads: initial }: { leads: UrovenLead[] }) {
  const [leads, setLeads] = useState(initial);
  const [filter, setFilter] = useState<LeadStatusValue | 'all'>('all');
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of STATUS) c[s.value] = leads.filter((l) => l.status === s.value).length;
    return c;
  }, [leads]);

  const shown = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  async function save(tg: string, patch: { status?: LeadStatusValue; note?: string }) {
    setSaving((s) => ({ ...s, [tg]: true }));
    setLeads((ls) => ls.map((l) => (l.tg === tg ? { ...l, ...patch } : l)));
    try {
      await fetch('/api/admin/lead-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: tg, ...patch }),
      });
    } finally {
      setSaving((s) => ({ ...s, [tg]: false }));
    }
  }

  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 12px', fontSize: '0.7rem', letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,240,255,0.15)',
    position: 'sticky', top: 0, background: 'var(--bg-secondary)', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = { padding: '9px 12px', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' };

  return (
    <div style={{ maxWidth: 1180 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.1rem', letterSpacing: '0.1em', marginBottom: 4 }}>
        ЛИДЫ · НОВЫЙ УРОВЕНЬ КОНТЕНТА
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 20 }}>
        Кто кликал «Забрать», заходил на страницу продукта или оплатил. Тянется живьём из воронки. Жми на строку — раскроется весь путь человека. Ставь статус — ассистент и ты видите одно и то же.
      </p>

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
              <th style={th}>Контакт</th>
              <th style={th}>Имя</th>
              <th style={th}>Контекст — что делал</th>
              <th style={th}>Источник</th>
              <th style={th}>Дата</th>
              <th style={th}>Статус</th>
              <th style={th}>Заметка</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((l) => {
              const contact = l.username ? `@${l.username}` : `id ${l.tg}`;
              const link = l.username ? `https://t.me/${l.username}` : `tg://user?id=${l.tg}`;
              const isOpen = !!open[l.tg];
              return (
                <Fragment key={l.tg}>
                  <tr style={{ background: saving[l.tg] ? 'rgba(0,240,255,0.04)' : undefined }}>
                    <td style={{ ...td, cursor: 'pointer', color: 'var(--text-muted)', userSelect: 'none' }} onClick={() => setOpen((o) => ({ ...o, [l.tg]: !o[l.tg] }))}>
                      {isOpen ? '▾' : '▸'}
                    </td>
                    <td style={td}>
                      <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-cyan)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        {contact}
                      </a>
                      {l.paid && (
                        <span
                          title={`оплата${l.paidAt ? ` ${fmt(l.paidAt)}` : ''}${l.paidTier ? ` · ${l.paidTier}` : ''}`}
                          style={{ marginLeft: 6, color: '#06d6a0', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                        >
                          💰 {l.paidAmount ? `${l.paidAmount.toLocaleString('ru-RU')} ₽` : ''}
                          {l.paidTier ? ` · ${l.paidTier.replace('тариф ', 'т')}` : ''}
                        </span>
                      )}
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{l.name || '—'}</td>
                    <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: 340, cursor: 'pointer', lineHeight: 1.4 }} onClick={() => setOpen((o) => ({ ...o, [l.tg]: !o[l.tg] }))}>
                      {l.context || '—'}
                    </td>
                    <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{l.source ? SOURCE[l.source] || l.source : '—'}</td>
                    <td style={{ ...td, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(l.lastAt)}</td>
                    <td style={td}>
                      <select value={l.status} onChange={(e) => save(l.tg, { status: e.target.value as LeadStatusValue })} style={{
                        background: 'var(--bg-primary)', color: LABEL[l.status].color,
                        border: `1px solid ${LABEL[l.status].color}55`, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', cursor: 'pointer',
                      }}>
                        {STATUS.map((s) => (<option key={s.value} value={s.value} style={{ color: '#111' }}>{s.label}</option>))}
                      </select>
                    </td>
                    <td style={td}>
                      <input defaultValue={l.note || ''} placeholder="…"
                        onBlur={(e) => { if (e.target.value !== (l.note || '')) save(l.tg, { note: e.target.value }); }}
                        style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', width: 150 }} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td />
                      <td colSpan={7} style={{ padding: '4px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '6px 0 8px' }}>
                          Путь по шагам
                        </div>
                        {l.timeline.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Нет детальных событий</div>}
                        <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', borderLeft: '2px solid rgba(0,240,255,0.25)' }}>
                          {l.timeline.map((s, i) => (
                            <li key={i} style={{ position: 'relative', padding: '3px 0 3px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <span style={{ position: 'absolute', left: -5, top: 9, width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-cyan)' }} />
                              <span style={{ color: 'var(--text-muted)', marginRight: 10, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(s.at)}</span>
                              {s.label}
                            </li>
                          ))}
                        </ol>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {shown.length === 0 && (
              <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>Пусто в этом фильтре</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
