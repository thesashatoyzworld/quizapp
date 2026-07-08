'use client';

export interface GrowthMetricItem {
  label: string;
  value: string;
}

export interface GrowthMetricProps {
  before: GrowthMetricItem[];
  after: GrowthMetricItem[];
  multiplier?: string;
}

export function GrowthMetric({ before, after, multiplier }: GrowthMetricProps) {
  return (
    <div className="growth-metric">
      <div className="growth-metric-col growth-metric-col-before">
        <div className="growth-metric-heading" style={{ color: 'var(--danger)' }}>Было</div>
        {before.map((item, i) => (
          <div key={i} className="growth-metric-item">
            <span className="growth-metric-item-label">{item.label}</span>
            <span className="growth-metric-item-value" style={{ color: 'var(--text-muted)' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {multiplier && (
        <div className="growth-metric-badge">
          {multiplier}
        </div>
      )}

      <div className="growth-metric-col growth-metric-col-after">
        <div className="growth-metric-heading" style={{ color: 'var(--success)' }}>Стало</div>
        {after.map((item, i) => (
          <div key={i} className="growth-metric-item">
            <span className="growth-metric-item-label">{item.label}</span>
            <span
              className="growth-metric-item-value"
              style={{ color: 'var(--success)', textShadow: '0 0 10px rgba(0, 255, 136, 0.4)' }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
