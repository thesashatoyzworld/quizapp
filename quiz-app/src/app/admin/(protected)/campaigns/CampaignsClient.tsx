'use client';

import { useState } from 'react';

export interface Campaign {
  pageId: string;
  name: string;
  platform: string;
  comments: number;
  keywords: number;
  date: string;
}

export interface FunnelTotals {
  reels: number;
  comments: number;
  keywords: number;
  botStart?: number;
  quizCompleted: number;
  sales: number;
}

interface Props {
  oldFunnel: FunnelTotals;
  newFunnel: FunnelTotals;
  campaigns: Campaign[];
}

function pct(num: number, den: number) {
  if (!den) return '—';
  return (num / den * 100).toFixed(1) + '%';
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  telegram: 'Telegram',
  other: 'Другое',
};

export default function CampaignsClient({ oldFunnel, newFunnel, campaigns: initial }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    platform: 'instagram',
    date: new Date().toISOString().slice(0, 10),
    comments: '',
    keywords: '',
  });

  const totals = {
    reels: campaigns.length,
    comments: campaigns.reduce((s, c) => s + c.comments, 0),
    keywords: campaigns.reduce((s, c) => s + c.keywords, 0),
  };

  const handleAdd = async () => {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    const res = await fetch('/api/admin/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) {
      const newC: Campaign = {
        pageId: data.pageId,
        name: form.name.trim(),
        platform: form.platform,
        date: form.date,
        comments: Number(form.comments) || 0,
        keywords: Number(form.keywords) || 0,
      };
      setCampaigns(prev => [newC, ...prev]);
      setForm({ name: '', platform: 'instagram', date: new Date().toISOString().slice(0, 10), comments: '', keywords: '' });
      setShowForm(false);
    }
    setSaving(false);
  };

  const handleDelete = async (pageId: string) => {
    await fetch('/api/admin/campaign', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    });
    setCampaigns(prev => prev.filter(c => c.pageId !== pageId));
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '6px',
    padding: '8px 10px',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    width: '100%',
  };

  const labelStyle = {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginBottom: '4px',
    display: 'block' as const,
  };

  // Comparison rows
  const rows: { label: string; old: string; new_: string; highlight?: boolean }[] = [
    { label: 'Рилсов', old: String(oldFunnel.reels), new_: String(newFunnel.reels) },
    { label: 'Комментариев', old: String(oldFunnel.comments), new_: String(totals.comments) },
    { label: 'Ключевых слов / DM', old: String(oldFunnel.keywords), new_: String(totals.keywords) },
    ...(newFunnel.botStart !== undefined ? [{ label: 'Открыли бота', old: '—', new_: String(newFunnel.botStart) }] : []),
    { label: 'Квиз завершили', old: String(oldFunnel.quizCompleted), new_: String(newFunnel.quizCompleted) },
    { label: 'Продаж', old: String(oldFunnel.sales), new_: String(newFunnel.sales), highlight: true },
    { label: 'Квиз → Продажа', old: pct(oldFunnel.sales, oldFunnel.quizCompleted), new_: pct(newFunnel.sales, newFunnel.quizCompleted), highlight: true },
    { label: 'Коммент → Продажа', old: pct(oldFunnel.sales, oldFunnel.comments), new_: pct(newFunnel.sales, totals.comments) },
  ];

  return (
    <div>
      {/* Comparison table */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '10px', overflow: 'hidden', marginBottom: '28px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Метрика</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Старая воронка</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--neon-cyan)', fontWeight: 500 }}>Новая воронка</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.label}</td>
                <td style={{
                  padding: '10px 16px', textAlign: 'center',
                  color: r.highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                  fontWeight: r.highlight ? 600 : 400,
                }}>
                  {r.old}
                </td>
                <td style={{
                  padding: '10px 16px', textAlign: 'center',
                  color: r.highlight ? 'var(--neon-cyan)' : 'var(--text-primary)',
                  fontWeight: r.highlight ? 700 : 400,
                }}>
                  {r.new_}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Campaign list header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Рилсы новой воронки
          <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            {campaigns.length} шт
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            border: '1px solid rgba(0,240,255,0.3)',
            background: showForm ? 'rgba(0,240,255,0.15)' : 'rgba(0,240,255,0.08)',
            color: 'var(--neon-cyan)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-body)',
          }}
        >
          {showForm ? 'Отмена' : '+ Добавить рилс'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(0,240,255,0.2)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Название / тема</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Рилс про контент-план"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Площадка</label>
              <select
                value={form.platform}
                onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="telegram">Telegram</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Дата публикации</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={labelStyle}>Комментов</label>
                <input
                  type="number"
                  value={form.comments}
                  onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Ключевых слов</label>
                <input
                  type="number"
                  value={form.keywords}
                  onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.name.trim() || saving}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid rgba(0,240,255,0.4)',
              background: 'rgba(0,240,255,0.12)',
              color: 'var(--neon-cyan)',
              cursor: !form.name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-body)',
              opacity: !form.name.trim() ? 0.5 : 1,
            }}
          >
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      )}

      {/* Campaign table */}
      {campaigns.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                  {['Дата', 'Рилс', 'Площадка', 'Комментов', 'Ключевых', 'CR ком→кл', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.pageId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(c.date)}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-primary)', maxWidth: '200px' }}>{c.name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{PLATFORM_LABEL[c.platform] || c.platform}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', textAlign: 'right' }}>{c.comments}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', textAlign: 'right' }}>{c.keywords}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', textAlign: 'right' }}>{pct(c.keywords, c.comments)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <button
                        onClick={() => handleDelete(c.pageId)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.85rem', padding: '2px 4px' }}
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.15)' }}>
                  <td colSpan={3} style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Итого</td>
                  <td style={{ padding: '10px 14px', color: 'var(--neon-cyan)', fontWeight: 600, textAlign: 'right' }}>{totals.comments}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--neon-cyan)', fontWeight: 600, textAlign: 'right' }}>{totals.keywords}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', textAlign: 'right' }}>{pct(totals.keywords, totals.comments)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {campaigns.length === 0 && !showForm && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Нет рилсов. Нажми «+ Добавить рилс» чтобы начать.
        </div>
      )}
    </div>
  );
}
