import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { trackEvent, markFollowUpPaid, getAdminChatId } from '@/lib/notion';

const PRODAMUS_SECRET_KEY = process.env.PRODAMUS_SECRET_KEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN;
const MASTERCLASS_CHANNEL_LINK = process.env.MASTERCLASS_CHANNEL_LINK;

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      sorted[key] = sortObject(val as Record<string, unknown>);
    } else {
      sorted[key] = val;
    }
  }
  return sorted;
}

function verifySignature(body: Record<string, unknown>, signature: string): boolean {
  if (!PRODAMUS_SECRET_KEY) {
    console.error('PRODAMUS_SECRET_KEY is not set');
    return false;
  }

  const sorted = sortObject(body);
  const json = JSON.stringify(sorted);
  const hmac = crypto.createHmac('sha256', PRODAMUS_SECRET_KEY).update(json).digest('hex');
  return hmac === signature;
}

async function sendMaterialsToUser(tgUserId: number) {
  if (!BOT_TOKEN) {
    console.error('BOT_TOKEN not set, cannot send materials');
    return;
  }

  // Build message with channel link if available
  let message: string;
  if (MASTERCLASS_CHANNEL_LINK) {
    message = `Оплата получена!

Мастер-класс "Продающий контент"

Ваша ссылка на закрытый канал: ${MASTERCLASS_CHANNEL_LINK}

Бонус "Богатая ЦА" — уже доступен в канале.

Если возникнут вопросы — напишите сюда.`;
  } else {
    message = `Оплата получена!

Мастер-класс "Продающий контент"

Ссылка на канал будет отправлена отдельным сообщением.

Если возникнут вопросы — напишите сюда.`;
    console.warn('MASTERCLASS_CHANNEL_LINK not set, using fallback message');
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send materials to user:', error);
  }
}

async function notifyAdmin(tgUserId: number, resultId: string) {
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const text = `Оплата 3,450 руб от user ${tgUserId} (результат: ${resultId})`;

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

async function sendMidSequenceThankYou(tgUserId: number) {
  if (!BOT_TOKEN) return;

  const message = `Спасибо за покупку! Все дальнейшие материалы ждут вас в закрытом канале.`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send mid-sequence thank-you:', error);
  }
}

async function sendConnectorsConfirmation(tgUserId: number, tierLabel: string) {
  if (!BOT_TOKEN) return;

  const message = `Оплата получена!

Программа "Коннекторы" — тариф "${tierLabel}"

Саша свяжется с вами в ближайшее время для организации старта.

Если возникнут вопросы — напишите сюда.`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send connectors confirmation:', error);
  }
}

async function notifyAdminConnectors(tgUserId: number, tierLabel: string, amount: number, resultId: string) {
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const text = `Коннекторы: оплата ${amount.toLocaleString('ru-RU')} руб (${tierLabel}) от user ${tgUserId} (результат: ${resultId})`;

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
    console.error('Failed to notify admin about connectors payment:', error);
  }
}

async function notifyAdminError(errorMessage: string) {
  if (!BOT_TOKEN) return;

  try {
    const adminChatId = await getAdminChatId();
    if (!adminChatId) return;

    const text = `⚠️ Ошибка webhook: ${errorMessage}`;

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
    console.error('Failed to notify admin about error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const contentType = request.headers.get('content-type') || '';

    let body: Record<string, unknown>;
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      body = JSON.parse(text);
    }

    // Extract signature from body (Prodamus sends it as _signature field)
    const signature = typeof body._signature === 'string' ? body._signature : '';
    if (!signature) {
      console.error('No signature in webhook payload');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Remove _signature from body before verification
    const { _signature, ...bodyWithoutSignature } = body;

    // Verify HMAC signature
    if (!verifySignature(bodyWithoutSignature, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Check payment status
    const paymentStatus = body.payment_status;
    if (paymentStatus !== 'success') {
      console.log(`Payment status is "${paymentStatus}", skipping`);
      return NextResponse.json({ success: true });
    }

    const orderId = body.order_id || body.order_num || '';
    const isConnectors = typeof orderId === 'string' && orderId.startsWith('conn_');

    if (isConnectors) {
      // Connectors payment: order_id format "conn_userId_tier_resultId"
      const parts = orderId.split('_');
      // parts: ["conn", <userId>, <tier>, <resultId>]
      const tgUserId = parts.length >= 3 ? parseInt(parts[1], 10) : null;
      const tier = parts.length >= 3 ? parts[2] : 'unknown';
      const resultId = parts.length >= 4 ? parts[3] : 'unknown';

      if (!tgUserId || tgUserId <= 0) {
        console.error('No tg_user_id in connectors order_id:', orderId);
        return NextResponse.json({ success: true });
      }

      const tierLabel = tier === 'premium' ? 'Премиум' : 'Базовый';
      const amount = tier === 'premium' ? 20000 : 10000;

      await Promise.all([
        sendConnectorsConfirmation(tgUserId, tierLabel),
        notifyAdminConnectors(tgUserId, tierLabel, amount, resultId),
        trackEvent({
          event_type: 'connectors_payment',
          user_id: tgUserId,
          result_title: tier,
          result_id: resultId,
          amount,
        }),
      ]);

      console.log(`[Prodamus Webhook] Connectors ${tierLabel} payment from user ${tgUserId}, result: ${resultId}`);
    } else {
      // Masterclass payment: order_id format "userId_resultId"
      let tgUserId: number | null = null;
      let resultId = 'unknown';

      if (typeof orderId === 'string' && orderId.includes('_')) {
        const [userPart, ...resultParts] = orderId.split('_');
        const parsed = parseInt(userPart, 10);
        if (parsed > 0) tgUserId = parsed;
        resultId = resultParts.join('_') || 'unknown';
      }

      if (!tgUserId) {
        console.error('No tg_user_id in order_id:', orderId);
        return NextResponse.json({ success: true });
      }

      await Promise.all([
        sendMaterialsToUser(tgUserId),
        notifyAdmin(tgUserId, resultId),
        trackEvent({
          event_type: 'payment_success',
          user_id: tgUserId,
          result_title: resultId,
          amount: 3450,
        }),
        markFollowUpPaid(tgUserId),
        sendMidSequenceThankYou(tgUserId),
      ]);

      console.log(`[Prodamus Webhook] Payment success for user ${tgUserId}, result: ${resultId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prodamus webhook error:', error);

    // Notify admin about webhook error
    const errorMessage = error instanceof Error ? error.message : String(error);
    await notifyAdminError(errorMessage);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
