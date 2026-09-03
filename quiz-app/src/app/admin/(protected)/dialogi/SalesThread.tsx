'use client';

import { useEffect, useRef, useState } from 'react';

// Переписка человека и следующий шаг под ней.
//
// Подсказка собирается по кнопке, а не заранее: разбор занимает около минуты
// и стоит денег, а половину диалогов Саша ведёт сам и подсказка ему не нужна.
// Перед отправкой текст можно править прямо здесь — уходит то, что в поле,
// а не то, что предложила модель.

export type ThreadMsg = {
  id: string;
  side: string;
  text: string;
  mediaType: string | null;
  createdAt: string;
};

type Step = { message: string; why: string; stage: string; callSasha: string | null };

const box: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid rgba(0,240,255,0.15)',
  borderRadius: 10,
  padding: 16,
};

const title: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 10,
};

const btn: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: 8,
  border: '1px solid rgba(0,240,255,0.35)',
  background: 'transparent',
  color: 'var(--neon-cyan)',
  cursor: 'pointer',
  fontSize: '0.85rem',
};

function time(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Живой индикатор на время разбора.
 *
 * Полоса не показывает настоящий прогресс — его неоткуда взять, модель не
 * отчитывается о ходе. Она показывает, что работа идёт, и сколько уже прошло:
 * без этого страница выглядит зависшей и кнопку жмут второй раз.
 */
function Progress({ seconds }: { seconds: number }) {
  return (
    <div style={{ marginTop: 12 }}>
      <style>{`@keyframes salesbar { 0% { left: -35%; } 100% { left: 100%; } }`}</style>
      <div
        style={{
          position: 'relative',
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '35%',
            borderRadius: 2,
            background: 'var(--neon-cyan)',
            animation: 'salesbar 1.4s ease-in-out infinite',
          }}
        />
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
        читаю переписку и собираю ответ · {seconds} сек
        {seconds > 75 ? ' · дольше обычного, но идёт' : ''}
      </div>
    </div>
  );
}

export default function SalesThread({
  chatId,
  messages,
  ready = null,
  compact = false,
}: {
  chatId: string;
  messages: ThreadMsg[];
  /** Ответ, собранный заранее пачкой: показываем сразу, без ожидания. */
  ready?: Step | null;
  compact?: boolean;
}) {
  const [thread, setThread] = useState(messages);
  // В карточке заявки переписка мешает анкете, поэтому там она свёрнута до
  // последних реплик, а целиком открывается по кнопке.
  const [full, setFull] = useState(!compact);
  const [step, setStep] = useState<Step | null>(ready);
  const [text, setText] = useState(ready?.message ?? '');
  const [busy, setBusy] = useState<'step' | 'send' | null>(null);
  const [steer, setSteer] = useState('');
  // Разбор идёт около минуты. Без бегущего счётчика страница выглядит
  // зависшей, и человек жмёт кнопку второй раз.
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const shown = full ? thread : thread.slice(-6);

  // Открываем на последнем сообщении: разговор читают с конца, а не с
  // знакомства двухнедельной давности.
  const tail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (full && tail.current) tail.current.scrollTop = tail.current.scrollHeight;
  }, [full, thread.length]);

  useEffect(() => {
    if (busy !== 'step') {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 250);
    return () => clearInterval(timer);
  }, [busy]);

  async function ask(another: boolean) {
    setBusy('step');
    setError(null);
    try {
      const res = await fetch('/api/admin/sales-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, another, steer: steer.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'не собралось');
      setStep(data.step);
      setText(data.step.message);
      setSent(false);
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
      const res = await fetch('/api/admin/sales-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'не отправилось');
      setSent(true);
      setThread((t) => [
        ...t,
        {
          id: `local:${Date.now()}`,
          side: 'us',
          text,
          mediaType: null,
          createdAt: new Date().toISOString(),
        },
      ]);
      setStep(null);
      setText('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={box}>
        <div style={title}>
          Переписка · {thread.length}
          {!full && thread.length > shown.length ? (
            <button
              onClick={() => setFull(true)}
              style={{ ...btn, padding: '2px 10px', fontSize: '0.7rem', marginLeft: 10 }}
            >
              показать всё
            </button>
          ) : null}
        </div>

        <div
          ref={tail}
          style={{
            display: 'grid',
            gap: 8,
            // Свёрнутая переписка растёт по содержимому: полоса прокрутки на
            // шести репликах прячет их же и читается как пустое место.
            ...(full ? { maxHeight: 520, overflowY: 'auto' as const } : {}),
          }}
        >
          {shown.map((m) => {
            const us = m.side === 'us';
            return (
              <div
                key={m.id}
                style={{
                  justifySelf: us ? 'end' : 'start',
                  maxWidth: '85%',
                  background: us ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${us ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  padding: '8px 12px',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                  {us ? 'мы' : 'человек'} · {time(m.createdAt)}
                  {m.mediaType === 'voice' ? ' · голосовое' : ''}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.45 }}>
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={box}>
        <div style={title}>Следующий шаг{step?.stage ? ` · ${step.stage}` : ''}</div>

        {!step && !sent ? (
          <>
            <input
              value={steer}
              onChange={(e) => setSteer(e.target.value)}
              placeholder="куда вести ответ: например «спроси про чек» или «веди на тариф 1»"
              disabled={busy === 'step'}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.35)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                marginBottom: 10,
              }}
            />
            <button onClick={() => ask(false)} disabled={busy === 'step'} style={btn}>
              собрать ответ
            </button>
          </>
        ) : null}

        {busy === 'step' ? <Progress seconds={elapsed} /> : null}

        {sent ? <div style={{ color: 'var(--neon-cyan)' }}>отправлено</div> : null}

        {step ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={Math.min(14, text.split('\n').length + 2)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.35)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: 12,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '8px 0 12px' }}>
              — {step.why}
            </div>
            {step.callSasha ? (
              <div style={{ fontSize: '0.82rem', color: '#ffb547', marginBottom: 12 }}>
                нужен Саша: {step.callSasha}
              </div>
            ) : null}
            <input
              value={steer}
              onChange={(e) => setSteer(e.target.value)}
              placeholder="не то? скажи, куда вести, и жми «другой»"
              disabled={busy !== null}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.35)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                marginBottom: 10,
              }}
            />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={send}
                disabled={busy !== null || !text.trim()}
                style={{ ...btn, borderColor: 'var(--neon-cyan)', background: 'rgba(0,240,255,0.12)' }}
              >
                {busy === 'send' ? 'отправляю…' : '📤 отправить'}
              </button>
              <button onClick={() => ask(true)} disabled={busy !== null} style={btn}>
                ↻ другой
              </button>
              <button onClick={() => setStep(null)} disabled={busy !== null} style={btn}>
                отвечу сам
              </button>
            </div>
          </>
        ) : null}

        {error ? <div style={{ color: '#ff6b6b', marginTop: 10 }}>{error}</div> : null}
      </div>
    </div>
  );
}
