import type { Metadata } from 'next';

// Страница-анкета — клиентский компонент, метаданные объявить внутри нельзя,
// поэтому они живут в лейауте. Без этого заголовок наследуется от корневого
// («Диагностика контента») и всплывает в превью, когда Саша шарит ссылку.
export const metadata: Metadata = {
  title: 'Анкета',
  description: 'Работаю не со всеми, а с теми, кому действительно могу помочь.',
  robots: { index: false, follow: false },
};

export default function DwyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
