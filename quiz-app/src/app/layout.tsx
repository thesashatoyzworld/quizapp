import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Диагностика контента | TheSasha",
  description: "Узнайте, на каком этапе пути вы находитесь и сколько денег теряете из-за неправильного контента",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* SDK Telegram грузим ПЕРВЫМ: синхронный скрипт после <link rel=stylesheet>
            ждёт эту таблицу стилей, а вместе с ним стоит и парсер — то есть <body>
            вообще не появляется, пока не ответит хост шрифтов. */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Шрифты грузятся НЕблокирующе: media="print" не подходит экрану, поэтому
            такая таблица не блокирует ни рендер, ни парсер. После загрузки скрипт
            ниже переключает media на "all". Если fonts.googleapis.com недоступен или
            тормозит (мобильный интернет без VPN) — страница всё равно рисуется
            системным шрифтом, а не висит белой. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
          media="print"
          data-swap-media="all"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var s=function(l){l.media=l.getAttribute('data-swap-media')};" +
              "document.querySelectorAll('link[data-swap-media]').forEach(function(l){" +
              "if(l.sheet)s(l);else l.addEventListener('load',function(){s(l)})})})()",
          }}
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap"
            rel="stylesheet"
          />
        </noscript>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
