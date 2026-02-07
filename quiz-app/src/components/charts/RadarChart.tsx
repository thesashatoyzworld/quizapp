'use client';

import { RadarDataPoint } from '@/data/chart-data';

interface RadarChartProps {
  data: RadarDataPoint[];
  accentColor?: string;
}

export function RadarChart({ data, accentColor = '#00f0ff' }: RadarChartProps) {
  return (
    <div className="chart-container">
      <h3 className="chart-title">Профиль эксперта</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
        {data.map((item) => (
          <div key={item.category}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {item.fullName}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                color: accentColor,
              }}>
                {item.value}%
              </span>
            </div>
            <div style={{
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${item.value}%`,
                borderRadius: '3px',
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}60`,
                transition: 'width 1.5s ease-out',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
