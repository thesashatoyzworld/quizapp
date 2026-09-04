import { prisma } from '@/lib/prisma';

// Чем кончился разговор.
//
// Очередь показывает тех, чьё последнее слово осталось за ними. Пока пометок
// не было, в ней навсегда оседали двое: кто сказал «спасибо, я подумаю» и кто
// ушёл совсем. Оба выглядели как живые, ждущие ответа, и очередь переставала
// быть списком дел.
//
// Оплату руками не отмечаем: она видна по выданному доступу. Отмечаем только
// то, чего в базе нет.

export const OUTCOMES = ['thinking', 'lost'] as const;
export type Outcome = (typeof OUTCOMES)[number];

export function isOutcome(value: unknown): value is Outcome {
  return typeof value === 'string' && (OUTCOMES as readonly string[]).includes(value);
}

export type OutcomeMark = {
  chatId: string;
  outcome: Outcome;
  reason: string | null;
  wakeAt: Date | null;
  markedAt: Date;
  markedBy: string | null;
};

export function wakeDate(days: number): Date {
  return new Date(Date.now() + days * 86_400_000);
}

/** Строка из базы в наш тип: колонка выше типа не знает, а мы знаем. */
function asMark(row: { outcome: string } & Omit<OutcomeMark, 'outcome'>): OutcomeMark {
  return { ...row, outcome: isOutcome(row.outcome) ? row.outcome : 'lost' };
}

/** Поставить или снять пометку. `null` возвращает человека в очередь. */
export async function setOutcome(
  chatId: string,
  outcome: Outcome | null,
  opts: { reason?: string | null; wakeAt?: Date | null; by?: string | null } = {},
): Promise<OutcomeMark | null> {
  if (!outcome) {
    await prisma.salesOutcome.deleteMany({ where: { chatId } });
    return null;
  }

  const data = {
    outcome,
    reason: opts.reason ?? null,
    // Срок возврата имеет смысл только у «думает»: ушедшего будить нечем.
    wakeAt: outcome === 'thinking' ? (opts.wakeAt ?? wakeDate(3)) : null,
    markedAt: new Date(),
    markedBy: opts.by ?? null,
  };

  return asMark(
    await prisma.salesOutcome.upsert({
      where: { chatId },
      create: { chatId, ...data },
      update: data,
    }),
  );
}

export async function outcomeOf(chatId: string): Promise<OutcomeMark | null> {
  const row = await prisma.salesOutcome.findUnique({ where: { chatId } });
  return row ? asMark(row) : null;
}

/** «завтра», «через 3 дня», «пора» — когда возвращаемся к думающему. */
export function wakeIn(wakeAt: Date | null): string {
  if (!wakeAt) return 'без срока';
  const days = Math.round((wakeAt.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return 'пора';
  if (days === 1) return 'завтра';
  return `через ${days} дн`;
}

/**
 * Сколько человек из переписок оплатили за период.
 *
 * Считается по выданному доступу, а не по пометке: доступ выдаётся платежом,
 * и рукой эту цифру не подделать. Совпадение по telegram id — он же служит
 * id чата в личке.
 */
export async function paidLately(days = 30): Promise<number> {
  const since = new Date(Date.now() - days * 86_400_000);
  const rows = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT count(DISTINCT a.telegram_id) AS n
      FROM product_access a
     WHERE a.granted_at >= ${since}
       AND a.telegram_id IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM tg_business_msg m WHERE m.chat_id = a.telegram_id::text
       )
  `;
  return Number(rows[0]?.n ?? 0);
}

export type Parked = OutcomeMark & {
  name: string | null;
  username: string | null;
  leadId: number | null;
  /** Когда человек написал последний раз — по нему видно, кто уже остыл. */
  lastAt: Date;
};

/**
 * Кого мы отложили сами и кто до сих пор отложен.
 *
 * Отдельным запросом, а не фильтром очереди: чаще всего отложенный молчит
 * после нашего вопроса, и в списке «ждут ответа» его нет вовсе. Пометка,
 * которую человек уже перебил своей репликой, сюда не попадает — он снова
 * живой и стоит в очереди.
 */
export async function parked(): Promise<Parked[]> {
  const rows = await prisma.$queryRaw<
    {
      chat_id: string;
      outcome: string;
      reason: string | null;
      wake_at: Date | null;
      marked_at: Date;
      marked_by: string | null;
      name: string | null;
      username: string | null;
      lead_id: number | null;
      last_at: Date;
    }[]
  >`
    SELECT o.chat_id, o.outcome, o.reason, o.wake_at, o.marked_at, o.marked_by,
           m.name, m.username, m.lead_id, m.created_at AS last_at
      FROM sales_outcome o
      JOIN LATERAL (
        SELECT name, username, lead_id, created_at
          FROM tg_business_msg t
         WHERE t.chat_id = o.chat_id
         ORDER BY t.created_at DESC
         LIMIT 1
      ) m ON true
     WHERE m.created_at <= o.marked_at
       AND (o.outcome <> 'thinking' OR o.wake_at IS NULL OR o.wake_at > now())
     ORDER BY o.wake_at ASC NULLS LAST, o.marked_at DESC
  `;

  return rows.map((r) => ({
    chatId: r.chat_id,
    outcome: isOutcome(r.outcome) ? r.outcome : 'lost',
    reason: r.reason,
    wakeAt: r.wake_at,
    markedAt: r.marked_at,
    markedBy: r.marked_by,
    name: r.name,
    username: r.username,
    leadId: r.lead_id,
    lastAt: r.last_at,
  }));
}
