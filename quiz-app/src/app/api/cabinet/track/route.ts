import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';

interface CabinetTrackPayload {
  event_type: 'cabinet_open' | 'material_view' | 'section_view';
  telegram_id?: number;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function POST(request: NextRequest) {
  try {
    const payload: CabinetTrackPayload = await request.json();

    if (!payload.event_type) {
      return NextResponse.json(
        { success: false, error: 'event_type is required' },
        { status: 400 }
      );
    }

    // Find user by telegramId if provided
    let userId: string | null = null;
    if (payload.telegram_id) {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(payload.telegram_id) },
        select: { id: true },
      });
      userId = user?.id || null;
    }

    // Create event record
    await prisma.event.create({
      data: {
        type: payload.event_type,
        source: 'cabinet',
        userId,
        telegramId: payload.telegram_id ? BigInt(payload.telegram_id) : null,
        metadata: payload.metadata
          ? (payload.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });

    console.log(`[Cabinet Track] ${payload.event_type}`, {
      telegram_id: payload.telegram_id,
      metadata: payload.metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Cabinet] Track event error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
