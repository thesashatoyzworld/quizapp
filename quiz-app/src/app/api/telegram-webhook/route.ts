import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { notifyAdmin } from '@/lib/telegram';
import { prisma } from '@/lib/prisma';
import { getLeadMagnet, type LeadMagnet } from '@/lib/leadmagnets';
import { CATALOG, getProductBySlug } from '@/lib/catalog';
import { grantAccess, bindAccessToTelegram } from '@/lib/access';

// Держим функцию открытой дольше дефолтных 10с: kazino-флоу ждёт ~7с между
// сообщением про канал и статьёй.
export const maxDuration = 20;

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quizapp-ivory-delta.vercel.app';

interface TelegramUpdate {
  message?: {
    chat: {
      id: number;
    };
    text?: string;
    from?: {
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
  callback_query?: {
    id: string;
    data?: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      chat: { id: number };
      message_id: number;
    };
  };
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!result.ok) {
    console.error('Telegram sendMessage failed:', JSON.stringify(result));
  }
  return result;
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  });
}

async function editMessageText(chatId: number, messageId: number, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
    }),
  });
}

// Check whether a user is a member of a public channel.
// Requires @testtoyzbot to be an admin of that channel, otherwise Telegram
// returns an error and we fail open (treat as subscribed) to avoid blocking
// users on a misconfiguration.
async function isChannelMember(channelUsername: string, userId: number): Promise<boolean> {
  const channel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(channel)}&user_id=${userId}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) {
      console.error('getChatMember failed:', JSON.stringify(data));
      return true; // fail open — don't lock people out if the bot isn't admin yet
    }
    const status = data.result?.status as string;
    return ['creator', 'administrator', 'member'].includes(status);
  } catch (err) {
    console.error('getChatMember error:', err);
    return true; // fail open on network errors
  }
}

// Deliver a lead magnet: warm message + web_app button, plus analytics.
async function deliverLeadMagnet(
  chatId: number,
  slug: string,
  lm: LeadMagnet,
  firstName: string,
  username: string,
  fullName: string,
) {
  const lmText = `привет, ${firstName}\n\n${lm.intro}${lm.softPitch ? '\n\n' + lm.softPitch : ''}`;
  const lmMarkup = {
    inline_keyboard: [
      [{ text: '📖 Открыть гайд', web_app: { url: lm.url } }],
    ],
  };

  await sendMessage(chatId, lmText, lmMarkup);

  await Promise.all([
    trackEvent({
      event_type: 'leadmagnet_delivered',
      user_id: chatId,
      username: username || undefined,
      first_name: fullName || undefined,
      utm_source: `leadmagnet_${slug}`,
      metadata: { slug },
    }),
    notifyAdmin(
      `🪝 <b>Лид-магнит выдан</b>\n\n` +
      `Материал: ${lm.title}\n` +
      `Slug: <code>${slug}</code>\n` +
      `👤 ${fullName || '—'}\n` +
      `💬 ${username ? '@' + username : 'без username'}\n` +
      `🆔 <code>${chatId}</code>`
    ),
  ]);
}

