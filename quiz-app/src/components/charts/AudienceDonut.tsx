'use client';

import { AudienceSegment } from '@/data/chart-data';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AudienceDonutProps {
  data: AudienceSegment[];
  accentColor?: string;
}

export function AudienceDonut({ data }: AudienceDonutProps) {
  // Find the largest segment for center label
  const largestSegment = data.reduce((max, segment) =>
    segment.value > max.value ? segment : max
  );

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="recharts-tooltip-custom">
          <div className="tooltip-label" style={{ color: data.color }}>
            {data.name}
          </div>
          <div className="tooltip-value">{data.value}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Состав аудитории</h3>

      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <defs>
              <filter id="donut-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              animationDuration={1500}
              animationEasing="ease-out"
              filter="url(#donut-glow)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            Аудитория
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: largestSegment.color,
              filter: 'drop-shadow(0 0 10px ' + largestSegment.color + ')',
            }}
          >
            {largestSegment.value}%
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              marginTop: '2px',
            }}
          >
            {largestSegment.name}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {data.map((segment, index) => (
          <div key={index} className="donut-legend-item">
            <div
              className="donut-legend-dot"
              style={{
                backgroundColor: segment.color,
                boxShadow: `0 0 8px ${segment.color}`,
              }}
            />
            <span style={{ flex: 1 }}>{segment.name}</span>
            <span className="donut-legend-pct">{segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
