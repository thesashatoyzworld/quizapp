import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { Receiver } from '@upstash/qstash';
import { prisma } from '@/lib/prisma';
import { scheduleIdeaAssemble } from '@/lib/qstash';
import { isBatchClosed } from '@/lib/ideas/batch';
import { assembleIdea } from '@/lib/ideas/assemble';
import { parseIdea, fallbackTitle } from '@/lib/ideas/parse';
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

  // Claim и создание идеи в одной транзакции: несколько задач (по одной на
  // сообщение альбома, или ретрай QStash после таймаута) могут пройти
  // findMany выше одновременно, а процесс может умереть между claim'ом и
  // созданием идеи (таймаут maxDuration, краш, редеплой). Раньше claim и
  // create были раздельными запросами, и падение между ними навсегда
  // теряло сообщения: строки помечены ideaId, которого не существует,
  // а верхний findMany ищет только ideaId: null и их больше не увидит.
  // В транзакции оба шага коммитятся или откатываются вместе.
  const ideaId = randomUUID();

  const claim = await prisma.$transaction(async (tx) => {
    const claimed = await tx.ideaInbox.updateMany({
      where: { batchKey, ideaId: null },
      data: { ideaId },
    });
    if (claimed.count === 0) return null; // никто ничего не писал, откатывать нечего

    const claimedRows = await tx.ideaInbox.findMany({
      where: { ideaId },
      orderBy: { messageId: 'asc' },
    });
    const claimedMessages = claimedRows.map((r) => r.payload as unknown as IngestMessage);
    const draft = assembleIdea(claimedMessages);

    // Плейсхолдер вместо разбора моделью: запись идеи не должна ждать
    // Haiku. Настоящий title/type/summary/tags придёт следующим update'ом
    // уже вне транзакции.
    await tx.idea.create({
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
        title: fallbackTitle(draft),
        type: 'other',
        summary: null,
        tags: [],
        parsed: false,
        parseError: null,
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

    return { ideaId, draft, messageCount: claimedRows.length };
  });

  if (!claim) {
    return NextResponse.json({ ok: true, skipped: 'already claimed' });
  }

  // Идея уже существует (с плейсхолдер-заголовком, parsed: false) и
  // пережила бы падение процесса прямо здесь. Разбор моделью и обновление
  // карточки это best-effort поверх уже сохранённых данных: если упадёт,
  // идея остаётся видимой с фолбэк-заголовком, что и есть корректное
  // состояние "разбор не случился".
  const parsed = await parseIdea(claim.draft);
  try {
    await prisma.idea.update({
      where: { id: claim.ideaId },
      data: {
        title: parsed.title,
        type: parsed.type,
        summary: parsed.summary,
        tags: parsed.tags,
        parsed: parsed.parsed,
        parseError: parsed.parseError,
      },
    });
  } catch (error) {
    console.error(`[ideas/assemble] Failed to save parse result for idea ${claim.ideaId}:`, error);
  }

  return NextResponse.json({ ok: true, ideaId: claim.ideaId, messages: claim.messageCount });
}
