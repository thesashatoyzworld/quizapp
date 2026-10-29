// Optimizator ladder, "own" references: the student's recent reels with play counts
// (HikerAPI) and their speech (ElevenLabs Scribe), cached per Instagram username in
// optimizator_refs and refreshed at most weekly. Server only. Never throws.
//
// Endpoints as in GSD-BRAND clients/sasha/kallaway/pool (hk.py, collect.py):
// /v1/user/by/username → pk, then /v2/user/clips pages (the Reels tab). Scribe as in
// reels-optimizer prompts/kallaway/fresh/fetch.py (scribe_v1), but the video is sent
// straight to Scribe: no ffmpeg on Vercel, and Scribe takes mp4.
import { prisma } from '@/lib/prisma';
import { LADDER_MIN_OWN, LADDER_REFS } from './config';

const HIKER = 'https://api.hikerapi.com';
const SCRIBE = 'https://api.elevenlabs.io/v1/speech-to-text';
const REFRESH_DAYS = 7;
/** A reel younger than this has not finished collecting views. */
const MIN_AGE_DAYS = 7;
const MAX_PAGES = 3;
/** Reels for the median plays (and the pool the 8 refs are taken from). */
const POOL = 30;
const MIN_WORDS = 20;

export type OwnRef = {
  code: string;
  taken_at: number;
  plays: number;
  ratio: number;
  outcome: 'hit' | 'norm' | 'flop';
  text: string;
};

export type OwnRefs = {
  status: 'ok' | 'private' | 'not_found' | 'few' | 'error';
  median: number | null;
  refs: OwnRef[];
};

/** Both keys are needed; without them the ladder uses expert anchors. */
export function ownRefsAvailable(): boolean {
  return Boolean(process.env.HIKERAPI_KEY && process.env.ELEVENLABS_API_KEY);
}

