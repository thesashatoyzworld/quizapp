'use client';

import { LevelData, FinancialData } from '@/data/chart-data';
import { LevelBadge } from '@/components/charts/LevelBadge';

export interface HeroSectionProps {
  userName?: string | null;
  userPhoto?: string | null;
  resultTitle: string;
  resultSubtitle: string;
  levelData: LevelData;
  financialData: FinancialData;
  accentColor: string;
  pdfUrl: string;
  pdfFilename: string;
}

export function HeroSection({
  userName,
  userPhoto,
  resultTitle,
  resultSubtitle,
  levelData,
  financialData,
  accentColor,
  pdfUrl,
  pdfFilename,
}: HeroSectionProps) {
  // Format financial number with thousands separators
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <div className="hero-section">
      {/* Greeting */}
      <div className="hero-greeting">
        {userName ? (
          <span>
            {userName}, ваш результат готов!
          </span>
        ) : (
          <span>Ваш результат готов!</span>
        )}
      </div>

      {/* Result Title */}
      <h1 className="title-xl" style={{ marginBottom: 'var(--space-lg)' }}>
        {resultTitle}
      </h1>

      {/* Subtitle */}
      <p className="subtitle" style={{ marginBottom: 'var(--space-xl)' }}>
        {resultSubtitle}
      </p>

      {/* Level Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
        <LevelBadge levelData={levelData} accentColor={accentColor} />
      </div>

      {/* Financial Impact Block */}
      <div className="hero-financial">
        <div className="hero-financial-label">
          {financialData.label}
        </div>
        <div className="hero-financial-amount" style={{ color: 'var(--danger)' }}>
          {formatNumber(financialData.lostPerMonth)}+<span className="hero-financial-suffix">&nbsp;₽</span>
        </div>
        <div className="hero-financial-label" style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          каждый месяц
        </div>
      </div>

      {/* PDF Download Link */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
        <a
          href={pdfUrl}
          download={pdfFilename}
          className="btn-download"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M8 12L3 7L4.4 5.6L7 8.2V0H9V8.2L11.6 5.6L13 7L8 12Z"
              fill="currentColor"
            />
            <path d="M0 14H16V16H0V14Z" fill="currentColor" />
          </svg>
          Скачать PDF
        </a>
      </div>
    </div>
  );
}
