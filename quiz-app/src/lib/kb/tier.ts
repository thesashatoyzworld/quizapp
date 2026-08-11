// Тариф спрашивающего и фильтр карты по доступу.
//
// Правило «тариф зашит в productSlug суффиксом -t<N>» до этого жило копиями
// в шести роутах кабинета. Здесь оно одно, роуты постепенно переезжают сюда.

import { getActiveAccessByTelegram } from '@/lib/access';

/** Тариф зашит в productSlug как суффикс -t<N> (uroven-t1 / uroven-t2 / uroven-t3). */
export function tierFromSlug(slug: string): number | null {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : null;
}

/** Максимальный активный тариф по каждой роли: { uroven: 2 }. */
export function computeTiers(rows: { role: string; productSlug: string }[]): Record<string, number> {
  const tiers: Record<string, number> = {};
  for (const r of rows) {
    const n = tierFromSlug(r.productSlug);
    if (n != null) tiers[r.role] = Math.max(tiers[r.role] ?? 0, n);
  }
  return tiers;
}

/** Тарифы человека по его Telegram id. Пустой объект = доступа нет. */
export async function tiersForTelegram(telegramId: number): Promise<Record<string, number>> {
  const rows = await getActiveAccessByTelegram(telegramId);
  return computeTiers(rows);
}
