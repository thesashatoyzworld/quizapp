'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { questions, calculateScores, determineResult, QuizResult } from '@/data/quiz';
import { useTelegram, CallbackData } from '@/hooks/useTelegram';

type QuizState = 'welcome' | 'quiz' | 'result-preview' | 'result';

export default function Home() {
  const [state, setState] = useState<QuizState>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [keyword, setKeyword] = useState('');
  const [keywordSubmitted, setKeywordSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const waitingForReturn = useRef(false);

  const { userId, sendCallback, isTelegramContext, webApp } = useTelegram();

  const CHANNEL_URL = 'https://t.me/sashatoyz';

  const handleStart = () => {
    setState('quiz');
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const scores = calculateScores(newAnswers);
      const quizResult = determineResult(newAnswers, scores);
      setResult(quizResult);
      setState('result-preview');
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
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (data.subscribed) {
        setState('result');
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
  }, [userId]);

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

    // Открываем канал
    if (webApp && isTelegramContext) {
      webApp.openTelegramLink(CHANNEL_URL);
    } else {
      window.open(CHANNEL_URL, '_blank');
    }
  };

  const handleKeywordSubmit = async () => {
    if (keyword.toUpperCase() !== result?.keyword || !result) {
      return;
    }

    setIsSubmitting(true);

    const callbackData: CallbackData = {
      user_id: userId,
      result_id: result.id,
      stage: result.stage,
      keyword: keyword.toUpperCase(),
      timestamp: Date.now(),
    };

    const success = await sendCallback(callbackData);

    if (success) {
      setKeywordSubmitted(true);
    }

    setIsSubmitting(false);
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

          {/* ==================== RESULT SCREEN ==================== */}
          {state === 'result' && result && (
            <div key="result">
              <div className="mb-md animate-1">
                <span className="label">📊 Диагностика готова</span>
              </div>

              <div className="card mb-lg animate-2">
                {/* Result Header */}
                <div className="text-center mb-lg">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Этап {result.stage}
                  </span>
                  <h2 className="title-lg text-magenta" style={{ marginTop: 'var(--space-xs)', marginBottom: 0 }}>
                    «{result.title}»
                  </h2>
                </div>

                {/* Description */}
                <div className="mb-lg">
                  <h3 className="label mb-xs">Что происходит:</h3>
                  <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>
                    {result.description}
                  </p>
                </div>

                {/* Financials */}
                <div className="mb-lg">
                  <h3 className="label mb-xs">Финансы:</h3>
                  <p className="text-danger" style={{ whiteSpace: 'pre-line' }}>
                    {result.financials}
                  </p>
                </div>

                {/* Reason */}
                <div className="mb-lg">
                  <h3 className="label mb-xs">Почему:</h3>
                  <p className="text-secondary">
                    {result.reason}
                  </p>
                </div>

                {/* Is Normal */}
                <div className="mb-lg">
                  <h3 className="label mb-xs">Это нормально?</h3>
                  <p className="text-success">
                    {result.isNormal}
                  </p>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="label mb-xs">➡️ Подробный разбор:</h3>
                  <ul className="text-secondary space-y-sm">
                    {result.nextSteps.map((step, i) => (
                      <li key={i}>• {step}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Keyword Input */}
              {!keywordSubmitted ? (
                <div className="text-center animate-3">
                  <p className="subtitle mb-lg">
                    Чтобы получить подробный разбор, напишите ключевое слово:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-md">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder={result.keyword}
                      className="input-neon"
                    />
                    <button
                      onClick={handleKeywordSubmit}
                      className="btn-neon"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Напишите «{result.keyword}»
                  </p>
                </div>
              ) : (
                <div className="text-center animate-fadeIn">
                  <div className="card card-success">
                    <p className="font-display text-success mb-xs" style={{ textAlign: 'center' }}>
                      ✓ Отлично! Ваш запрос отправлен.
                    </p>
                    <p className="text-secondary" style={{ textAlign: 'center' }}>
                      Подробный разбор будет отправлен вам в Telegram.
                    </p>
                  </div>
                </div>
              )}
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
