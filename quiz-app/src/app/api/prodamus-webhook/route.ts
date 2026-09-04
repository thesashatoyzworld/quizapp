import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { trackEvent, markFollowUpPaid, getUserInfo } from '@/lib/notion';
import { prisma } from '@/lib/prisma';
import { CATALOG, resolveProductByOrderId } from '@/lib/catalog';
import { floorPrice } from '@/content/prices';
import { grantAccess } from '@/lib/access';
import { ensureIntake, sendPreamble, intakeTotal, withCount } from '@/lib/intake';
import { sendWelcomeT2 } from '@/lib/onboarding';
import { sendBotMessage, notifyAdmin } from '@/lib/telegram';
import { INTAKE_INVITE, INTAKE_PRODUCT_SLUG } from '@/content/intake-tarif3';
import { T2_PRODUCT_SLUG } from '@/content/intake-tarif2';

const PRODAMUS_SECRET_KEY = process.env.PRODAMUS_SECRET_KEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN;
const MASTERCLASS_CHANNEL_LINK = process.env.MASTERCLASS_CHANNEL_LINK;

function sortDeep(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(sortDeep);
  if (val && typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[key] = sortDeep((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

// Parse form-urlencoded body into nested structure.
// Prodamus sends products as products[0][name], products[0][price], etc.
// URLSearchParams gives flat keys — we need to reconstruct the nested object.
function parseFormNested(text: string): Record<string, unknown> {
  const params = new URLSearchParams(text);
  const result: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    // Convert "products[0][name]" to path ["products", "0", "name"]
    const parts = key.replace(/\[([^\]]*)\]/g, '.$1').split('.');
    let cur: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      if (cur[part] === undefined) {
        cur[part] = /^\d+$/.test(next) ? [] : {};
      }
      cur = cur[part] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]] = value;
  }
  return result;
}

function hmacHex(json: string): string {
  return crypto.createHmac('sha256', PRODAMUS_SECRET_KEY).update(json).digest('hex');
}

function verifySignature(body: Record<string, unknown>, signature: string): boolean {
  if (!PRODAMUS_SECRET_KEY) {
    console.error('PRODAMUS_SECRET_KEY is not set');
    return false;
  }

  const sorted = sortDeep(body);
  const plain = JSON.stringify(sorted);
  // Продамус (PHP) кодирует json_encode($data, JSON_UNESCAPED_UNICODE):
  // юникод не экранирован (как у JS), а слэши экранированы (`/` → `\/`), чего
  // JS не делает. Принимаем оба варианта, чтобы подпись сошлась независимо от
  // наличия слэшей в payload.
  const phpStyle = plain.replace(/\//g, '\\/');
  if (hmacHex(plain) === signature || hmacHex(phpStyle) === signature) return true;

  console.error('[Prodamus] signature mismatch', JSON.stringify({
    received: signature,
    tryPlain: hmacHex(plain),
    tryPhp: hmacHex(phpStyle),
    sample: plain.slice(0, 400),
  }));
  return false;
}

async function createPurchase(tgUserId: number, productSlug: string, amount: number, source: string, orderId: string) {
  try {
    // Upsert user
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUserId) },
      create: { telegramId: BigInt(tgUserId) },
      update: {},
    });

    // Find or create product
    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      create: { slug: productSlug, name: productSlug, price: amount },
      update: {},
    });

    // Create purchase
    await prisma.purchase.create({
      data: {
        userId: user.id,
        productId: product.id,
        amount,
        source,
        prodamusOrderId: orderId,
      },
    });

    console.log(`[Supabase] Purchase created: ${productSlug} for user ${tgUserId}`);
  } catch (error) {
    console.error('[Supabase] Failed to create purchase:', error);
  }
}

async function sendMaterialsToUser(tgUserId: number) {
  if (!BOT_TOKEN) {
    console.error('BOT_TOKEN not set, cannot send materials');
    return;
  }

  // Build message with channel link if available
  let message: string;
  if (MASTERCLASS_CHANNEL_LINK) {
    message = `Оплата получена!

Мастер-класс "Продающий контент"

Ваша ссылка на закрытый канал: ${MASTERCLASS_CHANNEL_LINK}

Бонус "Богатая ЦА" — уже доступен в канале.

Если возникнут вопросы — напишите сюда.`;
  } else {
    message = `Оплата получена!

Мастер-класс "Продающий контент"

Ссылка на канал будет отправлена отдельным сообщением.

Если возникнут вопросы — напишите сюда.`;
    console.warn('MASTERCLASS_CHANNEL_LINK not set, using fallback message');
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send materials to user:', error);
  }
}

