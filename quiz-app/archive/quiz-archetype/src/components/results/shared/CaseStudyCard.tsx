'use client';

import React, { ReactNode } from 'react';

export interface CaseStudyCardProps {
  type: 'positive' | 'negative';
  title: string;
  children: ReactNode;
}

export function CaseStudyCard({
  type,
  title,
  children,
}: CaseStudyCardProps) {
  const variantClass = type === 'negative' ? 'case-study-negative' : 'case-study-positive';

  return (
    <div className={`case-study ${variantClass}`}>
      <h3 className="case-title">{title}</h3>
      {children}
    </div>
  );
}
