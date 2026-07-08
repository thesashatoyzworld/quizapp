'use client';

export interface IncomeGapBarProps {
  currentRange: string;
  potentialRange: string;
  gap: string;
  currentPercent: number;
  potentialPercent: number;
}

export function IncomeGapBar({
  currentRange,
  potentialRange,
  gap,
  currentPercent,
  potentialPercent,
}: IncomeGapBarProps) {
  return (
    <div className="income-gap">
      <div className="income-gap-row">
        <span className="income-gap-label">Сейчас</span>
        <div className="income-gap-track">
          <div
            className="income-gap-fill"
            style={{
              width: `${currentPercent}%`,
              background: 'var(--danger)',
              boxShadow: '0 0 8px rgba(255, 42, 109, 0.5)',
            }}
          />
        </div>
        <span className="income-gap-amount" style={{ color: 'var(--danger)' }}>
          {currentRange}
        </span>
      </div>

      <div className="income-gap-row">
        <span className="income-gap-label">Потенциал</span>
        <div className="income-gap-track">
          <div
            className="income-gap-fill"
            style={{
              width: `${potentialPercent}%`,
              background: 'var(--success)',
              boxShadow: '0 0 8px rgba(0, 255, 136, 0.5)',
            }}
          />
        </div>
        <span className="income-gap-amount" style={{ color: 'var(--success)' }}>
          {potentialRange}
        </span>
      </div>

      <div className="income-gap-divider">
        <span style={{ color: 'var(--neon-cyan)' }}>Разница: </span>
        <strong style={{ color: 'var(--text-primary)' }}>{gap}</strong>
      </div>
    </div>
  );
}
