// ─────────────────────────────────────────────────────────────
// Кто попадает в ветку «Поток Спроса».
//
// Два входа, и они не равны:
//   role 'potok'  — купил трипвайр за 1 490. Видит только эту ветку.
//   role 'uroven' — ученик курса, любой тариф. Метод входит в курс,
//                   поэтому ветка открыта и ему.
//
// Правило живёт здесь, а не в index.ts: тот файл генерируется скриптом
// potok-to-ts.mjs из файлов на рабочем столе и переписывается целиком.
// ─────────────────────────────────────────────────────────────

/** Собственная роль продукта: выдаётся при оплате 1 490 (CATALOG.potok_sprosa). */
export const POTOK_ROLE = 'potok';

/** Роль курса: открывает ветку с любого тарифа. */
export const COURSE_ROLE = 'uroven';
export const COURSE_MIN_TIER = 1;

export type PotokVia = 'potok' | 'uroven';

export interface AccessRow {
  role: string;
  productSlug: string;
}

/** Тариф зашит в productSlug суффиксом -t<N> (uroven-t1 / uroven-t2 / uroven-t3). */
function tierFromSlug(slug: string): number {
  const m = /-t(\d+)$/.exec(slug);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Решение о доступе к ветке по активным доступам человека.
 * `via` нужен странице: покупателю трипвайра показываем апсейл на курс,
 * ученику курса — нет, он уже внутри.
 */
export function resolvePotokAccess(rows: AccessRow[]): { allowed: boolean; via: PotokVia | null; tier: number } {
  if (rows.some((r) => r.role === POTOK_ROLE)) {
    return { allowed: true, via: 'potok', tier: 0 };
  }
  const tier = rows
    .filter((r) => r.role === COURSE_ROLE)
    .reduce((max, r) => Math.max(max, tierFromSlug(r.productSlug)), 0);
  if (tier >= COURSE_MIN_TIER) return { allowed: true, via: 'uroven', tier };
  return { allowed: false, via: null, tier: 0 };
}
