// «Студия»: personal keys and the studio_session cookie. Pure node crypto,
// no next/headers, so it is testable and usable from route handlers and MCP.
//
// STUDIO_KEYS="danya:<secret>,sasha:<secret>". The same key opens /studio
// (via /studio/enter?k=…) and is the MCP bearer token.

import { createHash, createHmac, timingSafeEqual } from 'crypto';
import type { Actor } from './view';

export const STUDIO_COOKIE = 'studio_session';
const SESSION_DAYS = 90;
const ACTORS: Actor[] = ['sasha', 'danya'];

const sha = (s: string) => createHash('sha256').update(s).digest();

function parseKeys(env: string | undefined): Map<Actor, string> {
  const out = new Map<Actor, string>();
  for (const part of (env ?? '').split(',')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    const name = part.slice(0, i).trim() as Actor;
    const secret = part.slice(i + 1).trim();
    if (ACTORS.includes(name) && secret.length >= 16) out.set(name, secret);
  }
  return out;
}

/** Who owns this key, or null. Compares sha256 digests in constant time. */
export function actorForKey(key: string | null | undefined, env = process.env.STUDIO_KEYS): Actor | null {
  if (!key) return null;
  const given = sha(key);
  let found: Actor | null = null;
  for (const [name, secret] of parseKeys(env)) {
    if (timingSafeEqual(given, sha(secret))) found = name;
  }
  return found;
}

// The cookie is signed with the owner's key, so rotating a key logs that person out.
function sign(payload: string, actor: Actor, env: string | undefined): string | null {
  const secret = parseKeys(env).get(actor);
  return secret ? createHmac('sha256', secret).update(payload).digest('base64url') : null;
}

export function createStudioSession(actor: Actor, env = process.env.STUDIO_KEYS, now = Date.now()): string | null {
  const payload = Buffer.from(JSON.stringify({ a: actor, exp: now + SESSION_DAYS * 864e5 })).toString('base64url');
  const sig = sign(payload, actor, env);
  return sig ? `${payload}.${sig}` : null;
}

export function verifyStudioSession(token: string | null | undefined, env = process.env.STUDIO_KEYS, now = Date.now()): Actor | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { a: Actor; exp: number };
    if (!ACTORS.includes(data.a) || !(data.exp > now)) return null;
    const expected = sign(payload, data.a, env);
    if (!expected || expected.length !== sig.length) return null;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? data.a : null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_DAYS * 86400;
