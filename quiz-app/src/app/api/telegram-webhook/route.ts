import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';

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

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

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

      // Special handling for masterclass deep link
      if (startParam === 'masterclass' || startParam === 'buy_mc') {
        console.log('Masterclass flow triggered!');
        const masterclassUrl = `${WEBAPP_URL}/masterclass?utm_source=telegram_bot`;
        const masterclassText = `Привет, ${firstName}! 👋

📚 <b>Мастер-класс «ПРОДАЮЩИЙ КОНТЕНТ»</b>

Как создавать контент, который продаёт. Без танцев в сторис. Без "давай пользу и жди".

📅 24 февраля, 17:00 мск
⏱ 2 часа
💰 3 450 руб

<b>Что будет:</b>
✓ Схема сборки Продающего Контента
✓ 3 промпта для нейросетей
✓ Готовая воронка (8000 подписчиков, 300+ продаж)
✓ Методика лид-магнитов
✓ «Фирменный рецепт»

<b>Бонус:</b> Шаблон «Богатая ЦА» сразу после оплаты

<b>Гарантия:</b> Если не подойдёт — верну деньги`;

        const masterclassMarkup = {
          inline_keyboard: [
            [
              {
                text: '🎓 Купить мастер-класс',
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
