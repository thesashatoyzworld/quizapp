'use client';

import { useState } from 'react';

interface FunnelUser {
  user_id: number | null;
  username: string;
  first_name: string;
  result_id: string;
  timestamp: string;
}

interface FunnelStep {
  key: string;
  label: string;
  count: number;
  users: FunnelUser[];
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].count : step.count;
        const conv = prev > 0 ? Math.round((step.count / prev) * 100) : 100;
        const isLast = i === steps.length - 1;
        const isOpen = open === step.key;
        const isPaid = step.key === 'payment_success';

        return (
          <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Block */}
            <button
              onClick={() => setOpen(isOpen ? null : step.key)}
              style={{
                width: '100%',
                maxWidth: '520px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isPaid ? 'rgba(0, 255, 136, 0.08)' : isOpen ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0, 240, 255, 0.05)',
                border: `1px solid ${isPaid ? 'rgba(0, 255, 136, 0.3)' : isOpen ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.2)'}`,
                borderRadius: isOpen ? '8px 8px 0 0' : '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {step.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  color: isPaid ? 'var(--success)' : 'var(--neon-cyan)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                }}>
                  {step.count}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {/* Expanded users */}
            {isOpen && (
              <div style={{
                width: '100%',
                maxWidth: '520px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                marginBottom: '4px',
                maxHeight: '280px',
                overflowY: 'auto',
              }}>
                {step.users.length === 0 ? (
                  <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                    Нет данных
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <tbody>
                      {step.users.map((u, j) => (
                        <tr key={j} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px 16px', color: 'var(--neon-cyan)', width: '40%' }}>
                            {u.username ? `@${u.username}` : u.user_id ? `[${u.user_id}]` : '—'}
                          </td>
                          <td style={{ padding: '8px 8px', color: 'var(--text-secondary)', width: '25%' }}>
                            {u.first_name || '—'}
                          </td>
                          <td style={{ padding: '8px 8px', color: 'var(--text-muted)', width: '20%' }}>
                            {u.result_id || '—'}
                          </td>
                          <td style={{ padding: '8px 16px', color: 'var(--text-muted)', width: '15%', whiteSpace: 'nowrap' }}>
                            {formatDate(u.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Arrow + conversion */}
            {!isLast && !isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
                <div style={{ width: '1px', height: '8px', background: 'rgba(255,255,255,0.15)' }} />
                {i > 0 && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: conv >= 70 ? 'var(--success)' : conv >= 40 ? 'var(--neon-cyan)' : 'rgba(255,42,109,0.8)',
                    padding: '1px 8px',
                  }}>
                    {conv}%
                  </div>
                )}
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>▼</div>
              </div>
            )}
            {!isLast && isOpen && <div style={{ height: '8px' }} />}
          </div>
        );
      })}
    </div>
  );
}
