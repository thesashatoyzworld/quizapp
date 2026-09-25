import { timingSafeEqual } from 'crypto';

// Shared secret between the server pipeline (zoom-drainer) and the roadmap-calls
// endpoints. Unset secret = both endpoints closed.
export function callSecretOk(given: string | null): boolean {
  const secret = (process.env.ROADMAP_CALLS_SECRET || '').trim();
  if (!secret || !given || given.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(secret));
}
