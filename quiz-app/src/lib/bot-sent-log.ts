// ─────────────────────────────────────────────────────────────
// Что бот сам написал клиенту, ложится в ту же переписку, что и ответы
// клиента боту (tg_personal_msg, account = 'bot'), стороной «мы».
//
// Без этого статус клиентов врал: клиенту ушло напоминание о платеже или
// карта, а по базе последнее слово за клиентом и мяч у Саши.
//
// Кто отправил, видно по media_ref = 'sent-by:<источник>'. Отдельной колонки
// в таблице нет, а media_ref у текстовых сообщений пустой и никем не читается.
//
// Запись не должна ломать отправку: сообщение к этому моменту уже ушло,
// поэтому любая ошибка базы только пишется в лог.
// ─────────────────────────────────────────────────────────────

import { BOT_ACCOUNT } from './client-bot-reply';

export const SENT_BY_PREFIX = 'sent-by:';

export interface BotSent {
  chatId: number | string;
  /** message_id из ответа Телеграма. Для групп с префиксом, чтобы не пересечься с личкой. */
  messageId?: number | string;
  text: string;
  /** Кто отправил: напоминание о платеже, карта, приветствие и т.п. */
  by: string;
  parseMode?: 'Markdown' | 'HTML' | null;
  at?: Date;
}

/** Текст как его увидит человек: без HTML-тегов и сущностей. */
export function plainText(text: string, parseMode?: 'Markdown' | 'HTML' | null): string {
  if (parseMode !== 'HTML') return text.trim();
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

export function sentRow(s: BotSent) {
  const chatId = String(s.chatId);
  return {
    id: `${BOT_ACCOUNT}:${chatId}:${s.messageId ?? (s.at ?? new Date()).getTime()}`,
    account: BOT_ACCOUNT,
    chatId,
    side: 'us',
    username: null,
    name: null,
    text: plainText(s.text, s.parseMode) || '[сообщение]',
    mediaType: null,
    mediaRef: `${SENT_BY_PREFIX}${s.by}`,
    createdAt: s.at ?? new Date(),
  };
}

export async function logBotSent(s: BotSent): Promise<void> {
  try {
    // Лениво, как в client-bot-reply: разбор тестируется без базы.
    const { prisma } = await import('./prisma');
    await prisma.tgPersonalMsg.create({ data: sentRow(s) });
  } catch (e) {
    // Повтор с тем же message_id или база недоступна: сообщение всё равно ушло.
    console.error('[bot-sent-log] не записал отправку', s.by, s.chatId, e);
  }
}
