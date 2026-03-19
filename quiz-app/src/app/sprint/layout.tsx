import type { Metadata, Viewport } from "next";
import "./sprint.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Спринт — собери digital-систему за день | TheSasha",
  description: "Сайт, воронка, контент — за один интенсивный день вместе с AI",
};

export default function SprintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Unbounded:wght@400;700;900&display=swap"
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
