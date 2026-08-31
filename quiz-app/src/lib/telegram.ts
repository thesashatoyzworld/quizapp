import { getAdminChatId } from '@/lib/notion';

// Re-export client-safe functions for backward compatibility
export { buildPaymentUrl, buildConnectorsPaymentUrl } from '@/lib/payment';
export type { ConnectorsTier } from '@/lib/payment';

const BOT_TOKEN = process.env.BOT_TOKEN;
const VIDEO_FILE_ID = process.env.FOLLOWUP_VIDEO_FILE_ID || '';

export { VIDEO_FILE_ID };

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  paymentUrl: string,
): Promise<{ ok: boolean; blocked?: boolean }> {
  if (!BOT_TOKEN) return { ok: false };

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '\uD83D\uDCB3 Оплатить мастер-класс — 3 450₽', url: paymentUrl },
          ]],
        },
      }),
    });
    const data = await response.json();

    if (data.ok === false && data.error_code === 403) {
      return { ok: false, blocked: true };
    }

    return { ok: data.ok === true };
  } catch (error) {
    console.error(`Failed to send message to ${chatId}:`, error);
    return { ok: false };
  }
}

export async function sendTelegramVideo(
  chatId: number,
  videoFileId: string,
  caption: string,
  paymentUrl: string,
): Promise<{ ok: boolean; blocked?: boolean }> {
  if (!BOT_TOKEN || !videoFileId) {
    return sendTelegramMessage(chatId, caption, paymentUrl);
  }

  const videoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
  try {
    const videoResponse = await fetch(videoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoFileId,
      }),
    });
    const videoData = await videoResponse.json();

    if (videoData.ok === false && videoData.error_code === 403) {
      return { ok: false, blocked: true };
    }

    if (!videoData.ok) {
      return sendTelegramMessage(chatId, caption, paymentUrl);
    }
  } catch (error) {
    console.error(`Failed to send video to ${chatId}:`, error);
    return sendTelegramMessage(chatId, caption, paymentUrl);
  }

  return sendTelegramMessage(chatId, caption, paymentUrl);
}

/**
 * Обычное сообщение боту без кнопки оплаты.
 * sendTelegramMessage выше всегда лепит кнопку мастер-класса, для анкеты не годится.
 */
export async function sendBotMessage(
  chatId: number,
  text: string,
  replyMarkup?: object,
  // null = слать как есть. Нужно для сообщений с юзернеймами: подчёркивание
  // в «dariya_basinaa» Markdown понимает как курсив и роняет разметку.
  parseMode: 'Markdown' | 'HTML' | null = 'Markdown',
): Promise<{ ok: boolean; blocked?: boolean; messageId?: number }> {
  if (!BOT_TOKEN) return { ok: false };

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {}),
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    const data = await res.json();

    // 403 = человек не начинал диалог с ботом или заблокировал его.
    // Телеграм не даёт написать первым, это не наша ошибка.
    if (data.ok === false && data.error_code === 403) return { ok: false, blocked: true };

    return { ok: data.ok === true, messageId: data.result?.message_id };
  } catch (error) {
    console.error(`sendBotMessage failed for ${chatId}:`, error);
    return { ok: false };
  }
}

/** Путь к файлу в Telegram. Лимит Bot API на скачивание — 20 МБ. */
export async function getTelegramFilePath(fileId: string): Promise<string> {
  if (!BOT_TOKEN) throw new Error('BOT_TOKEN is not set');

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = await res.json();
  const path: string | undefined = data?.result?.file_path;
  if (!path) throw new Error(`getFile returned no path: ${JSON.stringify(data)}`);
  return path;
}

export async function downloadTelegramFile(filePath: string): Promise<ArrayBuffer> {
  if (!BOT_TOKEN) throw new Error('BOT_TOKEN is not set');

  const res = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  return res.arrayBuffer();
}

/**
 * Кому дублируем важное. Рабочий аккаунт @sashatoyzwork Саша читает отдельно
 * от личного, поэтому туда уходят только заявки и деньги: анкеты, DWY-лиды,
 * оплаты, выдача доступа. Технический шум (ошибки рассылок, лид-магниты,
 * waitlist) остаётся на личном аккаунте.
 */
const WORK_CHAT_ID = (process.env.ADMIN_CHAT_ID_WORK || '').trim();

export type NotifyAdminOptions = {
  /** Продублировать на рабочий аккаунт. Ставим только на заявки и оплаты. */
  alsoWork?: boolean;
  /** Убрать превью ссылок: в анкетах и лидах ссылка на досье раздувает сообщение. */
  disableLinkPreview?: boolean;
  /**
   * null = слать текст как есть. Нужно там, где в сообщение попадает название
   * товара из Продамуса: амперсанд или угловая скобка в нём роняют HTML-разбор,
   * и Телеграм отвечает 400 вместо доставки.
   */
  parseMode?: 'HTML' | null;
};

/**
 * Одна отправка с повторами.
 *
 * Раньше ответ Телеграма не читался вовсе, а `fetch` не бросает на 400 и 429:
 * любая ошибка исчезала бесследно. В логах пусто, у Саши пусто, а человеку бот
 * бодро писал «анкета собрана» — так однажды потерялось уведомление о Косте.
 * Теперь разбираем ответ и повторяем: на 429 Телеграм сам говорит, сколько ждать.
 */
async function sendToAdmin(
  chatId: string,
  text: string,
  options: NotifyAdminOptions,
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Телеграм иногда просто не отвечает — без таймаута вызов висит до конца
      // лимита функции и уведомление не уходит вовсе.
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...(options.parseMode === null ? {} : { parse_mode: options.parseMode || 'HTML' }),
          ...(options.disableLinkPreview ? { link_preview_options: { is_disabled: true } } : {}),
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (data.ok === true) return true;

      const retryAfter: number | undefined = data?.parameters?.retry_after;
      console.error(
        `[notifyAdmin] ${chatId} попытка ${attempt}: telegram отказал ${data.error_code} ${data.description}`,
      );

      // 429 — ждём столько, сколько просят. Остальные ошибки повтор не лечит.
      if (data.error_code !== 429) return false;
      if (attempt < 3) await new Promise((r) => setTimeout(r, (retryAfter || 1) * 1000));
    } catch (error) {
      console.error(`[notifyAdmin] ${chatId} попытка ${attempt} упала:`, error);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return false;
}

/**
 * Уведомление Саше. С `alsoWork` уходит ещё и на рабочий аккаунт.
 *
 * Получатели независимы: молчание рабочего аккаунта не должно скрывать то,
 * что личный своё сообщение получил, поэтому true возвращаем, если дошло
 * хотя бы до одного, а по каждому отказу пишем в лог.
 */
export async function notifyAdmin(
  text: string,
  options: NotifyAdminOptions = {},
): Promise<boolean> {
  if (!BOT_TOKEN) return false;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) {
    console.error('[notifyAdmin] некому писать: ADMIN_CHAT_ID не задан');
    return false;
  }

  const recipients = [adminChatId];
  if (options.alsoWork && WORK_CHAT_ID && WORK_CHAT_ID !== adminChatId) {
    recipients.push(WORK_CHAT_ID);
  }

  const results = await Promise.all(
    recipients.map((chatId) => sendToAdmin(chatId, text, options)),
  );

  return results.some(Boolean);
}
