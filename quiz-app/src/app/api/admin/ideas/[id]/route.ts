import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { type DraftIdea, type DraftRef, type RefKind } from '@/lib/ideas/types';
import { IDEA_STATUSES, isIdeaStatus } from '@/lib/ideas/status';
import { parseIdea } from '@/lib/ideas/parse';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string; reparse?: boolean };

  if (body.reparse) {
    const idea = await prisma.idea.findUnique({ where: { id }, include: { refs: true } });
    if (!idea) return NextResponse.json({ error: 'not found' }, { status: 404 });

    // Собираем DraftIdea обратно из сохранённых колонок: исходник (rawText,
    // voiceTranscript) не трогаем, refs берём как есть, разбирает заново
    // только заголовок/тип/summary/tags.
    const draft: DraftIdea = {
      source: idea.source,
      chatId: idea.chatId,
      threadId: idea.threadId,
      firstMessageId: idea.firstMessageId,
      lastMessageId: idea.lastMessageId,
      authorUsername: idea.authorUsername,
      tgLink: idea.tgLink,
      rawText: idea.rawText,
      voiceTranscript: idea.voiceTranscript,
      occurredAt: idea.occurredAt,
      refs: idea.refs
        .sort((a, b) => a.position - b.position)
        .map((r): DraftRef => ({
          kind: r.kind as RefKind,
          fileId: r.fileId,
          thumbFileId: r.thumbFileId,
          url: r.url,
          domain: r.domain,
          caption: r.caption,
          messageId: r.messageId,
          tgLink: r.tgLink,
          position: r.position,
        })),
    };

    const parsed = await parseIdea(draft);
    await prisma.idea.update({
      where: { id },
      data: {
        title: parsed.title,
        type: parsed.type,
        summary: parsed.summary,
        tags: parsed.tags,
        parsed: parsed.parsed,
        parseError: parsed.parseError,
      },
    });

    return NextResponse.json({ ok: true, title: parsed.title });
  }

  if (!body.status || !isIdeaStatus(body.status)) {
    return NextResponse.json({ error: `status must be one of ${IDEA_STATUSES.join(', ')}` }, { status: 400 });
  }

  const idea = await prisma.idea.update({ where: { id }, data: { status: body.status } });
  return NextResponse.json({ ok: true, status: idea.status });
}
