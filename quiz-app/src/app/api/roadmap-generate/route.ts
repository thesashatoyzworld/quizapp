// Сборка маршрутной карты по закрытой анкете тарифа 2.
//
// Живёт отдельным роутом, потому что обращение к модели идёт минуты: вебхук
// Telegram столько не ждёт. Ставится в очередь из notifyIntakeDone.

import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { prisma } from '@/lib/prisma';
import { notifyAdmin } from '@/lib/telegram';
import { buildRoadmap } from '@/lib/roadmap/build';

// Модель думает долго, стандартных 10 секунд Vercel не хватит.
export const maxDuration = 300;

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function POST(request: NextRequest) {
  const signature = request.headers.get('upstash-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 401 });

  const body = await request.text();
  const valid = await receiver
    .verify({ signature, body, url: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/roadmap-generate` })
    .catch(() => false);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const { intakeId } = JSON.parse(body) as { intakeId: string };

  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: { status: true, username: true, firstName: true },
  });
  if (!intake) return NextResponse.json({ ok: true, skipped: 'not found' });
  if (intake.status !== 'done') return NextResponse.json({ ok: true, skipped: 'not finished' });

  const who = intake.username ? `@${intake.username}` : intake.firstName || intakeId;

  try {
    const result = await buildRoadmap(intakeId);

    // Предпросмотр не ушёл (бот молчит, админ не задан) — хотя бы скажем, где карта.
    if (!result.previewSent) {
      await notifyAdmin(`🗺 черновик карты ${who} собран, но предпросмотр не отправился. карта: /admin/roadmaps/${result.slug}`);
    }

    return NextResponse.json({ ok: true, roadmapId: result.roadmapId, warnings: result.warnings.length });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[roadmap-generate] ${intakeId}:`, error);
    await notifyAdmin(`🗺 карта для ${who} не собралась: ${reason}\n\nпересобрать: /karta_sobrat ${intake.username ? '@' + intake.username : ''}`);
    // 200, чтобы очередь не долбила повторами: причина уже у Саши в личке.
    return NextResponse.json({ ok: false, error: reason });
  }
}
