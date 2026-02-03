import type { Metadata } from "next";
import "./globals.css";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
