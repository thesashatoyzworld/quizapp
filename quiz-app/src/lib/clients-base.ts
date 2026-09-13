import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────
// Кто «в базе», то есть клиент, а не лид.
//
// Правило Саши (13.09.2026): люди в базе трекаются, людей не в базе ведут
// продажи. Клиент = хоть одно из трёх:
//   • действующий доступ тарифа 2 или 3 (кроме служебных, track = service);
//   • маршрутная карта, не в архиве;
//   • ждущий платёж в графике (payment_dues).
// Тариф 1 (канал) клиентом не считается: этих людей переводят на тариф 2.
//
// Оценка живая: доступ кончился, карта в архиве, платежей не ждём — человек
// снова уходит в продажи.
//
// Тот же набор условий стоит SQL-ом в lib/sales/dialogs.ts и outcome.ts
// (CLIENT_SQL): очередь продаж собирается одним запросом.
// ─────────────────────────────────────────────────────────────

/** Рабочий аккаунт, с которого идут продажи. Всё остальное подключённое — личное. */
export function workAccount(): string {
  return (process.env.ADMIN_CHAT_ID_WORK || '6013902004').trim();
}

export async function inBase(chatId: string): Promise<boolean> {
  if (!/^\d{3,20}$/.test(chatId)) return false;
  // SQL, а не prisma: колонки track в схеме нет, она есть только в базе.
  // Служебные доступы (сам Саша, рабочий аккаунт, партнёры) клиентами не считаем.
  const rows = await prisma.$queryRaw<{ yes: boolean }[]>`
    SELECT (
      EXISTS (
        SELECT 1 FROM product_access a
         WHERE a.telegram_id::text = ${chatId} AND a.status = 'active'
           AND a.product_slug IN ('uroven-t2', 'uroven-t3')
           AND (a.expires_at IS NULL OR a.expires_at > now())
           AND a.track IS DISTINCT FROM 'service'
      )
      OR EXISTS (SELECT 1 FROM roadmaps r WHERE r.telegram_id::text = ${chatId} AND NOT r.archived)
      OR EXISTS (SELECT 1 FROM payment_dues d WHERE d.telegram_id::text = ${chatId} AND d.status = 'pending')
    ) AS yes`;
  return rows[0]?.yes === true;
}
