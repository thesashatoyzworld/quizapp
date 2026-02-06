'use client';

import React from 'react';

interface PaymentButtonProps {
  resultTitle: string;
  userId?: number | null;
  resultId?: string;
  onPaymentClick?: () => void;
}

const PRODAMUS_FORM_URL = process.env.NEXT_PUBLIC_PRODAMUS_FORM_URL || '';
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || '';

function buildProdamusUrl(userId: number | null | undefined, resultId: string | undefined): string {
  if (!PRODAMUS_FORM_URL) {
    return 'https://t.me/sashatoyz_bot?start=pay_masterclass';
  }

  const params = new URLSearchParams();
  params.set('products[0][name]', 'Мастер-класс «Продающий контент»');
  params.set('products[0][price]', '3450');
  params.set('products[0][quantity]', '1');

  const customerExtra = JSON.stringify({
    tg_user_id: userId || null,
    result_id: resultId || 'unknown',
  });
  params.set('customer_extra', customerExtra);

  if (WEBAPP_URL) {
    params.set('urlNotification', `${WEBAPP_URL}/api/prodamus-webhook`);
    params.set('urlSuccess', `${WEBAPP_URL}?payment=success`);
  }

  return `${PRODAMUS_FORM_URL}?${params.toString()}`;
}

export default function PaymentButton({
  resultTitle,
  userId,
  resultId,
  onPaymentClick,
}: PaymentButtonProps) {
  const handleClick = () => {
    onPaymentClick?.();

    const paymentUrl = buildProdamusUrl(userId, resultId);

    // In Telegram context, use openLink; otherwise window.open
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    if (tg) {
      tg.openLink(paymentUrl);
    } else {
      window.open(paymentUrl, '_blank');
    }
  };

  return (
    <div className="payment-section">
      <button
        onClick={handleClick}
        className="btn-payment"
      >
        💳 Оплатить мастер-класс — 3 450₽
      </button>
      <p className="payment-note">
        После оплаты бот пришлёт доступ и бонус
      </p>
    </div>
  );
}
