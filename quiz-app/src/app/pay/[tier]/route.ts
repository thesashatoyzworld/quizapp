// ─────────────────────────────────────────────────────────────
// Короткая ссылка на оплату: /pay/t1 → сразу форма Продамуса.
//
// Зачем: путь «канал → бот → мини-апп → Оформить доступ → Продамус»
// оказался слишком длинным — покупатели отваливались, жалуясь на
// «столько переходов». Эта ссылка отдаётся человеку напрямую (в личку,
// в пост, в ответ на вопрос) и ведёт на оплату одним кликом.
//
// Разовый Тариф 1 → products[]; подписочный t3 → subscription (сумма
// и период берутся из карточки подписки в Продамусе).
// order_id = uroven_<tier>_web_<token>, как у оплаты картой с сайта:
// вебхук создаст событие web_paid, а urlSuccess вернёт человека в бота
// по /start paid_<token>, где доступ привяжется к его Telegram.
//
// Закрытый тариф открывается лично: /pay/t2?k=svoi ведёт на оплату, а не
// в лист ожидания. Ключ не про безопасность (цена та же), а про то, чтобы
// ссылка из личной переписки не разошлась по постам мимо набора.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { isOnSale, waitlistLink } from '@/lib/sales';

const FORM = 'https://thesashatoyz.payform.ru';
const BOT = 'https://t.me/testtoyzbot';
const NOTIFY = 'https://quizapp-ivory-delta.vercel.app/api/prodamus-webhook';

// ⚠️ У тарифа 2 подписки нет намеренно: карточка 2987944 выставляет старые
// 7 500, на ней сидят десять человек по прежней цене, и трогать её нельзя.
// Пока в Продамусе не заведена подписка на 10 000, тариф 2 продаётся разовым
// платежом на месяц, продление руками. Появится карточка — вернуть sub сюда
// И в public/uroven/checkout.html.
const TIERS: Record<string, { name: string; price: number; sub?: string }> = {
  t1: { name: 'Тариф 1 (делаешь сам)', price: 5450 },
  t2: { name: 'Тариф 2 (сам + монетизация)', price: 10000 },
  t3: { name: 'Тариф 3 (делаем вместе)', price: 50000, sub: '2989937' },
};

/** Личный ключ, открывающий закрытый тариф: /pay/t2?k=svoi */
const PERSONAL_KEY = 'svoi';

export async function GET(request: NextRequest, { params }: { params: Promise<{ tier: string }> }) {
  const { tier: raw } = await params;
  const tier = TIERS[raw] ? raw : 't1';
  const t = TIERS[tier];

  const personal = request.nextUrl.searchParams.get('k') === PERSONAL_KEY;

  // Набор на тариф закрыт: ссылка не ведёт в тупик, а записывает в лист ожидания.
  // Старые ссылки из постов и переписок продолжают работать — просто иначе.
  if (!isOnSale(tier) && !personal) {
    const src = (request.nextUrl.searchParams.get('src') || '')
      .toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
    try {
      await trackEvent({
        event_type: 'waitlist_redirect',
        utm_source: src ? `uroven_${src}` : 'uroven_paylink',
        metadata: { tag: 'uroven', tier, src: src || null },
      });
    } catch {}
    return NextResponse.redirect(waitlistLink(tier), 302);
  }

  // base36 без «_», иначе ломается разбор order_id по «_web_»
  const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const orderId = `uroven_${tier}_web_${token}`;
  const bind = `${BOT}?start=paid_${token}`;
  const name = `Новый уровень контента — ${t.name}`;

  const fields: Record<string, string> = {
    do: 'pay',
    order_id: orderId,
    paid_content:
      `Оплата принята: «Новый уровень контента» (${t.name}). ` +
      `Открой доступ в Telegram: ${bind} — внутри предобучение: ` +
      `«Продающий Контент» и «Формула Вирусного Контента». Курс записан целиком.`,
    urlNotification: NOTIFY,
    urlSuccess: bind,
  };
  if (t.sub) {
    fields.subscription = t.sub;
  } else {
    fields['products[0][name]'] = name;
    fields['products[0][price]'] = String(t.price);
    fields['products[0][quantity]'] = '1';
  }

  // Метка источника, если её передали: /pay/t1?src=oksana
  const src = (request.nextUrl.searchParams.get('src') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);

  // Трекинг не должен мешать оплате — падение молча игнорируем.
  try {
    await trackEvent({
      event_type: 'checkout_open',
      utm_source: src ? `uroven_${src}` : 'uroven_paylink',
      metadata: {
        tag: 'uroven', tier, price: t.price, method: 'paylink',
        order_id: orderId, src: src || null,
        // Личная ссылка на закрытый тариф — чтобы в статистике набора её было видно отдельно.
        personal: personal || undefined,
      },
    });
  } catch {}

  const url = `${FORM}?${Object.keys(fields)
    .map((k) => `${k}=${encodeURIComponent(fields[k])}`)
    .join('&')}`;

  return NextResponse.redirect(url, 302);
}
