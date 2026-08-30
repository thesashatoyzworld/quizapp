import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_STATUS = ['new', 'written', 'replied', 'bought', 'rejected'];

// Ассистент/оператор ставит статус лида из Instagram. Ключ — пара
// (клиент ChatPlace + автоматизация): один человек мог зайти в несколько
// воронок, и по каждой у него свой статус.
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId, automationId, status, note } = await request.json();

  if (!clientId || !automationId) {
    return NextResponse.json({ error: 'clientId и automationId обязательны' }, { status: 400 });
  }
  if (status !== undefined && !ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: 'Bad status' }, { status: 400 });
  }

  const row = await prisma.igLead.update({
    where: { clientId_automationId: { clientId: String(clientId), automationId: String(automationId) } },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(note !== undefined ? { note: note === '' ? null : String(note).slice(0, 500) } : {}),
      updatedBy: session.userId,
    },
  });

  return NextResponse.json({
    ok: true,
    status: row.status,
    note: row.note,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
  });
}
