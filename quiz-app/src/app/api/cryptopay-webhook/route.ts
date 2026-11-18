// Вебхук Crypto Pay (@CryptoBot → Crypto Pay → приложение → Webhooks).
// На invoice_paid открывает доступ. Подпись обязательна: без неё любой мог бы
// прислать «оплачено» и получить доступ.
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, fulfillInvoice, type CpInvoice } from '@/lib/cryptopay';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get('crypto-pay-api-signature'))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const update = JSON.parse(raw) as { update_type: string; payload: CpInvoice };
    if (update.update_type === 'invoice_paid') await fulfillInvoice(update.payload, 'webhook');
  } catch (e) {
    console.error('[cryptopay-webhook]', e);
  }
  return NextResponse.json({ ok: true });
}
