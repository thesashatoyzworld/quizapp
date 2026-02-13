'use client';

import { useTelegram } from '@/hooks/useTelegram';

interface ConnectorsCTAProps {
  resultType?: string;
  basicLabel: string;
  premiumLabel: string;
  basicPriceWeekly: string;
  premiumPriceWeekly: string;
  ctaButtonText: string;
}

function buildClientPaymentUrl(
  baseUrl: string,
  webappUrl: string,
  userId: number,
  resultId: string,
  tier: 'basic' | 'premium',
): string {
  const tierConfig = {
    basic: { name: 'Коннекторы — Базовый', price: 10000 },
    premium: { name: 'Коннекторы — Премиум', price: 20000 },
  };

  const config = tierConfig[tier];
  const orderId = `conn_${userId}_${tier}_${resultId}`;
  const parts = [
    'do=pay',
    `products[0][name]=${encodeURIComponent(config.name)}`,
    `products[0][price]=${config.price}`,
    'products[0][quantity]=1',
    `order_id=${encodeURIComponent(orderId)}`,
  ];

  if (webappUrl) {
    parts.push(`urlNotification=${encodeURIComponent(`${webappUrl}/api/prodamus-webhook`)}`);
    parts.push(`urlSuccess=${encodeURIComponent(`${webappUrl}/connectors?payment=success`)}`);
  }

  return `${baseUrl}?${parts.join('&')}`;
}

export function ConnectorsCTA({
  resultType,
  basicLabel,
  premiumLabel,
  basicPriceWeekly,
  premiumPriceWeekly,
  ctaButtonText,
}: ConnectorsCTAProps) {
  const { userId } = useTelegram();

  const prodamusUrl = process.env.NEXT_PUBLIC_PRODAMUS_FORM_URL || '';
  const webappUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || '';
  const resultId = resultType || 'direct';

  if (!userId || !prodamusUrl) {
    return (
      <div className="connectors-cta-buttons">
        <a
          className="btn-neon connectors-cta-btn"
          style={{ opacity: 0.5, pointerEvents: 'none' }}
        >
          {ctaButtonText}
        </a>
        <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
          Откройте через Telegram для оплаты
        </p>
      </div>
    );
  }

  const basicUrl = buildClientPaymentUrl(prodamusUrl, webappUrl, userId, resultId, 'basic');
  const premiumUrl = buildClientPaymentUrl(prodamusUrl, webappUrl, userId, resultId, 'premium');

  return (
    <div className="connectors-cta-buttons">
      <a
        href={premiumUrl}
        className="btn-neon connectors-cta-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        {premiumLabel} — {premiumPriceWeekly}
      </a>
      <a
        href={basicUrl}
        className="btn-neon connectors-cta-btn connectors-cta-btn-secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {basicLabel} — {basicPriceWeekly}
      </a>
    </div>
  );
}

export function ConnectorsTierButtons({
  resultType,
  basicLabel,
  premiumLabel,
  basicPriceWeekly,
  premiumPriceWeekly,
}: Omit<ConnectorsCTAProps, 'ctaButtonText'>) {
  const { userId } = useTelegram();

  const prodamusUrl = process.env.NEXT_PUBLIC_PRODAMUS_FORM_URL || '';
  const webappUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || '';
  const resultId = resultType || 'direct';

  if (!userId || !prodamusUrl) {
    return null;
  }

  const basicUrl = buildClientPaymentUrl(prodamusUrl, webappUrl, userId, resultId, 'basic');
  const premiumUrl = buildClientPaymentUrl(prodamusUrl, webappUrl, userId, resultId, 'premium');

  return (
    <>
      <a
        href={basicUrl}
        className="connectors-tier-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        {basicLabel} — {basicPriceWeekly}
      </a>
      <a
        href={premiumUrl}
        className="connectors-tier-btn connectors-tier-btn-premium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {premiumLabel} — {premiumPriceWeekly}
      </a>
    </>
  );
}