// Ask a non-subscriber to join the channel before getting the magnet.
async function sendSubscriptionGate(chatId: number, slug: string, lm: LeadMagnet, firstName: string) {
  const channel = lm.channelUsername.startsWith('@') ? lm.channelUsername : `@${lm.channelUsername}`;
  const gateText =
    lm.gateText ||
    `привет, ${firstName}\n\nчтобы забрать материал — подпишись на канал, оттуда я и делюсь всем этим\n\nподписался? жми кнопку ниже 👇`;

  const gateMarkup = {
    inline_keyboard: [
      [{ text: '📲 Подписаться на канал', url: `https://t.me/${channel.replace(/^@/, '')}` }],
      [{ text: '✅ Я подписался', callback_data: `checksub:${slug}` }],
    ],
  };

  await sendMessage(chatId, gateText, gateMarkup);
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    // Handle inline button callbacks
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data || '';

      // Masterclass SYNC waitlist join
      if (data === 'mcsync_join' && cb.message) {
        const tgUserId = cb.from.id;
        const username = cb.from.username || null;
        const firstName = cb.from.first_name || null;
        const lastName = cb.from.last_name || null;
        const chatId = cb.message.chat.id;
        const messageId = cb.message.message_id;

        try {
          const existing = await prisma.masterclassSyncWaitlist.findUnique({
            where: { telegramId: BigInt(tgUserId) },
          });

          if (existing) {
            await answerCallbackQuery(cb.id, 'Ты уже в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `Ты уже в листе ожидания ✓\n\nКак только появятся новости — напишу первым.`
            );
          } else {
            await prisma.masterclassSyncWaitlist.create({
              data: {
                telegramId: BigInt(tgUserId),
                username,
                firstName,
                lastName,
              },
            });

            await answerCallbackQuery(cb.id, 'Ты в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `Готово ⚡\n\nТы в листе ожидания мастеркласса <b>SYNC</b>.\n\nКак только появятся даты и детали — напишу первым.`
            );

            await notifyAdmin(
              `📌 <b>Новая запись в waitlist SYNC</b>\n\n` +
              `👤 ${[firstName, lastName].filter(Boolean).join(' ') || '—'}\n` +
              `💬 ${username ? '@' + username : 'без username'}\n` +
              `🆔 <code>${tgUserId}</code>`
            );

            await trackEvent({
              event_type: 'masterclasssync_waitlist_join',
              user_id: tgUserId,
              username: username || undefined,
              first_name: firstName || undefined,
              utm_source: 'masterclasssync',
            });
          }
        } catch (err) {
          console.error('mcsync_join error:', err);
          await answerCallbackQuery(cb.id, 'Что-то пошло не так, попробуй ещё раз');
        }

        return NextResponse.json({ ok: true });
      }

      // МК «Разрешение быстрых денег» waitlist join
      if (data === 'rdmk_join' && cb.message) {
        const tgUserId = cb.from.id;
        const username = cb.from.username || null;
        const firstName = cb.from.first_name || null;
        const lastName = cb.from.last_name || null;
        const chatId = cb.message.chat.id;
        const messageId = cb.message.message_id;

        try {
          const existing = await prisma.moneyMkWaitlist.findUnique({
            where: { telegramId: BigInt(tgUserId) },
          });

          if (existing) {
            await answerCallbackQuery(cb.id, 'Ты уже в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `ты уже в списке ✓\n\nкак открою даты — напишу одному из первых.`
            );
          } else {
            await prisma.moneyMkWaitlist.create({
              data: {
                telegramId: BigInt(tgUserId),
                username,
                firstName,
                lastName,
              },
            });

            await answerCallbackQuery(cb.id, 'Ты в списке ✓');
            await editMessageText(
              chatId,
              messageId,
              `готово ⚡\n\nты в листе ожидания «Разрешение быстрых денег».\n\nсейчас добиваю инфраструктуру и программу — как открою даты, напишу тебе одному из первых.`
            );

            // Уведомление админу для этого МК намеренно отключено —
            // список смотрим вручную через check-moneymk-waitlist.cjs.

            await trackEvent({
              event_type: 'moneymk_waitlist_join',
              user_id: tgUserId,
              username: username || undefined,
              first_name: firstName || undefined,
              utm_source: 'razreshenie_deneg',
            });
          }
        } catch (err) {
          console.error('rdmk_join error:', err);
          await answerCallbackQuery(cb.id, 'Что-то пошло не так, попробуй ещё раз');
        }

        return NextResponse.json({ ok: true });
      }

      // Subscription gate re-check: "Я подписался"
      if (data.startsWith('checksub:') && cb.message) {
        const slug = data.slice('checksub:'.length);
        const userId = cb.from.id;
        const chatId = cb.message.chat.id;
        const firstName = cb.from.first_name || 'друг';
        const username = cb.from.username || '';
        const fullName = [cb.from.first_name, cb.from.last_name].filter(Boolean).join(' ');

        const lm = getLeadMagnet(slug);
        if (!lm) {
          await answerCallbackQuery(cb.id, 'Материал не найден');
          return NextResponse.json({ ok: true });
        }

        const subscribed = await isChannelMember(lm.channelUsername, userId);
        if (subscribed) {
          await answerCallbackQuery(cb.id, 'Готово ✓');
          await editMessageText(chatId, cb.message.message_id, 'спасибо, что подписался 🤝 держи материал ниже');
          await deliverLeadMagnet(chatId, slug, lm, firstName, username, fullName);
        } else {
          await answerCallbackQuery(cb.id, 'Пока не вижу подписку — подпишись и нажми ещё раз');
        }

        return NextResponse.json({ ok: true });
      }

      // Unknown callback — just ack
      await answerCallbackQuery(cb.id);
      return NextResponse.json({ ok: true });
    }

    // Handle /start command (with or without parameters)
    if (update.message?.text?.startsWith('/start')) {
      const chatId = update.message.chat.id;
      const firstName = update.message.from?.first_name || 'друг';
      const username = update.message.from?.username || '';
      const fullName = [update.message.from?.first_name, update.message.from?.last_name].filter(Boolean).join(' ');

      // Parse UTM source from /start parameter (e.g. "/start youtube")
      const parts = update.message.text.split(' ');
      const startParam = parts.length > 1 ? parts[1].trim() : '';

      // Debug logging
      console.log('Webhook received:', { text: update.message.text, startParam });

      // Авто-выдача доступа после оплаты картой на сайте: /start paid_<token>.
      // Продамус редиректит сюда после успешной оплаты; код подтверждён вебхуком
      // (Event type web_paid/mk_web_paid). Продукт берём из события — работает для
      // любого продукта (МК, «Новый уровень контента» и т.д.).
      if (startParam.startsWith('paid_')) {
        const token = startParam.slice('paid_'.length);
        try {
          const ev = await prisma.event.findFirst({
            where: { type: { in: ['web_paid', 'mk_web_paid'] }, metadata: { path: ['token'], equals: token } },
            orderBy: { createdAt: 'desc' },
          });

          if (!ev) {
            // Оплата ещё не долетела вебхуком (или код не найден) — просим повторить.
            await sendMessage(
              chatId,
              `${firstName}, вижу тебя 👋\n\nоплата ещё обрабатывается — нажми /start через минуту, и я открою доступ. если не поможет — напиши сюда.`
            );
            return NextResponse.json({ ok: true });
          }

          const meta = (ev.metadata || {}) as { consumed?: boolean; boundTelegramId?: number; amount?: number; orderId?: string };
          // Продукт и источник доступа — из события. Легаси mk_web_paid без productSlug → mk-dengi.
          const product = getProductBySlug(ev.productSlug || 'mk-dengi') || CATALOG.mk_dengi;
          const source = meta.orderId || `mkdengi_web_${token}`;
          const amount = meta.amount || product.price;

          if (meta.consumed && meta.boundTelegramId && meta.boundTelegramId !== chatId) {
            await sendMessage(chatId, `этот код уже активирован на другом аккаунте. если это ошибка — напиши сюда.`);
            return NextResponse.json({ ok: true });
          }

          // Идемпотентно: создаём юзера, покупку (если ещё не выдавали), помечаем код использованным.
          const user = await prisma.user.upsert({
            where: { telegramId: BigInt(chatId) },
            create: { telegramId: BigInt(chatId), username: username || null, firstName: update.message.from?.first_name || null },
            update: {},
          });

          if (!meta.consumed) {
            const dbProduct = await prisma.product.findUnique({ where: { slug: product.slug } });
            if (dbProduct) {
              await prisma.purchase.create({
                data: { userId: user.id, productId: dbProduct.id, amount, source: 'web_redeem', prodamusOrderId: `paid_${token}` },
              });
            }
          }

          // Привязываем выданный картой доступ к этому Telegram (source = <prefix>_web_<token>).
          // Если по какой-то причине его нет (старый платёж) — выдаём заново, идемпотентно.
          await bindAccessToTelegram(source, chatId, user.id);
          await grantAccess({ product, telegramId: chatId, userId: user.id, source });

          await prisma.event.update({
            where: { id: ev.id },
            data: { telegramId: BigInt(chatId), metadata: { ...meta, token, consumed: true, boundTelegramId: chatId } },
          });

          await sendMessage(
            chatId,
            `готово ⚡\n\nоплата подтверждена, доступ к <b>${product.name}</b> открыт. материалы — в кабинете, жми кнопку ниже.`,
            { inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: 'https://world.thesashatoyz.com/dostup' } }]] }
          );

          await notifyAdmin(
            `✅ <b>Доступ выдан по коду</b> (оплата картой)\n\n${product.name}\n👤 ${fullName || '—'}\n💬 ${username ? '@' + username : 'без username'}\n🆔 <code>${chatId}</code>\nToken: <code>${token}</code>`
          );
        } catch (err) {
          console.error('paid redeem error:', err);
          await sendMessage(chatId, `что-то пошло не так с активацией. напиши сюда — открою доступ вручную.`);
        }

        return NextResponse.json({ ok: true });
      }

      // Кабинет deep-link: /start kabinet → присылаем кнопку кабинета.
      // Нужен для ручной выдачи доступа (крипта и т.п.), где вебхука оплаты
      // не было и кнопка автоматически не приходила. Ничего не выдаёт — сам
      // кабинет гейтит по telegram_id и покажет только реально купленное.
      if (startParam === 'kabinet' || startParam === 'dostup') {
        await prisma.user.upsert({
          where: { telegramId: BigInt(chatId) },
          create: { telegramId: BigInt(chatId), username: username || null, firstName: update.message.from?.first_name || null },
          update: {},
        });
        await sendMessage(
          chatId,
          `${firstName}, кабинет здесь 👇\n\nвнутри все материалы, к которым у тебя открыт доступ. если чего-то не хватает — напиши сюда.`,
          { inline_keyboard: [[{ text: '🚪 Открыть кабинет', web_app: { url: 'https://world.thesashatoyz.com/dostup' } }]] }
        );
        return NextResponse.json({ ok: true });
      }

      // Lead-magnet deep link (slug from content/leadmagnets.json)
      if (startParam) {
        const lm = getLeadMagnet(startParam);
        if (lm) {
          // Subscription gate: hold the magnet until the user joins the channel.
          // In a private chat the chat.id equals the user's telegram id.
          if (lm.requireSub) {
            const subscribed = await isChannelMember(lm.channelUsername, chatId);
            if (!subscribed) {
              await sendSubscriptionGate(chatId, startParam, lm, firstName);
              await trackEvent({
                event_type: 'leadmagnet_gated',
                user_id: chatId,
                username: username || undefined,
                first_name: fullName || undefined,
                utm_source: `leadmagnet_${startParam}`,
                metadata: { slug: startParam },
              });
              return NextResponse.json({ ok: true });
            }
          }

          await deliverLeadMagnet(chatId, startParam, lm, firstName, username, fullName);
          return NextResponse.json({ ok: true });
        }
      }

      // Sprint waitlist deep link
      if (startParam === 'sprint') {
        const sprintUrl = `${WEBAPP_URL}/sprint`;
        const sprintText = `Привет, ${firstName}! 🔥

<b>Спринт: Собери digital-систему за день</b>

8 часов в Zoom → уходишь с рабочим сайтом, формой заявок и уведомлениями в Telegram.

А потом сам меняешь что угодно — голосом, без программиста.

Заполни анкету — расскажу детали 👇`;

        const sprintMarkup = {
          inline_keyboard: [
            [
              {
                text: '📋 Заполнить анкету',
                web_app: { url: sprintUrl },
              },
            ],
          ],
        };

        await sendMessage(chatId, sprintText, sprintMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'sprint',
        });

        return NextResponse.json({ ok: true });
      }

      // Masterclass SYNC waitlist deep link
      if (startParam === 'masterclasssync') {
        const mcsyncText = `Привет, ${firstName}! ⚡

<b>Мастеркласс SYNC</b>

[Описание мастеркласса появится позже]

Запишись в лист ожидания — напишу первым, когда откроются места и появятся детали 👇`;

        const mcsyncMarkup = {
          inline_keyboard: [
            [
              {
                text: '📌 Записаться в лист ожидания',
                callback_data: 'mcsync_join',
              },
            ],
          ],
        };

        await sendMessage(chatId, mcsyncText, mcsyncMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'masterclasssync',
        });

        return NextResponse.json({ ok: true });
      }

      // Квиз «блоки на деньги» как Mini App — вход с Инсты на ТЕСТ
      // quiz_dengi_ig и т.п. → метка источника прокидывается в utm_source квиза и трекинг
      if (startParam === 'quiz_dengi' || startParam.startsWith('quiz_dengi_')) {
        // текст-болванка, Саша может переписать голосом
        const quizText = `${firstName}, погнали ⚡

короткий тест — покажу, какой именно блок мешает тебе получать деньги. жми 👇`;

        const quizMarkup = {
          inline_keyboard: [
            [
              {
                text: '🧭 Пройти тест',
                web_app: { url: `https://quiz.thesashatoyz.com/quiz-money?utm_source=${startParam}` },
              },
            ],
          ],
        };

        await sendMessage(chatId, quizText, quizMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // МК «Разрешение быстрых денег» waitlist deep link
      // принимаем и метки источника: razreshenie_deneg_ig (Instagram) и т.п. — попадают в utm_source трекинга
      if (startParam === 'razreshenie_deneg' || startParam.startsWith('razreshenie_deneg_')) {
        const rdmkText = `${firstName}, ты почти в списке ⚡

<b>«Разрешение быстрых денег»</b> — 7 дней, на которых я прокачу тебя на своей энергии на новый уровень.

цель простая: помочь тебе перейти на ту сторону берега. где тебе можно проявляться и сиять. где можно получать любые деньги. где можно делать то, что ты хочешь.

это не курс и не информация — это экшн. стык коучинга и маркетинга, который сразу закрепляем на практике. три этапа: голова, инструменты, действие.

кто хочет быть в числе первых — жми 👇`;

        const rdmkMarkup = {
          inline_keyboard: [
            [
              {
                text: '📌 Я в числе первых',
                callback_data: 'rdmk_join',
              },
            ],
          ],
        };

        await sendMessage(chatId, rdmkText, rdmkMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // Страница МК «Разрешение быстрых денег» (лендинг) сразу из бота.
      // Для постов в TG с прямым CTA: t.me/testtoyzbot?start=mk_page (или mk_page_<источник>).
      // Человек остаётся в базе бота (bot_start), метка уходит в utm_source лендинга.
      if (startParam === 'mk_page' || startParam.startsWith('mk_page_')) {
        // текст-болванка, Саша может переписать голосом
        const pageText = `${firstName}, всё про мастер-класс «Разрешение быстрых денег» — тут 👇`;

        const pageMarkup = {
          inline_keyboard: [
            [
              {
                text: '⚡ Открыть страницу МК',
                web_app: { url: `https://thesashatoyz.com/mk-dengi?utm_source=${startParam}` },
              },
            ],
          ],
        };

        await sendMessage(chatId, pageText, pageMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // «Новый уровень контента» — deep-link uroven / uroven_t1 / t2 / t3.
      // Хвост после тарифа = метка источника: uroven_t2_kanal → тариф 2, источник «kanal».
      // Так видно, какой канал привёл покупателя (utm_source = uroven_<метка>).
      // Открываем компактный checkout в мини-аппе; оплата привязывается к Telegram.
      if (startParam === 'uroven' || startParam.startsWith('uroven_t')) {
        const rest = startParam.startsWith('uroven_') ? startParam.slice('uroven_'.length) : '';
        const [tier = 't1', ...srcParts] = rest.split('_');
        const safeTier = ['t1', 't2', 't3'].includes(tier) ? tier : 't1';
        // Метка: только буквы/цифры/дефис, до 32 символов. Пустая → нет метки.
        const src = srcParts.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32) || null;

        const checkoutUrl = `${WEBAPP_URL}/uroven/checkout.html?tier=${safeTier}${src ? `&src=${src}` : ''}`;

        await sendMessage(chatId, `${firstName}, открываю «Новый уровень контента» ⚡`, {
          inline_keyboard: [[{ text: '⚡ Оформить доступ', web_app: { url: checkoutUrl } }]],
        });

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: src ? `uroven_${src}` : startParam,
          metadata: { product: 'uroven', tier: safeTier, src, startParam },
        });

        return NextResponse.json({ ok: true });
      }

      // Статья «Инстаграм это казино» (лонгрид про алгоритм) как Mini App.
      // Вход из Instagram через trampoline: thesashatoyz.com/tg/testtoyzbot?start=kazino
      // Метки источника: kazino_stories / kazino_bio / kazino_reels → в utm_source (bot_start).
      // Человек попадает в базу бота, статья открывается внутри мини-аппа (пруфы через tg.openLink).
      if (startParam === 'kazino' || startParam.startsWith('kazino_')) {
        // текст-болванка, Саша может переписать голосом
        const kazinoText = `${firstName}, держи 👇

разбор на реальных аккаунтах: почему «секрет алгоритма» — это миф, и как обыграть это казино`;

        const kazinoMarkup = {
          inline_keyboard: [
            [{ text: '📖 Читать разбор', web_app: { url: 'https://thesashatoyz.com/algoritm-sistema.html' } }],
          ],
        };

        // Сначала мягкий пул в канал (текст Саши, дословно)…
        const channelText = `подписку проверять не буду, но если реально хочешь:

• обыгрывать это казино
• зарабатывать капусту из блога
• шуметь своим проектом на всю катушку

каждый день я делюсь инсайтами и тем, о чем вам не расскажет ни один маркетолог

буду ждать тебя тут 👇`;

        await sendMessage(chatId, channelText, {
          inline_keyboard: [
            [{ text: '📣 мой канал в telegram', url: 'https://t.me/sashatoyz' }],
          ],
        });

        // …потом, с паузой ~7с, сама статья.
        await new Promise((r) => setTimeout(r, 7000));
        await sendMessage(chatId, kazinoText, kazinoMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: startParam,
        });

        return NextResponse.json({ ok: true });
      }

      // МК «Разрешение быстрых денег» — открываем лендинг в мини-аппе,
      // оплата идёт прямо из него (см. public/mk/index.html), вебхук ловит оплату.
      if (startParam === 'mk_dengi') {
        const mkText = `${firstName}, открываю мастер-класс ⚡`;

        const mkMarkup = {
          inline_keyboard: [
            [{ text: '⚡ Открыть мастер-класс', web_app: { url: `${WEBAPP_URL}/mk/index.html` } }],
          ],
        };

        await sendMessage(chatId, mkText, mkMarkup);

        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'mk_dengi',
        });

        return NextResponse.json({ ok: true });
      }

      // МК Синхронизация deep link
      if (startParam === 'sync_mk') {
        const mkSyncUrl = 'https://thesashatoyz.com/sync/mk';
        const syncText = `Привет, ${firstName}!

<b>МК «Синхронизация» — 27 апреля, 17:00 МСК</b>

За 2 часа уберём шум, найдём ваше «хочу» — фундамент, на котором собирается проект всей жизни.

2 450 ₽ (первые 10 мест) → потом 3 450 ₽
Запись + методичка навсегда.`;

        const syncMarkup = {
          inline_keyboard: [
            [{ text: 'Открыть лендинг', web_app: { url: mkSyncUrl } }],
          ],
        };

        await sendMessage(chatId, syncText, syncMarkup);
        return NextResponse.json({ ok: true });
      }

      // Special handling for masterclass deep link
      if (startParam === 'masterclass' || startParam === 'buy_mc') {
        console.log('Masterclass flow triggered!');
        const masterclassUrl = `${WEBAPP_URL}/masterclass?utm_source=telegram_bot`;
        const masterclassText = `<b>Приглашение на Мастер-класс — "Продающий Контент"</b>

Как трансформировать контент в продажи через соц. сети
2 часа | 3 450 ₽

<b>Что будет на мастер-классе:</b>
Это не лекция про теорию.
Это разбор конкретных постов и трансформация в режиме реального времени.

<b>1. Схема сборки Продающего Контента</b>
Пошаговый алгоритм, который превращает "обучающие" посты в "продающие"

<b>2. 3 промпта для нейросетей</b> — вставляете в нейронку, получаете готовый продающий контент за минуты

<b>3. Готовая воронка с 4 рилсов</b> — не теория, а реальная система, которую вы сможете скопировать

<b>4. Методика создания лид-магнитов</b>, за которыми люди приходят сами толпами.

<b>5. «Фирменный рецепт»</b> — секретный ингредиент, который выделит вас среди тысяч других экспертов.

<b>Та же схема дала такие результаты:</b>

• <b>Маша</b> — коммерческий сценарист
4 рилса → 2 000 000 ₽ за месяц
350+ продаж мастер-класса

• <b>Вася</b> — фитнес-тренер
С 100 000 до 500 000 ₽/месяц
При 500 подписчиках

• <b>Женя</b>
С $2 000 до $8 000/месяц

<b>Результат:</b>
Цель: окупить мастер-класс минимум в 3 раза за 14 дней.
Вы создадите контент, который приводит клиентов — без танцев в сторис и бесплатных созвонов.

<b>Гарантия:</b>
Если после мастер-класса поймёте, что система не подходит — верну деньги. Без вопросов.

<b>Бонус сразу после оплаты:</b>
Шаблон «Богатая ЦА» — за 20 минут получите всю информацию по вашей целевой аудитории.

<b>Стоимость: 3 450 ₽</b>
Живой эфир + запись навсегда.`;

        const masterclassMarkup = {
          inline_keyboard: [
            [
              {
                text: '📖 Ознакомиться подробнее',
                web_app: { url: masterclassUrl },
              },
            ],
          ],
        };

        await sendMessage(chatId, masterclassText, masterclassMarkup);

        // Track bot_start with masterclass source
        await trackEvent({
          event_type: 'bot_start',
          user_id: chatId,
          username: username || undefined,
          first_name: fullName || undefined,
          utm_source: 'telegram_bot_masterclass',
        });

        return NextResponse.json({ ok: true });
      }

      // Default flow — квиз «блоки на деньги» (старый квиз «Диагностика контента» убран)
      const defaultUtm = startParam || 'bot_start';
      const webappUrl = `https://quiz.thesashatoyz.com/quiz-money?utm_source=${encodeURIComponent(defaultUtm)}`;

      // текст-болванка, Саша может переписать голосом
      const welcomeText = `${firstName}, погнали ⚡

короткий тест — покажу, какой именно блок мешает тебе получать деньги. жми 👇`;

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🧭 Пройти тест',
              web_app: { url: webappUrl },
            },
          ],
        ],
      };

      await sendMessage(chatId, welcomeText, replyMarkup);

      // Track bot_start event (user clicked the link and opened the bot)
      await trackEvent({
        event_type: 'bot_start',
        user_id: chatId,
        username: username || undefined,
        first_name: fullName || undefined,
        utm_source: startParam || undefined,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