async function notifyAdminMasterclass(tgUserId: number, resultId: string) {
  const text = `Оплата 3,450 руб от user ${tgUserId} (результат: ${resultId})`;
  await notifyAdmin(text, { alsoWork: true });
}

async function sendMidSequenceThankYou(tgUserId: number) {
  if (!BOT_TOKEN) return;

  const message = `Спасибо за покупку! Все дальнейшие материалы ждут вас в закрытом канале.`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send mid-sequence thank-you:', error);
  }
}

async function sendConnectorsConfirmation(tgUserId: number, tierLabel: string) {
  if (!BOT_TOKEN) return;

  const message = `Оплата получена!

Программа "Коннекторы" — тариф "${tierLabel}"

Саша свяжется с вами в ближайшее время для организации старта.

Если возникнут вопросы — напишите сюда.`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to send connectors confirmation:', error);
  }
}

async function notifyAdminConnectors(tgUserId: number, tierLabel: string, amount: number, resultId: string) {
  const text = `Коннекторы: оплата ${amount.toLocaleString('ru-RU')} руб (${tierLabel}) от user ${tgUserId} (результат: ${resultId})`;
  await notifyAdmin(text, { alsoWork: true });
}

// МК «Разрешение быстрых денег»: подтверждение оплаты + кнопка кабинета (доступ-роль).
async function sendMkDengiConfirmation(tgUserId: number) {
  if (!BOT_TOKEN) return;

  const message = `оплата получена ⚡

доступ к мастер-классу <b>«Разрешение быстрых денег»</b> открыт.

материалы — в кабинете, жми кнопку ниже 👇`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgUserId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: 'https://world.thesashatoyz.com/dostup' } }]],
        },
      }),
    });
  } catch (error) {
    console.error('Failed to send MK Dengi confirmation:', error);
  }
}

async function notifyAdminMkDengi(tgUserId: number, amount: number, orderId: string) {
  const text = `💰 Оплата МК «Разрешение быстрых денег»\n\n${amount.toLocaleString('ru-RU')} ₽ от user ${tgUserId}\nOrder: ${orderId}`;
  await notifyAdmin(text, { alsoWork: true, parseMode: null });
}

// Оплата МК с веб-лендинга — без Telegram-привязки. Уведомляем Сашу с контактом.
async function notifyAdminMkDengiWeb(amount: number, email: string, phone: string, orderId: string) {
  const contact = [email, phone].filter(Boolean).join(' / ') || 'контакт не передан';
  const text = `💰 Оплата МК «Разрешение быстрых денег» (с лендинга)\n\n${amount.toLocaleString('ru-RU')} ₽\nКонтакт: ${contact}\nOrder: ${orderId}\n\n⚠️ Без Telegram-привязки — доступ выдай вручную.`;
  await notifyAdmin(text, { alsoWork: true, parseMode: null });
}

async function notifyAdminUroven(productName: string, amount: number, contact: string, orderId: string) {
  const text = `💳 Оплата «Новый уровень контента»\n\n${productName}\n${amount.toLocaleString('ru-RU')} ₽\nКонтакт: ${contact}\nOrder: ${orderId}`;
  await notifyAdmin(text, { alsoWork: true, parseMode: null });
}

// Оплата дошла до Продамуса, но не завершилась (карта отклонена / рассрочка не
// одобрена / отмена / таймаут). Шлём админу сразу — это горячий лид на дожим.
// Пришла сумма меньше каталожной. Причина почти всегда безобидная (у человека
// открылась закэшированная страница со старой ценой), но тем же путём проходит и
// подмена цены в форме руками. Доступ не выдаём молча — решает Саша.
async function notifyAdminUnderpaid(
  productName: string, expected: number, paid: number,
  contact: string, orderId: string,
) {
  const text = [
    '⚠️ Недоплата — доступ НЕ выдан',
    '',
    productName,
    `Оплачено: ${paid.toLocaleString('ru-RU')} ₽ из ${expected.toLocaleString('ru-RU')} ₽`,
    `Не хватает: ${(expected - paid).toLocaleString('ru-RU')} ₽`,
    `Контакт: ${contact}`,
    `Order: ${orderId}`,
    '',
    'Деньги у тебя. Решаешь ты: выдать доступ вручную или попросить дослать разницу.',
  ].join('\n');
  await notifyAdmin(text, { alsoWork: true, parseMode: null });
}

