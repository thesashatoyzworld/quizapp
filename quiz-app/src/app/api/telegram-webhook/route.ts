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

      // Parse UTM source from /start parameter (e.g. "/start youtube")
      const parts = update.message.text.split(' ');
      const startParam = parts.length > 1 ? parts[1].trim() : '';
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
      trackEvent({
        event_type: 'bot_start',
        user_id: chatId,
        utm_source: startParam || undefined,
      }).catch(() => {}); // fire-and-forget
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
