'use client';

import { useEffect } from 'react';

export interface AnalyzingLoaderProps {
  onComplete: () => void;
}

export function AnalyzingLoader({ onComplete }: AnalyzingLoaderProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="analyzing-loader">
      <div className="analyzing-content">
        <h2 className="analyzing-title">
          Анализирую ваши ответы...
        </h2>

        <div className="analyzing-progress">
          <div className="analyzing-progress-fill" />
        </div>

        <div className="analyzing-steps">
          <div className="analyzing-step analyzing-step-1">
            🔍 Обработка ответов...
          </div>
          <div className="analyzing-step analyzing-step-2">
            📊 Построение профиля...
          </div>
          <div className="analyzing-step analyzing-step-3">
            🎯 Подготовка диагностики...
          </div>
        </div>
      </div>
    </div>
  );
}
