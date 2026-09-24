// ─────────────────────────────────────────────────────────────
// Короткая ссылка на оплату «Потока Спроса»: /pay/potok → форма Продамуса.
//
// Это та ссылка, которую ставит кнопка на thesashatoyz.com/potok-sprosa
// и бот. Цену задаёт сервер из каталога, а не страница: закэшированный
// лендинг со старой ценой уже один раз продал тариф дешевле, чем стоил
// (20.08), и повторять это на трипвайре смысла нет.
//
// Товар разовый, поэтому идёт products[], без карточки подписки.
// order_id:
//   potok_sprosa_<tgId>       — покупателя узнали (кнопка из бота, ?u=<id>)
//   potok_sprosa_web_<token>  — оплата картой с сайта, привязка позже
// Вебхук разбирает оба (см. api/prodamus-webhook), выдаёт роль `potok`
// и зовёт человека в его ветку кабинета.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { CATALOG } from '@/lib/catalog';

const FORM = 'https://thesashatoyz.payform.ru';
const BOT = 'https://t.me/testtoyzbot';
// Продамус возвращает человека не в бота, а на свой экран: там он забирает
// доступ той же кнопкой и один раз видит предложение добрать до курса.
const DONE = 'https://thesashatoyz.com/potok-sprosa/gotovo';
const NOTIFY = 'https://quizapp-ivory-delta.vercel.app/api/prodamus-webhook';

export async function GET(request: NextRequest) {
  const product = CATALOG.potok_sprosa;

  // Кнопка внутри Telegram передаёт id покупателя (?u=<tgId>): тогда вебхук
  // выдаст доступ прямо на аккаунт, без промежуточного токена.
  const uid = (request.nextUrl.searchParams.get('u') || '').replace(/\D/g, '').slice(0, 15);
  const byTelegram = uid.length >= 3;

  // base36 без «_», иначе ломается разбор order_id по «_web_»
  const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const orderId = byTelegram ? `potok_sprosa_${uid}` : `potok_sprosa_web_${token}`;
  const bind = byTelegram ? `${BOT}?start=kabinet` : `${BOT}?start=paid_${token}`;
  // Токен едет на экран «готово»: кнопка привязки там собирается из него.
  const done = byTelegram ? DONE : `${DONE}?t=${token}`;

  const fields: Record<string, string> = {
    do: 'pay',
    order_id: orderId,
    'products[0][name]': product.name,
    'products[0][price]': String(product.price),
    'products[0][quantity]': '1',
    paid_content:
      `Оплата принята: «${product.name}». ` +
      `Открой доступ в Telegram: ${bind} — внутри методичка и правила для нейронки. ` +
      `Сразу учти: нужен компьютер, с телефона метод не работает.`,
    urlNotification: NOTIFY,
    urlSuccess: done,
  };

  // Метка источника, если её передали: /pay/potok?src=reels
  const src = (request.nextUrl.searchParams.get('src') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);

  // Трекинг не должен мешать оплате — падение молча игнорируем.
  try {
    await trackEvent({
      event_type: 'checkout_open',
      utm_source: src ? `potok_${src}` : 'potok_paylink',
      metadata: {
        tag: 'potok', price: product.price,
        method: byTelegram ? 'paylink_tg' : 'paylink',
        order_id: orderId, src: src || null,
        tg: byTelegram ? Number(uid) : undefined,
      },
    });
  } catch {}

  const url = `${FORM}?${Object.keys(fields)
    .map((k) => `${k}=${encodeURIComponent(fields[k])}`)
    .join('&')}`;

  return NextResponse.redirect(url, 302);
}