async function hiker(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const url = `${HIKER}${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, {
    headers: { 'x-access-key': process.env.HIKERAPI_KEY!, accept: 'application/json' },
    signal: AbortSignal.timeout(25_000),
  });
  if (res.status === 404) return {};
  if (!res.ok) throw new Error(`hikerapi ${path} ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

type Media = {
  code?: string;
  media_type?: number;
  play_count?: number | null;
  ig_play_count?: number | null;
  taken_at?: number;
  '1ltaken_at'?: number;
  video_versions?: { url: string }[];
  like_and_view_counts_disabled?: boolean;
};

/** Speech of one reel, or null (no speech, download or Scribe failed). */
async function transcribe(videoUrl: string, code: string): Promise<string | null> {
  try {
    const vid = await fetch(videoUrl, { signal: AbortSignal.timeout(40_000) });
    if (!vid.ok) return null;
    const form = new FormData();
    form.append('model_id', 'scribe_v1');
    form.append('tag_audio_events', 'false');
    form.append('file', new Blob([await vid.arrayBuffer()], { type: 'video/mp4' }), `${code}.mp4`);
    const res = await fetch(SCRIBE, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! },
      body: form,
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) {
      console.error('[optimizator/refs] scribe', code, res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const text = String(((await res.json()) as { text?: string }).text || '').trim();
    return text.split(/\s+/).length >= MIN_WORDS ? text : null;
  } catch (err) {
    console.error('[optimizator/refs] transcribe', code, String((err as Error)?.message || err).slice(0, 200));
    return null;
  }
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function fetchFresh(username: string): Promise<OwnRefs> {
  const user = (await hiker('/v1/user/by/username', { username })) as { pk?: string | number; is_private?: boolean };
  if (!user.pk) return { status: 'not_found', median: null, refs: [] };
  if (user.is_private) return { status: 'private', median: null, refs: [] };

  const now = Date.now() / 1000;
  const reels = new Map<string, { code: string; taken_at: number; plays: number; video: string }>();
  let next: string | undefined;
  // The Reels tab, not the feed: an account that posts mostly carousels has no reels
  // in the first feed pages (Sasha's feed, 29.10). Items come as {media} or bare.
  for (let page = 0; page < MAX_PAGES; page++) {
    const d = (await hiker('/v2/user/clips', { user_id: String(user.pk), ...(next ? { page_id: next } : {}) })) as {
      response?: { items?: ({ media?: Media } & Media)[] };
      items?: ({ media?: Media } & Media)[];
      next_page_id?: string;
    };
    const items = d.response?.items || d.items || [];
    for (const it of items) {
      const i: Media = it.media ?? it;
      const taken = Number(i.taken_at || i['1ltaken_at'] || 0);
      const plays = Number(i.play_count ?? i.ig_play_count ?? 0);
      const video = i.video_versions?.[0]?.url;
      if (i.media_type !== 2 || !i.code || !video || !plays || !taken || i.like_and_view_counts_disabled) continue;
      if (now - taken < MIN_AGE_DAYS * 86400) continue;
      reels.set(i.code, { code: i.code, taken_at: taken, plays, video });
    }
    if (page === 0 && items.length && !reels.size) {
      console.error('[optimizator/refs] no usable reels on page 1, item keys:', Object.keys(items[0]).slice(0, 30).join(','));
    }
    next = d.next_page_id;
    if (!next || !items.length || reels.size >= POOL) break;
  }
  const pool = [...reels.values()].sort((a, b) => b.taken_at - a.taken_at).slice(0, POOL);
  if (!pool.length) return { status: 'few', median: null, refs: [] };
  const med = median(pool.map((r) => r.plays));

  // Most recent first; one Scribe call per reel, all at once.
  const cand = pool.slice(0, LADDER_REFS);
  const texts = await Promise.all(cand.map((r) => transcribe(r.video, r.code)));
  const refs: OwnRef[] = [];
  cand.forEach((r, i) => {
    const text = texts[i];
    if (!text) return;
    const ratio = Math.round((r.plays / med) * 100) / 100;
    refs.push({
      code: r.code, taken_at: r.taken_at, plays: r.plays, ratio, text,
      outcome: ratio >= 2 ? 'hit' : ratio <= 0.5 ? 'flop' : 'norm',
    });
  });
  return { status: refs.length >= LADDER_MIN_OWN ? 'ok' : 'few', median: Math.round(med), refs };
}

/** The student's own references: from the weekly cache, or fetched and transcribed now. */
export async function getOwnRefs(username: string): Promise<OwnRefs> {
  try {
    const cached = await prisma.$queryRaw<{ status: string; median_plays: number | null; refs: OwnRef[] }[]>`
      SELECT status, median_plays, refs FROM optimizator_refs
       WHERE username = ${username} AND fetched_at > now() - make_interval(days => ${REFRESH_DAYS}::int)`;
    if (cached.length) {
      const c = cached[0];
      return { status: c.status as OwnRefs['status'], median: c.median_plays, refs: c.refs || [] };
    }
  } catch (err) {
    console.error('[optimizator/refs] cache read', err);
  }
  if (!ownRefsAvailable()) return { status: 'error', median: null, refs: [] };

  let got: OwnRefs;
  try {
    got = await fetchFresh(username);
  } catch (err) {
    console.error('[optimizator/refs] fetch', username, String((err as Error)?.message || err).slice(0, 200));
    // Not cached: a HikerAPI hiccup must not block the next try for a week.
    return { status: 'error', median: null, refs: [] };
  }
  try {
    await prisma.$executeRaw`
      INSERT INTO optimizator_refs (username, fetched_at, status, median_plays, refs)
      VALUES (${username}, now(), ${got.status}, ${got.median}, ${JSON.stringify(got.refs)}::jsonb)
      ON CONFLICT (username) DO UPDATE
        SET fetched_at = now(), status = EXCLUDED.status, median_plays = EXCLUDED.median_plays, refs = EXCLUDED.refs`;
  } catch (err) {
    console.error('[optimizator/refs] cache write', err);
  }
  return got;
}
