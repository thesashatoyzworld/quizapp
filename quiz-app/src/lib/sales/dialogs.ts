import { prisma } from '@/lib/prisma';

// Кто ждёт ответа в личке и что ему уже написали.
//
// Раньше помощник пушил подсказку на каждое входящее, и переписки с разными
// людьми перемешивались в одну ленту: человек пишет очередью из пяти реплик,
// а в чат прилетает двадцать сообщений от бота. Работа переехала в кабинет,
// где у каждого человека своя страница, а телеграм получает только пинг.

/** Через сколько молчания считаем, что человек ждёт нас, а не думает. */
const FRESH_SECONDS = 90;

export type WaitingRow = {
  chatId: string;
  name: string | null;
  username: string | null;
  leadId: number | null;
  /** Доход из анкеты — по нему видно, кто тянет на большой формат. */
  income: string | null;
  /** Насколько сам себя оценил в анкете: с какой скоростью идти к цене. */
  readiness: string | null;
  /** Как давно читает Сашу: тёплому кейс второй раз не нужен. */
  following: string | null;
  /** Последнее, что человек написал. */
  lastText: string;
  lastAt: Date;
  /** Сколько его сообщений подряд остались без нашего ответа. */
  unanswered: number;
  waitingSeconds: number;
};

/**
 * Люди, у которых последнее слово осталось за ними.
 *
 * Свежие реплики (моложе полутора минут) не показываем: человек ещё
 * дописывает очередь, и отвечать ему на первую фразу из пяти бессмысленно.
 *
 * Отложенные (`sales_outcome`) не показываются вовсе, и отсечение стоит именно
 * здесь: этот же список кормит сборку ответов и рассылку пачкой, а помеченному
 * «слился» нельзя не то что подсказку собрать — тем более что-то отправить.
 * Пометка держится ровно до его следующей реплики, срок у «думает» — до даты
 * возврата.
 */
export async function waiting(): Promise<WaitingRow[]> {
  const rows = await prisma.$queryRaw<
    {
      chat_id: string;
      name: string | null;
      username: string | null;
      lead_id: number | null;
      income: string | null;
      readiness: string | null;
      following: string | null;
      text: string;
      created_at: Date;
      unanswered: bigint;
    }[]
  >`
    WITH last_us AS (
      SELECT chat_id, max(created_at) AS at
        FROM tg_business_msg WHERE side = 'us' GROUP BY chat_id
    ),
    last_msg AS (
      SELECT DISTINCT ON (chat_id) chat_id, side, text, created_at, name, username, lead_id
        FROM tg_business_msg ORDER BY chat_id, created_at DESC
    )
    SELECT m.chat_id, m.name, m.username, m.lead_id,
           l.income, l.readiness, l.following, m.text, m.created_at,
           (SELECT count(*) FROM tg_business_msg t
             WHERE t.chat_id = m.chat_id AND t.side = 'client'
               AND t.created_at > coalesce(u.at, '-infinity'::timestamp)) AS unanswered
      FROM last_msg m
      LEFT JOIN last_us u ON u.chat_id = m.chat_id
      LEFT JOIN dwy_leads l ON l.id = m.lead_id
      LEFT JOIN sales_outcome o ON o.chat_id = m.chat_id
     WHERE m.side = 'client'
       AND m.created_at < now() - make_interval(secs => ${FRESH_SECONDS})
       AND (
         o.chat_id IS NULL
         OR m.created_at > o.marked_at
         OR (o.outcome = 'thinking' AND o.wake_at IS NOT NULL AND o.wake_at <= now())
       )
     ORDER BY m.created_at ASC
  `;

  return rows.map((r) => ({
    chatId: r.chat_id,
    name: r.name,
    username: r.username,
    leadId: r.lead_id,
    income: r.income,
    readiness: r.readiness,
    following: r.following,
    lastText: r.text,
    lastAt: r.created_at,
    unanswered: Number(r.unanswered),
    waitingSeconds: Math.max(0, Math.round((Date.now() - r.created_at.getTime()) / 1000)),
  }));
}

/** «9 часов», «20 минут» — сколько человек уже ждёт. */
export function waited(seconds: number): string {
  if (seconds < 60) return 'только что';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.round(h / 24)} дн`;
}

/**
 * Насколько срочно. Красный это не «важный человек», а «ждёт слишком долго»:
 * по данным MIT ответ в первые пять минут против получаса даёт кратно больше
 * шансов вообще довести разговор до квалификации.
 */
export function heat(row: WaitingRow): 'hot' | 'warm' | 'fresh' {
  if (row.waitingSeconds > 4 * 3600) return 'hot';
  if (row.waitingSeconds > 3600) return 'warm';
  return 'fresh';
}

export type ThreadRow = {
  id: string;
  side: string;
  text: string;
  mediaType: string | null;
  createdAt: Date;
};

/** Переписка чата целиком, в порядке разговора. */
export async function threadOf(chatId: string, take = 200): Promise<ThreadRow[]> {
  const rows = await prisma.tgBusinessMsg.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    take,
    select: { id: true, side: true, text: true, mediaType: true, createdAt: true },
  });
  return rows.reverse();
}

/**
 * Чат человека по анкете. Привязка ставится при разборе сообщения, но у тех,
 * кто написал до неё, lead_id пустой — тогда ищем по нику из анкеты.
 */
export async function chatOfLead(lead: {
  id: number;
  username: string | null;
}): Promise<string | null> {
  const byLead = await prisma.tgBusinessMsg.findFirst({
    where: { leadId: lead.id },
    orderBy: { createdAt: 'desc' },
    select: { chatId: true },
  });
  if (byLead) return byLead.chatId;

  if (!lead.username) return null;
  const byName = await prisma.tgBusinessMsg.findFirst({
    where: { username: { equals: lead.username, mode: 'insensitive' } },
    orderBy: { createdAt: 'desc' },
    select: { chatId: true },
  });
  return byName?.chatId ?? null;
}

/**
 * Готовый, но ещё не отправленный ответ по этому чату.
 *
 * Подсказку собираем заранее пачкой, чтобы Саша, открыв человека, видел текст
 * сразу, а не ждал минуту на каждом. Годной считаем только ту, что собрана
 * после последней реплики человека: всё, что старше, отвечает на несказанное.
 */
export type ReadyStep = {
  id: string;
  message: string;
  why: string;
  stage: string;
  callSasha: string | null;
  sell: string;
  plan: string[];
};

export async function readySuggestion(chatId: string): Promise<ReadyStep | null> {
  const [last, suggestion] = await Promise.all([
    prisma.tgBusinessMsg.findFirst({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.tgSuggestion.findFirst({
      where: { chatId, sentAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        text: true,
        why: true,
        stage: true,
        callSasha: true,
        sell: true,
        plan: true,
        createdAt: true,
      },
    }),
  ]);

  if (!last || !suggestion) return null;
  if (suggestion.createdAt < last.createdAt) return null;
  return {
    id: suggestion.id,
    message: suggestion.text,
    why: suggestion.why || 'собран заранее',
    stage: suggestion.stage || '',
    callSasha: suggestion.callSasha,
    sell: suggestion.sell || '',
    plan: suggestion.plan || [],
  };
}

/** По каким чатам ответ уже собран — для пометок в списке. */
export async function readyChats(chatIds: string[]): Promise<Set<string>> {
  const ready = await Promise.all(chatIds.map((id) => readySuggestion(id).then((r) => (r ? id : null))));
  return new Set(ready.filter((v): v is string => !!v));
}
