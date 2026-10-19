import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Сообщество | TheSasha' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
