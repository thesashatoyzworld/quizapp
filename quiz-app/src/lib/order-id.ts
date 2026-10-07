// Разбор наших order_id без базы: отдельно, чтобы тестировалось без DATABASE_URL.

/** Телеграм из нашего order_id. null — в order_id его нет (веб-оплата, чужой формат). */
export function tgFromOrderId(orderId: string): number | null {
  const parts = orderId.split('_');
  let raw = '';
  if (orderId.startsWith('deal_')) raw = parts[2] || ''; // deal_<id>_<tg>_<хвост>
  else if (orderId.startsWith('uroven_')) raw = parts[2] || ''; // uroven_<tier>_<tg>
  else if (orderId.startsWith('potok_sprosa_')) raw = parts[2] || ''; // potok_sprosa_<tg>
  else if (orderId.startsWith('mkdengi_')) raw = parts[1] || ''; // mkdengi_<tg>
  if (!/^\d+$/.test(raw)) return null;
  const tg = parseInt(raw, 10);
  return tg > 1000 ? tg : null;
}
