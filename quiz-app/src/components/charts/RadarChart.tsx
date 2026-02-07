'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RadarDataPoint } from '@/data/chart-data';

interface RadarChartProps {
  data: RadarDataPoint[];
  accentColor?: string; // Default: '#00f0ff' (cyan)
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: 'rgba(10, 6, 18, 0.95)',
          border: '1px solid rgba(0, 240, 255, 0.5)',
          padding: '8px 12px',
          borderRadius: '4px',
        }}
      >
        <p
          style={{
            color: '#fff',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)',
            margin: 0,
          }}
        >
          {data.fullName}: {data.value}/100
        </p>
      </div>
    );
  }
  return null;
};

export function RadarChart({ data, accentColor = '#00f0ff' }: RadarChartProps) {
  // Category colors cycling through cyberpunk palette
  const categoryColors = ['#00f0ff', '#ff00aa', '#9d4edd', '#ffd700', '#00ff88'];

  return (
    <div className="chart-container">
      <h3 className="chart-title">Профиль эксперта</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsRadarChart data={data}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <PolarGrid stroke="rgba(157, 78, 221, 0.3)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: '#fff',
              fontSize: 11,
              fontFamily: 'var(--font-display)',
            }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Оценка"
            dataKey="value"
            stroke={accentColor}
            fill={accentColor}
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ fill: accentColor, r: 4 }}
            animationDuration={1500}
            animationEasing="ease-out"
            filter="url(#glow)"
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Score summary row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '16px',
          fontSize: '0.8rem',
        }}
      >
        {data.map((item, index) => (
          <div
            key={item.category}
            style={{
              color: categoryColors[index % categoryColors.length],
              fontFamily: 'var(--font-body)',
            }}
          >
            {item.category}:{' '}
            <span style={{ fontFamily: 'var(--font-display)' }}>
              {item.value}
            </span>
            /100
          </div>
        ))}
      </div>
    </div>
  );
}
