// ─────────────────────────────────────────────────────────────
// Выдача и продление доступов (ProductAccess).
//
// Единая точка, через которую вебхук Продамуса открывает доступ.
//   - Разовый продукт (МК): один бессрочный active-доступ, идемпотентно.
//   - Подписка (SYNC/Group): продлеваем существующий доступ на период
//     вперёд (от текущего expiresAt, либо от now если уже истёк), а не
//     плодим дубли. Так рекуррент-списание просто двигает дату.
//
// Доступ может быть без Telegram (оплата картой с сайта): тогда
// telegramId = null, привязка позже — bindAccessToTelegram по токену.
// ─────────────────────────────────────────────────────────────

import { prisma } from './prisma';
import { CatalogProduct, computeExpiresAt } from './catalog';

interface GrantParams {
  product: CatalogProduct;
  telegramId?: number | null;
  userId?: string | null;
  /** order_id Продамуса или subscription id — для аудита и привязки по токену */
  source: string;
}

/** Выдать или продлить доступ. Возвращает id записи ProductAccess. */
export async function grantAccess(params: GrantParams): Promise<string> {
  const { product, telegramId, userId, source } = params;
  const now = new Date();

  // Ищем существующий доступ этого человека к этому продукту.
  // Для веб-оплаты (telegramId null) ищем по source, чтобы не плодить дубли при ретрае вебхука.
  const existing = telegramId
    ? await prisma.productAccess.findFirst({
        where: { telegramId: BigInt(telegramId), productSlug: product.slug },
        orderBy: { createdAt: 'desc' },
      })
    : await prisma.productAccess.findFirst({
        where: { source, productSlug: product.slug },
        orderBy: { createdAt: 'desc' },
      });

  if (product.type === 'subscription') {
    // Продление: считаем от max(текущий срок, сейчас).
    const base = existing?.expiresAt && existing.expiresAt > now ? existing.expiresAt : now;
    const nextExpires = computeExpiresAt(product, base);

    if (existing) {
      await prisma.productAccess.update({
        where: { id: existing.id },
        data: { expiresAt: nextExpires, status: 'active', source, role: product.role },
      });
      return existing.id;
    }
    const created = await prisma.productAccess.create({
      data: {
        userId: userId ?? null,
        telegramId: telegramId ? BigInt(telegramId) : null,
        productSlug: product.slug,
        role: product.role,
        expiresAt: nextExpires,
        status: 'active',
        period: product.period,
        source,
      },
    });
    return created.id;
  }

  // Разовый: уже есть активный → ничего не делаем (идемпотентно).
  if (existing && existing.status === 'active') return existing.id;
  if (existing) {
    await prisma.productAccess.update({
      where: { id: existing.id },
      data: { status: 'active', source, role: product.role },
    });
    return existing.id;
  }
  const created = await prisma.productAccess.create({
    data: {
      userId: userId ?? null,
      telegramId: telegramId ? BigInt(telegramId) : null,
      productSlug: product.slug,
      role: product.role,
      expiresAt: null, // бессрочно
      status: 'active',
      period: null,
      source,
    },
  });
  return created.id;
}

/**
 * Привязать ранее выданный (картой с сайта) доступ к Telegram-аккаунту.
 * Вызывается ботом при /start paid_<token>, когда source = mkdengi_web_<token>.
 */
export async function bindAccessToTelegram(source: string, telegramId: number, userId?: string | null) {
  await prisma.productAccess.updateMany({
    where: { source, telegramId: null },
    data: { telegramId: BigInt(telegramId), userId: userId ?? null },
  });
}

/** Активные (не истёкшие) доступы человека по Telegram. */
export async function getActiveAccessByTelegram(telegramId: number) {
  const now = new Date();
  return prisma.productAccess.findMany({
    where: {
      telegramId: BigInt(telegramId),
      status: 'active',
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { grantedAt: 'desc' },
  });
}
