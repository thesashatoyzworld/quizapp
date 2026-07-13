import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { PRODUCT } from '@/lib/leads';

const ALLOWED_STATUS = ['new', 'written', 'replied', 'bought', 'rejected'];

// Ассистент/оператор ставит статус лида. Пишем в lead_status (upsert по паре
// product+telegramId). Живёт под той же admin-сессией, что и вся админка.
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { telegramId, status, note } = await request.json();

  const tg = String(telegramId ?? '').trim();
  if (!/^\d{3,}$/.test(tg)) {
    return NextResponse.json({ error: 'Bad telegramId' }, { status: 400 });
  }
  if (status !== undefined && !ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: 'Bad status' }, { status: 400 });
  }

  const data = {
    ...(status !== undefined ? { status } : {}),
    ...(note !== undefined ? { note: note === '' ? null : String(note).slice(0, 500) } : {}),
    updatedBy: session.userId,
  };

  const row = await prisma.leadStatus.upsert({
    where: { product_telegramId: { product: PRODUCT, telegramId: BigInt(tg) } },
    create: { product: PRODUCT, telegramId: BigInt(tg), status: status ?? 'new', note: note || null, updatedBy: session.userId },
    update: data,
  });

  return NextResponse.json({
    ok: true,
    status: row.status,
    note: row.note,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
  });
}
