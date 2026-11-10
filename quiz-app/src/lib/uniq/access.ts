// Who sees the Уникализатор tab while it is in beta. No DB here: imported by the rooms route.
//
// UNIQ_OPEN=1  → everyone (the paid lock is drawn by the cabinet and enforced by /api/cabinet/uniq)
// otherwise    → Sasha, tier 3 of «Новый уровень» (личка and group) and UNIQ_TESTERS (comma-separated Telegram ids)

export const UNIQ_ADMINS = new Set([788334680, 6013902004]);
/** Beta tab visibility: Sasha only, he checks it by hand before opening it to others. */
export const UNIQ_BETA_VIEWERS = new Set([788334680]);

export function uniqTesters(raw: string = process.env.UNIQ_TESTERS || ''): Set<number> {
  return new Set(raw.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0));
}

export function uniqTabVisible(
  telegramId: number | null,
  env: { open?: string; testers?: string } = { open: process.env.UNIQ_OPEN, testers: process.env.UNIQ_TESTERS },
  tiers: Record<string, number> = {},
): boolean {
  if (env.open === '1') return true;
  if (telegramId == null) return false;
  if ((tiers.uroven ?? 0) >= 3) return true;
  return UNIQ_BETA_VIEWERS.has(telegramId) || uniqTesters(env.testers || '').has(telegramId);
}

/** Paid access: course «Новый уровень» tier ≥ 1, admins always pass. */
export function uniqPaid(telegramId: number, tiers: Record<string, number>): boolean {
  return UNIQ_ADMINS.has(telegramId) || (tiers.uroven ?? 0) >= 1;
}
