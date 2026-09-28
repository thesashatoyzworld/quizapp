import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // База хуков — статическая страница в public/huki, отдаём по чистому адресу.
    return [{ source: "/huki", destination: "/huki/index.html" }];
  },
  async redirects() {
    // Старый квиз «Диагностика контента» убран — корень ведёт на квиз денег.
    // Query (utm_source и пр.) Next прокидывает в destination автоматически.
    return [
      {
        source: "/",
        destination: "/quiz-money",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
