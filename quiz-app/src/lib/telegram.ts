import { getAdminChatId } from '@/lib/notion';

const BOT_TOKEN = process.env.BOT_TOKEN;
const PRODAMUS_FORM_URL = process.env.NEXT_PUBLIC_PRODAMUS_FORM_URL || '';
// Fallback to custom domain ensures urlNotification is always included in payment links
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quiz.thesashatoyz.com';
const VIDEO_FILE_ID = process.env.FOLLOWUP_VIDEO_FILE_ID || '';

export { VIDEO_FILE_ID };

export type ConnectorsTier = 'basic' | 'premium';

const CONNECTORS_TIER_CONFIG: Record<ConnectorsTier, { name: string; price: number }> = {
  basic: { name: 'Коннекторы — Базовый', price: 10000 },
  premium: { name: 'Коннекторы — Премиум', price: 20000 },
};

export function buildConnectorsPaymentUrl(userId: number, resultId: string, tier: ConnectorsTier): string {
  if (!PRODAMUS_FORM_URL) {
    return 'https://t.me/testtoyzbot';
  }

  const config = CONNECTORS_TIER_CONFIG[tier];
  const orderId = `conn_${userId}_${tier}_${resultId}`;
  const parts = [
    'do=pay',
    `products[0][name]=${encodeURIComponent(config.name)}`,
    `products[0][price]=${config.price}`,
    'products[0][quantity]=1',
    `order_id=${encodeURIComponent(orderId)}`,
  ];

  if (WEBAPP_URL) {
    parts.push(`urlNotification=${encodeURIComponent(`${WEBAPP_URL}/api/prodamus-webhook`)}`);
    parts.push(`urlSuccess=${encodeURIComponent(`${WEBAPP_URL}/connectors?payment=success`)}`);
  }

  return `${PRODAMUS_FORM_URL}?${parts.join('&')}`;
}

export function buildPaymentUrl(userId: number, resultId: string): string {
  if (!PRODAMUS_FORM_URL) {
    return 'https://t.me/sashatoyz_bot?start=pay_masterclass';
  }

  const orderId = `${userId}_${resultId}`;
  const parts = [
    'do=pay',
    `products[0][name]=${encodeURIComponent('Мастер-класс «Продающий контент»')}`,
    'products[0][price]=3450',
    'products[0][quantity]=1',
    `order_id=${encodeURIComponent(orderId)}`,
  ];

  if (WEBAPP_URL) {
    parts.push(`urlNotification=${encodeURIComponent(`${WEBAPP_URL}/api/prodamus-webhook`)}`);
    parts.push(`urlSuccess=${encodeURIComponent(`${WEBAPP_URL}?payment=success`)}`);
  }

  return `${PRODAMUS_FORM_URL}?${parts.join('&')}`;
}

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

  // Step 1: Send video (no caption — Telegram limits caption to 1024 chars)
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
      // Video failed — fall back to text-only
      return sendTelegramMessage(chatId, caption, paymentUrl);
    }
  } catch (error) {
    console.error(`Failed to send video to ${chatId}:`, error);
    // Fall back to text-only
    return sendTelegramMessage(chatId, caption, paymentUrl);
  }

  // Step 2: Send text message with payment button
  return sendTelegramMessage(chatId, caption, paymentUrl);
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
