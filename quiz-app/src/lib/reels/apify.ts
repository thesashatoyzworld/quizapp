// Статистика рилсов через Apify (apify/instagram-scraper). Тариф бесплатный,
// поэтому все коды собираем в один запуск: и по кнопке, и в кроне.

import { prisma } from '@/lib/prisma';

const ACTOR_URL = 'https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items';
/** Секунд на запуск: функция живёт 300, оставляем запас на запись в базу. */
const RUN_TIMEOUT_SEC = 240;

export interface ReelStats {
  plays: number | null;
  likes: number | null;
  comments: number | null;
  timestamp: string | null;
}

interface ApifyItem {
  shortCode?: string;
  videoPlayCount?: number | null;
  videoViewCount?: number | null;
  likesCount?: number | null;
  commentsCount?: number | null;
  timestamp?: string | null;
  error?: string;
}

const num = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.round(n) : null);

/** Один запуск на все коды. Чего Apify не вернул, в ответе просто нет. */
export async function fetchReelStats(codes: string[]): Promise<Map<string, ReelStats>> {
  const out = new Map<string, ReelStats>();
  const unique = [...new Set(codes.filter(Boolean))];
  if (!unique.length) return out;

  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('нет APIFY_TOKEN');

  const res = await fetch(`${ACTOR_URL}?token=${encodeURIComponent(token)}&timeout=${RUN_TIMEOUT_SEC}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      directUrls: unique.map((c) => `https://www.instagram.com/reel/${c}/`),
      resultsType: 'posts',
      searchType: 'hashtag',
    }),
  });
  await recordRun(unique.length, res.ok);
  if (!res.ok) throw new Error(`apify ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const items = (await res.json()) as ApifyItem[];
  for (const it of Array.isArray(items) ? items : []) {
    if (!it.shortCode || it.error) continue;
    out.set(it.shortCode, {
      plays: num(it.videoPlayCount) ?? num(it.videoViewCount),
      likes: num(it.likesCount),
      comments: num(it.commentsCount),
      timestamp: it.timestamp ?? null,
    });
  }
  return out;
}

/** Запуск Apify в общий учёт расходов: сколько раз и сколько рилсов за день. */
async function recordRun(reels: number, ok: boolean) {
  const date = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  try {
    for (const [metric, value] of [['runs', 1], ['reels', reels]] as const) {
      await prisma.serviceUsageDaily.upsert({
        where: { service_date_metric: { service: 'apify', date, metric } },
        create: { service: 'apify', date, metric, value, source: 'computed', meta: { ok } },
        update: { value: { increment: value } },
      });
    }
  } catch (err) {
    console.error('[reels] запуск Apify не записался в расходы:', err);
  }
}
