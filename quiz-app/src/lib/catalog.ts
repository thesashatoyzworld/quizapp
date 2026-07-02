// ─────────────────────────────────────────────────────────────
// Единый каталог продуктов Саши.
//
// Источник правды для: цены, типа (разовый/подписка), роли в кабинете,
// срока доступа и привязки к подписке Продамуса. Раньше цены были
// захардкожены в payment.ts — теперь всё здесь.
//
// Доступ выдаётся вебхуком Продамуса по `order_id`, который начинается
// с `orderPrefix` (см. resolveProductByOrderId). Разовый продукт даёт
// бессрочный доступ (expiresAt = null), подписка — до даты (grantedAt + period).
// ─────────────────────────────────────────────────────────────

export type ProductType = 'one_time' | 'subscription';
export type AccessPeriod = 'week' | 'month';

export interface CatalogProduct {
  /** slug в БД (Product.slug, ProductAccess.productSlug) */
  slug: string;
  /** человекочитаемое имя (для Продамуса, уведомлений, кабинета) */
  name: string;
  /** цена в рублях */
  price: number;
  type: ProductType;
  /** роль = какая комната открывается в кабинете */
  role: string;
  /** для подписок: шаг продления; для разовых — null */
  period: AccessPeriod | null;
  /** ID подписки в Продамусе (только для type=subscription) */
  subscriptionId?: string;
  /** префикс order_id, по которому вебхук опознаёт продукт */
  orderPrefix: string;
}

export const CATALOG: Record<string, CatalogProduct> = {
  mk_dengi: {
    slug: 'mk-dengi',
    name: 'МК «Разрешение быстрых денег»',
    price: 4884,
    type: 'one_time',
    role: 'mk',
    period: null,
    orderPrefix: 'mkdengi',
  },
  sync_month: {
    slug: 'sync-month',
    name: 'Синхронизация (10к/мес)',
    price: 10000,
    type: 'subscription',
    role: 'sync',
    period: 'month',
    subscriptionId: '2356023',
    orderPrefix: 'sync_mk',
  },
  group_week: {
    slug: 'group-week',
    name: 'Группа (10к/нед)',
    price: 10000,
    type: 'subscription',
    role: 'group',
    period: 'week',
    subscriptionId: '2002781',
    orderPrefix: 'conn_', // TODO: уточнить реальный order_id Group у Саши
  },

  // ── «Новый уровень контента» (предпродажа, доступ с 1 августа) ──
  // Три тарифа. Все дают одну роль `uroven` (на предпродаже комната одна;
  // тарифная разница — чат/созвоны — отдельными комнатами позже, к 1 августа).
  // T1 — разовый, доступ навсегда. T2/T3 — помесячно: оплата разовым do=pay,
  // доступ на месяц (grantAccess продлевает при повторной оплате). Настоящий
  // Продамус-рекуррент (subscriptionId) не подключаем на старте (вариант B).
  uroven_t1: {
    slug: 'uroven-t1',
    name: 'Новый уровень контента — Тариф 1 (сам)',
    price: 3450,
    type: 'one_time',
    role: 'uroven',
    period: null,
    orderPrefix: 'uroven_t1',
  },
  uroven_t2: {
    slug: 'uroven-t2',
    name: 'Новый уровень контента — Тариф 2 (сам + монетизация)',
    price: 7500,
    type: 'subscription',
    role: 'uroven',
    period: 'month',
    orderPrefix: 'uroven_t2',
  },
  uroven_t3: {
    slug: 'uroven-t3',
    name: 'Новый уровень контента — Тариф 3 (делаем вместе)',
    price: 35000,
    type: 'subscription',
    role: 'uroven',
    period: 'month',
    orderPrefix: 'uroven_t3',
  },
};

/** Опознать продукт по order_id Продамуса (по самому длинному совпавшему префиксу). */
export function resolveProductByOrderId(orderId: string): CatalogProduct | null {
  if (!orderId) return null;
  let best: CatalogProduct | null = null;
  for (const p of Object.values(CATALOG)) {
    if (orderId.startsWith(p.orderPrefix)) {
      if (!best || p.orderPrefix.length > best.orderPrefix.length) best = p;
    }
  }
  return best;
}

export function getProductBySlug(slug: string): CatalogProduct | null {
  return Object.values(CATALOG).find((p) => p.slug === slug) || null;
}

/**
 * Дата окончания доступа от момента выдачи.
 * Разовый → null (бессрочно). Подписка → grantedAt + один период.
 */
export function computeExpiresAt(product: CatalogProduct, grantedAt: Date): Date | null {
  if (product.type === 'one_time' || !product.period) return null;
  const d = new Date(grantedAt);
  if (product.period === 'week') d.setDate(d.getDate() + 7);
  else if (product.period === 'month') d.setMonth(d.getMonth() + 1);
  return d;
}
