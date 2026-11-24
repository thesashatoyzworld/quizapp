// Instagram connect for the student cabinet (Meta app "SASHA TOYZ Stats").
// Facebook Login for Business, config "compatible with Instagram login":
// system user token (never expires), instagram_basic + instagram_manage_insights.
// A t2/t3 student connects once, the server then reads their reels stats.
//
// ⚠ Never log or store Graph responses wholesale: paging URLs embed the token.

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifiedViewer } from '@/lib/reels/store';
import { tiersForTelegram } from '@/lib/kb/tier';
import { UNLIMITED_IDS } from '@/lib/optimizator/config';

export const GRAPH = 'https://graph.facebook.com/v25.0/';
const CONFIG_ID = process.env.STATS_LOGIN_CONFIG_ID || '2256834715048469';
export const REDIRECT_URI = process.env.STATS_REDIRECT_URI || 'https://thesashatoyz.com/api/cabinet/instagram/callback';
const STATE_TTL_MS = 15 * 60 * 1000;

function app() {
  const id = process.env.STATS_APP_ID;
  const secret = process.env.STATS_APP_SECRET;
  if (!id || !secret) throw new Error('STATS_APP_ID / STATS_APP_SECRET not set');
  return { id, secret };
}

/**
 * Until Meta App Review passes only app admins can log in, so students must not see
 * the block: everything is Sasha-only unless STATS_IG_PUBLIC=1.
 */
const IG_PUBLIC = process.env.STATS_IG_PUBLIC === '1';

/** Fixed demo account for Meta App Review reviewers (entry: /api/cabinet/instagram/review). */
export function isReviewId(id: number): boolean {
  const demo = Number(process.env.STATS_REVIEW_TG_ID || 0);
  return demo > 0 && id === demo;
}

/** Telegram id of a viewer allowed to connect: Sasha; with STATS_IG_PUBLIC=1 also tariff 2 or 3 of «Новый уровень». */
export async function igViewer(request: NextRequest): Promise<{ id: number | null; allowed: boolean }> {
  const id = verifiedViewer(request);
  if (!id) return { id: null, allowed: false };
  if (UNLIMITED_IDS.has(id) || isReviewId(id)) return { id, allowed: true };
  if (!IG_PUBLIC) return { id, allowed: false };
  const tiers = await tiersForTelegram(id);
  return { id, allowed: (tiers.uroven ?? 0) >= 2 };
}

// ─── state: "<telegramId>.<expiresMs>.<nonce>.<hmac>" ───

const sign = (s: string) => createHmac('sha256', app().secret).update(s).digest('base64url');

export function makeState(telegramId: number): string {
  const body = `${telegramId}.${Date.now() + STATE_TTL_MS}.${randomBytes(8).toString('hex')}`;
  return `${body}.${sign(body)}`;
}

export function readState(state: string | null): number | null {
  const parts = (state || '').split('.');
  if (parts.length !== 4) return null;
  const body = parts.slice(0, 3).join('.');
  const a = Buffer.from(parts[3]);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(parts[1]) < Date.now()) return null;
  const id = Number(parts[0]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function loginUrl(telegramId: number): string {
  const q = new URLSearchParams({
    client_id: app().id,
    config_id: CONFIG_ID,
    display: 'popup',
    override_default_response_type: 'true',
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    state: makeState(telegramId),
    prompt: 'login',
  });
  return `https://www.facebook.com/dialog/oauth?${q}`;
}

// ─── Graph calls ───

export class GraphError extends Error {
  constructor(message: string, public code?: number) { super(message); }
}

/** Removes the token (and any access_token=... in paging urls) before logging. */
export function redact(v: unknown, token?: string): string {
  let s = typeof v === 'string' ? v : JSON.stringify(v);
  if (token) s = s.split(token).join('***');
  return s.replace(/access_token=[^&"\s]+/g, 'access_token=***').slice(0, 2000);
}

async function graph<T>(path: string, params: Record<string, string>, token: string): Promise<T> {
  const url = `${GRAPH}${path}?${new URLSearchParams({ ...params, access_token: token })}`;
  const res = await fetch(url, { cache: 'no-store' });
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } } & T;
  if (!res.ok || body.error) {
    throw new GraphError(`${path.split('?')[0]}: ${redact(String(body.error?.message ?? res.status), token)}`, body.error?.code);
  }
  return body;
}

export async function exchangeCode(code: string): Promise<string> {
  const { id, secret } = app();
  const q = new URLSearchParams({ client_id: id, client_secret: secret, redirect_uri: REDIRECT_URI, code });
  const res = await fetch(`${GRAPH}oauth/access_token?${q}`, { cache: 'no-store' });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; error?: { message?: string } };
  if (!res.ok || !body.access_token) throw new GraphError(`oauth/access_token: ${redact(String(body.error?.message ?? res.status), secret)}`);
  return body.access_token;
}

export interface TokenInfo {
  type?: string;
  user_id?: string;
  expires_at?: number;
  scopes?: string[];
  granular_scopes?: { scope: string; target_ids?: string[] }[];
}

export async function debugToken(token: string): Promise<TokenInfo> {
  const { id, secret } = app();
  const r = await graph<{ data: TokenInfo }>('debug_token', { input_token: token }, `${id}|${secret}`);
  return r.data;
}

export interface IgAccount { id: string; username: string | null }

