'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Кнопка «собрать ответы всем».
//
// Когда очередь накопилась за сутки, разбирать по одному — час ожидания.
// Здесь разбор идёт разом, и дальше по списку идёшь уже с готовыми текстами.

export default function PrepareAll({ waiting, ready }: { waiting: number; ready: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const left = waiting - ready;

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/sales-prepare', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'не собралось');
      setResult(
        data.prepared
          ? `готово: ${data.prepared}${data.failed ? `, не вышло ${data.failed}` : ''}`
          : 'все ответы уже собраны',
      );
      router.refresh();
    } catch (e) {
      setResult(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!waiting) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <button
        onClick={run}
        disabled={busy || left <= 0}
        style={{
          padding: '9px 16px',
          borderRadius: 8,
          border: '1px solid rgba(0,240,255,0.35)',
          background: left > 0 ? 'rgba(0,240,255,0.12)' : 'transparent',
          color: 'var(--neon-cyan)',
          cursor: busy || left <= 0 ? 'default' : 'pointer',
          fontSize: '0.85rem',
          opacity: left <= 0 ? 0.5 : 1,
        }}
      >
        {busy
          ? `собираю ответы, это пара минут…`
          : left > 0
            ? `собрать ответы всем (${left})`
            : 'ответы собраны'}
      </button>
      {ready ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>готовых: {ready}</span>
      ) : null}
      {result ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)' }}>{result}</span>
      ) : null}
    </div>
  );
}