// Успешный платёж, чей order_id мы не разобрали: счёт выставлен руками из
// кабинета Продамуса, оплачена чужая карточка подписки, или автосписание пришло
// без order_num. Деньги пришли, доступ не выдан — и до 26.08.2026 об этом никто
// не узнавал, пока человек сам не написал.
async function notifyAdminUnknownPayment(
  productName: string, amount: string, email: string, phone: string,
  orderId: string, init: string,
) {
  let name = productName;
  try { name = decodeURIComponent(productName); } catch { /* keep as-is */ }
  name = name.replace(/&quot;/g, '"');
  const contact = [email, phone].filter(Boolean).join(' · ') || 'нет контакта';
  const text = [
    '❓ Платёж прошёл, а чей — система не поняла',
    '',
    name || 'товар не указан',
    amount ? `${Number(amount).toLocaleString('ru-RU')} ₽` : '',
    `Контакт: ${contact}`,
    `Order: ${orderId || 'пустой'}${init ? ` · ${init}` : ''}`,
    '',
    'Доступ НЕ выдан: order_id не наш. Если это оплата тарифа — выдай ссылкой',
    'node scripts/grant-gift-link.mjs <username> uroven-t2',
  ].filter((l) => l !== '').join('\n');
  await notifyAdmin(text, { alsoWork: true, parseMode: null });
}

async function notifyAdminPaymentFailed(
  status: string, statusDesc: string, productName: string,
  amount: string, email: string, phone: string, orderId: string,
) {
  let name = productName;
  try { name = decodeURIComponent(productName); } catch { /* keep as-is */ }
  const contact = [email, phone].filter(Boolean).join(' · ') || 'нет контакта';
  const text = `❌ Оплата НЕ прошла (Продамус)\n\n`
    + `${name || 'товар не указан'}\n`
    + `${amount ? Number(amount).toLocaleString('ru-RU') + ' ₽\n' : ''}`
    + `Статус: ${statusDesc || status}\n`
    + `Контакт: ${contact}\n`
    + `Order: ${orderId || '—'}\n\n`
    + `⚡ Дошёл до оплаты, сорвалось — можно дожать по горячим следам.`;
  await notifyAdmin(text, { alsoWork: true, parseMode: null });
}

