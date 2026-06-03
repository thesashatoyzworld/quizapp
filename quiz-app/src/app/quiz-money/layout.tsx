import type { Metadata } from "next";

// Переопределяет дефолтный title/OG из root layout (был «Диагностика контента»),
// чтобы при шеринге ссылки на квиз превью было про деньги. Тексты — с welcome-экрана (голос Саши).
export const metadata: Metadata = {
  title: "Разрешение быстрых денег — квиз",
  description: "Посмотрим, что мешает тебе получать деньги. В конце — твой денежный блок и что за ним стоит.",
  openGraph: {
    title: "Посмотрим, что мешает тебе получать деньги",
    description: "Короткий квиз. В конце — твой денежный блок и что за ним стоит.",
    type: "website",
    url: "https://quiz.thesashatoyz.com/quiz-money",
    siteName: "Саша Toyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Посмотрим, что мешает тебе получать деньги",
    description: "Короткий квиз. В конце — твой денежный блок и что за ним стоит.",
  },
};

export default function QuizMoneyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
