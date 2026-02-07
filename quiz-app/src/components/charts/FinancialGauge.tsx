'use client';

import { FinancialData } from '@/data/chart-data';
import { useEffect, useRef, useState } from 'react';

interface FinancialGaugeProps {
  data: FinancialData;
  accentColor?: string;
}

export function FinancialGauge({ data, accentColor = '#ffd700' }: FinancialGaugeProps) {
  const [animatedCurrent, setAnimatedCurrent] = useState(0);
  const [animatedPotential, setAnimatedPotential] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  // Animated counter
  useEffect(() => {
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedCurrent(Math.round(data.currentIncome * easeOut));
      setAnimatedPotential(Math.round(data.potentialIncome * easeOut));

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [data.currentIncome, data.potentialIncome]);

  // Format rubles - compact for boxes
  const formatRubles = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1).replace('.0', '') + 'M ₽';
    }
    if (amount >= 1000) {
      return Math.round(amount / 1000) + 'K ₽';
    }
    return amount + ' ₽';
  };

  // Format rubles - full for center label
  const formatRublesFull = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  // Calculate gauge fill percentage
  const fillPercentage = Math.min((data.currentIncome / data.potentialIncome) * 100, 100);

  // SVG arc calculations (semicircular gauge)
  const size = 200;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle

  // Arc path (semicircle from left to right)
  const startAngle = 180;
  const endAngle = 0;

  const polarToCartesian = (angle: number) => {
    const angleRad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);

  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;

  // Filled arc strokeDasharray calculation
  const fillLength = (fillPercentage / 100) * circumference;
  const fillDasharray = `${fillLength} ${circumference}`;

  return (
    <div className="chart-container">
      <h3 className="chart-title">{data.label}</h3>

      <div className="gauge-wrapper">
        <svg viewBox={`0 0 ${size} 120`} className="gauge-svg">
          {/* Neon glow filter */}
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset={`${fillPercentage}%`} stopColor={accentColor} />
              <stop offset="100%" stopColor={accentColor} />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc with animation */}
          <path
            d={arcPath}
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={fillDasharray}
            strokeDashoffset="0"
            filter="url(#gauge-glow)"
            style={{
              transition: 'stroke-dasharray 1.5s ease-out',
            }}
          />

          {/* Center label */}
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            fill={accentColor}
            fontSize="20"
            fontFamily="var(--font-display)"
            fontWeight="700"
            filter="url(#gauge-glow)"
          >
            {formatRublesFull(animatedPotential)}
          </text>

          <text
            x={center}
            y={center + 15}
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="10"
            fontFamily="var(--font-display)"
            style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {data.label}
          </text>
        </svg>
      </div>

      <div className="gauge-metrics">
        <div className="gauge-metric-box">
          <div className="gauge-metric-label">Сейчас</div>
          <div className="gauge-metric-value">{formatRubles(animatedCurrent)}</div>
        </div>
        <div className="gauge-metric-box">
          <div className="gauge-metric-label">Потенциал</div>
          <div className="gauge-metric-value" style={{ color: accentColor }}>
            {formatRubles(animatedPotential)}
          </div>
        </div>
      </div>
    </div>
  );
}
