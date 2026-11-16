// Share links for a finished run: /optimizator?r=<id>.<sig>. Anyone with the link sees the
// analysis read-only, without logging in; only the owner's API response carries the link.
import crypto from 'node:crypto';

const SITE = 'https://world.thesashatoyz.com';

function sig(id: string): string {
  const secret = process.env.OPTIMIZATOR_SHARE_SECRET || process.env.BOT_TOKEN || '';
  return crypto.createHmac('sha256', `optimizator-share:${secret}`).update(id).digest('base64url').slice(0, 16);
}

export function shareToken(id: string): string {
  return `${id}.${sig(id)}`;
}

export function shareUrl(id: string): string {
  return `${SITE}/optimizator?r=${shareToken(id)}`;
}

/** The run id when the token is genuine, else null. */
export function readShareToken(token: string | null): string | null {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i <= 0) return null;
  const id = token.slice(0, i);
  const s = Buffer.from(token.slice(i + 1));
  const want = Buffer.from(sig(id));
  return s.length === want.length && crypto.timingSafeEqual(s, want) ? id : null;
}
