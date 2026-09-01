'use client';

import { useState } from 'react';
import type { IgKeywordData, IgReplyData, IgLogData, IgStats } from './page';

interface ScanLog {
  type: 'info' | 'match' | 'success' | 'error';
  message: string;
  timestamp: string;
}

interface Props {
  initialKeywords: IgKeywordData[];
  initialReplies: IgReplyData[];
  initialLogs: IgLogData[];
  initialStats: IgStats;
}

const card: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(0, 240, 255, 0.1)',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const statBox: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: '16px',
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(0, 240, 255, 0.1)',
  borderRadius: '12px',
  flex: 1,
};

const btnPrimary: React.CSSProperties = {
  padding: '10px 20px',
  background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.875rem',
};

const btnSmall: React.CSSProperties = {
  padding: '4px 12px',
  background: 'rgba(0, 240, 255, 0.1)',
  color: 'var(--neon-cyan)',
  border: '1px solid rgba(0, 240, 255, 0.2)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.75rem',
};

const btnDanger: React.CSSProperties = {
  padding: '4px 12px',
  color: '#ff4444',
  border: '1px solid rgba(255, 68, 68, 0.3)',
  background: 'rgba(255, 68, 68, 0.1)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.75rem',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg-primary)',
  border: '1px solid rgba(0, 240, 255, 0.2)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  width: '100%',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left' as const,
  padding: '8px 12px',
  color: 'var(--text-muted)',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
}

