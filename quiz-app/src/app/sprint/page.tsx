'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

const NEEDS_OPTIONS = [
  'Сайт с формой заявок',
  'Воронка и чат-бот',
  'Контент и карусели',
];

const SITE_OPTIONS = [
  'Нет',
  'Да, но не устраивает',
  'Да, устраивает',
];

const AI_OPTIONS = [
  'Нет',
  'ChatGPT/Claude в чате',
  'Пробовал кодить с AI',
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function SprintPage() {
  const { user } = useTelegram();

  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hasSite, setHasSite] = useState('');
  const [needs, setNeeds] = useState<string[]>([]);
  const [aiExperience, setAiExperience] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');

  // Pre-fill from Telegram user data
  useEffect(() => {
    if (user) {
      if (user.first_name && !name) {
        setName(user.first_name + (user.last_name ? ` ${user.last_name}` : ''));
      }
      if (user.username && !telegram) {
        setTelegram(`@${user.username}`);
      }
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleNeed = (need: string) => {
    setNeeds((prev) =>
      prev.includes(need)
        ? prev.filter((n) => n !== need)
        : [...prev, need]
    );
  };

  const isValid = name && telegram && occupation && hasSite && needs.length > 0 && aiExperience;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setFormState('submitting');

    try {
      const response = await fetch('/api/sprint-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.id?.toString() || null,
          name,
          telegram,
          occupation,
          hasSite,
          needs,
          aiExperience,
          source: 'telegram_miniapp',
        }),
      });

      if (response.ok) {
        setFormState('success');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  if (formState === 'success') {
    return (
      <div className="sprint-page">
        <div className="sprint-success">
          <div className="sprint-success-icon">&#x1F64C;</div>
          <h2 className="sprint-success-title">Спасибо!</h2>
          <p className="sprint-success-text">
            Скоро напишу тебе в Telegram
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sprint-page">
      {/* Hero */}
      <div className="sprint-hero">
        <h1 className="sprint-title">
          Спринт: собери digital&#8209;систему за&nbsp;день
        </h1>
        <p className="sprint-subtitle">
          Сайт, воронка, контент — за один интенсивный день вместе с AI.
          Оставь заявку, чтобы попасть в первый поток.
        </p>
      </div>

      {/* Form */}
      <form className="sprint-form" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="sprint-field">
          <label className="sprint-label" htmlFor="name">Имя</label>
          <input
            id="name"
            type="text"
            className="sprint-input"
            placeholder="Как тебя зовут"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Telegram */}
        <div className="sprint-field">
          <label className="sprint-label" htmlFor="telegram">Telegram</label>
          <input
            id="telegram"
            type="text"
            className="sprint-input"
            placeholder="@username или номер"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
        </div>

        {/* Occupation */}
        <div className="sprint-field">
          <label className="sprint-label" htmlFor="occupation">Чем занимаешься?</label>
          <textarea
            id="occupation"
            className="sprint-textarea"
            placeholder="Ниша, что продаёшь, чем помогаешь людям"
            rows={3}
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
        </div>

        {/* Has site */}
        <div className="sprint-field">
          <label className="sprint-label">Есть ли сайт сейчас?</label>
          <div className="sprint-select-group">
            {SITE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`sprint-select-btn ${hasSite === option ? 'active' : ''}`}
                onClick={() => setHasSite(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Needs */}
        <div className="sprint-field">
          <label className="sprint-label">Что нужнее всего?</label>
          <div className="sprint-checkbox-group">
            {NEEDS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`sprint-checkbox-btn ${needs.includes(option) ? 'active' : ''}`}
                onClick={() => toggleNeed(option)}
              >
                <span className="sprint-checkbox-indicator">
                  {needs.includes(option) ? '✓' : ''}
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* AI Experience */}
        <div className="sprint-field">
          <label className="sprint-label">Пользовался ли AI для работы?</label>
          <div className="sprint-select-group">
            {AI_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`sprint-select-btn ${aiExperience === option ? 'active' : ''}`}
                onClick={() => setAiExperience(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="sprint-submit"
          disabled={!isValid || formState === 'submitting'}
        >
          {formState === 'submitting' ? 'Отправляю...' : 'Оставить заявку'}
        </button>

        {formState === 'error' && (
          <p className="sprint-error">Что-то пошло не так. Попробуй ещё раз.</p>
        )}
      </form>
    </div>
  );
}
