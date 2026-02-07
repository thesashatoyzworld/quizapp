'use client';

import { LevelData } from '@/data/chart-data';

interface LevelPathProps {
  levelData: LevelData;
  accentColor?: string;
}

export function LevelPath({ levelData, accentColor = '#00f0ff' }: LevelPathProps) {
  const { level: currentLevel, allLevels } = levelData;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Ваш путь эксперта</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px 0',
        }}
      >
        {allLevels.map((lvl, index) => {
          const isCurrent = lvl.level === currentLevel;
          const isPast = lvl.level < currentLevel;
          const isFuture = lvl.level > currentLevel;

          return (
            <div
              key={lvl.level}
              className="level-path-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                opacity: isFuture ? 0.5 : 1,
              }}
            >
              {/* Level circle */}
              <div
                className={`level-node ${isCurrent ? 'level-node-current' : ''}`}
                style={{
                  flexShrink: 0,
                  width: isCurrent ? '32px' : '24px',
                  height: isCurrent ? '32px' : '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: isCurrent ? '1rem' : '0.85rem',
                  fontWeight: 'bold',
                  background: isCurrent
                    ? accentColor
                    : isPast
                    ? `${accentColor}66`
                    : 'transparent',
                  border: isFuture ? `2px solid ${accentColor}40` : 'none',
                  color: isCurrent || isPast ? '#0a0612' : accentColor,
                  boxShadow: isCurrent
                    ? `0 0 20px ${accentColor}, 0 0 40px ${accentColor}80`
                    : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {lvl.level}
              </div>

              {/* Level name */}
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isCurrent ? '1rem' : '0.9rem',
                  color: isCurrent ? '#fff' : isPast ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                }}
              >
                {lvl.name}
              </div>

              {/* Connector line (after each except last) */}
              {index < allLevels.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: isCurrent ? '16px' : '12px',
                    top: isCurrent ? '48px' : '40px',
                    width: '2px',
                    height: '24px',
                    background:
                      lvl.level < currentLevel
                        ? `${accentColor}66`
                        : `${accentColor}20`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
