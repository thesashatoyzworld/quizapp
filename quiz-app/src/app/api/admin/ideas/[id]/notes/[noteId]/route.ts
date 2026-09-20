import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { normalizeNoteText } from '@/lib/ideas/notes';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string; noteId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, noteId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    text?: string;
    done?: boolean;
    chosen?: boolean;
  };

  const note = await prisma.ideaNote.findUnique({ where: { id: noteId } });
  if (!note || note.ideaId !== id) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const data: { text?: string; done?: boolean; chosen?: boolean } = {};

  if (body.text !== undefined) {
    const text = normalizeNoteText(body.text);
    if (!text) return NextResponse.json({ error: 'text is empty' }, { status: 400 });
    data.text = text;
  }
  if (body.done !== undefined) data.done = body.done;

  // Only one title carries the bet. Clearing the others and setting this one
  // happen together, otherwise a failed second write leaves two chosen.
  if (body.chosen !== undefined) {
    await prisma.$transaction([
      prisma.ideaNote.updateMany({
        where: { ideaId: id, kind: note.kind, chosen: true },
        data: { chosen: false },
      }),
      prisma.ideaNote.update({ where: { id: noteId }, data: { ...data, chosen: body.chosen } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'nothing to change' }, { status: 400 });
  }

  await prisma.ideaNote.update({ where: { id: noteId }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, noteId } = await params;
  const note = await prisma.ideaNote.findUnique({ where: { id: noteId }, select: { ideaId: true } });
  if (!note || note.ideaId !== id) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await prisma.ideaNote.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
