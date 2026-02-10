'use client';

import React, { ReactNode } from 'react';

export interface ReasonBlockProps {
  number: number;
  title: string;
  quote: string;
  icon?: string;
  children: ReactNode;
}

export function ReasonBlock({
  number,
  title,
  quote,
  icon,
  children,
}: ReasonBlockProps) {
  return (
    <div className="reason-block mb-lg">
      <div className="reason-header">
        {icon && <span className="reason-icon">{icon}</span>}
        <h3 className="reason-title">{number}. {title}</h3>
      </div>
      <p className="text-muted mb-md">{quote}</p>
      {children}
    </div>
  );
}
