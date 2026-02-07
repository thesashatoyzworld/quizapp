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
  return (
    <div className="chart-container">
      <h3 className="chart-title">Профиль эксперта</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RechartsRadarChart data={data} outerRadius="70%">
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
              fontSize: 10,
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

    </div>
  );
}
