// Бронь «Личного бренда на 360»: /pay/bron360?u=<tg> → сразу форма Продамуса на 2 000 ₽.
// Ссылка уходит только из бота (цепочка брони), поэтому без u не продаём: ведём в бота,
// там бот отдаст личную ссылку. Бронь без Telegram выдать некуда: интервью и приложения в боте.
//
// order_id = bron360_<tg>_<хвост>, вебхук → onBronPaid (lib/bron360.ts).
// k=test: Саша проверяет цепочку целиком за 10 ₽ (только UNIQ_ADMINS).

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { cardFields, readCard } from '@/lib/payform-card';
import { BRON_PRICE } from '@/content/bron360';
import { BOT_BRON_URL, hasBron, seatsFull } from '@/lib/bron360';
import { UNIQ_ADMINS } from '@/lib/uniq/access';

export const dynamic = 'force-dynamic';

const FORM = 'https://thesashatoyz.payform.ru';
const NOTIFY = 'https://quizapp-ivory-delta.vercel.app/api/prodamus-webhook';
const BRON_TEST_PRICE = 10;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const uid = (q.get('u') || '').replace(/\D/g, '').slice(0, 15);
  if (uid.length < 3) return NextResponse.redirect(BOT_BRON_URL, 302);
  const tg = Number(uid);

  // Уже забронировал или мест нет: бот объяснит сам.
  if (await hasBron(tg)) return NextResponse.redirect(BOT_BRON_URL, 302);
  if (!UNIQ_ADMINS.has(tg) && (await seatsFull())) return NextResponse.redirect(`${BOT_BRON_URL}_full`, 302);

  const test = q.get('k') === 'test' && UNIQ_ADMINS.has(tg);
  const price = test ? BRON_TEST_PRICE : BRON_PRICE;
  const tail = Date.now().toString(36);
  const orderId = `bron360_${uid}_${tail}`;
  const fields: Record<string, string> = {
    do: 'pay',
    order_id: orderId,
    'products[0][name]': 'Бронь места «Личный бренд на 360» (в счёт первого месяца)',
    'products[0][price]': String(price),
    'products[0][quantity]': '1',
    paid_content: `Бронь принята. Вернись в Telegram: ${BOT_BRON_URL}, там твоё место и первые вопросы.`,
    urlNotification: NOTIFY,
    urlSuccess: BOT_BRON_URL,
    ...cardFields(readCard(request)),
  };

  const src = (q.get('src') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
  try {
    await trackEvent({
      event_type: 'checkout_open',
      utm_source: src ? `bron360_${src}` : 'bron360',
      metadata: { tag: 'bron360', price, order_id: orderId, src: src || null, tg, test: test || undefined },
    });
  } catch {}

  const url = `${FORM}?${Object.keys(fields).map((k) => `${k}=${encodeURIComponent(fields[k])}`).join('&')}`;
  return NextResponse.redirect(url, 302);
}
