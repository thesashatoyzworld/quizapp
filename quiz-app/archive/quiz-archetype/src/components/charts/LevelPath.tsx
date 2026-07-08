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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '8px 0' }}>
        {allLevels.map((lvl, index) => {
          const isCurrent = lvl.level === currentLevel;
          const isPast = lvl.level < currentLevel;
          const isFuture = lvl.level > currentLevel;

          return (
            <div key={lvl.level}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: isFuture ? 0.4 : 1,
                  padding: '6px 0',
                }}
              >
                {/* Level circle */}
                <div
                  className={isCurrent ? 'level-node-current' : ''}
                  style={{
                    flexShrink: 0,
                    width: isCurrent ? '32px' : '24px',
                    height: isCurrent ? '32px' : '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: isCurrent ? '0.9rem' : '0.75rem',
                    fontWeight: 'bold',
                    background: isCurrent
                      ? accentColor
                      : isPast
                      ? `${accentColor}66`
                      : 'transparent',
                    border: isFuture ? `2px solid ${accentColor}40` : `2px solid ${isPast ? accentColor + '66' : accentColor}`,
                    color: isCurrent || isPast ? '#0a0612' : `${accentColor}80`,
                    boxShadow: isCurrent
                      ? `0 0 15px ${accentColor}, 0 0 30px ${accentColor}60`
                      : 'none',
                    marginLeft: isCurrent ? '0px' : '4px',
                  }}
                >
                  {lvl.level}
                </div>

                {/* Level name */}
                <span
                  style={{
                    fontSize: isCurrent ? '0.9rem' : '0.8rem',
                    color: isCurrent ? '#fff' : isPast ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
                    fontWeight: isCurrent ? '600' : '400',
                  }}
                >
                  {lvl.name}
                </span>
              </div>

              {/* Connector line */}
              {index < allLevels.length - 1 && (
                <div style={{
                  marginLeft: isCurrent ? '15px' : '15px',
                  width: '2px',
                  height: '8px',
                  background: lvl.level < currentLevel
                    ? `${accentColor}50`
                    : `${accentColor}15`,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
