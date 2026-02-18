'use client';

import { useState, useMemo } from 'react';

export interface RawEvent {
  pageId: string;
  type: string;
  timestamp: string;
  user_id: number | null;
  username: string;
  first_name: string;
  result_id: string;
  utm_source: string;
}

const FUNNEL_STEPS_QUIZ = [
  { key: 'bot_start', label: 'Запуск бота' },
  { key: 'webapp_open', label: 'Открыл приложение' },
  { key: 'quiz_start', label: 'Начал квиз' },
  { key: 'quiz_complete', label: 'Завершил квиз' },
  { key: 'subscribe_click', label: 'Подписался' },
  { key: 'result_view', label: 'Просмотрел результат' },
  { key: 'payment_click', label: 'Нажал оплатить' },
  { key: 'payment_success', label: 'Оплатил' },
];

const FUNNEL_STEPS_MASTERCLASS = [
  { key: 'bot_start', label: 'Запуск бота' },
  { key: 'masterclass_view', label: 'Открыл МК страницу' },
  { key: 'payment_click', label: 'Нажал оплатить' },
  { key: 'payment_success', label: 'Оплатил' },
];

const FUNNEL_STEPS_ALL = FUNNEL_STEPS_QUIZ;

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function buildFunnel(events: RawEvent[], steps = FUNNEL_STEPS_QUIZ) {
  const stepUsersMap: Record<string, Map<string, RawEvent>> = {};
  steps.forEach(s => { stepUsersMap[s.key] = new Map(); });

  for (const e of events) {
    if (!stepUsersMap[e.type]) continue;
    const key = e.user_id ? String(e.user_id) : `anon_${e.timestamp}`;
    const existing = stepUsersMap[e.type].get(key);
    if (!existing || new Date(e.timestamp) > new Date(existing.timestamp)) {
      stepUsersMap[e.type].set(key, e);
    }
  }

  return steps.map(s => ({
    ...s,
    count: stepUsersMap[s.key].size,
    users: Array.from(stepUsersMap[s.key].values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  }));
}

interface OutreachStatus {
  dm_sent: boolean;
  dm_sent_at: string;
  dm_sent_pageId: string;
  dm_replied: boolean;
  dm_replied_at: string;
  dm_replied_pageId: string;
}

const EMPTY_OUTREACH: OutreachStatus = {
  dm_sent: false, dm_sent_at: '', dm_sent_pageId: '',
  dm_replied: false, dm_replied_at: '', dm_replied_pageId: '',
};

function FunnelBlock({ steps, getOutreachStatus, onSet, onUndo }: {
  steps: ReturnType<typeof buildFunnel>;
  getOutreachStatus: (userId: number | null) => OutreachStatus;
  onSet: (userId: number, action: 'admin_dm_sent' | 'admin_dm_replied', username: string, firstName: string) => void;
  onUndo: (userId: number, field: 'dm_sent' | 'dm_replied') => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].count : step.count;
        const conv = prev > 0 ? Math.round((step.count / prev) * 100) : 100;
        const isLast = i === steps.length - 1;
        const isOpen = open === step.key;
        const isPaid = step.key === 'payment_success';

        // Map of userId → their event in the NEXT step (for timing comparison)
        const nextStepMap = !isLast
          ? new Map(steps[i + 1].users
              .filter(u => u.user_id)
              .map(u => [String(u.user_id), u]))
          : null;

        return (
          <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <button
              onClick={() => setOpen(isOpen ? null : step.key)}
              style={{
                width: '100%',
                maxWidth: '560px',
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
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{step.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: isPaid ? 'var(--success)' : 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
                  {step.count}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div style={{
                width: '100%',
                maxWidth: '560px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                marginBottom: '4px',
                maxHeight: '360px',
                overflowY: 'auto',
              }}>
                {step.users.length === 0 ? (
                  <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>Нет данных</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                    <tbody>
                      {step.users.map((u, j) => {
                        const status = getOutreachStatus(u.user_id);
                        const nextUser = nextStepMap && u.user_id ? nextStepMap.get(String(u.user_id)) : undefined;
                        const movedToNext = !!nextUser;

                        // Did they move to next step AFTER we DMed them?
                        const movedAfterDm = movedToNext && status.dm_sent && status.dm_sent_at && nextUser
                          ? new Date(nextUser.timestamp) > new Date(status.dm_sent_at)
                          : false;

                        // Funnel movement indicator
                        let moveLabel = '';
                        let moveColor = 'rgba(255,255,255,0.15)';
                        let moveTitle = '';
                        if (nextStepMap) {
                          if (status.dm_sent && movedAfterDm) {
                            moveLabel = 'ДМ сработал';
                            moveColor = 'var(--success)';
                            moveTitle = `Перешёл на следующий этап после ДМ (${formatDate(nextUser!.timestamp)})`;
                          } else if (movedToNext && !status.dm_sent) {
                            moveLabel = '→ сам';
                            moveColor = 'rgba(255,255,255,0.3)';
                            moveTitle = `Перешёл самостоятельно (${formatDate(nextUser!.timestamp)})`;
                          } else if (movedToNext && status.dm_sent && !movedAfterDm) {
                            moveLabel = '→ до ДМ';
                            moveColor = 'rgba(255,255,255,0.3)';
                            moveTitle = 'Перешёл ещё до того, как мы написали';
                          } else if (status.dm_sent && !movedToNext) {
                            moveLabel = '→ ждём';
                            moveColor = 'rgba(255, 180, 0, 0.7)';
                            moveTitle = 'Написали, ждём реакции';
                          }
                        }

                        const btnBase: React.CSSProperties = {
                          padding: '2px 7px',
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-body)',
                          borderRadius: '3px',
                          border: '1px solid',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.6',
                        };

                        return (
                          <tr key={j} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '7px 12px', color: 'var(--neon-cyan)', width: '26%' }}>
                              {u.username ? `@${u.username}` : u.user_id ? `[${u.user_id}]` : '—'}
                            </td>
                            <td style={{ padding: '7px 4px', color: 'var(--text-secondary)', width: '14%' }}>{u.first_name || '—'}</td>
                            <td style={{ padding: '7px 4px', color: 'var(--text-muted)', width: '10%' }}>{u.result_id || '—'}</td>
                            <td style={{ padding: '7px 4px', color: 'var(--text-muted)', width: '12%', fontSize: '0.6rem', whiteSpace: 'nowrap' }}>{formatDate(u.timestamp)}</td>
                            <td style={{ padding: '7px 8px 7px 4px', width: '38%' }}>
                              {u.user_id ? (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'nowrap' }}>
                                  {/* ДМ button */}
                                  <button
                                    onClick={() => {
                                      if (status.dm_sent) {
                                        onUndo(u.user_id!, 'dm_sent');
                                      } else {
                                        onSet(u.user_id!, 'admin_dm_sent', u.username, u.first_name);
                                      }
                                    }}
                                    title={status.dm_sent ? 'Нажми чтобы отменить' : 'Написали ДМ'}
                                    style={{
                                      ...btnBase,
                                      cursor: 'pointer',
                                      borderColor: status.dm_sent ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.12)',
                                      background: status.dm_sent ? 'rgba(0,255,136,0.12)' : 'transparent',
                                      color: status.dm_sent ? 'var(--success)' : 'var(--text-muted)',
                                    }}
                                  >
                                    {status.dm_sent ? '✓ ДМ' : 'ДМ'}
                                  </button>

                                  {/* Отв button */}
                                  <button
                                    onClick={() => {
                                      if (!status.dm_sent) return;
                                      if (status.dm_replied) {
                                        onUndo(u.user_id!, 'dm_replied');
                                      } else {
                                        onSet(u.user_id!, 'admin_dm_replied', u.username, u.first_name);
                                      }
                                    }}
                                    title={status.dm_replied ? 'Нажми чтобы отменить' : status.dm_sent ? 'Ответил' : 'Сначала отметь ДМ'}
                                    style={{
                                      ...btnBase,
                                      cursor: status.dm_sent ? 'pointer' : 'not-allowed',
                                      borderColor: status.dm_replied ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.08)',
                                      background: status.dm_replied ? 'rgba(0,255,136,0.12)' : 'transparent',
                                      color: status.dm_replied ? 'var(--success)' : status.dm_sent ? 'var(--text-muted)' : 'rgba(255,255,255,0.2)',
                                      opacity: status.dm_sent ? 1 : 0.4,
                                    }}
                                  >
                                    {status.dm_replied ? '✓ Отв' : 'Отв'}
                                  </button>

                                  {/* Movement indicator */}
                                  {moveLabel && (
                                    <span
                                      title={moveTitle}
                                      style={{
                                        fontSize: '0.6rem',
                                        color: moveColor,
                                        paddingLeft: '2px',
                                        whiteSpace: 'nowrap',
                                        fontWeight: moveColor === 'var(--success)' ? 600 : 400,
                                      }}
                                    >
                                      {moveLabel}
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {!isLast && !isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
                <div style={{ width: '1px', height: '8px', background: 'rgba(255,255,255,0.15)' }} />
                {i > 0 && (
                  <div style={{ fontSize: '0.7rem', color: conv >= 70 ? 'var(--success)' : conv >= 40 ? 'var(--neon-cyan)' : 'rgba(255,42,109,0.8)', padding: '1px 8px' }}>
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

const BRANCHES = [
  { key: '__all__', label: 'Все' },
  { key: '__quiz__', label: 'Квиз' },
  { key: '__masterclass__', label: 'Мастер-класс' },
];

function filterByBranch(events: RawEvent[], branch: string): RawEvent[] {
  if (branch === '__all__') return events;

  const userBranch = new Map<string, string>();
  for (const e of events) {
    if (e.type !== 'bot_start' || !e.user_id) continue;
    const key = String(e.user_id);
    const utm = e.utm_source || '';
    userBranch.set(key, utm.includes('masterclass') ? '__masterclass__' : '__quiz__');
  }

  return events.filter(e => {
    if (!e.user_id) return false;
    const ub = userBranch.get(String(e.user_id));
    if (!ub) {
      const utm = e.utm_source || '';
      return (utm.includes('masterclass') ? '__masterclass__' : '__quiz__') === branch;
    }
    return ub === branch;
  });
}

export default function DashboardClient({ events }: { events: RawEvent[] }) {
  const [branch, setBranch] = useState('__all__');
  const [localOutreach, setLocalOutreach] = useState<Map<string, Partial<OutreachStatus>>>(new Map());

  const filteredEvents = useMemo(() => filterByBranch(events, branch), [events, branch]);

  const funnelSteps = useMemo(
    () => buildFunnel(filteredEvents, branch === '__masterclass__' ? FUNNEL_STEPS_MASTERCLASS : FUNNEL_STEPS_ALL),
    [filteredEvents, branch]
  );

  const recent = useMemo(() =>
    [...filteredEvents]
      .filter(e => !e.type.startsWith('admin_'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10),
    [filteredEvents]
  );

  // Build outreach base map from events (persisted data)
  const outreachBaseMap = useMemo(() => {
    const map = new Map<string, Partial<OutreachStatus>>();
    for (const e of events) {
      if (!e.user_id) continue;
      const key = String(e.user_id);
      if (e.type === 'admin_dm_sent') {
        const cur = map.get(key) || {};
        map.set(key, { ...cur, dm_sent: true, dm_sent_at: e.timestamp, dm_sent_pageId: e.pageId });
      } else if (e.type === 'admin_dm_replied') {
        const cur = map.get(key) || {};
        map.set(key, { ...cur, dm_replied: true, dm_replied_at: e.timestamp, dm_replied_pageId: e.pageId });
      }
    }
    return map;
  }, [events]);

  function getOutreachStatus(userId: number | null): OutreachStatus {
    if (!userId) return { ...EMPTY_OUTREACH };
    const key = String(userId);
    const base = outreachBaseMap.get(key) || {};
    const local = localOutreach.get(key) || {};
    return { ...EMPTY_OUTREACH, ...base, ...local };
  }

  async function handleSet(userId: number, action: 'admin_dm_sent' | 'admin_dm_replied', username: string, firstName: string) {
    const key = String(userId);
    const now = new Date().toISOString();

    // Optimistic update
    setLocalOutreach(prev => {
      const next = new Map(prev);
      const cur = { ...EMPTY_OUTREACH, ...(outreachBaseMap.get(key) || {}), ...(prev.get(key) || {}) };
      if (action === 'admin_dm_sent') {
        next.set(key, { ...cur, dm_sent: true, dm_sent_at: now });
      } else {
        next.set(key, { ...cur, dm_replied: true, dm_replied_at: now });
      }
      return next;
    });

    const res = await fetch('/api/admin/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: action, user_id: userId, username, first_name: firstName }),
    });
    const data = await res.json().catch(() => ({}));

    // Store the pageId for future undo
    if (data.pageId) {
      setLocalOutreach(prev => {
        const next = new Map(prev);
        const cur = prev.get(key) || {};
        if (action === 'admin_dm_sent') {
          next.set(key, { ...cur, dm_sent_pageId: data.pageId });
        } else {
          next.set(key, { ...cur, dm_replied_pageId: data.pageId });
        }
        return next;
      });
    }
  }

  async function handleUndo(userId: number, field: 'dm_sent' | 'dm_replied') {
    const key = String(userId);
    const status = getOutreachStatus(userId);
    const pageId = field === 'dm_sent' ? status.dm_sent_pageId : status.dm_replied_pageId;

    if (!pageId) return;

    // Optimistic update
    setLocalOutreach(prev => {
      const next = new Map(prev);
      const cur = { ...EMPTY_OUTREACH, ...(outreachBaseMap.get(key) || {}), ...(prev.get(key) || {}) };
      if (field === 'dm_sent') {
        next.set(key, { ...cur, dm_sent: false, dm_sent_at: '', dm_sent_pageId: '' });
      } else {
        next.set(key, { ...cur, dm_replied: false, dm_replied_at: '', dm_replied_pageId: '' });
      }
      return next;
    });

    await fetch('/api/admin/outreach', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    });
  }

  const getStep = (key: string) => funnelSteps.find(s => s.key === key);

  const metricCards = branch === '__masterclass__'
    ? [
        { label: 'Запусков бота', value: getStep('bot_start')?.count ?? 0 },
        { label: 'Открыли МК', value: getStep('masterclass_view')?.count ?? 0 },
        { label: 'Кликнули оплатить', value: getStep('payment_click')?.count ?? 0 },
        { label: 'Оплатили', value: getStep('payment_success')?.count ?? 0, highlight: true },
      ]
    : [
        { label: 'Запусков бота', value: getStep('bot_start')?.count ?? 0 },
        { label: 'Квиз пройден', value: getStep('quiz_complete')?.count ?? 0 },
        { label: 'Подписались', value: getStep('subscribe_click')?.count ?? 0 },
        { label: 'Кликнули оплатить', value: getStep('payment_click')?.count ?? 0 },
        { label: 'Оплатили', value: getStep('payment_success')?.count ?? 0, highlight: true },
      ];

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    borderRadius: '10px',
    padding: '20px 24px',
    flex: '1 1 160px',
    minWidth: '140px',
  };

  return (
    <>
      {/* Branch selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {BRANCHES.map(b => (
          <button
            key={b.key}
            onClick={() => setBranch(b.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: branch === b.key ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.12)',
              color: branch === b.key ? 'var(--neon-cyan)' : 'var(--text-muted)',
              background: branch === b.key ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {metricCards.map(({ label, value, highlight }) => (
          <div key={label} style={{ ...cardStyle, borderColor: highlight ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 240, 255, 0.15)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: highlight ? 'var(--success)' : 'var(--neon-cyan)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '6px' }}>
              {value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '10px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Воронка — нажми на этап чтобы увидеть людей
        </h2>
        <FunnelBlock steps={funnelSteps} getOutreachStatus={getOutreachStatus} onSet={handleSet} onUndo={handleUndo} />
      </div>

      {/* Recent events */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '10px', padding: '24px' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Последние события
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Время', 'Событие', 'Username', 'Архетип', 'Источник'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(e.timestamp)}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontSize: '0.7rem' }}>{e.type}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{e.username ? `@${e.username}` : '—'}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{e.result_id || '—'}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{e.utm_source || '—'}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Нет данных</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
