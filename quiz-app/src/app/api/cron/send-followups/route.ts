import { NextRequest, NextResponse } from 'next/server';
import followUpMessages, { ResultId } from '@/data/followup-messages';
import { getPendingUsers, updateFollowUpSent, markUserBlocked, getAdminChatId } from '@/lib/notion';

const BOT_TOKEN = process.env.BOT_TOKEN;
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

    // Check if bot was blocked by user (403 error)
    if (data.ok === false && data.error_code === 403) {
      return { ok: false, blocked: true };
    }

    return { ok: data.ok === true };
  } catch (error) {
    console.error(`Failed to send message to ${chatId}:`, error);
    return { ok: false };
  }
}

async function sendTelegramVideo(
  chatId: number,
  videoFileId: string,
  caption: string,
  paymentUrl: string,
): Promise<{ ok: boolean; blocked?: boolean }> {
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

    // Check if bot was blocked by user (403 error)
    if (data.ok === false && data.error_code === 403) {
      return { ok: false, blocked: true };
    }

    return { ok: data.ok === true };
  } catch (error) {
    console.error(`Failed to send video to ${chatId}:`, error);
    return { ok: false };
  }
}

async function notifyAdmin(sentCount: number, errorCount: number, blockedCount: number) {
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  let text = `\uD83D\uDCE8 <b>Follow-up рассылка</b>\n\n\u2705 Отправлено: <b>${sentCount}</b>\n\u274C Ошибок: <b>${errorCount}</b>`;

  if (blockedCount > 0) {
    text += `\n\uD83D\uDEAB Заблокировали бота: <b>${blockedCount}</b>`;
  }

  text += `\n\u23F0 ${timestamp}`;

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

async function notifyAdminError(errorMessage: string) {
  if (!BOT_TOKEN) return;

  try {
    const adminChatId = await getAdminChatId();
    if (!adminChatId) return;

    const text = `⚠️ Ошибка cron follow-up: ${errorMessage}`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (notifyError) {
    console.error('Failed to notify admin about error:', notifyError);
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends it as Authorization header)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check for dry-run mode
  const dryRun = request.nextUrl.searchParams.get('dry_run') === 'true';

  try {
    const pendingUsers = await getPendingUsers();

    if (pendingUsers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No pending users', dry_run: dryRun });
    }

    let sentCount = 0;
    let errorCount = 0;
    let blockedCount = 0;

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

      if (dryRun) {
        // Dry-run mode: log what would be sent without actually sending
        console.log(`[DRY RUN] Would send message ${messageIndex + 1} to user ${user.user_id} (result: ${resultId})`);
        sentCount++;
      } else {
        // Normal mode: actually send messages
        let result: { ok: boolean; blocked?: boolean };

        if (message.hasVideo && VIDEO_FILE_ID) {
          result = await sendTelegramVideo(
            user.user_id,
            VIDEO_FILE_ID,
            message.text,
            paymentUrl,
          );
        } else {
          result = await sendTelegramMessage(
            user.user_id,
            message.text,
            paymentUrl,
          );
        }

        if (result.blocked) {
          // User blocked the bot - mark in Notion and stop sending
          await markUserBlocked(user.user_id);
          blockedCount++;
        } else if (result.ok) {
          await updateFollowUpSent(user.user_id);
          sentCount++;
        } else {
          errorCount++;
        }

        // Small delay to avoid Telegram rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Notify admin about results (skip in dry-run mode)
    if (!dryRun && (sentCount > 0 || errorCount > 0 || blockedCount > 0)) {
      await notifyAdmin(sentCount, errorCount, blockedCount);
    }

    console.log(`[Follow-up Cron] ${dryRun ? 'DRY RUN - ' : ''}Sent: ${sentCount}, Errors: ${errorCount}, Blocked: ${blockedCount}`);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      blocked: blockedCount,
      total: pendingUsers.length,
      dry_run: dryRun,
    });
  } catch (error) {
    console.error('Follow-up cron error:', error);

    // Notify admin about cron error
    const errorMessage = error instanceof Error ? error.message : String(error);
    await notifyAdminError(errorMessage);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
