// A batch of messages turns into one idea.
//
// Source is untouched: texts and transcripts are folded verbatim, in message
// order. The model works later and writes to other fields.
import { extractLinks } from './batch';
import type { DraftIdea, DraftRef, IngestMessage } from './types';

export function assembleIdea(messages: IngestMessage[]): DraftIdea {
  if (messages.length === 0) throw new Error('assembleIdea: empty batch');

  const sorted = [...messages].sort((a, b) => a.messageId - b.messageId);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const texts: string[] = [];
  const transcripts: string[] = [];
  const refs: DraftRef[] = [];

  for (const m of sorted) {
    if (m.text && m.text.trim()) texts.push(m.text.trim());
    if (m.voiceTranscript && m.voiceTranscript.trim()) transcripts.push(m.voiceTranscript.trim());

    for (const a of m.attachments) {
      refs.push({
        kind: a.kind,
        fileId: a.fileId ?? null,
        thumbFileId: a.thumbFileId ?? null,
        url: a.url ?? null,
        domain: a.domain ?? null,
        caption: a.caption ?? null,
        messageId: m.messageId,
        tgLink: m.tgLink,
        position: refs.length,
      });
    }

    for (const l of extractLinks(m.text)) {
      if (refs.some((r) => r.kind === 'link' && r.url === l.url)) continue;
      refs.push({
        kind: 'link',
        fileId: null,
        thumbFileId: null,
        url: l.url,
        domain: l.domain,
        caption: null,
        messageId: m.messageId,
        tgLink: m.tgLink,
        position: refs.length,
      });
    }
  }

  return {
    source: first.source,
    chatId: String(first.chatId),
    threadId: first.threadId,
    firstMessageId: first.messageId,
    lastMessageId: last.messageId,
    authorUsername: first.authorUsername,
    tgLink: first.tgLink,
    rawText: texts.length ? texts.join('\n\n') : null,
    voiceTranscript: transcripts.length ? transcripts.join('\n\n') : null,
    occurredAt: new Date(first.at),
    refs,
  };
}