/**
 * Which Instagram professional account the student granted. Meta does not document
 * one listing call for system user tokens from Facebook Login for Business, so:
 *   1. debug_token granular_scopes: target_ids of instagram_basic are exactly the
 *      Instagram accounts picked in the consent screen;
 *   2. /me/assigned_instagram_accounts (accounts assigned to the system user);
 *   3. /me/accounts → Page-linked instagram_business_account (classic user token).
 * Each id is confirmed with GET /{id}?fields=username. Every step logs its raw,
 * token-free result for diagnosis.
 */
export async function discoverAccount(token: string, info: TokenInfo): Promise<IgAccount | null> {
  const log = (step: string, v: unknown) => console.log(`[ig-connect] ${step}`, redact(v, token));
  const confirm = async (id: string): Promise<IgAccount | null> => {
    try {
      const r = await graph<{ id: string; username?: string }>(id, { fields: 'id,username' }, token);
      return { id: r.id, username: r.username ?? null };
    } catch (e) { log(`confirm ${id} failed`, (e as Error).message); return null; }
  };

  const ids = (info.granular_scopes || [])
    .filter((g) => g.scope === 'instagram_basic' || g.scope === 'instagram_manage_insights')
    .flatMap((g) => g.target_ids || []);
  log('granular_scopes', info.granular_scopes ?? null);
  for (const id of [...new Set(ids)]) {
    const acc = await confirm(id);
    if (acc) return acc;
  }

  try {
    const r = await graph<{ data: { id: string; username?: string }[] }>('me/assigned_instagram_accounts', { fields: 'id,username' }, token);
    log('assigned_instagram_accounts', r);
    const a = r.data?.[0];
    if (a) return { id: a.id, username: a.username ?? null };
  } catch (e) { log('assigned_instagram_accounts failed', (e as Error).message); }

  try {
    const r = await graph<{ data: { instagram_business_account?: { id: string; username?: string } }[] }>(
      'me/accounts', { fields: 'instagram_business_account{id,username}' }, token);
    log('me/accounts', r);
    const a = r.data?.find((p) => p.instagram_business_account)?.instagram_business_account;
    if (a) return { id: a.id, username: a.username ?? null };
  } catch (e) { log('me/accounts failed', (e as Error).message); }

  return null;
}

// ─── stats ───

export const METRICS = ['views', 'reach', 'saved', 'shares', 'total_interactions'] as const;
type Metric = (typeof METRICS)[number];

export interface MediaStat {
  id: string;
  caption: string;
  permalink: string | null;
  timestamp: string;
  mediaType: string;
  productType: string | null;
  likes: number | null;
  comments: number | null;
  insights: Partial<Record<Metric, number>>;
}

/** All metrics in one call; if the batch fails, one by one so a missing metric does not lose the rest. */
async function insights(mediaId: string, token: string): Promise<Partial<Record<Metric, number>>> {
  type R = { data: { name: Metric; values?: { value: number }[]; total_value?: { value: number } }[] };
  const read = (r: R) => Object.fromEntries(r.data.map((m) => [m.name, m.values?.[0]?.value ?? m.total_value?.value ?? 0]));
  try {
    return read(await graph<R>(`${mediaId}/insights`, { metric: METRICS.join(',') }, token));
  } catch (e) {
    if (e instanceof GraphError && e.code === 190) throw e;
    const out: Partial<Record<Metric, number>> = {};
    for (const m of METRICS) {
      try { Object.assign(out, read(await graph<R>(`${mediaId}/insights`, { metric: m }, token))); } catch { /* metric unavailable */ }
    }
    return out;
  }
}

/** Last ~25 posts of the connected account with their numbers. */
export async function fetchRecentMedia(igUserId: string, token: string, limit = 25): Promise<MediaStat[]> {
  type M = { id: string; caption?: string; permalink?: string; timestamp: string; media_type: string; media_product_type?: string; like_count?: number; comments_count?: number };
  const r = await graph<{ data: M[] }>(`${igUserId}/media`, {
    fields: 'id,caption,permalink,timestamp,media_type,media_product_type,like_count,comments_count',
    limit: String(limit),
  }, token);
  const out: MediaStat[] = [];
  // 5 at a time: 25 insights calls in parallel trip Graph rate limits.
  for (let i = 0; i < r.data.length; i += 5) {
    const chunk = r.data.slice(i, i + 5);
    const vals = await Promise.all(chunk.map((m) => insights(m.id, token)));
    chunk.forEach((m, j) => out.push({
      id: m.id,
      caption: (m.caption || '').slice(0, 300),
      permalink: m.permalink ?? null,
      timestamp: m.timestamp,
      mediaType: m.media_type,
      productType: m.media_product_type ?? null,
      likes: m.like_count ?? null,
      comments: m.comments_count ?? null,
      insights: vals[j],
    }));
  }
  return out;
}

// ─── Meta callbacks (data deletion, deauthorize) ───

/** Parses and verifies Meta's signed_request with the app secret. */
export function parseSignedRequest(signed: string | null): { user_id?: string } | null {
  const [sig, payload] = (signed || '').split('.');
  if (!sig || !payload) return null;
  const expected = createHmac('sha256', app().secret).update(payload).digest();
  const got = Buffer.from(sig, 'base64url');
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { algorithm?: string; user_id?: string };
    return data.algorithm?.toUpperCase() === 'HMAC-SHA256' ? data : null;
  } catch { return null; }
}

/** Deletes every connection of this Meta user (stored Meta user id or Instagram id). */
export async function deleteByMetaUser(userId: string): Promise<number> {
  const r = await prisma.instagramConnection.deleteMany({ where: { OR: [{ fbUserId: userId }, { igUserId: userId }] } });
  return r.count;
}
