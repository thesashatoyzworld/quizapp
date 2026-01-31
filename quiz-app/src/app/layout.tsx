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
      <body>
        {children}
      </body>
    </html>
  );
}
