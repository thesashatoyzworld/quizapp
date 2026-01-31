'use client';

import { useState } from 'react';
import { questions, calculateScores, determineResult, QuizResult } from '@/data/quiz';

type QuizState = 'welcome' | 'quiz' | 'result' | 'keyword';

export default function Home() {
  const [state, setState] = useState<QuizState>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [keyword, setKeyword] = useState('');
  const [keywordSubmitted, setKeywordSubmitted] = useState(false);

  const handleStart = () => {
    setState('quiz');
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const scores = calculateScores(newAnswers);
      const quizResult = determineResult(newAnswers, scores);
      setResult(quizResult);
      setState('result');
    }
  };

  const handleKeywordSubmit = () => {
    if (keyword.toUpperCase() === result?.keyword) {
      setKeywordSubmitted(true);
      // Here we would send callback to Telegram bot
      console.log('Callback data:', {
        result: result?.id,
        stage: result?.stage,
        keyword: keyword.toUpperCase(),
      });
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen grid-bg scanlines relative">
      {/* HUD Corners */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Welcome Screen */}
        {state === 'welcome' && (
          <div className="animate-fadeIn text-center py-16">
            <h1
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--neon-cyan)' }}
            >
              Диагностика контента
            </h1>

            <div className="text-left mb-8 space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Я помогу понять, почему ваш контент даёт текущие результаты и
                сколько вы не зарабатываете своих заслуженных денег.
              </p>
              <p>Сейчас проведу тест — 8 вопросов, отвечаете интуитивно.</p>
              <p>В конце:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Определим, на каком этапе пути вы находитесь</li>
                <li>Объясним, почему контент не привлекает клиентов</li>
                <li>Посмотрим финансовую картину</li>
                <li>Разберёмся, что делать дальше</li>
              </ul>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Тест работает на любой стадии — от 100 подписчиков до масштабных аудиторий.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="btn-neon animate-pulse-neon"
            >
              Поехали
            </button>
          </div>
        )}

        {/* Quiz Questions */}
        {state === 'quiz' && (
          <div className="animate-fadeIn py-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span
                  className="text-sm"
                  style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--neon-cyan)' }}
                >
                  Вопрос {currentQuestion + 1} из {questions.length}
                </span>
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
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
            <h2
              className="text-xl md:text-2xl mb-8"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              {questions[currentQuestion].text}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="btn-option flex items-start gap-4"
                >
                  <span
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border"
                    style={{
                      borderColor: 'var(--neon-purple)',
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '0.875rem'
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result Screen */}
        {state === 'result' && result && (
          <div className="animate-fadeIn py-8">
            <div
              className="text-center mb-6"
              style={{ color: 'var(--neon-cyan)' }}
            >
              <span style={{ fontFamily: 'Orbitron, sans-serif' }}>
                📊 ДИАГНОСТИКА ГОТОВА
              </span>
            </div>

            <div
              className="p-6 mb-6 rounded-lg"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--neon-purple)'
              }}
            >
              <div className="text-center mb-4">
                <span
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Этап {result.stage}
                </span>
                <h2
                  className="text-2xl md:text-3xl mt-2"
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    color: 'var(--neon-magenta)'
                  }}
                >
                  «{result.title}»
                </h2>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3
                  className="text-sm mb-2"
                  style={{ color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif' }}
                >
                  Что происходит:
                </h3>
                <p style={{ color: 'var(--text-secondary)' }} className="whitespace-pre-line">
                  {result.description}
                </p>
              </div>

              {/* Financials */}
              <div className="mb-6">
                <h3
                  className="text-sm mb-2"
                  style={{ color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif' }}
                >
                  Финансы:
                </h3>
                <p style={{ color: 'var(--danger)' }} className="whitespace-pre-line">
                  {result.financials}
                </p>
              </div>

              {/* Reason */}
              <div className="mb-6">
                <h3
                  className="text-sm mb-2"
                  style={{ color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif' }}
                >
                  Почему:
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {result.reason}
                </p>
              </div>

              {/* Is Normal */}
              <div className="mb-6">
                <h3
                  className="text-sm mb-2"
                  style={{ color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif' }}
                >
                  Это нормально?
                </h3>
                <p style={{ color: 'var(--success)' }}>
                  {result.isNormal}
                </p>
              </div>

              {/* Next Steps */}
              <div>
                <h3
                  className="text-sm mb-2"
                  style={{ color: 'var(--neon-cyan)', fontFamily: 'Orbitron, sans-serif' }}
                >
                  ➡️ Подробный разбор:
                </h3>
                <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {result.nextSteps.map((step, i) => (
                    <li key={i}>• {step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Keyword Input */}
            {!keywordSubmitted ? (
              <div className="text-center">
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Чтобы получить подробный разбор, напишите ключевое слово:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={result.keyword}
                    className="px-4 py-3 text-center uppercase tracking-widest w-full sm:w-auto"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '2px solid var(--neon-purple)',
                      color: 'var(--text-primary)',
                      fontFamily: 'Orbitron, sans-serif',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--neon-cyan)';
                      e.target.style.boxShadow = '0 0 15px var(--glow-cyan)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--neon-purple)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    onClick={handleKeywordSubmit}
                    className="btn-neon"
                  >
                    Отправить
                  </button>
                </div>
                <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Напишите «{result.keyword}»
                </p>
              </div>
            ) : (
              <div className="text-center animate-fadeIn">
                <div
                  className="p-6 rounded-lg"
                  style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid var(--success)'
                  }}
                >
                  <p style={{ color: 'var(--success)', fontFamily: 'Orbitron, sans-serif' }}>
                    ✓ Отлично! Ваш запрос отправлен.
                  </p>
                  <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Подробный разбор будет отправлен вам в Telegram.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
