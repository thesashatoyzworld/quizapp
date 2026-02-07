'use client';

import React from 'react';

export interface ResultHeaderProps {
  title: string;
  subtitle: string;
  pdfUrl: string;
  pdfFilename: string;
  accentColor?: string;
}

export function ResultHeader({
  title,
  subtitle,
  pdfUrl,
  pdfFilename,
  accentColor = 'var(--neon-magenta)',
}: ResultHeaderProps) {
  return (
    <div className="result-header">
      <h1 className="title-xl" style={{ color: accentColor }}>
        {title}
      </h1>
      <p className="subtitle">{subtitle}</p>
      <a
        href={pdfUrl}
        download={pdfFilename}
        className="btn-download"
      >
        📥 Скачать PDF с результатами
      </a>
    </div>
  );
}
