import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { Receiver } from '@upstash/qstash';
import { prisma } from '@/lib/prisma';
import { scheduleIdeaAssemble } from '@/lib/qstash';
import { isBatchClosed } from '@/lib/ideas/batch';
import { assembleIdea } from '@/lib/ideas/assemble';
import { parseIdea } from '@/lib/ideas/parse';
import type { IngestMessage } from '@/lib/ideas/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function POST(request: NextRequest) {
  const signature = request.headers.get('upstash-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 401 });

  const body = await request.text();
  const valid = await receiver
    .verify({ signature, body, url: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/ideas/assemble` })
    .catch(() => false);
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  const { batchKey } = JSON.parse(body) as { batchKey: string };

  const rows = await prisma.ideaInbox.findMany({
    where: { batchKey, ideaId: null },
    orderBy: { messageId: 'asc' },
  });
  if (rows.length === 0) return NextResponse.json({ ok: true, skipped: 'nothing to assemble' });

  const messages = rows.map((r) => r.payload as unknown as IngestMessage);
  const lastAt = new Date(messages[messages.length - 1].at);

  // Человек ещё пишет: подождём следующего окна.
  if (!isBatchClosed(lastAt, new Date())) {
    await scheduleIdeaAssemble(batchKey, 60);
    return NextResponse.json({ ok: true, rescheduled: true });
  }

  // Claim before work: несколько задач (по одной на сообщение альбома, или
  // ретрай QStash после таймаута) могут пройти findMany выше одновременно.
  // updateMany с condition ideaId: null атомарен на уровне БД: только одна
  // задача реально проставит id и увидит claimed.count > 0.
  const ideaId = randomUUID();
  const claimed = await prisma.ideaInbox.updateMany({
    where: { batchKey, ideaId: null },
    data: { ideaId },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ ok: true, skipped: 'already claimed' });
  }

  try {
    // Перечитываем именно то, что застолбили: сообщение могло прилететь
    // между первым findMany и claim'ом, и оно тоже принадлежит этой идее.
    const claimedRows = await prisma.ideaInbox.findMany({
      where: { ideaId },
      orderBy: { messageId: 'asc' },
    });
    const claimedMessages = claimedRows.map((r) => r.payload as unknown as IngestMessage);

    const draft = assembleIdea(claimedMessages);
    const parsed = await parseIdea(draft);

    await prisma.idea.create({
      data: {
        id: ideaId,
        source: draft.source,
        chatId: draft.chatId,
        threadId: draft.threadId,
        firstMessageId: draft.firstMessageId,
        lastMessageId: draft.lastMessageId,
        authorUsername: draft.authorUsername,
        tgLink: draft.tgLink,
        rawText: draft.rawText,
        voiceTranscript: draft.voiceTranscript,
        occurredAt: draft.occurredAt,
        title: parsed.title,
        type: parsed.type,
        summary: parsed.summary,
        tags: parsed.tags,
        parsed: parsed.parsed,
        parseError: parsed.parseError,
        refs: {
          create: draft.refs.map((r) => ({
            kind: r.kind,
            fileId: r.fileId,
            thumbFileId: r.thumbFileId,
            url: r.url,
            domain: r.domain,
            caption: r.caption,
            messageId: r.messageId,
            tgLink: r.tgLink,
            position: r.position,
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, ideaId, messages: claimedRows.length });
  } catch (error) {
    // Что-то упало после claim: снимаем метку, иначе эти сообщения навсегда
    // помечены идеей, которой не существует, и никогда не соберутся снова.
    await prisma.ideaInbox.updateMany({ where: { ideaId }, data: { ideaId: null } });
    throw error;
  }
}
