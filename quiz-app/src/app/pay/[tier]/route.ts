// ─────────────────────────────────────────────────────────────
// Короткая ссылка на оплату: /pay/t1 → сразу форма Продамуса.
//
// Зачем: путь «канал → бот → мини-апп → Оформить доступ → Продамус»
// оказался слишком длинным — покупатели отваливались, жалуясь на
// «столько переходов». Эта ссылка отдаётся человеку напрямую (в личку,
// в пост, в ответ на вопрос) и ведёт на оплату одним кликом.
//
// Разовый Тариф 1 → products[]; подписочные t2/t3 → subscription (сумма
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
import { canBuy, PERSONAL_KEY, waitlistLink } from '@/lib/sales';
import { CATALOG } from '@/lib/catalog';

const FORM = 'https://thesashatoyz.payform.ru';
const BOT = 'https://t.me/testtoyzbot';
const NOTIFY = 'https://quizapp-ivory-delta.vercel.app/api/prodamus-webhook';

// ⚠️ У тарифа 2 подписка 2356023, а НЕ 2987944: старая карточка выставляет
// 7 500, на ней сидят десять человек по прежней цене, и трогать её нельзя.
// 2356023 списывает 10 000 сразу и каждые 30 дней. Та же карточка обслуживает
// «Синхронизацию» — цена и период совпадают, а кто именно купил, видно
// по нашему order_id, не по подписке.
// Цена разового т1 берётся из каталога, а не дублируется здесь: именно
// расхождение копий цены и дало оплату 3 450 вместо 5 450 (20.08).
const TIERS: Record<string, { name: string; price: number; sub?: string }> = {
  t1: { name: 'Тариф 1 (делаешь сам)', price: CATALOG.uroven_t1.price },
  t2: { name: 'Тариф 2 (сам + монетизация)', price: 10000, sub: '2356023' },
  t3: { name: 'Тариф 3 (делаем вместе)', price: 50000, sub: '2989937' },
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ tier: string }> }) {
  const { tier: raw } = await params;
  const tier = TIERS[raw] ? raw : 't1';
  const t = TIERS[tier];

  const personal = request.nextUrl.searchParams.get('k') === PERSONAL_KEY;

  // Набор на тариф закрыт: ссылка не ведёт в тупик, а записывает в лист ожидания.
  // Старые ссылки из постов и переписок продолжают работать — просто иначе.
  if (!canBuy(tier, personal)) {
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

  // Кнопки лендинга внутри Telegram передают сюда id покупателя (?u=<tgId>):
  // тогда order_id опознаётся вебхуком как телеграмный и доступ выдаётся прямо
  // на аккаунт, без промежуточного токена. Цену при этом задаёт сервер, а не
  // страница — закэшированный лендинг больше не может продать по старой цене.
  const uid = (request.nextUrl.searchParams.get('u') || '').replace(/\D/g, '').slice(0, 15);
  const byTelegram = uid.length >= 3;

  // base36 без «_», иначе ломается разбор order_id по «_web_»
  const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const orderId = byTelegram ? `uroven_${tier}_${uid}` : `uroven_${tier}_web_${token}`;
  // Куда Продамус вернёт человека после оплаты. Оплата с привязкой к Telegram
  // уже выдана вебхуком по её order_id, поэтому возвращаем в кабинет, а не на
  // ссылку тарифа: та снова открывала чекаут, а на закрытом тарифе встречала
  // оплатившего человека листом ожидания.
  const bind = byTelegram ? `${BOT}?start=kabinet` : `${BOT}?start=paid_${token}`;
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
        tag: 'uroven', tier, price: t.price,
        method: byTelegram ? 'paylink_tg' : 'paylink',
        order_id: orderId, src: src || null,
        tg: byTelegram ? Number(uid) : undefined,
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
