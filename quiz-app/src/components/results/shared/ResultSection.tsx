'use client';

import React, { ReactNode } from 'react';

export interface ResultSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  slot?: ReactNode;
}

export function ResultSection({
  title,
  children,
  className = '',
  id,
  slot,
}: ResultSectionProps) {
  return (
    <div className={`card mb-lg ${className}`} id={id}>
      {title && <h2 className="section-title">{title}</h2>}
      {slot}
      {children}
    </div>
  );
}
