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
import { canBuy, isPersonalKey, waitlistLink, OLD_PRICE_KEY } from '@/lib/sales';
import { prices } from '@/content/prices';
import { CATALOG } from '@/lib/catalog';

const FORM = 'https://thesashatoyz.payform.ru';
const BOT = 'https://t.me/testtoyzbot';
const NOTIFY = 'https://quizapp-ivory-delta.vercel.app/api/prodamus-webhook';

// ⚠️ У тарифа 2 три карточки подписки в Продамусе, по одной на каждую цену:
// сумма жёстко зашита в карточку, произвольную ей не передать.
//   3061890 — 12 000 каждые 30 дней, цена с 13 сентября. Идёт всем новым.
//   2356023 — 10 000 каждые 30 дней, цена до 13 сентября. Только по ключу svoi10,
//     то есть тому, кому Саша уже назвал 10 000. Та же карточка обслуживает
//     «Синхронизацию» — кто именно купил, видно по order_id, не по подписке.
//   2987944 — 7 500, старики из LEGACY_T2. Трогать её нельзя.
// Цена на витрине считается из prices(), но списывает всё равно карточка: после
// подорожания 13.09 витрина показывала 12 000, а старая 2356023 списывала 10 000.
const T2_SUB = '3061890';      // 12 000 каждые 30 дней
const T2_SUB_OLD = '2356023';  // 10 000 каждые 30 дней, только по ключу svoi10
const OLD_T2_PRICE = 10000;    // что реально спишет T2_SUB_OLD — для трекинга

// Цена разового т1 берётся из каталога, а не дублируется здесь: именно
// расхождение копий цены и дало оплату 3 450 вместо 5 450 (20.08).
// Цена считается в момент запроса, а не при загрузке модуля: 13 сентября она
// меняется сама, и тёплая лямбда не должна выдавать вчерашнюю ссылку.
const tiers = (): Record<string, { name: string; price: number; sub?: string }> => {
  const p = prices();
  return {
    t1: { name: 'Тариф 1 (делаешь сам)', price: p.t1 },
    t2: { name: 'Тариф 2 (сам + монетизация)', price: p.t2Month, sub: T2_SUB },
    t3: { name: 'Тариф 3 (делаем вместе)', price: p.t3Month, sub: '2989937' },
  };
};

// Кто зашёл в тариф 2 по 7 500, тот и продлевается по 7 500: цену задним числом
// человеку не поднимаем. Ссылка при этом одна на всех — карточку подписки
// выбирает сервер по telegram_id, а не отдельная ссылка со старой ценой.
// Список поимённый, потому что вывести его из данных нельзя: оплаты шли мимо
// системы (крипта, перевод, счёт руками), и в purchases их попросту нет.
// Ирина, Анна и Михаил сюда НЕ входят — они добрали т1 до десяти тысяч.
const LEGACY_T2_SUB = '2987944'; // старая карточка Продамуса, 7 500/мес
const LEGACY_T2_PRICE = 7500;
const LEGACY_T2: Record<string, string> = {
  '125013977': 'dmk1982',
  '737814065': 'Netpregrad',
  '826748516': 'keepcalmanddoyoga8',
  '406295413': 'unforgettable_inna',
  '364601750': 'jeckas_telko',
  '171377516': 'Zohanty',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ tier: string }> }) {
  const { tier: raw } = await params;
  const TIERS = tiers();
  const tier = TIERS[raw] ? raw : 't1';
  const t = TIERS[tier];

  const key = request.nextUrl.searchParams.get('k');
  const personal = isPersonalKey(key);
  // Ключ svoi10 — тот же тариф по старой цене: и витрина чекаута, и карточка
  // подписки остаются на 10 000. Он выдаётся руками тому, кому цену назвали
  // до подорожания.

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

  // Старая цена тарифа 2 — только по узнанному Telegram: без него мы не знаем,
  // кто пришёл, и продаём по текущей цене.
  const legacyT2 = tier === 't2' && byTelegram && !!LEGACY_T2[uid];
  const oldPriceT2 = tier === 't2' && key === OLD_PRICE_KEY;

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
  if (legacyT2) {
    fields.subscription = LEGACY_T2_SUB;
  } else if (oldPriceT2) {
    fields.subscription = T2_SUB_OLD;
  } else if (t.sub) {
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
        tag: 'uroven', tier, price: legacyT2 ? LEGACY_T2_PRICE : oldPriceT2 ? OLD_T2_PRICE : t.price,
        legacy: legacyT2 ? LEGACY_T2[uid] : undefined,
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
