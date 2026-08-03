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

export async function notifyAdmin(text: string) {
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to notify admin:', error);
  }
}
