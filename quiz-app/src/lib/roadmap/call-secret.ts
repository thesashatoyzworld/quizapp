import { timingSafeEqual } from 'crypto';

// Shared secret between the server pipeline (zoom-drainer) and the roadmap-calls
// endpoints. Unset secret = both endpoints closed.
export function callSecretOk(given: string | null): boolean {
  const secret = (process.env.ROADMAP_CALLS_SECRET || '').trim();
  if (!secret || !given) return false;
  // Compare byte lengths: a non-ASCII header of the same string length would make timingSafeEqual throw.
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
