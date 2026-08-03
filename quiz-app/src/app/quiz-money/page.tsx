'use client';

// Квиз «Разрешение быстрых денег» — фронт в тёплой палитре result-экранов.
// welcome → вопросы → анализ → редирект на /r/result-<slug>.html.
// Никакого гейта подписки: одно касание, сразу результат.
// ⚠️ Тексты вопросов — ЧЕРНОВИК в src/data/quiz-money.ts (Саша переписывает).

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { waitForTelegramWebApp } from '@/lib/telegram-ready';
import {
  questions,
  calculateScores,
  determineResult,
  resultSlug,
  blockMeta,
  VSE_HOROSHO,
  type MoneyResult,
} from '@/data/quiz-money';

type Screen = 'welcome' | 'quiz' | 'analyzing';

const CREAM = '#F4ECE0';
const CHAR = '#23201C';
const TERRA = '#C8501F';
const CARD = '#FBF6EE';

export default function QuizMoney() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [utmSource, setUtmSource] = useState<string | null>(null);
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherText, setOtherText] = useState('');
  const customRef = useRef<Record<number, string>>({}); // qIndex → свой вариант ответа («Другое»)
  const resultRef = useRef<MoneyResult | null>(null);

  const { user } = useTelegram();

  const track = useCallback(
    async (event_type: string, extra: Record<string, unknown> = {}, srcOverride?: string) => {
      try {
        // SDK грузится с defer — ждём его, чтобы событие не ушло без user_id.
        const tgUser = (await waitForTelegramWebApp())?.initDataUnsafe?.user ?? null;
        await fetch('/api/track-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type,
            user_id: tgUser?.id || null,
            username: tgUser?.username,
            first_name: tgUser?.first_name,
            // srcOverride нужен для самого первого события (webapp_open): setUtmSource
            // асинхронный, поэтому состояние ещё пустое в момент монтирования.
            utm_source: srcOverride || utmSource || 'razreshenie_deneg',
            metadata: { quiz: 'money', ...extra },
          }),
        });
      } catch (e) {
        console.error('track failed', e);
      }
    },
    [utmSource],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get('utm_source');
    if (src) setUtmSource(src);
    track('webapp_open', { route: 'quiz-money' }, src || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    track('quiz_start');
    setScreen('quiz');
  };

  const goToResult = useCallback(() => {
    const r = resultRef.current;
    if (!r) return;
    const slug = resultSlug(r);
    const name = user?.first_name ? encodeURIComponent(user.first_name) : '';
    const sec = r.secondary || '';
    const src = encodeURIComponent(utmSource || 'razreshenie_deneg');
    window.location.href = `/r/result-${slug}.html?primary=${r.primary}&secondary=${sec}&pct=${r.overlapPercent}&name=${name}&utm_source=${src}`;
  }, [user, utmSource]);

  const answer = (idx: number) => {
    const next = [...answers, idx];
    setAnswers(next);
    // сброс состояния «Другое» перед следующим вопросом
    setOtherOpen(false);
    setOtherText('');

    if (current < questions.length - 1) {
      setCurrent(current + 1);
      return;
    }

    const scores = calculateScores(next);
    const result = determineResult(next, scores);
    resultRef.current = result;

    const label =
      result.primary === 'vse-horosho' ? VSE_HOROSHO.title : blockMeta[result.primary].title;
    track('quiz_complete', {
      primary: result.primary,
      secondary: result.secondary,
      pct: result.overlapPercent,
      title: label,
      other_count: Object.keys(customRef.current).length, // сколько раз выбрали «Другое»
      custom: customRef.current, // тексты своих вариантов — на почитать / доработку ответов
    });

    setScreen('analyzing');
  };

  // «Другое» — это всегда индекс ПОСЛЕ реальных опций вопроса.
  // Скоринг такого ответа = 0 по всем блокам (scoringRules[q]?.[otherIdx] === undefined),
  // так что свой вариант не двигает результат, но текст уходит в трекинг.
  const submitOther = () => {
    const text = otherText.trim();
    if (!text) return;
    customRef.current[current] = text;
    answer(questions[current].options.length);
  };

  // Аналитический экран → редирект на result-HTML
  useEffect(() => {
    if (screen !== 'analyzing') return;
    const t = setTimeout(goToResult, 1700);
    return () => clearTimeout(t);
  }, [screen, goToResult]);

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: CREAM,
        color: CHAR,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '24px 20px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* WELCOME */}
        {screen === 'welcome' && (
          <div style={{ margin: 'auto 0' }}>
            <div style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: TERRA, fontWeight: 600, marginBottom: 16 }}>
              Разрешение быстрых денег
            </div>
            <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 8vw, 46px)', lineHeight: 1.05, margin: '0 0 18px' }}>
              Посмотрим, что мешает тебе получать деньги
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.5, opacity: 0.8, margin: '0 0 28px' }}>
              {questions.length} вопросов, отвечай как чувствуешь. В конце — твой денежный блок и что за ним стоит.
            </p>
            <button onClick={start} style={btnStyle}>
              Поехали
            </button>
          </div>
        )}

        {/* QUIZ */}
        {screen === 'quiz' && (
          <div style={{ margin: 'auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
              <span style={{ opacity: 0.6 }}>
                {current + 1} / {questions.length}
              </span>
              <span style={{ color: TERRA }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(35,32,28,0.1)', borderRadius: 4, marginBottom: 28, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: TERRA, transition: 'width .3s' }} />
            </div>

            <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: 'clamp(20px, 5.5vw, 27px)', lineHeight: 1.15, margin: '0 0 22px' }}>
              {questions[current].text}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions[current].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  style={optionStyle}
                  onMouseDown={(e) => (e.currentTarget.style.background = '#F3E7D6')}
                  onMouseUp={(e) => (e.currentTarget.style.background = CARD)}
                >
                  {opt}
                </button>
              ))}

              {/* Другое — свой вариант */}
              {!otherOpen ? (
                <button
                  onClick={() => setOtherOpen(true)}
                  style={{ ...optionStyle, background: 'transparent', color: CHAR, opacity: 0.75, fontStyle: 'italic' }}
                >
                  Другое — свой вариант
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    autoFocus
                    rows={3}
                    placeholder="Напиши своими словами, как это у тебя на самом деле"
                    style={{
                      width: '100%',
                      background: CARD,
                      color: CHAR,
                      border: `1.5px solid ${TERRA}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      fontSize: 16,
                      lineHeight: 1.4,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={submitOther}
                    disabled={!otherText.trim()}
                    style={{
                      ...btnStyle,
                      opacity: otherText.trim() ? 1 : 0.4,
                      cursor: otherText.trim() ? 'pointer' : 'default',
                    }}
                  >
                    Дальше
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYZING */}
        {screen === 'analyzing' && (
          <div style={{ margin: 'auto 0', textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                border: '4px solid rgba(200,80,31,0.25)',
                borderTopColor: TERRA,
                borderRadius: '50%',
                margin: '0 auto 22px',
                animation: 'qmspin 0.8s linear infinite',
              }}
            />
            <p style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 600, fontSize: 18 }}>Собираю твой результат…</p>
            <style>{`@keyframes qmspin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  width: '100%',
  background: TERRA,
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '18px 24px',
  fontSize: 17,
  fontWeight: 700,
  fontFamily: "'Unbounded', sans-serif",
  cursor: 'pointer',
};

const optionStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  background: CARD,
  color: CHAR,
  border: '1.5px solid rgba(35,32,28,0.12)',
  borderRadius: 14,
  padding: '16px 18px',
  fontSize: 16,
  lineHeight: 1.35,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background .15s, border-color .15s',
};
