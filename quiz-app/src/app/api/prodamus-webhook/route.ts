import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { trackEvent, markFollowUpPaid, getAdminChatId, getUserInfo } from '@/lib/notion';
import { prisma } from '@/lib/prisma';

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

function verifySignature(body: Record<string, unknown>, signature: string): boolean {
  if (!PRODAMUS_SECRET_KEY) {
    console.error('PRODAMUS_SECRET_KEY is not set');
    return false;
  }

  const sorted = sortDeep(body);
  const json = JSON.stringify(sorted);
  const hmac = crypto.createHmac('sha256', PRODAMUS_SECRET_KEY).update(json).digest('hex');
  return hmac === signature;
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

async function notifyAdmin(tgUserId: number, resultId: string) {
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const text = `Оплата 3,450 руб от user ${tgUserId} (результат: ${resultId})`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to notify admin:', error);
  }
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
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const text = `Коннекторы: оплата ${amount.toLocaleString('ru-RU')} руб (${tierLabel}) от user ${tgUserId} (результат: ${resultId})`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to notify admin about connectors payment:', error);
  }
}

// МК «Разрешение быстрых денег»: подтверждение оплаты + кнопка кабинета (доступ-роль).
async function sendMkDengiConfirmation(tgUserId: number) {
  if (!BOT_TOKEN) return;

  const webappUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quizapp-ivory-delta.vercel.app';
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
          inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: `${webappUrl}/cabinet` } }]],
        },
      }),
    });
  } catch (error) {
    console.error('Failed to send MK Dengi confirmation:', error);
  }
}

async function notifyAdminMkDengi(tgUserId: number, amount: number, orderId: string) {
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const text = `💰 Оплата МК «Разрешение быстрых денег»\n\n${amount.toLocaleString('ru-RU')} ₽ от user ${tgUserId}\nOrder: ${orderId}`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminChatId, text }),
    });
  } catch (error) {
    console.error('Failed to notify admin about MK Dengi payment:', error);
  }
}

// Оплата МК с веб-лендинга — без Telegram-привязки. Уведомляем Сашу с контактом.
async function notifyAdminMkDengiWeb(amount: number, email: string, phone: string, orderId: string) {
  if (!BOT_TOKEN) return;

  const adminChatId = await getAdminChatId();
  if (!adminChatId) return;

  const contact = [email, phone].filter(Boolean).join(' / ') || 'контакт не передан';
  const text = `💰 Оплата МК «Разрешение быстрых денег» (с лендинга)\n\n${amount.toLocaleString('ru-RU')} ₽\nКонтакт: ${contact}\nOrder: ${orderId}\n\n⚠️ Без Telegram-привязки — доступ выдай вручную.`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminChatId, text }),
    });
  } catch (error) {
    console.error('Failed to notify admin about MK Dengi web payment:', error);
  }
}

async function notifyAdminError(errorMessage: string) {
  if (!BOT_TOKEN) return;

  try {
    const adminChatId = await getAdminChatId();
    if (!adminChatId) return;

    const text = `⚠️ Ошибка webhook: ${errorMessage}`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('Failed to notify admin about error:', error);
  }
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
      return NextResponse.json({ success: true });
    }

    // Prodamus puts their internal order_id in body.order_id,
    // our order ID (userId_resultId) comes in body.order_num
    const orderId = body.order_num || body.order_id || '';
    const isSyncMk = typeof orderId === 'string' && orderId.startsWith('sync_mk');
    const isConnectors = typeof orderId === 'string' && orderId.startsWith('conn_');
    const isMkDengi = typeof orderId === 'string' && orderId.startsWith('mkdengi');

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
        ]);
        console.log(`[Prodamus Webhook] MK Dengi (telegram) payment for user ${tgUserId}`);
      } else {
        // Веб-лендинг без Telegram (оплата картой на сайте) → трекаем по контакту.
        const email = (body.customer_email || body.email || '') as string;
        const phone = (body.customer_phone || body.phone || '') as string;

        // Запись в Event для аналитики (userId/telegramId nullable — привязки нет).
        await prisma.event.create({
          data: {
            type: 'mk_dengi_payment_web',
            source: 'thesasha',
            productSlug: 'mk-dengi',
            metadata: { email, phone, amount, orderId: String(orderId) },
          },
        }).catch((e) => console.error('[Supabase] web sale event insert failed:', e));

        await notifyAdminMkDengiWeb(amount, email, phone, orderId as string);
        console.log(`[Prodamus Webhook] MK Dengi (web) payment, order ${orderId}`);
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
      if (BOT_TOKEN) {
        const adminChatId = await getAdminChatId();
        if (adminChatId) {
          const src = tgUserId ? `TG Mini App (user ${tgUserId})` : 'Сайт';
          const text = `Оплата МК Синхронизация!\n\n${productName} — ${amount} руб\nИсточник: ${src}\nКонтакт: ${contact}\nOrder: ${orderId}`;
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: adminChatId, text }),
          });
        }
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
        console.error('No tg_user_id in order_id:', orderId);
        return NextResponse.json({ success: true });
      }

      const userInfo = await getUserInfo(tgUserId);

      await Promise.all([
        sendMaterialsToUser(tgUserId),
        notifyAdmin(tgUserId, resultId),
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
