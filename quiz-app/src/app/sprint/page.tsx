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
          <h2 className="sprint-success-title">Заявка принята</h2>
          <p className="sprint-success-text">
            Напишу тебе в Telegram с деталями
          </p>
          <div className="sprint-success-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="sprint-page">
      {/* Hero */}
      <header className="sprint-hero">
        <span className="sprint-tag">29 марта</span>
        <h1 className="sprint-title">
          Собери digital&#8209;систему<br />
          за <span className="sprint-accent">один</span> день
        </h1>
        <p className="sprint-subtitle">
          Сайт, воронка, контент — всё за один интенсивный день вместе с&nbsp;AI. Не&nbsp;теория. Ты уйдёшь с работающей системой.
        </p>
      </header>

      {/* What you get */}
      <section className="sprint-details">
        <div className="sprint-insight-box">
          <span className="sprint-insight-label">Что ты соберёшь</span>
          <ul className="sprint-insight-list">
            <li><strong>Сайт</strong> с формой заявок — готовый к трафику</li>
            <li><strong>Воронку</strong> — от первого касания до оплаты</li>
            <li><strong>Контент</strong> — карусели и тексты под твой бренд</li>
          </ul>
        </div>

        <div className="sprint-meta-row">
          <div className="sprint-meta-item">
            <span className="sprint-meta-value">1</span>
            <span className="sprint-meta-label">день</span>
          </div>
          <div className="sprint-meta-item">
            <span className="sprint-meta-value">AI</span>
            <span className="sprint-meta-label">+ ведущий</span>
          </div>
          <div className="sprint-meta-item">
            <span className="sprint-meta-value">3</span>
            <span className="sprint-meta-label">результата</span>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="sprint-form-section">
        <h2 className="sprint-form-heading">Оставь заявку</h2>
        <form className="sprint-form" onSubmit={handleSubmit}>
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

          <div className="sprint-field">
            <label className="sprint-label" htmlFor="occupation">Чем занимаешься?</label>
            <textarea
              id="occupation"
              className="sprint-textarea"
              placeholder="Ниша, продукт, чем помогаешь людям"
              rows={3}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>

          <div className="sprint-field">
            <label className="sprint-label">Есть ли сайт сейчас?</label>
            <div className="sprint-select-group">
              {SITE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`sprint-select-btn${hasSite === option ? ' active' : ''}`}
                  onClick={() => setHasSite(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="sprint-field">
            <label className="sprint-label">Что нужнее всего?</label>
            <div className="sprint-checkbox-group">
              {NEEDS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`sprint-checkbox-btn${needs.includes(option) ? ' active' : ''}`}
                  onClick={() => toggleNeed(option)}
                >
                  <span className="sprint-checkbox-indicator">
                    {needs.includes(option) ? '\u2713' : ''}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="sprint-field">
            <label className="sprint-label">Опыт с AI?</label>
            <div className="sprint-select-group">
              {AI_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`sprint-select-btn${aiExperience === option ? ' active' : ''}`}
                  onClick={() => setAiExperience(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

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
      </section>
    </div>
  );
}
