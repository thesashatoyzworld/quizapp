'use client';

import { useState } from 'react';
import { LEAD_STATUSES, STATUS_LABEL, STATUS_COLOR, type LeadStatus } from '@/lib/zayavki';

/** Панель работы с заявкой: статус и заметка. Сохраняется сразу, без кнопки «ок». */
export default function LeadWork({
  id,
  status: initialStatus,
  note: initialNote,
  updatedBy,
  updatedAt,
}: {
  id: number;
  status: LeadStatus;
  note: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [note, setNote] = useState(initialNote || '');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function save(patch: { status?: LeadStatus; note?: string }) {
    setState('saving');
    try {
      const res = await fetch('/api/admin/dwy-lead-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      setState(res.ok ? 'saved' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid rgba(0,240,255,0.15)',
      borderRadius: 10, padding: 16,
    }}>
      <div style={{
        fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 10,
      }}>
        Работа с заявкой
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {LEAD_STATUSES.map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => { setStatus(s); void save({ status: s }); }}
              style={{
                padding: '6px 14px', borderRadius: 6,
                border: `1px solid ${active ? STATUS_COLOR[s] : 'rgba(255,255,255,0.12)'}`,
                background: active ? `${STATUS_COLOR[s]}22` : 'transparent',
                color: active ? STATUS_COLOR[s] : 'var(--text-secondary)',
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              {STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => { if (note !== (initialNote || '')) void save({ note }); }}
        placeholder="заметка: о чём договорились, что писал, чего ждём"
        rows={3}
        style={{
          width: '100%', background: 'var(--bg-primary)', color: 'var(--text-secondary)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
          padding: '8px 10px', fontSize: '0.85rem', resize: 'vertical', fontFamily: 'inherit',
        }}
      />

      <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: 8 }}>
        {state === 'saving' && 'сохраняю…'}
        {state === 'saved' && 'сохранено'}
        {state === 'error' && <span style={{ color: '#ef476f' }}>не сохранилось, попробуй ещё раз</span>}
        {state === 'idle' && updatedAt && (
          <>последнее изменение {new Date(updatedAt).toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          })}{updatedBy ? ` · ${updatedBy}` : ''}</>
        )}
      </div>
    </div>
  );
}
