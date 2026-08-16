import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, SESSION_COOKIE } from '@/lib/telegram-login';
import type { Prisma } from '@/generated/prisma/client';

export const runtime = 'nodejs';

// ─────────────────────────────────────────────────────────────
// Приёмник трекинга кабинета. Пишет в общую таблицу events.
//
//   section_view    — человек открыл раздел          metadata { section }
//   material_view   — открыл материал                metadata { kind, slug, title }
//   video_progress  — досмотрел видео до percent     metadata { kind, slug, percent, seconds }
//   cabinet_open    — зашёл в кабинет (старые страницы)
//
// video_progress живёт ОДНОЙ строкой на человека и видео: percent двигаем
// только вверх. История перемоток не нужна, нужен максимум досмотра —
// иначе таблица events утонет в тикках плеера.
//
// Опознание как везде в кабинете: telegram_id из initData мини-аппа,
// иначе подписанная сессия-cookie после Telegram Login Widget.
// Неопознанного не пишем вовсе: событие без человека нам ничего не говорит.
// ─────────────────────────────────────────────────────────────

const TYPES = ['cabinet_open', 'section_view', 'material_view', 'video_progress'] as const;
type EventType = (typeof TYPES)[number];

interface CabinetTrackPayload {
  event_type: EventType;
  telegram_id?: number;
  metadata?: Record<string, string | number | boolean | null>;
}

type Meta = Record<string, string | number | boolean | null>;

/** Строка прогресса этого человека по этому видео, если она уже есть. */
async function findProgress(telegramId: number, kind: string, slug: string) {
  return prisma.event.findFirst({
    where: {
      telegramId: BigInt(telegramId),
      type: 'video_progress',
      AND: [
        { metadata: { path: ['kind'], equals: kind } },
        { metadata: { path: ['slug'], equals: slug } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload: CabinetTrackPayload = await request.json();

    if (!payload.event_type || !TYPES.includes(payload.event_type)) {
      return NextResponse.json({ success: false, error: 'bad event_type' }, { status: 400 });
    }

    let telegramId: number | null = null;
    if (payload.telegram_id && Number.isInteger(payload.telegram_id)) {
      telegramId = payload.telegram_id;
    } else {
      const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
      telegramId = verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret);
    }
    if (!telegramId) return NextResponse.json({ success: true, stored: false });

    const meta: Meta = payload.metadata ? { ...payload.metadata } : {};

    // Досмотр видео: одна строка на человека и видео, percent только вверх.
    if (payload.event_type === 'video_progress') {
      const kind = String(meta.kind || '');
      const slug = String(meta.slug || '');
      const percent = Math.max(0, Math.min(100, Number(meta.percent) || 0));
      if (!kind || !slug) {
        return NextResponse.json({ success: false, error: 'kind and slug required' }, { status: 400 });
      }

      const existing = await findProgress(telegramId, kind, slug);
      const now = new Date().toISOString();

      if (existing) {
        const prev = (existing.metadata as Meta | null) ?? {};
        const prevPercent = Number(prev.percent) || 0;
        await prisma.event.update({
          where: { id: existing.id },
          data: {
            metadata: {
              ...prev,
              kind,
              slug,
              percent: Math.max(prevPercent, percent),
              seconds: Math.max(Number(prev.seconds) || 0, Number(meta.seconds) || 0),
              lastAt: now,
            } as Prisma.InputJsonValue,
          },
        });
        return NextResponse.json({ success: true, stored: true });
      }

      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
        select: { id: true },
      });
      await prisma.event.create({
        data: {
          type: 'video_progress',
          source: 'cabinet',
          userId: user?.id ?? null,
          telegramId: BigInt(telegramId),
          metadata: { ...meta, kind, slug, percent, firstAt: now, lastAt: now } as Prisma.InputJsonValue,
        },
      });
      return NextResponse.json({ success: true, stored: true });
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
      select: { id: true },
    });
    await prisma.event.create({
      data: {
        type: payload.event_type,
        source: 'cabinet',
        userId: user?.id ?? null,
        telegramId: BigInt(telegramId),
        metadata: Object.keys(meta).length ? (meta as Prisma.InputJsonValue) : undefined,
      },
    });

    return NextResponse.json({ success: true, stored: true });
  } catch (error) {
    console.error('[Cabinet] Track event error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
