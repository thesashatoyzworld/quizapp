'use client';

import { useState } from 'react';
import type { EgEvent } from './page';

const FUNNEL_STEPS = [
  { key: 'eg_bot_start', label: 'Запуск бота' },
  { key: 'eg_webapp_open', label: 'Открыл калькулятор' },
  { key: 'eg_subscription_check', label: 'Не подписан' },
  { key: 'eg_subscribed', label: 'Подписался' },
];

type User = {
  user_id: number;
  username: string;
  first_name: string;
  utm_source: string;
  events: string[];
  lastSeen: string;
};

export default function EuvgenClient({ events }: { events: EgEvent[] }) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Build user map
  const userMap = new Map<number, User>();
  for (const e of events) {
    if (!e.user_id) continue;
    const existing = userMap.get(e.user_id);
    if (existing) {
      if (!existing.events.includes(e.type)) existing.events.push(e.type);
      if (e.username && !existing.username) existing.username = e.username;
      if (e.first_name && !existing.first_name) existing.first_name = e.first_name;
      if (e.utm_source && !existing.utm_source) existing.utm_source = e.utm_source;
      if (e.timestamp > existing.lastSeen) existing.lastSeen = e.timestamp;
    } else {
      userMap.set(e.user_id, {
        user_id: e.user_id,
        username: e.username,
        first_name: e.first_name,
        utm_source: e.utm_source,
        events: [e.type],
        lastSeen: e.timestamp,
      });
    }
  }

  const users = Array.from(userMap.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));

  // Funnel counts
  const funnelData = FUNNEL_STEPS.map(step => {
    const usersAtStep = users.filter(u => u.events.includes(step.key));
    return { ...step, count: usersAtStep.length, users: usersAtStep };
  });

  const maxCount = Math.max(...funnelData.map(f => f.count), 1);

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(0, 240, 255, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  };

  return (
    <div>
      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {funnelData.map(step => (
          <div key={step.key} style={cardStyle}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{step.count}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{step.label}</div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div style={{ ...cardStyle, marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Воронка
        </h2>
        {funnelData.map((step, i) => {
          const width = Math.max((step.count / maxCount) * 100, 8);
          const isExpanded = expandedStep === step.key;
          return (
            <div key={step.key} style={{ marginBottom: '12px' }}>
              <div
                onClick={() => setExpandedStep(isExpanded ? null : step.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                  padding: '8px 0',
                }}
              >
                <div style={{ width: '140px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {step.label}
                </div>
                <div style={{ flex: 1, background: 'rgba(0,240,255,0.05)', borderRadius: '4px', height: '28px', position: 'relative' }}>
                  <div style={{
                    width: `${width}%`,
                    height: '100%',
                    background: i === funnelData.length - 1 ? 'var(--success)' : 'var(--neon-cyan)',
                    borderRadius: '4px',
                    opacity: 0.7,
                    transition: 'width 0.3s',
                  }} />
                  <span style={{
                    position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
                  }}>
                    {step.count}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '40px', textAlign: 'right' }}>
                  {i > 0 && funnelData[0].count > 0
                    ? `${Math.round((step.count / funnelData[0].count) * 100)}%`
                    : ''}
                </span>
              </div>

              {isExpanded && step.users.length > 0 && (
                <div style={{
                  marginLeft: '152px', padding: '8px 12px',
                  background: 'rgba(0,240,255,0.03)', borderRadius: '6px', marginBottom: '8px',
                }}>
                  {step.users.map(u => (
                    <div key={u.user_id} style={{
                      display: 'flex', gap: '12px', padding: '6px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem',
                    }}>
                      <span style={{ color: 'var(--neon-cyan)', minWidth: '100px' }}>
                        {u.username ? `@${u.username}` : `#${u.user_id}`}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{u.first_name}</span>
                      {u.utm_source && (
                        <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{u.utm_source}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Users table */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Контакты ({users.length})
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,240,255,0.15)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Username</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Имя</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Источник</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Подписан</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Последний визит</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const subscribed = u.events.includes('eg_subscribed');
              return (
                <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--neon-cyan)' }}>
                    {u.username ? `@${u.username}` : `#${u.user_id}`}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{u.first_name}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{u.utm_source || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
                      background: subscribed ? 'rgba(0,255,136,0.15)' : 'rgba(255,100,100,0.15)',
                      color: subscribed ? 'var(--success)' : '#ff6464',
                    }}>
                      {subscribed ? 'Да' : 'Нет'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                    {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Пока нет данных. Отправьте /start боту @eglobauto_bot
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