async function notifyAdminError(errorMessage: string) {
  await notifyAdmin(`⚠️ Ошибка webhook: ${errorMessage}`);
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const contentType = request.headers.get('content-type') || '';

    let body: Record<string, unknown>;
    if (contentType.includes('application/x-www-form-urlencoded')) {
      body = parseFormNested(text);
    } else {
      body = JSON.parse(text);
    }

    // Prodamus sends signature in 'Sign' header (not in body)
    let signature = request.headers.get('sign') || request.headers.get('Sign') || '';
    // Strip "Sign: " prefix if present in header value
    if (signature.startsWith('Sign: ')) signature = signature.slice(6);

    // ── ЛОГ ВХОДЯЩИХ ВЕБХУКОВ (постоянный, не диагностика) ──
    // Пишем каждый заход ДО проверки подписи. Это единственное место, где видно
    // платежи, которые система не опознала: счёт, выставленный руками в кабинете
    // Продамуса, приходит с ПУСТЫМ order_num, и разбор по нему не срабатывает.
    // Из этого лога вытащены 24 таких платежа за июль-август 2026 — от 6 550
    // за доплату тарифа до 150 000 за менторство. Не удалять.
    try {
      const dbgPlain = JSON.stringify(sortDeep(body));
      const logSub = (body.subscription || {}) as Record<string, unknown>;
      const logProds = body.products as Record<string, Record<string, string>> | undefined;
      const logFirst = logProds?.['0'] || (Array.isArray(logProds) ? logProds[0] : undefined);
      await prisma.event.create({
        data: {
          type: 'wh_debug', source: 'thesasha',
          metadata: {
            hasSign: !!signature, sign: signature.slice(0, 80),
            paymentStatus: (body.payment_status ?? null) as string | null,
            order: (body.order_num || body.order_id || null) as string | null,
            tryPlain: hmacHex(dbgPlain),
            tryPhp: hmacHex(dbgPlain.replace(/\//g, '\\/')),
            // Разобранные поля: платёж читается из базы без разбора payload.
            init: (body.payment_init ?? null) as string | null,
            email: (body.customer_email ?? null) as string | null,
            phone: (body.customer_phone ?? null) as string | null,
            sum: (logFirst?.sum ?? logFirst?.price ?? body.sum ?? null) as string | null,
            product: (logFirst?.name ?? null) as string | null,
            // id подписки: по нему автосписание можно связать с человеком даже
            // тогда, когда order_num пуст.
            subId: (logSub.id ?? logSub.subscription_id ?? null) as string | null,
            subProfile: (logSub.profile_id ?? null) as string | null,
            sample: dbgPlain.slice(0, 4000),
          },
        },
      });
    } catch (e) { console.error('wh_debug failed', e); }

    if (!signature) {
      console.error('No signature in Sign header');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Verify HMAC signature over the full body (signature is separate in header)
    if (!verifySignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Check payment status
    const paymentStatus = body.payment_status;
    if (paymentStatus !== 'success') {
      console.log(`Payment status is "${paymentStatus}", skipping`);
      // Оплата дошла до Продамуса, но не прошла → уведомляем админа (горячий лид).
      const failProducts = body.products as Record<string, Record<string, string>> | undefined;
      await notifyAdminPaymentFailed(
        String(paymentStatus ?? ''),
        String(body.payment_status_description ?? ''),
        failProducts?.['0']?.name ?? '',
        String(failProducts?.['0']?.sum ?? failProducts?.['0']?.price ?? body.sum ?? ''),
        String(body.customer_email ?? ''),
        String(body.customer_phone ?? ''),
        String(body.order_num || body.order_id || ''),
      ).catch((e) => console.error('notifyAdminPaymentFailed failed', e));
      return NextResponse.json({ success: true });
    }

    // Prodamus puts their internal order_id in body.order_id,
    // our order ID (userId_resultId) comes in body.order_num
    const orderId = body.order_num || body.order_id || '';
    const isSyncMk = typeof orderId === 'string' && orderId.startsWith('sync_mk');
    const isConnectors = typeof orderId === 'string' && orderId.startsWith('conn_');
    const isMkDengi = typeof orderId === 'string' && orderId.startsWith('mkdengi');
    const isUroven = typeof orderId === 'string' && orderId.startsWith('uroven_');

    if (isMkDengi) {
      // order_id: "mkdengi_<tgUserId>" — оплата из мини-аппа (привязка к Telegram)
      //           "mkdengi_web_<ts>"   — оплата с веб-лендинга (без Telegram)
      const parts = (orderId as string).split('_');
      const second = parts[1] || '';
      const tgUserId = /^\d+$/.test(second) ? parseInt(second, 10) : null;
      const amount = 4884;

      // Человекочитаемое имя продукта (createPurchase upsert'ит с name=slug).
      await prisma.product.upsert({
        where: { slug: 'mk-dengi' },
        create: { slug: 'mk-dengi', name: 'МК «Разрешение быстрых денег»', price: amount, type: 'one_time' },
        update: { name: 'МК «Разрешение быстрых денег»' },
      });

      if (tgUserId && tgUserId > 1000) {
        // Telegram-привязанная оплата → доступ + кабинет.
        await Promise.all([
          sendMkDengiConfirmation(tgUserId),
          notifyAdminMkDengi(tgUserId, amount, orderId as string),
          trackEvent({
            event_type: 'payment_success',
            user_id: tgUserId,
            result_title: 'mk_dengi',
            amount,
          }),
          createPurchase(tgUserId, 'mk-dengi', amount, 'mk_dengi', orderId as string),
          grantAccess({ product: CATALOG.mk_dengi, telegramId: tgUserId, source: orderId as string })
            .catch((e) => console.error('[Access] telegram grant failed:', e)),
        ]);
        console.log(`[Prodamus Webhook] MK Dengi (telegram) payment for user ${tgUserId}`);
      } else {
        // Веб-лендинг без Telegram (оплата картой на сайте) → трекаем по контакту.
        const email = (body.customer_email || body.email || '') as string;
        const phone = (body.customer_phone || body.phone || '') as string;

        // Код оплаты из order_id (mkdengi_web_<token>). По нему бот выдаст доступ.
        const token = String(orderId).replace('mkdengi_web_', '');

        // Запись в Event: подтверждённая оплата картой. consumed=false — доступ ещё
        // не выдан; выдаст бот по /start paid_<token>. userId/telegramId nullable.
        await prisma.event.create({
          data: {
            type: 'mk_web_paid',
            source: 'thesasha',
            productSlug: 'mk-dengi',
            metadata: { token, email, phone, amount, orderId: String(orderId), consumed: false },
          },
        }).catch((e) => console.error('[Supabase] web sale event insert failed:', e));

        // Доступ выдаём сразу (telegramId null) — кабинет на сайте найдёт его по токену
        // в source. Если человек зайдёт в бота по /start paid_<token>, доступ привяжется к TG.
        await grantAccess({ product: CATALOG.mk_dengi, telegramId: null, source: orderId as string })
          .catch((e) => console.error('[Access] web grant failed:', e));

        await notifyAdminMkDengiWeb(amount, email, phone, orderId as string);
        console.log(`[Prodamus Webhook] MK Dengi (web) payment, order ${orderId}`);
      }
    } else if (isUroven) {
      // «Новый уровень контента» — order_id:
      //   uroven_<tier>_<tgUserId>   — оплата из бота (привязка к Telegram)
      //   uroven_<tier>_web_<token>  — оплата картой с сайта (привязка позже по токену/почте)
      const product = resolveProductByOrderId(orderId as string);
      if (!product) {
        console.error('[Prodamus Webhook] uroven: product not resolved for order', orderId);
        return NextResponse.json({ success: true });
      }
      const products = body.products as Record<string, Record<string, string>> | undefined;
      // Что реально списано. sum — итог позиции, price — цена за единицу; берём sum.
      const paidRaw = products?.['0']?.sum ?? products?.['0']?.price;
      const amount = parseInt(String(paidRaw ?? product.price), 10) || product.price;
      const parts = (orderId as string).split('_'); // ['uroven', tier, tgId|'web', ...]
      const third = parts[2] || '';
      const isWeb = third === 'web';
      const tgUserId = !isWeb && /^\d+$/.test(third) ? parseInt(third, 10) : null;

      // ── Гейт по сумме ───────────────────────────────────────────────
      // Цену платёжной формы собирает браузер, поэтому она НЕ источник правды:
      // 20.08 у покупателя открылась закэшированная страница с ценой до 8 августа
      // и Тариф 1 ушёл за 3 450 вместо 5 450. Тем же путём проходит и подмена
      // цены руками. Источник правды — CATALOG; недоплата доступ не открывает.
      // Только разовые товары: у подписок сумму диктует карточка Продамуса, а не
      // браузер, и она законно расходится с каталогом — на старой карточке т2
      // (2987944) десять человек продолжают платить 7 500 вместо 10 000, и их
      // продления гейт обязан пропускать.
      // 13 сентября цены поднимаются, и ссылку, взятую накануне, оплачивают
      // уже по новой дате. Двое суток после смены старая сумма ещё законна,
      // иначе в день X гейт отрежет всех, у кого страница открыта со вчера.
      const floor = floorPrice(product.slug) ?? product.price;

      if (product.type === 'one_time' && paidRaw !== undefined && amount < floor) {
        const email = (body.customer_email || body.email || '') as string;
        const phone = (body.customer_phone || body.phone || '') as string;
        const contact = tgUserId
          ? `TG user ${tgUserId}`
          : [email, phone].filter(Boolean).join(' · ') || 'нет контакта';

        await prisma.event.create({
          data: {
            type: 'underpaid',
            source: 'thesasha',
            productSlug: product.slug,
            telegramId: tgUserId ? BigInt(tgUserId) : null,
            metadata: {
              expected: floor, paid: amount,
              email, phone, orderId: String(orderId), granted: false,
            },
          },
        }).catch((e) => console.error('[Supabase] underpaid event insert failed:', e));

        await notifyAdminUnderpaid(product.name, floor, amount, contact, orderId as string);
        console.warn(`[Prodamus Webhook] underpaid: ${orderId} paid ${amount} of ${floor}, access withheld`);
        return NextResponse.json({ success: true });
      }

      await prisma.product.upsert({
        where: { slug: product.slug },
        create: { slug: product.slug, name: product.name, price: product.price, type: product.type },
        update: { name: product.name },
      });

      if (tgUserId && tgUserId > 1000) {
        // Оплата привязана к Telegram → выдаём доступ и пишем в чат.
        await Promise.all([
          createPurchase(tgUserId, product.slug, amount, 'uroven', orderId as string),
          grantAccess({ product, telegramId: tgUserId, source: orderId as string })
            .catch((e) => console.error('[Access] uroven telegram grant failed:', e)),
        ]);
        // Тариф 2 встречает своим пакетом: где что лежит, группа, следом интервью.
        const welcomed = product.slug === T2_PRODUCT_SLUG ? await sendWelcomeT2(tgUserId) : false;

        if (!welcomed && BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgUserId,
              text: `готово ⚡\n\nоплата принята: <b>${product.name}</b>.\n\nвсе материалы в кабинете, жми кнопку ниже.`,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: 'https://world.thesashatoyz.com/dostup' } }]] },
            }),
          }).catch(() => {});
        }
        // Тариф 3 = групповое менторство: сразу зовём собрать досье до созвона 1-1.
        // Момент максимальной мотивации, человек только что заплатил.
        if (product.slug === INTAKE_PRODUCT_SLUG) {
          try {
            const intake = await ensureIntake(tgUserId);
            await sendBotMessage(tgUserId, withCount(INTAKE_INVITE, intakeTotal(intake)));
            await sendPreamble(tgUserId, intake);
          } catch (e) {
            console.error('[Prodamus Webhook] intake invite failed:', e);
          }
        }

        await notifyAdminUroven(product.name, amount, `TG user ${tgUserId}`, orderId as string);
        console.log(`[Prodamus Webhook] Uroven (telegram) payment user ${tgUserId}, ${product.slug}`);
      } else {
        // Оплата картой с сайта. Токен = хвост order_id после _web_.
        // Доступ выдаём сразу (telegramId null); человек откроет кабинет по токену/почте,
        // либо привяжет Telegram, зайдя в бота по /start paid_<token>.
        const token = (orderId as string).split('_web_')[1] || '';
        const email = (body.customer_email || body.email || '') as string;
        const phone = (body.customer_phone || body.phone || '') as string;

        await prisma.event.create({
          data: {
            type: 'web_paid',
            source: 'thesasha',
            productSlug: product.slug,
            metadata: { token, email, phone, amount, orderId: String(orderId), consumed: false },
          },
        }).catch((e) => console.error('[Supabase] uroven web event insert failed:', e));

        await grantAccess({ product, telegramId: null, source: orderId as string })
          .catch((e) => console.error('[Access] uroven web grant failed:', e));

        await notifyAdminUroven(product.name, amount, email || phone || 'нет контакта', orderId as string);
        console.log(`[Prodamus Webhook] Uroven (web) payment, order ${orderId}`);
      }
    } else if (isSyncMk) {
      // МК Синхронизация payment
      // order_id formats: sync_mk_[ts] (no TG) or sync_mk_[userId]_[ts] (from TG Mini App)
      // early bird: sync_mk_eb_[ts] or sync_mk_eb_[userId]_[ts]
      const products = body.products as Record<string, Record<string, string>> | undefined;
      const productName = products?.['0']?.name || 'МК Синхронизация';
      const amount = products?.['0']?.price || '?';
      const customerEmail = (body.customer_email || body.email || '') as string;
      const customerPhone = (body.customer_phone || body.phone || '') as string;

      // Extract TG user ID if present in order_id
      let tgUserId: number | null = null;
      if (typeof orderId === 'string') {
        // sync_mk_[userId]_[ts] or sync_mk_eb_[userId]_[ts]
        const parts = orderId.split('_');
        // Find the numeric part that looks like a TG user ID (>1000, not a timestamp)
        for (const part of parts) {
          const num = parseInt(part, 10);
          if (num > 1000 && num < 10000000000) { // TG IDs are typically 6-10 digits
            tgUserId = num;
            break;
          }
        }
      }

      const contact = customerEmail || customerPhone || (tgUserId ? `TG user ${tgUserId}` : 'нет контакта');

      // If opened from TG Mini App — send materials to user
      if (tgUserId && BOT_TOKEN) {
        const mkMessage = `Оплата получена!\n\nМК «Синхронизация» — 27 апреля, 17:00 МСК\n\nСсылка на Zoom и инструкция придут отдельным сообщением ближе к дате.\n\nЕсли возникнут вопросы — напишите сюда.`;
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tgUserId, text: mkMessage }),
        });
      }

      // Always notify admin
      {
        const src = tgUserId ? `TG Mini App (user ${tgUserId})` : 'Сайт';
        const text = `Оплата МК Синхронизация!\n\n${productName} — ${amount} руб\nИсточник: ${src}\nКонтакт: ${contact}\nOrder: ${orderId}`;
        await notifyAdmin(text, { alsoWork: true, parseMode: null });
      }

      // Record purchase in Supabase
      const parsedAmount = parseInt(String(amount), 10) || 0;
      if (tgUserId) {
        await createPurchase(tgUserId, 'sync-mk', parsedAmount, 'sync_mk_landing', orderId as string);
      }

      console.log(`[Prodamus Webhook] Sync MK payment: ${productName}, ${amount} rub, contact: ${contact}, tgUser: ${tgUserId}`);
    } else if (isConnectors) {
      // Connectors payment: order_id format "conn_userId_tier_resultId"
      const parts = orderId.split('_');
      // parts: ["conn", <userId>, <tier>, <resultId>]
      const tgUserId = parts.length >= 3 ? parseInt(parts[1], 10) : null;
      const tier = parts.length >= 3 ? parts[2] : 'unknown';
      const resultId = parts.length >= 4 ? parts[3] : 'unknown';

      if (!tgUserId || tgUserId <= 0) {
        console.error('No tg_user_id in connectors order_id:', orderId);
        return NextResponse.json({ success: true });
      }

      const tierLabel = tier === 'premium' ? 'Премиум' : 'Базовый';
      const amount = tier === 'premium' ? 20000 : 10000;

      await Promise.all([
        sendConnectorsConfirmation(tgUserId, tierLabel),
        notifyAdminConnectors(tgUserId, tierLabel, amount, resultId),
        trackEvent({
          event_type: 'connectors_payment',
          user_id: tgUserId,
          result_title: tier,
          result_id: resultId,
          amount,
        }),
        createPurchase(tgUserId, tier === 'premium' ? 'connectors-premium' : 'connectors-basic', amount, 'connectors', orderId as string),
      ]);

      console.log(`[Prodamus Webhook] Connectors ${tierLabel} payment from user ${tgUserId}, result: ${resultId}`);
    } else {
      // Masterclass payment: order_id format "userId_resultId"
      let tgUserId: number | null = null;
      let resultId = 'unknown';

      if (typeof orderId === 'string' && orderId.includes('_')) {
        const [userPart, ...resultParts] = orderId.split('_');
        const parsed = parseInt(userPart, 10);
        if (parsed > 0) tgUserId = parsed;
        resultId = resultParts.join('_') || 'unknown';
      }

      if (!tgUserId) {
        // Сюда падает всё, чей order_id мы не разобрали. Раньше здесь стоял
        // тихий return, и деньги пропадали из виду: счета, выставленные руками
        // в кабинете Продамуса, приходят с пустым order_num. Так молча прошли
        // 24 платежа за июль-август 2026, включая доплаты тарифа 2.
        console.error('No tg_user_id in order_id:', orderId);
        const unkProds = body.products as Record<string, Record<string, string>> | undefined;
        const unkFirst = unkProds?.['0'] || (Array.isArray(unkProds) ? unkProds[0] : undefined);
        await notifyAdminUnknownPayment(
          String(unkFirst?.name ?? ''),
          String(unkFirst?.sum ?? unkFirst?.price ?? body.sum ?? ''),
          String(body.customer_email ?? ''),
          String(body.customer_phone ?? ''),
          String(orderId || ''),
          String(body.payment_init ?? ''),
        ).catch((e) => console.error('notifyAdminUnknownPayment failed', e));
        return NextResponse.json({ success: true });
      }

      const userInfo = await getUserInfo(tgUserId);

      await Promise.all([
        sendMaterialsToUser(tgUserId),
        notifyAdminMasterclass(tgUserId, resultId),
        trackEvent({
          event_type: 'payment_success',
          user_id: tgUserId,
          username: userInfo.username,
          first_name: userInfo.first_name,
          result_title: resultId,
          amount: 3450,
        }),
        markFollowUpPaid(tgUserId),
        sendMidSequenceThankYou(tgUserId),
        createPurchase(tgUserId, 'masterclass', 3450, 'quiz', orderId as string),
      ]);

      console.log(`[Prodamus Webhook] Payment success for user ${tgUserId}, result: ${resultId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prodamus webhook error:', error);

    // Notify admin about webhook error
    const errorMessage = error instanceof Error ? error.message : String(error);
    await notifyAdminError(errorMessage);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