export default function InstagramClient({ initialKeywords, initialReplies, initialLogs, initialStats }: Props) {
  const [keywords, setKeywords] = useState<IgKeywordData[]>(initialKeywords);
  const [replies, setReplies] = useState<IgReplyData[]>(initialReplies);
  const [logs] = useState<IgLogData[]>(initialLogs);
  const [stats, setStats] = useState<IgStats>(initialStats);

  const [scanning, setScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newReplyText, setNewReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'activity' | 'webhooks'>('activity');

  // ── Scan Now ──
  const handleScan = async () => {
    setScanning(true);
    setScanLogs([]);
    try {
      const res = await fetch('/api/admin/instagram-scan', { method: 'POST' });
      const data = await res.json();
      setScanLogs(data.logs || []);

      const [repliesRes, statsRes] = await Promise.all([
        fetch('/api/admin/instagram?tab=replies'),
        fetch('/api/admin/instagram?tab=stats'),
      ]);
      const repliesData = await repliesRes.json();
      const statsData = await statsRes.json();
      if (repliesData.replies) setReplies(repliesData.replies);
      if (statsData.stats) setStats(statsData.stats);
    } catch (e) {
      setScanLogs([{ type: 'error', message: `Request failed: ${e}`, timestamp: new Date().toISOString() }]);
    }
    setScanning(false);
  };

  // ── Add Keyword ──
  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !newReplyText.trim() || saving) return;
    setSaving(true);
    const res = await fetch('/api/admin/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_keyword', keyword: newKeyword, replyText: newReplyText }),
    });
    const data = await res.json();
    if (data.ok) {
      setKeywords(prev => [{ ...data.keyword, _count: { replies: 0 } }, ...prev]);
      setNewKeyword('');
      setNewReplyText('');
      setShowAddForm(false);
      setStats(prev => ({ ...prev, activeKeywords: prev.activeKeywords + 1 }));
    }
    setSaving(false);
  };

  // ── Toggle Keyword ──
  const handleToggle = async (id: number, active: boolean) => {
    const res = await fetch('/api/admin/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_keyword', id, active }),
    });
    const data = await res.json();
    if (data.ok) {
      setKeywords(prev => prev.map(k => k.id === id ? { ...k, active } : k));
      setStats(prev => ({ ...prev, activeKeywords: prev.activeKeywords + (active ? 1 : -1) }));
    }
  };

  // ── Delete Keyword ──
  const handleDelete = async (id: number) => {
    const res = await fetch('/api/admin/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_keyword', id }),
    });
    const data = await res.json();
    if (data.ok) {
      const kw = keywords.find(k => k.id === id);
      setKeywords(prev => prev.filter(k => k.id !== id));
      if (kw?.active) setStats(prev => ({ ...prev, activeKeywords: prev.activeKeywords - 1 }));
    }
  };

  const logColor = (type: ScanLog['type']) => {
    switch (type) {
      case 'match': return '#ffaa00';
      case 'success': return '#00ff88';
      case 'error': return '#ff4444';
      default: return 'var(--text-muted)';
    }
  };

  const logIcon = (type: ScanLog['type']) => {
    switch (type) {
      case 'match': return '🎯';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📡';
    }
  };

  return (
    <div>
      {/* ── Stats Bar ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={statBox}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{stats.activeKeywords}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active Keywords</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{stats.totalReplies}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Total Replies</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00ff88' }}>{stats.successReplies}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Delivered</div>
        </div>
        <div style={statBox}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats.successRate >= 80 ? '#00ff88' : '#ffaa00' }}>
            {stats.successRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Success Rate</div>
        </div>
      </div>

      {/* ── Scan Now ── */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: scanLogs.length ? '16px' : '0' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Comment Scanner</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Scan recent posts for keyword matches, send public replies and Direct Messages
            </div>
          </div>
          <button onClick={handleScan} disabled={scanning} style={{ ...btnPrimary, opacity: scanning ? 0.6 : 1 }}>
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>

        {scanLogs.length > 0 && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid rgba(0, 240, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px',
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
          }}>
            {scanLogs.map((log, i) => (
              <div key={i} style={{ color: logColor(log.type), marginBottom: '4px', lineHeight: '1.6' }}>
                <span style={{ opacity: 0.5 }}>[{formatTime(log.timestamp)}]</span>{' '}
                {logIcon(log.type)} {log.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Keywords ── */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Keywords</div>
          <button onClick={() => setShowAddForm(!showAddForm)} style={btnSmall}>
            {showAddForm ? 'Cancel' : '+ Add Keyword'}
          </button>
        </div>

        {showAddForm && (
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '16px', padding: '12px',
            background: 'var(--bg-primary)', borderRadius: '8px',
          }}>
            <input
              placeholder="Keyword (e.g. контент)"
              value={newKeyword}
              onChange={e => setNewKeyword(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              placeholder="DM reply text"
              value={newReplyText}
              onChange={e => setNewReplyText(e.target.value)}
              style={{ ...inputStyle, flex: 2 }}
            />
            <button onClick={handleAddKeyword} disabled={saving} style={btnPrimary}>
              {saving ? '...' : 'Add'}
            </button>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Keyword</th>
              <th style={thStyle}>Reply Text</th>
              <th style={thStyle}>Matches</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map(kw => (
              <tr key={kw.id}>
                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--neon-cyan)' }}>&quot;{kw.keyword}&quot;</td>
                <td style={{ ...tdStyle, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {kw.replyText}
                </td>
                <td style={tdStyle}>{kw.replyCount}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: kw.active ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: kw.active ? '#00ff88' : 'var(--text-muted)',
                  }}>
                    {kw.active ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleToggle(kw.id, !kw.active)} style={btnSmall}>
                      {kw.active ? 'Pause' : 'Enable'}
                    </button>
                    <button onClick={() => handleDelete(kw.id)} style={btnDanger}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {keywords.length === 0 && (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No keywords configured</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Tabs: Activity / Webhooks ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {(['activity', 'webhooks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === tab ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeTab === tab ? 'var(--neon-cyan)' : 'var(--text-muted)',
            }}
          >
            {tab === 'activity' ? 'Reply Activity' : 'Webhook Logs'}
          </button>
        ))}
      </div>

      {/* ── Activity Feed ── */}
      {activeTab === 'activity' && (
        <div style={card}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '12px' }}>
            Recent Activity ({replies.length})
          </div>
          {replies.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
              No replies yet. Add keywords and run a scan to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {replies.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${r.replySent ? '#00ff88' : r.error ? '#ff4444' : '#ffaa00'}`,
                }}>
                  <div style={{ fontSize: '1.2rem' }}>
                    {r.replySent ? '✅' : r.error ? '❌' : '⏳'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <strong style={{ color: 'var(--neon-cyan)' }}>@{r.igUsername || 'unknown'}</strong>
                      {' '}commented: &quot;{(r.commentText || '').slice(0, 60)}{(r.commentText || '').length > 60 ? '...' : ''}&quot;
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Keyword: &quot;{r.keyword.keyword}&quot; · {r.replySent ? 'DM sent' : r.error ? `Error: ${r.error.slice(0, 50)}` : 'Pending'}
                      {' '}· {formatTime(r.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Webhook Logs ── */}
      {activeTab === 'webhooks' && (
        <div style={card}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '12px' }}>
            Webhook Logs ({logs.length})
          </div>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
              No webhook events received yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {logs.map(log => {
                let parsed = '';
                try {
                  parsed = JSON.stringify(JSON.parse(log.payload), null, 2);
                } catch {
                  parsed = log.payload;
                }
                return (
                  <details key={log.id} style={{
                    background: 'var(--bg-primary)', borderRadius: '8px', padding: '8px 12px',
                  }}>
                    <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {formatTime(log.createdAt)} — {log.payload.slice(0, 80)}...
                    </summary>
                    <pre style={{
                      marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto',
                    }}>
                      {parsed}
                    </pre>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
