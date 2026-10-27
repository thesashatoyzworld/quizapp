// Optimizator limits and model. Sasha pays for every call, so runs are capped
// per calendar month by tariff of the `uroven` role.

/** Analyses per calendar month by tariff. */
export const MONTHLY_LIMIT: Record<number, number> = { 1: 10, 2: 30, 3: 100 };

/** Telegram ids without a limit (Sasha). */
export const UNLIMITED_IDS = new Set<number>([788334680]);

/** Effectively unlimited for the counter. */
export const UNLIMITED = 100_000;

export function limitFor(telegramId: number, tier: number): number {
  if (UNLIMITED_IDS.has(telegramId)) return UNLIMITED;
  if (tier < 1) return 0;
  return MONTHLY_LIMIT[Math.min(tier, 3)] ?? 0;
}

/** Tested model. Thinking is on by default; it needs max_tokens >= 20000 or the JSON gets cut. */
export const MODEL = 'claude-sonnet-5-5';
export const MAX_TOKENS = 24_000;

/** Calendar month key in Moscow time: YYYY-MM. */
export function monthKey(d = new Date()): string {
  const msk = new Date(d.getTime() + 3 * 3600 * 1000);
  return msk.toISOString().slice(0, 7);
}
