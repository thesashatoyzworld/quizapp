// «Студия»: pulls Sasha's posts and their numbers from the official Instagram
// Graph API (token = his long-lived user token, IG_INSIGHTS_TOKEN).
//
// Every run: posts of the last 30 days → one snapshot per post per UTC day,
// posts matched to items by shortcode, unknown posts become items (stage
// published, author api) so the schedule shows everything that came out.
//
// ⚠ Paging URLs embed the token: never log or store responses wholesale.

import { prisma } from '@/lib/prisma';
import { localDate } from './view';

const IG_USER = '17841458571811846';
const BASE = 'https://graph.facebook.com/v25.0/';
const WINDOW_DAYS = 30;
const REEL_METRICS = ['views', 'reach', 'saved', 'shares', 'comments', 'likes', 'reels_skip_rate', 'ig_reels_avg_watch_time'];
const FEED_METRICS = ['views', 'reach', 'saved', 'shares', 'comments', 'likes', 'follows', 'profile_visits'];

interface Media {
  id: string;
  shortcode: string;
  media_type: string;
  media_product_type: string;
  timestamp: string;
  caption?: string;
  permalink?: string;
  media_url?: string;
  thumbnail_url?: string;
}

function token(): string {
  const t = process.env.IG_INSIGHTS_TOKEN;
  if (!t) throw new Error('IG_INSIGHTS_TOKEN не задан');
  return t;
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const t = token();
  const url = `${BASE}${path}?${new URLSearchParams({ ...params, access_token: t })}`;
  const res = await fetch(url, { cache: 'no-store' });
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!res.ok || body.error) {
    throw new Error(`IG ${path.split('/').pop()}: ${String(body.error?.message ?? res.status).split(t).join('***')}`);
  }
  return body;
}

async function recentMedia(since: Date): Promise<Media[]> {
  const out: Media[] = [];
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const params: Record<string, string> = {
      fields: 'id,shortcode,media_type,media_product_type,timestamp,caption,permalink,media_url,thumbnail_url',
      limit: '50',
    };
    if (after) params.after = after;
    const res = await get<{ data: Media[]; paging?: { cursors?: { after?: string }; next?: string } }>(`${IG_USER}/media`, params);
    out.push(...res.data);
    const oldest = res.data.at(-1);
    after = res.paging?.cursors?.after;
    if (!oldest || new Date(oldest.timestamp) < since || !res.paging?.next) break;
  }
  return out.filter((m) => new Date(m.timestamp) >= since);
}

type Values = Record<string, number>;

/** All metrics in one call; if the batch fails, one by one so a single missing metric does not lose the rest. */
async function insights(mediaId: string, metrics: string[]): Promise<Values> {
  type R = { data: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] };
  const read = (r: R) => Object.fromEntries(r.data.map((m) => [m.name, m.values?.[0]?.value ?? m.total_value?.value ?? 0]));
  try {
    return read(await get<R>(`${mediaId}/insights`, { metric: metrics.join(',') }));
  } catch {
    const out: Values = {};
    for (const m of metrics) {
      try { Object.assign(out, read(await get<R>(`${mediaId}/insights`, { metric: m }))); } catch { /* metric unavailable */ }
    }
    return out;
  }
}

function titleFromCaption(caption: string | undefined, at: Date, isReel: boolean): string {
  const line = (caption ?? '').split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  if (!line) return `${isReel ? 'Рилс' : 'Пост'} от ${localDate(at).slice(8, 10)}.${localDate(at).slice(5, 7)}`;
  return line.length > 80 ? `${line.slice(0, 77).trimEnd()}…` : line;
}

const int = (v: number | undefined) => (typeof v === 'number' ? Math.round(v) : null);

export async function syncInstagram() {
  const now = new Date();
  const media = await recentMedia(new Date(now.getTime() - WINDOW_DAYS * 864e5));
  const items = await prisma.studioItem.findMany({
    where: { shortcode: { in: media.map((m) => m.shortcode) } },
    select: { id: true, shortcode: true, planDate: true, stage: true },
  });
  const byCode = new Map(items.map((i) => [i.shortcode as string, i]));

  let snapshots = 0, matched = 0, created = 0;
  const failed: string[] = [];
  const queue = [...media];
  async function worker() {
    for (let m = queue.shift(); m; m = queue.shift()) {
      const isReel = m.media_product_type === 'REELS';
      const at = new Date(m.timestamp);
      const pubDate = new Date(`${localDate(at)}T00:00:00Z`);
      const permalink = m.permalink ?? `https://www.instagram.com/${isReel ? 'reel' : 'p'}/${m.shortcode}/`;
      try {
        const known = byCode.get(m.shortcode);
        if (known) {
          await prisma.studioItem.update({
            where: { id: known.id },
            data: { mediaId: m.id, permalink, publishedAt: at, stage: 'published', planDate: pubDate },
          });
          matched++;
        } else {
          await prisma.studioItem.create({
            data: {
              kind: isReel ? 'reel' : 'carousel', title: titleFromCaption(m.caption, at, isReel), stage: 'published',
              planDate: pubDate, shortcode: m.shortcode, mediaId: m.id, permalink, publishedAt: at, author: 'api',
            },
          });
          created++;
        }

        const v = await insights(m.id, isReel ? REEL_METRICS : FEED_METRICS);
        const data = {
          mediaId: m.id, shortcode: m.shortcode, takenAt: now, ageHours: (now.getTime() - at.getTime()) / 3600_000,
          views: int(v.views), reach: int(v.reach), likes: int(v.likes), comments: int(v.comments),
          shares: int(v.shares), saved: int(v.saved), skipRate: v.reels_skip_rate ?? null,
          avgWatchMs: int(v.ig_reels_avg_watch_time), follows: isReel ? null : int(v.follows),
          profileVisits: isReel ? null : int(v.profile_visits),
        };
        // Warm the thumbnail cache: the list already carries a fresh preview URL
        // (an album's media_url is its first child), so the thumb route rarely calls Graph.
        const thumb = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url ?? m.thumbnail_url;
        if (thumb) {
          await prisma.studioThumb.upsert({
            where: { mediaId: m.id }, create: { mediaId: m.id, url: thumb, fetchedAt: now }, update: { url: thumb, fetchedAt: now },
          });
        }

        const id = `${m.id}-${now.toISOString().slice(0, 10)}`;
        await prisma.studioStat.upsert({ where: { id }, create: { id, ...data }, update: data });
        snapshots++;
      } catch (err) {
        failed.push(m.shortcode);
        console.error('[studio] sync failed for', m.shortcode, err instanceof Error ? err.message : 'unknown');
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  return { media: media.length, snapshots, matched, created, failed };
}

/**
 * A fresh preview URL for one post: reel/video → thumbnail_url, image →
 * media_url, carousel → its first child. IG CDN links are signed and expire,
 * so callers cache this for about a day only.
 */
export async function resolveThumb(mediaId: string): Promise<string | null> {
  type M = { media_type?: string; media_url?: string; thumbnail_url?: string };
  const pick = (m: M | undefined) => (m ? (m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url ?? m.thumbnail_url) ?? null : null);
  const m = await get<M>(mediaId, { fields: 'media_type,media_url,thumbnail_url' });
  if (m.media_type !== 'CAROUSEL_ALBUM') return pick(m);
  const kids = await get<{ data: M[] }>(`${mediaId}/children`, { fields: 'media_type,media_url,thumbnail_url' });
  return pick(kids.data[0]);
}
