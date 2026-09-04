'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Разослать готовые ответы всем, кого не надо разбирать руками.
//
// Отправка необратима, поэтому в один клик она не делается: сперва показываем
// список — кому и что уйдёт — и отдельно тех, кто остаётся Саше. Подтверждение
// нажимается уже поверх увиденного.

type Auto = { chatId: string; who: string; text: string };
type Manual = { chatId: string; who: string; reason: string; leadId: number | null };

const btn: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: 8,
  border: '1px solid rgba(0,240,255,0.35)',
  background: 'rgba(0,240,255,0.12)',
  color: 'var(--neon-cyan)',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

export default function SendAll() {
  const router = useRouter();
  const [plan, setPlan] = useState<{ auto: Auto[]; manual: Manual[] } | null>(null);
  const [busy, setBusy] = useState<'plan' | 'send' | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function preview() {
    setBusy('plan');
    setError(null);
    try {
      const res = await fetch('/api/admin/sales-send-all');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'не собралось');
      setPlan({ auto: data.auto, manual: data.manual });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    setBusy('send');
    setError(null);
    try {
      const res = await fetch('/api/admin/sales-send-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'не отправилось');
      setDone(
        `отправлено ${data.sent}${data.failed?.length ? `, не ушло ${data.failed.length}` : ''}` +
          `${data.manual ? ` · тебе осталось ${data.manual}` : ''}`,
      );
      setPlan(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={preview} disabled={busy !== null} style={btn}>
          {busy === 'plan' ? 'смотрю, что уйдёт…' : 'разослать ответы'}
        </button>
        {done ? <span style={{ fontSize: '0.82rem', color: 'var(--neon-cyan)' }}>{done}</span> : null}
        {error ? <span style={{ fontSize: '0.82rem', color: '#ff6b6b' }}>{error}</span> : null}
      </div>

      {plan ? (
        <div
          style={{
            marginTop: 14,
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(0,240,255,0.15)',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div style={{ fontSize: '0.9rem', marginBottom: 12 }}>
            Уйдёт сразу: <b>{plan.auto.length}</b>. Остаётся тебе: <b>{plan.manual.length}</b>.
          </div>

          {plan.auto.length ? (
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 14 }}>
              {plan.auto.map((a) => (
                <div
                  key={a.chatId}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '8px 0',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ color: 'var(--neon-cyan)' }}>{a.who}</div>
                  <div style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                    {a.text.length > 220 ? `${a.text.slice(0, 220)}…` : a.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', marginBottom: 14 }}>
              Автоматом отправлять нечего: либо ответы ещё не собраны, либо все попали к тебе.
            </div>
          )}

          {plan.manual.length ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                РАЗБИРАЕШЬ САМ
              </div>
              {plan.manual.map((m) => (
                <div key={m.chatId} style={{ fontSize: '0.85rem', marginBottom: 4 }}>
                  <a
                    href={m.leadId ? `/admin/zayavki/${m.leadId}` : `/admin/dialogi/${m.chatId}`}
                    style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}
                  >
                    {m.who}
                  </a>
                  <span style={{ color: 'var(--text-muted)' }}> — {m.reason}</span>
                </div>
              ))}
            </div>
          ) : null}

          {plan.auto.length ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={send} disabled={busy !== null} style={btn}>
                {busy === 'send' ? 'отправляю…' : `📤 отправить ${plan.auto.length}`}
              </button>
              <button
                onClick={() => setPlan(null)}
                disabled={busy !== null}
                style={{ ...btn, background: 'transparent' }}
              >
                отмена
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
