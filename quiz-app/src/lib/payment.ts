const PRODAMUS_FORM_URL = process.env.NEXT_PUBLIC_PRODAMUS_FORM_URL || '';
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quizapp-ivory-delta.vercel.app';

export type ConnectorsTier = 'basic' | 'premium';

const CONNECTORS_TIER_CONFIG: Record<ConnectorsTier, { name: string; price: number }> = {
  basic: { name: 'Коннекторы — Базовый', price: 10000 },
  premium: { name: 'Коннекторы — Премиум', price: 20000 },
};

export function buildConnectorsPaymentUrl(userId: number, resultId: string, tier: ConnectorsTier): string {
  if (!PRODAMUS_FORM_URL) {
    return 'https://t.me/testtoyzbot';
  }

  const config = CONNECTORS_TIER_CONFIG[tier];
  const orderId = `conn_${userId}_${tier}_${resultId}`;
  const parts = [
    'do=pay',
    `products[0][name]=${encodeURIComponent(config.name)}`,
    `products[0][price]=${config.price}`,
    'products[0][quantity]=1',
    `order_id=${encodeURIComponent(orderId)}`,
  ];

  if (WEBAPP_URL) {
    parts.push(`urlNotification=${encodeURIComponent(`${WEBAPP_URL}/api/prodamus-webhook`)}`);
    parts.push(`urlSuccess=${encodeURIComponent(`${WEBAPP_URL}/connectors?payment=success`)}`);
  }

  return `${PRODAMUS_FORM_URL}?${parts.join('&')}`;
}

export function buildPaymentUrl(userId: number, resultId: string): string {
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

// МК «Разрешение быстрых денег» — разовая оплата 4 884 ₽.
// order_id формата mkdengi_<tgUserId> распознаётся в prodamus-webhook,
// после успешной оплаты выдаётся доступ (Purchase 'mk-dengi') и кабинет.
export function buildMkDengiPaymentUrl(userId: number): string {
  if (!PRODAMUS_FORM_URL) {
    return 'https://t.me/testtoyzbot';
  }

  const orderId = `mkdengi_${userId}`;
  const parts = [
    'do=pay',
    `products[0][name]=${encodeURIComponent('МК «Разрешение быстрых денег»')}`,
    'products[0][price]=4884',
    'products[0][quantity]=1',
    `order_id=${encodeURIComponent(orderId)}`,
  ];

  if (WEBAPP_URL) {
    parts.push(`urlNotification=${encodeURIComponent(`${WEBAPP_URL}/api/prodamus-webhook`)}`);
    parts.push(`urlSuccess=${encodeURIComponent(`${WEBAPP_URL}/cabinet?payment=success`)}`);
  }

  return `${PRODAMUS_FORM_URL}?${parts.join('&')}`;
}
