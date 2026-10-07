/**
 * Пачка вопроса: один человек в одной теме пишет несколько сообщений подряд
 * (картинка, следом подпись, следом «@thesashatoyz глянь»). Черновик собираем
 * на всю пачку, когда человек замолчал, а не на каждое сообщение.
 *
 * Чистые функции: без базы и без телеграма, чтобы проверялись тестом.
 */

/** Сколько тишины считаем концом пачки. */
export const QUIET_MS = 2 * 60 * 1000;

/** Старше этого не отвечаем: вопрос недельной давности черновиком не догонишь. */
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface BatchRow {
  messageId: number;
  userId: string | null;
  text: string;
  replyToId: number | null;
  createdAt: Date;
}

export function batchKey(chatId: string, threadId: number | null, userId: string): string {
  return `${chatId}:${threadId ?? 0}:${userId}`;
}

export function parseBatchKey(key: string): { chatId: string; threadId: number | null; userId: string } {
  const [chatId, thread, userId] = key.split(':');
  const t = Number(thread);
  return { chatId, threadId: t ? t : null, userId };
}

/** message_id из ключа строки tg_group_msg: `chat:message`. */
export function messageIdOf(rowId: string): number {
  return Number(rowId.split(':').pop());
}

export function isQuiet(lastAt: Date, now: Date): boolean {
  return now.getTime() - lastAt.getTime() >= QUIET_MS;
}

/**
 * Ответил ли Саша сам на что-то из пачки: reply на её сообщение, либо его
 * сообщение в той же теме позже последнего сообщения человека с упоминанием
 * его юзернейма. Тогда черновик не нужен.
 */
export function answeredByOwner(
  batch: BatchRow[],
  ownerAfter: BatchRow[],
  username: string | null,
): boolean {
  if (!batch.length) return false;
  const ids = new Set(batch.map((r) => r.messageId));
  const last = batch[batch.length - 1].createdAt.getTime();
  const mention = username ? '@' + username.toLowerCase() : null;
  return ownerAfter.some(
    (o) =>
      (o.replyToId !== null && ids.has(o.replyToId)) ||
      (o.createdAt.getTime() > last && !!mention && o.text.toLowerCase().includes(mention)),
  );
}
