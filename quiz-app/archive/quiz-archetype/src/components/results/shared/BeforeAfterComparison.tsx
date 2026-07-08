'use client';

import { RadarDataPoint, FinancialData } from '@/data/chart-data';

export interface BeforeAfterComparisonProps {
  radarData: RadarDataPoint[];
  financialData: FinancialData;
  accentColor: string;
}

export function BeforeAfterComparison({ radarData, financialData, accentColor }: BeforeAfterComparisonProps) {
  // Find 2 weakest radar dimensions (reuse logic from WeakPointsHighlight)
  const weakestDimensions = [...radarData]
    .sort((a, b) => a.value - b.value)
    .slice(0, 2);

  // Calculate projected improvement for weak dimensions
  const projectedDimensions = weakestDimensions.map(dim => ({
    ...dim,
    projectedValue: Math.min(95, dim.value + ((100 - dim.value) * 0.6))
  }));

  return (
    <div className="before-after-comparison">
      {/* СЕЙЧАС (Before) */}
      <div className="before-after-col before-after-col-before">
        <div className="before-after-heading" style={{ color: 'var(--danger)' }}>
          СЕЙЧАС
        </div>

        {projectedDimensions.map((dim, i) => (
          <div key={i} className="before-after-metric">
            <div className="before-after-metric-label">{dim.fullName}</div>
            <div className="before-after-metric-value" style={{ color: 'var(--danger)' }}>
              {dim.value}%
            </div>
          </div>
        ))}

        <div className="before-after-metric">
          <div className="before-after-metric-label">Доход от контента</div>
          <div className="before-after-metric-value" style={{ color: 'var(--danger)' }}>
            {financialData.currentIncome > 0 ? `${(financialData.currentIncome / 1000).toFixed(0)}K` : '0'}
          </div>
        </div>

        <div className="before-after-status" style={{ color: 'var(--danger)' }}>
          Потенциал не раскрыт
        </div>
      </div>

      {/* Divider with arrow */}
      <div className="before-after-divider">
        <div className="before-after-arrow">→</div>
      </div>

      {/* ПОСЛЕ МАСТЕР-КЛАССА (After) */}
      <div className="before-after-col before-after-col-after">
        <div className="before-after-heading" style={{ color: 'var(--success)' }}>
          ПОСЛЕ МАСТЕР-КЛАССА
        </div>

        {projectedDimensions.map((dim, i) => (
          <div key={i} className="before-after-metric">
            <div className="before-after-metric-label">{dim.fullName}</div>
            <div
              className="before-after-metric-value"
              style={{
                color: 'var(--success)',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.4)'
              }}
            >
              {Math.round(dim.projectedValue)}%
            </div>
          </div>
        ))}

        <div className="before-after-metric">
          <div className="before-after-metric-label">Потенциальный доход</div>
          <div
            className="before-after-metric-value"
            style={{
              color: 'var(--success)',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.4)'
            }}
          >
            {financialData.potentialIncome > 0
              ? `${(financialData.potentialIncome / 1000).toFixed(0)}K`
              : `${(financialData.lostPerMonth / 1000).toFixed(0)}K+`
            }
          </div>
        </div>

        <div
          className="before-after-status"
          style={{
            color: 'var(--success)',
            textShadow: '0 0 8px rgba(0, 255, 136, 0.3)'
          }}
        >
          Системный рост
        </div>
      </div>
    </div>
  );
}
