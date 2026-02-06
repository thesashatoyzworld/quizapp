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

  // Pass user data in order_id (not visible to buyer), friendly text in customer_extra
  const orderId = `${userId || 0}_${resultId || 'unknown'}`;

  // Build URL manually — Prodamus requires literal [] brackets and do=pay
  const parts = [
    `do=pay`,
    `products[0][name]=${encodeURIComponent('Мастер-класс «Продающий контент»')}`,
    `products[0][price]=3450`,
    `products[0][quantity]=1`,
    `order_id=${encodeURIComponent(orderId)}`,
  ];

  if (WEBAPP_URL) {
    parts.push(`urlNotification=${encodeURIComponent(`${WEBAPP_URL}/api/prodamus-webhook`)}`);
    parts.push(`urlSuccess=${encodeURIComponent(`${WEBAPP_URL}?payment=success`)}`);
  }

  return `${PRODAMUS_FORM_URL}?${parts.join('&')}`;
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
