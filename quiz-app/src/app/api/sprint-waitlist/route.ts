import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyAdmin } from '@/lib/telegram';

interface SprintWaitlistPayload {
  telegramId?: string;
  name: string;
  telegram: string;
  occupation: string;
  hasSite: string;
  needs: string[];
  aiExperience: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: SprintWaitlistPayload = await request.json();

    // Валидация обязательных полей
    if (!payload.name || !payload.telegram || !payload.occupation || !payload.hasSite || !payload.aiExperience) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!payload.needs || payload.needs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one need is required' },
        { status: 400 }
      );
    }

    // Сохраняем в БД
    await prisma.sprintWaitlist.create({
      data: {
        telegramId: payload.telegramId || null,
        name: payload.name,
        telegram: payload.telegram,
        occupation: payload.occupation,
        hasSite: payload.hasSite,
        needs: payload.needs,
        aiExperience: payload.aiExperience,
        source: payload.source || null,
      },
    });

    // Уведомляем админа в Telegram
    const needsList = payload.needs.join(', ');
    const message = `🔥 <b>Новая заявка на спринт!</b>

👤 Имя: ${payload.name}
💬 Telegram: ${payload.telegram}
💼 Чем занимается: ${payload.occupation}
🌐 Есть сайт: ${payload.hasSite}
🎯 Нужнее всего: ${needsList}
🤖 Опыт с AI: ${payload.aiExperience}`;

    await notifyAdmin(message);

    console.log('[Sprint Waitlist] New submission:', {
      name: payload.name,
      telegram: payload.telegram,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sprint waitlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
