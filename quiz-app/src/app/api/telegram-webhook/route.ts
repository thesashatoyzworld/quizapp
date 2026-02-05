import { NextRequest, NextResponse } from 'next/server';

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
    body.reply_markup = JSON.stringify(replyMarkup);
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    // Handle /start command
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const firstName = update.message.from?.first_name || 'друг';

      const welcomeText = `Привет, ${firstName}! 👋

🎯 <b>Диагностика контента</b>

Узнай, на каком этапе развития ты находишься и сколько денег теряешь из-за неправильного контента.

8 вопросов → персональный разбор`;

      const replyMarkup = {
        inline_keyboard: [
          [
            {
              text: '🚀 Пройти диагностику',
              web_app: { url: WEBAPP_URL },
            },
          ],
        ],
      };

      await sendMessage(chatId, welcomeText, replyMarkup);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
