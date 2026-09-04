'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Чем кончился разговор. Стоит прямо в строке очереди: если ради пометки надо
// открывать человека, её не поставят никогда, и очередь снова зарастёт теми,
// кто давно ушёл.
//
// Оплата здесь не отмечается — она видна по выданному доступу.

const link: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: '0.72rem',
  color: 'var(--text-muted)',
  textDecoration: 'underline dotted',
};

/** Каденция возврата из базы: сутки, три дня, неделя. */
const WAKE = [
  { days: 1, label: 'завтра' },
  { days: 3, label: 'через 3 дня' },
  { days: 7, label: 'через неделю' },
];

export default function OutcomeButtons({
  chatId,
  outcome,
  wakeIn,
}: {
  chatId: string;
  outcome: 'thinking' | 'lost' | null;
  /** «завтра», «пора» — уже посчитано на сервере. */
  wakeIn?: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);

  async function mark(next: 'thinking' | 'lost' | null, days?: number) {
    setBusy(true);
    await fetch('/api/admin/sales-outcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, outcome: next, days }),
    });
    setBusy(false);
    setAsking(false);
    router.refresh();
  }

  if (busy) return <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>…</span>;

  if (outcome) {
    return (
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        {outcome === 'thinking' ? `думает · ${wakeIn ?? ''}` : 'слился'}{' '}
        <button style={link} onClick={() => mark(null)}>
          вернуть
        </button>
      </span>
    );
  }

  if (asking) {
    return (
      <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {WAKE.map((w) => (
          <button key={w.days} style={link} onClick={() => mark('thinking', w.days)}>
            {w.label}
          </button>
        ))}
        <button style={link} onClick={() => setAsking(false)}>
          отмена
        </button>
      </span>
    );
  }

  return (
    <span style={{ display: 'flex', gap: 10 }}>
      <button style={link} onClick={() => setAsking(true)}>
        думает
      </button>
      <button style={link} onClick={() => mark('lost')}>
        слился
      </button>
    </span>
  );
}
