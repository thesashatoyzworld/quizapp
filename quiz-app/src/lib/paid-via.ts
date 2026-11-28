// Подпись «откуда пришла оплата» для /admin/uroven. Без Prisma, чтобы проверялась тестом.

export type PaidVia = {
  source: string | null;
  co_src: string | null;
  co_method: string | null;
  co_utm: string | null;
  co_from: string | null;
  co_post: string | null;
};

export const SOURCE_RU: Record<string, string> = {
  'casino-block': 'блок-казино',
  popup: 'попап',
  final: 'финал статьи',
  inline: 'по тексту',
  floatcta: 'плавающая кнопка',
  'urovni-article': 'статья 6 уровней',
  'chitkody-article': 'статья чит-коды',
  'article-bottom': 'низ статьи',
};

const PAY_SRC_RU: Record<string, string> = {
  potok: 'Поток Спроса',
  yt: 'YouTube',
  ig: 'Instagram',
  lichka: 'личка',
};

// Откуда пришла оплата — по чекауту, который её открыл (checkout_open с тем же order_id).
// Метка ?src= на ссылке оплаты главнее способа: /pay/t1?src=potok — это «Поток Спроса»,
// даже если сама ссылка обычная.
// Метка поста (?post=, utm_content из ссылки бота) дописывается к любому пути:
// «Поток Спроса · пост tg2811», A/B-метка src при этом остаётся как была.
export function paidViaLabel(r: PaidVia): string {
  const base = paidViaBase(r);
  return r.co_post ? `${base} · пост ${r.co_post}` : base;
}

function paidViaBase(r: PaidVia): string {
  if (r.co_src) return PAY_SRC_RU[r.co_src] || r.co_src;
  if (r.co_utm === 'uroven_dop_potok') return 'доплата из Потока Спроса';
  const from = r.co_from || (r.co_utm === 'ig' ? 'ig' : null);
  const fromRu = from ? ` · ${PAY_SRC_RU[from] || SOURCE_RU[from] || from}` : '';
  switch (r.co_method) {
    case 'deal_link':
      return 'прайс-ссылка';
    case 'tg_openlink':
      return 'бот';
    case 'paylink_tg':
      return 'лендинг в Telegram';
    case 'bounce_bot':
    case 'browser_card':
    case 'tg_webview':
      return `лендинг${fromRu}`;
    case 'paylink':
      return 'ссылка на оплату';
  }
  // Чекаута нет: доступ выдан скриптом мимо формы (перевод, крипта, PayPal)
  return r.source === 'web_redeem' ? 'выдано вручную' : 'не отмечено';
}
