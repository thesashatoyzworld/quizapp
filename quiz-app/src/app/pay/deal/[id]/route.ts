// ─────────────────────────────────────────────────────────────
// Оплата по прайс-ссылке: /pay/deal/<id> → форма Продамуса с её ценой.
//
// Кнопка в боте ведёт сюда с ?u=<tgId>, поэтому order_id получается
// deal_<id>_<tgId>_<хвост>, и вебхук открывает доступ прямо на этот телеграм.
// Цену собирает сервер из строки прайса: страница её задать не может, как не
// может и у каталожных тарифов (после оплаты 3 450 вместо 5 450).
//
// Ссылка многоразовая: по ней платят разные люди и один человек не один раз.
// Закрывается не удалением, а статусом off.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { getDeal, dealOrderId } from '@/lib/deals';
import { BOT } from '@/lib/sales';

const FORM = 'https://thesashatoyz.payform.ru';
const NOTIFY = 'https://quizapp-ivory-delta.vercel.app/api/prodamus-webhook';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getDeal(id);

  // Нет такой позиции или она закрыта — не показываем форму, уводим в бота.
  if (!deal || deal.status !== 'active') {
    return NextResponse.redirect(`${BOT}?start=kabinet`, 302);
  }

  const uid = (request.nextUrl.searchParams.get('u') || '').replace(/\D/g, '').slice(0, 15);
  const telegramId = uid.length >= 3 ? parseInt(uid, 10) : null;

  const orderId = dealOrderId(deal.id, telegramId);
  const bind = `${BOT}?start=kabinet`;

  const fields: Record<string, string> = {
    do: 'pay',
    order_id: orderId,
    'products[0][name]': deal.title,
    'products[0][price]': String(deal.price),
    'products[0][quantity]': '1',
    paid_content: `Оплата принята: «${deal.title}». Открой доступ в Telegram: ${bind}`,
    urlNotification: NOTIFY,
    urlSuccess: bind,
  };

  try {
    await trackEvent({
      event_type: 'checkout_open',
      user_id: telegramId ?? undefined,
      utm_source: 'uroven_deal',
      metadata: {
        tag: 'uroven', deal: deal.id, tier: deal.tier, price: deal.price,
        days: deal.days, method: 'deal_link', order_id: orderId,
        tg: telegramId ?? undefined,
      },
    });
  } catch {}

  const url = `${FORM}?${Object.keys(fields)
    .map((k) => `${k}=${encodeURIComponent(fields[k])}`)
    .join('&')}`;

  return NextResponse.redirect(url, 302);
}
