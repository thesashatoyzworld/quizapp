import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';
import { notifyAdmin } from '@/lib/telegram';
import { prisma } from '@/lib/prisma';

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

      // Default quiz flow
      const webappUrl = startParam
        ? `${WEBAPP_URL}?utm_source=${encodeURIComponent(startParam)}`
        : WEBAPP_URL;

      const welcomeText = `Привет, ${firstName}! 👋

🎯 <b>Диагностика контента</b>

Узнай, на каком этапе развития ты находишься и сколько денег теряешь из-за неправильного контента.

8 вопросов → персональный разбор`;

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🚀 Пройти диагностику',
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
