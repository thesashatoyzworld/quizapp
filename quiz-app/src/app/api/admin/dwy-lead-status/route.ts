import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { isLeadStatus } from '@/content/lead-status';

// Саша или ассистент ведёт заявку с сайта: статус и заметка. Ключ — id самой
// заявки, а не человека: один и тот же человек мог прийти дважды (сначала лист
// ожидания, потом менторство), и это две разные заявки со своей судьбой.
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, note } = await request.json();

  const leadId = Number(id);
  if (!Number.isInteger(leadId)) {
    return NextResponse.json({ error: 'id обязателен' }, { status: 400 });
  }
  if (status !== undefined && !isLeadStatus(status)) {
    return NextResponse.json({ error: 'Bad status' }, { status: 400 });
  }

  const row = await prisma.dwyLead.update({
    where: { id: leadId },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(note !== undefined ? { note: note === '' ? null : String(note).slice(0, 2000) } : {}),
      updatedBy: session.userId,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    status: row.status,
    note: row.note,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt?.toISOString() ?? null,
  });
}
