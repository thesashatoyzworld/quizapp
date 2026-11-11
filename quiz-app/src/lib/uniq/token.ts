// Server-only: the secret never reaches the browser. Do not import from 'use client' files.
//
// Token for the Уникализатор VPS (uniq.thesashatoyz.com). Format is fixed by the VPS:
//   base64url(JSON.stringify({uid, name?, exp})) + "." + base64url(HMAC_SHA256(payloadPart, UNIQ_SECRET))
// where payloadPart is the base64url string itself and exp is unix seconds.

import { createHmac, timingSafeEqual } from 'node:crypto';

export const UNIQ_TOKEN_TTL_S = 2 * 60 * 60;

// free: not a student, the VPS caps them at UNIQ_FREE_PER_DAY videos a day.
// bonus: friends credited (referral), each is one video past the daily cap; the VPS counts spent ones.
export type UniqPayload = { uid: string; name?: string; free?: boolean; bonus?: number; exp: number };

const b64u = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

export function signUniqToken(
  user: { uid: string | number; name?: string; free?: boolean; bonus?: number },
  secret: string,
  nowS: number = Math.floor(Date.now() / 1000),
): string {
  if (!secret) throw new Error('UNIQ_SECRET is not set');
  const payload: UniqPayload = { uid: String(user.uid), exp: nowS + UNIQ_TOKEN_TTL_S };
  if (user.name) payload.name = user.name;
  if (user.free) payload.free = true;
  if (user.bonus) payload.bonus = user.bonus;
  const p = b64u(JSON.stringify(payload));
  return `${p}.${b64u(createHmac('sha256', secret).update(p).digest())}`;
}

/** Mirror of the VPS check. Used by tests; returns null on any problem. */
export function verifyUniqToken(
  token: string,
  secret: string,
  nowS: number = Math.floor(Date.now() / 1000),
): UniqPayload | null {
  if (!token || !secret) return null;
  const [p, s, extra] = token.split('.');
  if (!p || !s || extra !== undefined) return null;
  const want = createHmac('sha256', secret).update(p).digest();
  const got = Buffer.from(s, 'base64url');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  let data: UniqPayload;
  try { data = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')); } catch { return null; }
  if (!data || typeof data.uid !== 'string' || !data.uid) return null;
  if (!(Number(data.exp) > nowS)) return null;
  return data;
}
