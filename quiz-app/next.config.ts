import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
