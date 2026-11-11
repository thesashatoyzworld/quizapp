// Вебхук PayPal (developer.paypal.com → приложение → Webhooks).
// Каждое списание по подписке (PAYMENT.SALE.COMPLETED) продлевает доступ.
// Подпись проверяется через API PayPal: без неё любой мог бы прислать «оплачено».
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook, getSubscription, fulfillPayment, parseCustom } from '@/lib/paypal';
import { notifyAdmin } from '@/lib/telegram';

interface PpEvent {
  event_type: string;
  resource: { id: string; billing_agreement_id?: string; amount?: { total?: string }; custom_id?: string; status?: string };
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!(await verifyWebhook(req.headers, raw))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const ev = JSON.parse(raw) as PpEvent;
    if (ev.event_type === 'PAYMENT.SALE.COMPLETED' && ev.resource.billing_agreement_id) {
      const sub = await getSubscription(ev.resource.billing_agreement_id);
      await fulfillPayment(sub, ev.resource.id, ev.resource.amount?.total, 'webhook');
    } else if (ev.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' || ev.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      const c = parseCustom(ev.resource.custom_id);
      if (c) {
        const what = ev.event_type.endsWith('CANCELLED') ? 'отменил подписку' : 'списание не прошло';
        await notifyAdmin(`PayPal: ${what} (${c.plan}), TG ${c.telegramId}. Доступ доживёт до конца оплаченного срока.`, { parseMode: null });
      }
    }
  } catch (e) {
    console.error('[paypal-webhook]', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
