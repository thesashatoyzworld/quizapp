import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // База хуков — статическая страница в public/huki, отдаём по чистому адресу.
    return [{ source: "/huki", destination: "/huki/index.html" }];
  },
  // 08.11.2026: the root no longer redirects to /quiz-money. world.* root is the
  // cabinet door (middleware rewrites "/" to /dostup); the quiz stays reachable
  // directly at /quiz-money from the bot button.
};

export default nextConfig;
