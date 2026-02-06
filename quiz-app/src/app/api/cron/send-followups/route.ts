import { NextRequest, NextResponse } from 'next/server';
import followUpMessages, { ResultId } from '@/data/followup-messages';
import { getPendingUsers, updateFollowUpSent } from '@/lib/notion';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;
const PRODAMUS_FORM_URL = process.env.NEXT_PUBLIC_PRODAMUS_FORM_URL || '';
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || '';

// Video file_id for Masha's testimonial — set via env or replace after uploading video to Telegram
const VIDEO_FILE_ID = process.env.FOLLOWUP_VIDEO_FILE_ID || '';

function buildPaymentUrl(userId: number, resultId: string): string {
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

async function sendTelegramMessage(
  chatId: number,
  text: string,
  paymentUrl: string,
) {
  if (!BOT_TOKEN) return false;

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
    return data.ok === true;
  } catch (error) {
    console.error(`Failed to send message to ${chatId}:`, error);
    return false;
  }
}

async function sendTelegramVideo(
  chatId: number,
  videoFileId: string,
  caption: string,
  paymentUrl: string,
) {
  if (!BOT_TOKEN || !videoFileId) {
    // Fallback to text message if no video file_id
    return sendTelegramMessage(chatId, caption, paymentUrl);
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoFileId,
        caption,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '\uD83D\uDCB3 Оплатить мастер-класс — 3 450₽', url: paymentUrl },
          ]],
        },
      }),
    });
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error(`Failed to send video to ${chatId}:`, error);
    return false;
  }
}

async function notifyAdmin(sentCount: number, errorCount: number) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return;

  const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const text = `\uD83D\uDCE8 <b>Follow-up рассылка</b>\n\n\u2705 Отправлено: <b>${sentCount}</b>\n\u274C Ошибок: <b>${errorCount}</b>\n\u23F0 ${timestamp}`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to notify admin:', error);
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends it as Authorization header)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pendingUsers = await getPendingUsers();

    if (pendingUsers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No pending users' });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of pendingUsers) {
      const resultId = user.result_id as ResultId;
      const messageIndex = user.messages_sent;

      // Validate result_id and message index
      const messages = followUpMessages[resultId];
      if (!messages || messageIndex >= messages.length) {
        continue;
      }

      const message = messages[messageIndex];
      const paymentUrl = buildPaymentUrl(user.user_id, resultId);

      let success = false;

      if (message.hasVideo && VIDEO_FILE_ID) {
        success = await sendTelegramVideo(
          user.user_id,
          VIDEO_FILE_ID,
          message.text,
          paymentUrl,
        );
      } else {
        success = await sendTelegramMessage(
          user.user_id,
          message.text,
          paymentUrl,
        );
      }

      if (success) {
        await updateFollowUpSent(user.user_id);
        sentCount++;
      } else {
        errorCount++;
      }

      // Small delay to avoid Telegram rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Notify admin about results
    if (sentCount > 0 || errorCount > 0) {
      await notifyAdmin(sentCount, errorCount);
    }

    console.log(`[Follow-up Cron] Sent: ${sentCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: pendingUsers.length,
    });
  } catch (error) {
    console.error('Follow-up cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
