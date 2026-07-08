'use client';

import { RadarDataPoint } from '@/data/chart-data';

export interface WeakPointsHighlightProps {
  data: RadarDataPoint[];
  accentColor: string;
  count?: number;
}

export function WeakPointsHighlight({ data, accentColor, count = 2 }: WeakPointsHighlightProps) {
  const sorted = [...data].sort((a, b) => a.value - b.value);
  const weakest = sorted.slice(0, count);

  const getBarColor = (value: number) => {
    if (value <= 15) return '#ff2a6d';
    if (value <= 30) return '#ff6b35';
    return accentColor;
  };

  return (
    <div className="weak-points">
      <div className="label mb-xs" style={{ fontSize: '0.7rem' }}>Слабые точки</div>
      {weakest.map((point) => (
        <div key={point.category} className="weak-point-bar">
          <span className="weak-point-label">{point.category}</span>
          <div className="weak-point-track">
            <div
              className="weak-point-fill"
              style={{
                width: `${point.value}%`,
                background: getBarColor(point.value),
                boxShadow: `0 0 8px ${getBarColor(point.value)}`,
              }}
            />
          </div>
          <span className="weak-point-value" style={{ color: getBarColor(point.value) }}>
            {point.value}%
          </span>
        </div>
      ))}
    </div>
  );
}
