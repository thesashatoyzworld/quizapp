import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, registerFollowUp } from '@/lib/notion';

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

interface TrackEventPayload {
  event_type: 'quiz_complete' | 'payment_click' | 'payment_success' | 'result_view';
  user_id?: number;
  result_id?: string;
  result_stage?: string;
  result_title?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
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

  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.log('Telegram notification skipped (no BOT_TOKEN or ADMIN_CHAT_ID)');
    return;
  }

  try {
    const text = formatEventMessage(payload);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
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

    // Регистрируем в очереди follow-up (только quiz_complete)
    if (payload.event_type === 'quiz_complete' && payload.user_id && payload.result_id) {
      await registerFollowUp(payload.user_id, payload.result_id);
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
