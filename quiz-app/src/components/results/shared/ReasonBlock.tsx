'use client';

import React, { ReactNode } from 'react';

export interface ReasonBlockProps {
  number: number;
  title: string;
  quote: string;
  children: ReactNode;
}

export function ReasonBlock({
  number,
  title,
  quote,
  children,
}: ReasonBlockProps) {
  return (
    <div className="reason-block mb-lg">
      <h3 className="reason-title">{number}. {title}</h3>
      <p className="text-muted mb-md">{quote}</p>
      {children}
    </div>
  );
}
