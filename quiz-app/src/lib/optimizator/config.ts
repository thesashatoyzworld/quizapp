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

/**
 * Ladder: the script is compared pairwise with 8 reels of known outcome (the student's
 * own past reels, or expert reels on a close topic). Research (reels-optimizer
 * prompts/kallaway/pairs/ladder.py): experts, own reels 0.81 within author, topic
 * anchors 0.78, against ~0.70 for the absolute score. Off switch for the whole block.
 */
export const LADDER_ON = true;
/** Pairwise was measured on Opus; Sonnet drops to ~0.69. */
export const LADDER_MODEL = 'claude-opus-5-5';
export const LADDER_MAX_TOKENS = 32_000;
/** Reference reels per ladder (4 hits + 4 flops for anchors). */
export const LADDER_REFS = 8;
/** Below this many own reels with speech the ladder falls back to anchors. */
export const LADDER_MIN_OWN = 4;
/** Chars per text in a pair, as in ladder.py. */
export const LADDER_CUT = 2500;
/**
 * |mean signed confidence| over all 16 answers (-100..100) from which the place is
 * "confident". 25 ≈ 6 of 8 won in both orders at ~70; 5 of 8 at 70 gives 17.5 and
 * reads as "разница небольшая".
 */
export const LADDER_CONFIDENT = 25;
