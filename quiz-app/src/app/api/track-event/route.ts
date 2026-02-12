import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, registerFollowUp, updateFollowUpSent, getAdminChatId } from '@/lib/notion';
import followUpMessages, { ResultId } from '@/data/followup-messages';

const BOT_TOKEN = process.env.BOT_TOKEN;
const PRODAMUS_FORM_URL = process.env.NEXT_PUBLIC_PRODAMUS_FORM_URL || '';
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || '';

interface TrackEventPayload {
  event_type: 'quiz_complete' | 'payment_click' | 'payment_success' | 'result_view';
  user_id?: number;
  result_id?: string;
  result_stage?: string;
  result_title?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

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

// Send first follow-up message immediately after quiz completion
async function sendFirstFollowUp(userId: number, resultId: string) {
  if (!BOT_TOKEN) return;

  const messages = followUpMessages[resultId as ResultId];
  if (!messages || messages.length === 0) return;

  const message = messages[0];
  const paymentUrl = buildPaymentUrl(userId, resultId);

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userId,
        text: message.text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '\uD83D\uDCB3 Оплатить мастер-класс — 3 450₽', url: paymentUrl },
          ]],
        },
      }),
    });
    const data = await response.json();

    if (data.ok) {
      // Mark message 1 as sent in Notion
      await updateFollowUpSent(userId);
      console.log(`[Follow-up] Sent immediate message 1 to user ${userId} (result: ${resultId})`);
    } else {
      console.error(`[Follow-up] Failed to send to ${userId}:`, data);
    }
  } catch (error) {
    console.error(`[Follow-up] Error sending to ${userId}:`, error);
  }
}

// Форматирование сообщения для Telegram (только для важных событий)
function formatEventMessage(payload: TrackEventPayload): string {
  const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  if (payload.event_type === 'payment_success') {
    return `✅ <b>ОПЛАТА ПОЛУЧЕНА!</b>

👤 User ID: <code>${payload.user_id || 'unknown'}</code>
💰 Сумма: <b>${payload.amount || 3450}₽</b>
📊 Этап: <b>${payload.result_title || 'N/A'}</b>
⏰ ${timestamp}`;
  }

  return '';
}

// Отправка уведомления в Telegram (только для оплат)
async function sendTelegramNotification(payload: TrackEventPayload) {
  // Отправляем в Telegram только оплаты
  if (payload.event_type !== 'payment_success') {
    return;
  }

  if (!BOT_TOKEN) {
    console.log('Telegram notification skipped (no BOT_TOKEN)');
    return;
  }

  const adminChatId = await getAdminChatId();
  if (!adminChatId) {
    console.log('Telegram notification skipped (no admin chat_id)');
    return;
  }

  try {
    const text = formatEventMessage(payload);
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
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: TrackEventPayload = await request.json();

    // Валидация
    if (!payload.event_type) {
      return NextResponse.json(
        { success: false, error: 'event_type is required' },
        { status: 400 }
      );
    }

    // Отправляем в Notion (все события)
    await trackEvent(payload);

    // Регистрируем в очереди follow-up и сразу шлём первое сообщение (только quiz_complete)
    if (payload.event_type === 'quiz_complete' && payload.user_id && payload.result_id) {
      const isNew = await registerFollowUp(payload.user_id, payload.result_id);
      if (isNew) {
        await sendFirstFollowUp(payload.user_id, payload.result_id);
      }
    }

    // Отправляем в Telegram (только оплаты)
    await sendTelegramNotification(payload);

    // Логируем событие
    console.log(`[Track Event] ${payload.event_type}`, {
      user_id: payload.user_id,
      result: payload.result_title,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
