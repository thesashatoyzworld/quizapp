import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { isLeadStatus } from '@/content/lead-status';
import { editAdminMarkup, type NotifyRef } from '@/lib/telegram';
import { leadKeyboard } from '@/lib/lead-keyboard';

/**
 * Куда уходило уведомление об этой заявке.
 *
 * Читаем терпимо: jsonb через драйвер приходит массивом, но заявки писались
 * разными версиями кода, и в поле может лежать строка с JSON или мусор.
 * Кривая запись не должна ронять сохранение статуса — она лишь оставляет
 * кнопки в боте непеперерисованными.
 */
function parseNotifyRefs(value: unknown): NotifyRef[] {
  let raw = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) {
    if (raw) console.error('[dwy-lead-status] notifyRefs не массив:', typeof raw);
    return [];
  }

  const refs: NotifyRef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { chatId, messageId } = item as { chatId?: unknown; messageId?: unknown };
    if (typeof chatId !== 'string' || typeof messageId !== 'number') continue;
    refs.push({ chatId, messageId });
  }
  return refs;
}

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

  // Статус поменяли в кабинете — перерисуем кнопки под уведомлением в боте,
  // иначе там останется прежняя галочка и два места будут спорить друг с другом.
  let synced = 0;
  if (status !== undefined) {
    const refs = parseNotifyRefs(row.notifyRefs);
    if (refs.length) {
      const markup = leadKeyboard(row.id, status);
      await Promise.all(refs.map((ref) => editAdminMarkup(ref, markup)));
      synced = refs.length;
    }
  }

  return NextResponse.json({
    ok: true,
    status: row.status,
    note: row.note,
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt?.toISOString() ?? null,
    /** Скольким сообщениям в боте перерисовали кнопки. 0 = заявка старая, кнопок под ней нет. */
    synced,
  });
}
