import type { Metadata } from 'next';
import Script from 'next/script';

// Страница-анкета — клиентский компонент, метаданные объявить внутри нельзя,
// поэтому они живут в лейауте. Без этого заголовок наследуется от корневого
// («Диагностика контента») и всплывает в превью, когда Саша шарит ссылку.
export const metadata: Metadata = {
  title: 'Менторство by SASHA TOYZ',
  description: 'Работаю не со всеми, а с теми, кому действительно могу помочь.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Менторство by SASHA TOYZ',
    description: 'Работаю не со всеми, а с теми, кому действительно могу помочь.',
  },
};

export default function DwyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Meta Pixel (1054102467518764) — тот же счётчик, что на thesashatoyz.com.
          Анкета живёт на другом домене, и без пикселя здесь целевое действие
          рекламе не видно вообще: Lead шлёт сама страница после успешной отправки.
          Стоит именно в лейауте анкеты, а не в корневом: корневой обслуживает и
          кабинет внутри Telegram, туда счётчик Meta не нужен. */}
      <Script id="meta-pixel-dwy" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1054102467518764');fbq('track','PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=1054102467518764&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {children}
    </>
  );
}
