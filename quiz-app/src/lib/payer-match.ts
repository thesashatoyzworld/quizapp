// ─────────────────────────────────────────────────────────────
// Чей платёж, если order_id не наш: опознание по почте плательщика.
//
// Зачем. Счёт, выставленный руками в кабинете Продамуса, приходит с пустым
// order_num, и вебхук видит только «50 000 от movlatgiri96@mail.ru». Так
// 06.10.2026 Мовлатгирей оплатил второй месяц из трёх: деньги пришли, доступ
// не продлился, график не закрылся.
//
// Почта плательщика лежит в логе вебхука (`events`, type `wh_debug`) рядом с
// order_id каждой прошлой оплаты. Если человек хоть раз платил нашей ссылкой,
// в том order_id зашит его телеграм. Дальше ищем у него ждущий платёж по
// графику на ту же сумму: нашёлся — платёж проводим как оплату по прайс-ссылке.
// Сумма не сошлась или графика нет — доступ сами не выдаём, только подсказываем
// Саше, кто это был.
// ─────────────────────────────────────────────────────────────

import { prisma } from './prisma';
import { tgFromOrderId } from './order-id';

/**
 * Телеграмы, которые раньше платили с этой почты. Обычно один. Несколько —
 * почта общая (семья, ассистент), такую автоматом не разбираем.
 */
export async function telegramsByEmail(email: string): Promise<number[]> {
  const e = email.trim().toLowerCase();
  if (!e.includes('@')) return [];
  // Телеграм берём не только из нашего order_id. Если человек всегда платит
  // счётом из кабинета (Женя Сокольчик: 27.08 и 09.10), order_id — голый номер
  // Продамуса, телеграма в нём нет. Такой платёж Саша закрывает в графике руками,
  // и номер заказа ложится в payment_dues.order_id рядом с телеграмом. С этой
  // сверки следующий счёт с той же почты опознаётся сам.
  const rows = await prisma.$queryRaw<{ order: string; dueTg: bigint | null }[]>`
    SELECT DISTINCT w.metadata->>'order' AS "order", d.telegram_id AS "dueTg"
      FROM events w
      LEFT JOIN payment_dues d
        ON d.order_id = w.metadata->>'order' AND d.telegram_id IS NOT NULL
     WHERE w.type = 'wh_debug'
       AND lower(w.metadata->>'email') = ${e}
       AND w.metadata->>'paymentStatus' = 'success'
       AND w.metadata->>'order' IS NOT NULL`;
  const tgs = new Set<number>();
  for (const r of rows) {
    const tg = tgFromOrderId(r.order) ?? (r.dueTg != null ? Number(r.dueTg) : null);
    if (tg) tgs.add(tg);
  }
  return [...tgs];
}

export type PayerMatch =
  | { kind: 'due'; telegramId: number; dealId: string; dueId: string; label: string | null }
  | { kind: 'person'; telegramId: number }
  | { kind: 'none'; candidates: number[] };

/**
 * Кто заплатил и за что. `due` — у человека ждёт платёж по графику ровно на
 * эту сумму, его можно провести целиком. `person` — человека узнали, но
 * за что платёж, непонятно.
 */
export async function matchPayer(email: string, amount: number): Promise<PayerMatch> {
  const tgs = await telegramsByEmail(email);
  if (tgs.length !== 1) return { kind: 'none', candidates: tgs };
  const telegramId = tgs[0];
  const due = await prisma.paymentDue.findFirst({
    where: { telegramId: BigInt(telegramId), status: 'pending', amount, dealId: { not: null } },
    orderBy: { dueAt: 'asc' },
  });
  if (!due?.dealId) return { kind: 'person', telegramId };
  return { kind: 'due', telegramId, dealId: due.dealId, dueId: due.id, label: due.label };
}
