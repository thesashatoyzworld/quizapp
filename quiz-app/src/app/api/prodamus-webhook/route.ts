import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { trackEvent, markFollowUpPaid } from '@/lib/notion';

const PRODAMUS_SECRET_KEY = process.env.PRODAMUS_SECRET_KEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

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

  const message = `✅ Оплата получена!

🎓 Мастер-класс «Продающий контент»
📅 24 февраля, 17:00 мск

Ссылка на эфир: [будет отправлена за 1 час до начала]

🎁 Ваш бонус «Богатая ЦА»: [будет отправлен отдельным сообщением]

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
    console.error('Failed to send materials to user:', error);
  }
}

async function notifyAdmin(tgUserId: number, resultId: string) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return;

  const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  const text = `✅ <b>ОПЛАТА ПОЛУЧЕНА!</b>

👤 User ID: <code>${tgUserId}</code>
💰 Сумма: <b>3 450₽</b>
📊 Результат квиза: <b>${resultId}</b>
⏰ ${timestamp}`;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract signature from body (Prodamus sends it as _signature field)
    const signature = body._signature || '';
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

    // Extract tg_user_id and result_id from order_id (format: "userId_resultId")
    let tgUserId: number | null = null;
    let resultId = 'unknown';

    const orderId = body.order_id || body.order_num || '';
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

    // Execute all post-payment actions in parallel
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
    ]);

    console.log(`[Prodamus Webhook] Payment success for user ${tgUserId}, result: ${resultId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prodamus webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
