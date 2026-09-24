// ─────────────────────────────────────────────────────────────
// Доплата с «Потока Спроса» до полного курса: /pay/dop → форма Продамуса.
//
// Единственное место, откуда эта ссылка даётся, — экран после оплаты
// трипвайра (thesashatoyz.com/potok-sprosa/gotovo). Цену считает сервер как
// разницу между тарифом 1 и «Потоком», поэтому подъём цены курса меняет её
// сам, а страница не может продать курс дешевле, чем он стоит.
//
// order_id = uroven_dop_<tgId> | uroven_dop_web_<token>. Вебхук разбирает его
// тем же кодом, что и остальные заказы курса, и выдаёт доступ тарифа 1.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { CATALOG } from '@/lib/catalog';
import { canBuy, waitlistLink } from '@/lib/sales';

const FORM = 'https://thesashatoyz.payform.ru';
const BOT = 'https://t.me/testtoyzbot';
const NOTIFY = 'https://quizapp-ivory-delta.vercel.app/api/prodamus-webhook';

export async function GET(request: NextRequest) {
  const product = CATALOG.uroven_dop;

  // Тариф 1 закрыт — доплачивать некуда: ведём туда же, куда ведёт его ссылка.
  if (!canBuy('t1')) return NextResponse.redirect(waitlistLink('t1'), 302);

  // ?u=<tgId> — человека узнали (кнопка из бота). ?t=<token> — он пришёл
  // с экрана после оплаты «Потока», и это токен ТОЙ покупки: по нему мы
  // связываем доплату с ней в событии, но свой токен у неё отдельный.
  const uid = (request.nextUrl.searchParams.get('u') || '').replace(/\D/g, '').slice(0, 15);
  const from = (request.nextUrl.searchParams.get('t') || '').replace(/[^a-z0-9]/gi, '').slice(0, 64);
  const byTelegram = uid.length >= 3;

  // base36 без «_», иначе ломается разбор order_id по «_web_»
  const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const orderId = byTelegram ? `uroven_dop_${uid}` : `uroven_dop_web_${token}`;
  const bind = byTelegram ? `${BOT}?start=kabinet` : `${BOT}?start=paid_${token}`;

  const fields: Record<string, string> = {
    do: 'pay',
    order_id: orderId,
    'products[0][name]': product.name,
    'products[0][price]': String(product.price),
    'products[0][quantity]': '1',
    paid_content:
      `Доплата принята: курс «Новый уровень контента» открыт целиком. ` +
      `Открой доступ в Telegram: ${bind} — внутри шесть уровней, «Формула вирусного ` +
      `контента», «Продающий контент» и промпты.`,
    urlNotification: NOTIFY,
    urlSuccess: bind,
  };

  try {
    await trackEvent({
      event_type: 'checkout_open',
      utm_source: 'uroven_dop_potok',
      metadata: {
        tag: 'uroven', tier: 't1', price: product.price,
        method: byTelegram ? 'paylink_tg' : 'paylink',
        order_id: orderId, from: from || null,
        tg: byTelegram ? Number(uid) : undefined,
      },
    });
  } catch {}

  const url = `${FORM}?${Object.keys(fields)
    .map((k) => `${k}=${encodeURIComponent(fields[k])}`)
    .join('&')}`;

  return NextResponse.redirect(url, 302);
}
