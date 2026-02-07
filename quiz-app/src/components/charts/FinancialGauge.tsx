'use client';

import { FinancialData } from '@/data/chart-data';
import { useEffect, useRef, useState } from 'react';

interface FinancialGaugeProps {
  data: FinancialData;
  accentColor?: string;
}

export function FinancialGauge({ data, accentColor = '#ffd700' }: FinancialGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValue(Math.round(data.lostPerMonth * easeOut));

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
  }, [data.lostPerMonth]);

  const formatRubles = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">{data.label}</h3>

      <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: '700',
          color: accentColor,
          filter: `drop-shadow(0 0 12px ${accentColor}80)`,
          lineHeight: 1.2,
        }}>
          ~{formatRubles(animatedValue)}
        </div>
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginTop: '8px',
        }}>
          в месяц
        </div>
      </div>
    </div>
  );
}
