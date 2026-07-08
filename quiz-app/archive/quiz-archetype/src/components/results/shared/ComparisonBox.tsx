'use client';

import React from 'react';

export interface ComparisonItem {
  name: string;
  result: string;
  type: 'positive' | 'negative';
}

export interface ComparisonBoxProps {
  items: ComparisonItem[];
  label?: string;
}

export function ComparisonBox({ items, label }: ComparisonBoxProps) {
  return (
    <div className="comparison-box">
      {label && <h4 className="label mb-md text-center">{label}</h4>}
      <div className="comparison-grid">
        {items.map((item, index) => {
          const variantClass = item.type === 'negative'
            ? 'comparison-item-negative'
            : 'comparison-item-positive';

          return (
            <div key={index} className={`comparison-item ${variantClass}`}>
              <span className="comparison-name">{item.name}:</span>
              <span className="comparison-result">{item.result}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
