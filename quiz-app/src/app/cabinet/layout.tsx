import type { Metadata } from 'next';
import './cabinet.css';

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
    <>
      <div className="grid-bg" />
      <div className="scanlines" />
      <div className="glow-sphere glow-sphere-1" />
      <div className="glow-sphere glow-sphere-2" />
      <div className="cabinet-page">
        <div className="cabinet-content">
          {children}
        </div>
      </div>
    </>
  );
}
