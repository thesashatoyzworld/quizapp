'use client';

import { useState } from 'react';
import { questions, calculateScores, determineResult, QuizResult } from '@/data/quiz';
import { useTelegram, CallbackData } from '@/hooks/useTelegram';

type QuizState = 'welcome' | 'quiz' | 'result';

export default function Home() {
  const [state, setState] = useState<QuizState>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [keyword, setKeyword] = useState('');
  const [keywordSubmitted, setKeywordSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userId, sendCallback } = useTelegram();

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
      setState('result');
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
    </>
  );
}
