import type { Metadata } from 'next';
import { Suspense } from 'react';
import './cabinet.css';
import { PreviewProvider } from './PreviewContext';
import PreviewBanner from './PreviewBanner';

export const metadata: Metadata = {
  title: 'Кабинет | TheSasha',
  description: 'Личный кабинет — материалы, события, рекомендации',
};

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <PreviewProvider>
        <div className="grid-bg" />
        <div className="scanlines" />
        <div className="glow-sphere glow-sphere-1" />
        <div className="glow-sphere glow-sphere-2" />
        <PreviewBanner />
        <div className="cabinet-page">
          <div className="cabinet-content">
            {children}
          </div>
        </div>
      </PreviewProvider>
    </Suspense>
  );
}
