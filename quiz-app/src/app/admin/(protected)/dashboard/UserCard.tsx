'use client';

import { useState } from 'react';
import { RawEvent } from './DashboardClient';

const EVENT_LABELS: Record<string, string> = {
  bot_start: 'Запустил бота',
  webapp_open: 'Открыл приложение',
  quiz_start: 'Начал квиз',
  quiz_complete: 'Завершил квиз',
  subscribe_click: 'Подписался на канал',
  result_view: 'Просмотрел результат',
  payment_click: 'Нажал оплатить',
  payment_success: 'Оплатил МК',
  masterclass_view: 'Открыл МК страницу',
  connectors_payment: 'Оплатил Коннекторы',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export interface UserCardNote {
  pageId: string;
  text: string;
  timestamp: string;
}

interface OutreachStatus {
  dm_sent: boolean;
  dm_sent_at: string;
  dm_replied: boolean;
  dm_replied_at: string;
}

interface UserCardProps {
  userId: number;
  username: string;
  firstName: string;
  events: RawEvent[];
  notes: UserCardNote[];
  outreachStatus: OutreachStatus;
  onClose: () => void;
  onAddNote: (text: string) => Promise<void>;
}

export default function UserCard({
  userId, username, firstName,
  events, notes, outreachStatus,
  onClose, onAddNote,
}: UserCardProps) {
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!noteText.trim() || saving) return;
    setSaving(true);
    await onAddNote(noteText.trim());
    setNoteText('');
    setSaving(false);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '24px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)' }}>
              {username ? `@${username}` : `[${userId}]`}
            </div>
            {firstName && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{firstName}</div>
            )}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>ID: {userId}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Outreach status */}
        {(outreachStatus.dm_sent || outreachStatus.dm_replied) && (
          <div style={{
            marginBottom: '20px', padding: '12px 14px',
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Аутрич
            </div>
            {outreachStatus.dm_sent && (
              <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '3px' }}>
                ✓ ДМ написали{outreachStatus.dm_sent_at ? ` — ${formatDate(outreachStatus.dm_sent_at)}` : ''}
              </div>
            )}
            {outreachStatus.dm_replied && (
              <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                ✓ Ответил{outreachStatus.dm_replied_at ? ` — ${formatDate(outreachStatus.dm_replied_at)}` : ''}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Путь пользователя
          </div>
          {events.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Нет событий</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                  <span style={{
                    fontSize: '0.62rem', color: 'var(--text-muted)',
                    whiteSpace: 'nowrap', minWidth: '72px', flexShrink: 0,
                  }}>
                    {formatDate(e.timestamp)}
                  </span>
                  <div>
                    <span style={{
                      fontSize: '0.8rem',
                      color: e.type === 'payment_success' || e.type === 'connectors_payment'
                        ? 'var(--success)'
                        : e.type === 'payment_click'
                        ? 'var(--neon-cyan)'
                        : 'var(--text-secondary)',
                    }}>
                      {EVENT_LABELS[e.type] || e.type}
                    </span>
                    {e.result_id && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        · {e.result_id}
                      </span>
                    )}
                    {e.utm_source && (
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginLeft: '6px' }}>
                        [{e.utm_source}]
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

        {/* Notes */}
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Заметки
          </div>

          {notes.length === 0 && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Заметок пока нет
            </div>
          )}

          {notes.map((n, i) => (
            <div key={i} style={{
              marginBottom: '8px',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '6px',
              borderLeft: '2px solid rgba(0, 240, 255, 0.25)',
            }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.text}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '4px' }}>{formatDate(n.timestamp)}</div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginTop: notes.length > 0 ? '12px' : '0' }}>
            <input
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
              placeholder="Написать заметку... (Enter для сохранения)"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSave}
              disabled={!noteText.trim() || saving}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(0,240,255,0.3)',
                background: 'rgba(0,240,255,0.1)',
                color: 'var(--neon-cyan)',
                cursor: !noteText.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                opacity: !noteText.trim() ? 0.4 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {saving ? '...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
