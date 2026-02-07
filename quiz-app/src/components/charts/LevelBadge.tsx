'use client';

import { LevelData } from '@/data/chart-data';

interface LevelBadgeProps {
  levelData: LevelData;
  accentColor?: string;
}

export function LevelBadge({ levelData, accentColor = '#00f0ff' }: LevelBadgeProps) {
  return (
    <div
      className="level-badge"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(10, 6, 18, 0.9)',
        border: `2px solid ${accentColor}`,
        borderRadius: '8px',
        padding: '12px 24px',
        boxShadow: `0 0 20px ${accentColor}40, 0 0 40px ${accentColor}20`,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: accentColor,
        }}
      >
        Уровень
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: accentColor,
          textShadow: `0 0 20px ${accentColor}, 0 0 40px ${accentColor}80`,
          lineHeight: 1,
        }}
      >
        {levelData.level}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          color: '#fff',
        }}
      >
        {levelData.name}
      </div>
    </div>
  );
}
