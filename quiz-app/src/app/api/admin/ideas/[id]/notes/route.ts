import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { isNoteKind, normalizeNoteText, NOTE_KINDS } from '@/lib/ideas/notes';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { kind?: string; text?: string };

  if (!body.kind || !isNoteKind(body.kind)) {
    return NextResponse.json({ error: `kind must be one of ${NOTE_KINDS.join(', ')}` }, { status: 400 });
  }
  const text = normalizeNoteText(body.text || '');
  if (!text) return NextResponse.json({ error: 'text is empty' }, { status: 400 });

  const idea = await prisma.idea.findUnique({ where: { id }, select: { id: true } });
  if (!idea) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // Position is per kind: each block is its own list on the sheet.
  const last = await prisma.ideaNote.findFirst({
    where: { ideaId: id, kind: body.kind },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  const note = await prisma.ideaNote.create({
    data: { ideaId: id, kind: body.kind, text, position: (last?.position ?? -1) + 1 },
  });

  return NextResponse.json({ ok: true, note });
}
