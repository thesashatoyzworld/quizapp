'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { questions, calculateScores, determineResult, QuizResult, Category } from '@/data/quiz';
import { useTelegram } from '@/hooks/useTelegram';
import { useTracking } from '@/hooks/useTracking';
import InvisibleResult from '@/components/results/InvisibleResult';
import DoerResult from '@/components/results/DoerResult';
import GenerousResult from '@/components/results/GenerousResult';
import UnstableResult from '@/components/results/UnstableResult';
import ScaleResult from '@/components/results/ScaleResult';
import { AnalyzingLoader } from '@/components/results/shared/AnalyzingLoader';

type QuizState = 'welcome' | 'quiz' | 'result-preview' | 'analyzing' | 'result' | 'payment-success';

export default function Home() {
  const [state, setState] = useState<QuizState>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [scores, setScores] = useState<Record<Category, number> | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const waitingForReturn = useRef(false);
  const hasTrackedResult = useRef(false);

  const [utmSource, setUtmSource] = useState<string | null>(null);

  const { user, userId, isTelegramContext, webApp } = useTelegram();
  const { trackEvent, trackWebappOpen, trackQuizStart, trackQuizComplete, trackResultView, trackPaymentClick } = useTracking(user, utmSource);

  const CHANNEL_URL = 'https://t.me/sashatoyz';

  // Read utm_source, detect ?payment=success, and track webapp_open on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const source = params.get('utm_source');
    if (source) {
      setUtmSource(source);
    }

    if (params.get('payment') === 'success') {
      setState('payment-success');
    } else {
      // Track webapp_open (user clicked "Пройти диагностику")
      // Read Telegram user directly — state may not be set yet
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'webapp_open',
          user_id: tgUser?.id,
          username: tgUser?.username,
          first_name: tgUser?.first_name,
          utm_source: source || undefined,
        }),
      }).catch(() => {});
    }

    // Clean up URL params
    if (params.toString()) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleStart = () => {
    trackQuizStart();
    setState('quiz');
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const calculatedScores = calculateScores(newAnswers);
      const quizResult = determineResult(newAnswers, calculatedScores);
      setScores(calculatedScores);
      setResult(quizResult);
      setState('result-preview');

      // Track quiz completion
      trackQuizComplete(quizResult.title, String(quizResult.stage), quizResult.id);
    }
  };

  const checkSubscription = useCallback(async (showError = true) => {
    if (!userId) {
      if (showError) {
        setSubscriptionError('Откройте квиз через Telegram для проверки подписки');
      }
      return false;
    }

    setIsCheckingSubscription(true);
    setSubscriptionError(null);

    try {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          result_id: result?.id,
          username: user?.username,
          first_name: user?.first_name,
        }),
      });

      const data = await response.json();

      if (data.subscribed) {
        setState('analyzing');
        // Track result view when subscription confirmed
        if (!hasTrackedResult.current && result) {
          trackResultView(result.title);
          hasTrackedResult.current = true;
        }
        return true;
      } else {
        if (showError) {
          setSubscriptionError('Вы ещё не подписаны на канал. Подпишитесь и попробуйте снова.');
        }
        return false;
      }
    } catch (error) {
      console.error('Subscription check error:', error);
      if (showError) {
        setSubscriptionError('Ошибка проверки. Попробуйте ещё раз.');
      }
      return false;
    } finally {
      setIsCheckingSubscription(false);
    }
  }, [userId, result, trackResultView]);

  // Автопроверка подписки при возврате в приложение
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && waitingForReturn.current) {
        waitingForReturn.current = false;
        // Небольшая задержка чтобы Telegram успел обновить статус подписки
        setTimeout(() => {
          checkSubscription(true);
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkSubscription]);

  const openChannelWithPopup = () => {
    setShowSubscribePopup(true);
  };

  const confirmOpenChannel = () => {
    setShowSubscribePopup(false);
    waitingForReturn.current = true;

    // Track that user is going to subscribe (key drop-off point)
    trackEvent('subscribe_click', { result_title: result?.title });

    // Открываем канал
    if (webApp && isTelegramContext) {
      webApp.openTelegramLink(CHANNEL_URL);
    } else {
      window.open(CHANNEL_URL, '_blank');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <>
      {/* Background layers */}
      <div className="grid-bg" />
      <div className="scanlines" />
      <div className="glow-sphere glow-sphere-1" />
      <div className="glow-sphere glow-sphere-2" />

      {/* HUD Corners */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <main className="quiz-container">
        <div className="quiz-content">
          {/* ==================== WELCOME SCREEN ==================== */}
          {state === 'welcome' && (
            <div key="welcome">
              <h1 className="title-xl animate-1">
                Диагностика контента
              </h1>
              <div className="title-line animate-2" />
              <p className="subtitle animate-3 mb-xl">
                Узнайте, на каком этапе развития вы находитесь и сколько денег теряете из-за неправильного контента
              </p>

              <div className="text-left mb-xl space-y-md animate-4" style={{ maxWidth: '650px', margin: '0 auto var(--space-xl)' }}>
                <p className="text-secondary">
                  Сейчас проведу тест — 8 вопросов, отвечаете интуитивно.
                </p>
                <p className="text-secondary">В конце:</p>
                <ul className="space-y-sm text-secondary" style={{ paddingLeft: 'var(--space-md)' }}>
                  <li>• Определим, на каком этапе пути вы находитесь</li>
                  <li>• Объясним, почему контент не привлекает клиентов</li>
                  <li>• Посмотрим финансовую картину</li>
                  <li>• Разберёмся, что делать дальше</li>
                </ul>
              </div>

              <button
                onClick={handleStart}
                className="btn-neon animate-5"
              >
                Поехали
              </button>
            </div>
          )}

          {/* ==================== QUIZ QUESTIONS ==================== */}
          {state === 'quiz' && (
            <div key={`quiz-${currentQuestion}`}>
              {/* Progress */}
              <div className="mb-lg animate-1">
                <div className="flex justify-between items-center mb-sm">
                  <span className="label">
                    Вопрос {currentQuestion + 1} из {questions.length}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <h2 className="title-lg animate-2">
                {questions[currentQuestion].text}
              </h2>

              {/* Options */}
              <div className="space-y-sm text-left">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`btn-option animate-${index + 3}`}
                  >
                    <span className="option-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ==================== RESULT PREVIEW (Subscribe) ==================== */}
          {state === 'result-preview' && result && (
            <div key="result-preview">
              <div className="mb-md animate-1">
                <span className="label">📊 Диагностика готова</span>
              </div>

              <div className="card mb-lg animate-2">
                <div className="text-center mb-lg">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Этап {result.stage}
                  </span>
                  <h2 className="title-lg text-magenta" style={{ marginTop: 'var(--space-xs)', marginBottom: 0 }}>
                    «{result.title}»
                  </h2>
                </div>

                <p className="text-secondary text-center mb-lg">
                  {result.description.split('\n')[0]}
                </p>

                <div className="text-center" style={{ padding: 'var(--space-md)', background: 'rgba(157, 78, 221, 0.1)', borderRadius: '8px', border: '1px solid rgba(157, 78, 221, 0.3)' }}>
                  <p className="text-cyan mb-sm" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                    🔒 Полный разбор доступен подписчикам канала
                  </p>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Подпишитесь, чтобы узнать:
                  </p>
                  <ul className="text-secondary text-left" style={{ maxWidth: '300px', margin: 'var(--space-sm) auto 0' }}>
                    <li>• Финансовые потери</li>
                    <li>• Причины проблемы</li>
                    <li>• Пошаговый план действий</li>
                  </ul>
                </div>
              </div>

              <div className="text-center animate-3">
                <button
                  onClick={openChannelWithPopup}
                  className="btn-neon mb-md"
                  style={{ width: '100%', maxWidth: '320px' }}
                >
                  Подписаться на канал
                </button>

                <button
                  onClick={() => checkSubscription(true)}
                  className="btn-option"
                  disabled={isCheckingSubscription}
                  style={{ width: '100%', maxWidth: '320px', justifyContent: 'center' }}
                >
                  {isCheckingSubscription ? 'Проверяю...' : 'Уже подписан — проверить'}
                </button>

                {subscriptionError && (
                  <p className="text-danger mt-md" style={{ fontSize: '0.9rem' }}>
                    {subscriptionError}
                  </p>
                )}

                {!isTelegramContext && (
                  <p className="text-muted mt-md" style={{ fontSize: '0.85rem' }}>
                    Для проверки подписки откройте квиз через Telegram
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ==================== ANALYZING SCREEN ==================== */}
          {state === 'analyzing' && (
            <AnalyzingLoader onComplete={() => setState('result')} />
          )}

          {/* ==================== RESULT SCREEN ==================== */}
          {state === 'result' && result && (
            <div key="result">
              {/* Show detailed result page based on result type */}
              {result.id === 'invisible' && <InvisibleResult onPaymentClick={() => trackPaymentClick(result.title)} userId={userId} resultId={result.id} scores={scores} userName={user?.first_name || null} userPhoto={null} />}
              {result.id === 'doer' && <DoerResult onPaymentClick={() => trackPaymentClick(result.title)} userId={userId} resultId={result.id} scores={scores} userName={user?.first_name || null} userPhoto={null} />}
              {result.id === 'generous' && <GenerousResult onPaymentClick={() => trackPaymentClick(result.title)} userId={userId} resultId={result.id} scores={scores} userName={user?.first_name || null} userPhoto={null} />}
              {result.id === 'unstable' && <UnstableResult onPaymentClick={() => trackPaymentClick(result.title)} userId={userId} resultId={result.id} scores={scores} userName={user?.first_name || null} userPhoto={null} />}
              {result.id === 'scale' && <ScaleResult onPaymentClick={() => trackPaymentClick(result.title)} userId={userId} resultId={result.id} scores={scores} userName={user?.first_name || null} userPhoto={null} />}

            </div>
          )}

          {/* ==================== PAYMENT SUCCESS ==================== */}
          {state === 'payment-success' && (
            <div key="payment-success" className="text-center">
              <div className="mb-lg animate-1">
                <span style={{ fontSize: '4rem' }}>&#x2705;</span>
              </div>

              <h1 className="title-xl text-cyan animate-2" style={{ marginBottom: 'var(--space-md)' }}>
                Оплата получена!
              </h1>

              <div className="card mb-lg animate-3">
                <p className="text-secondary mb-md" style={{ fontSize: '1.1rem' }}>
                  Проверьте сообщения в Telegram — бот уже отправил вам доступ и бонус.
                </p>

                <div style={{
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '8px',
                  padding: 'var(--space-md)',
                }}>
                  <p className="text-cyan" style={{ fontSize: '0.95rem', margin: 0 }}>
                    &#x1F393; Мастер-класс «Продающий контент»<br/>
                    &#x1F4C5; 24 февраля, 17:00 мск<br/>
                    &#x1F381; Бонус «Богатая ЦА» уже в чате
                  </p>
                </div>
              </div>

              <p className="text-muted animate-4" style={{ fontSize: '0.9rem' }}>
                Если сообщение не пришло — напишите @sashatoyz_bot
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Subscribe Popup */}
      {showSubscribePopup && (
        <div
          className="popup-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-md)',
          }}
          onClick={() => setShowSubscribePopup(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="title-md text-cyan mb-md">
              Подписка на канал
            </h3>

            <p className="text-secondary mb-lg" style={{ fontSize: '0.95rem' }}>
              Сейчас откроется канал <strong>@sashatoyz</strong>
            </p>

            <div style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '8px',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <p className="text-cyan" style={{ fontSize: '0.9rem', margin: 0 }}>
                👆 Нажмите «Подписаться» в канале,<br/>
                затем вернитесь назад — результат появится автоматически
              </p>
            </div>

            <button
              onClick={confirmOpenChannel}
              className="btn-neon mb-sm"
              style={{ width: '100%' }}
            >
              Открыть канал
            </button>

            <button
              onClick={() => setShowSubscribePopup(false)}
              className="btn-option"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
}
