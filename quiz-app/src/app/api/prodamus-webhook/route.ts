import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { trackEvent, markFollowUpPaid, getAdminChatId } from '@/lib/notion';

const PRODAMUS_SECRET_KEY = process.env.PRODAMUS_SECRET_KEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN;
const MASTERCLASS_CHANNEL_LINK = process.env.MASTERCLASS_CHANNEL_LINK;

function sortDeep(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortDeep);
  if (val && typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[key] = sortDeep((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

// Parse form-urlencoded body into nested structure.
// Prodamus sends products as products[0][name], products[0][price], etc.
// URLSearchParams gives flat keys — we need to reconstruct the nested object.
function parseFormNested(text: string): Record<string, unknown> {
  const params = new URLSearchParams(text);
  const result: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    // Convert "products[0][name]" to path ["products", "0", "name"]
    const parts = key.replace(/\[([^\]]*)\]/g, '.$1').split('.');
    let cur: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      if (cur[part] === undefined) {
        cur[part] = /^\d+$/.test(next) ? [] : {};
      }
      cur = cur[part] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

function verifySignature(body: Record<string, unknown>, signature: string): boolean {
  if (!PRODAMUS_SECRET_KEY) {
    console.error('PRODAMUS_SECRET_KEY is not set');
    return false;
  }

  const sorted = sortDeep(body);
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
      body = parseFormNested(text);
    } else {
      body = JSON.parse(text);
    }

    // Prodamus sends signature in 'Sign' header (not in body)
    let signature = request.headers.get('sign') || request.headers.get('Sign') || '';
    // Strip "Sign: " prefix if present in header value
    if (signature.startsWith('Sign: ')) signature = signature.slice(6);

    if (!signature) {
      console.error('No signature in Sign header');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Verify HMAC signature over the full body (signature is separate in header)
    if (!verifySignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Check payment status
    const paymentStatus = body.payment_status;
    if (paymentStatus !== 'success') {
      console.log(`Payment status is "${paymentStatus}", skipping`);
      return NextResponse.json({ success: true });
    }

    // Prodamus puts their internal order_id in body.order_id,
    // our order ID (userId_resultId) comes in body.order_num
    const orderId = body.order_num || body.order_id || '';
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
