// Message form sent by agent-hub to /api/ideas/ingest.
//
// Warning: The same type is described in agent-hub/src/lib/idea-payload.ts.
// The repositories are not connected by build, so changing the form requires
// updating both files.

export type RefKind = 'photo' | 'video' | 'video_note' | 'voice' | 'document' | 'audio' | 'link';

export interface IngestAttachment {
  kind: RefKind;
  fileId?: string;
  thumbFileId?: string;
  url?: string;
  domain?: string;
  caption?: string;
}

export interface IngestMessage {
  source: string;
  chatId: number;
  threadId: number | null;
  messageId: number;
  authorId: string | null;
  authorUsername: string | null;
  /** ISO-timestamp of the message in Telegram */
  at: string;
  text: string | null;
  voiceTranscript: string | null;
  attachments: IngestAttachment[];
  tgLink: string;
}

export interface DraftRef {
  kind: RefKind;
  fileId: string | null;
  thumbFileId: string | null;
  url: string | null;
  domain: string | null;
  caption: string | null;
  messageId: number;
  tgLink: string;
  position: number;
}

export interface DraftIdea {
  source: string;
  chatId: string;
  threadId: number | null;
  firstMessageId: number;
  lastMessageId: number;
  authorUsername: string | null;
  tgLink: string;
  rawText: string | null;
  voiceTranscript: string | null;
  occurredAt: Date;
  refs: DraftRef[];
}

export const IDEA_TYPES = ['reel', 'bigvideo', 'carousel', 'post', 'offer', 'system', 'other'] as const;
export type IdeaType = (typeof IDEA_TYPES)[number];

export const IDEA_STATUSES = ['raw', 'in_work', 'shipped', 'rejected'] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

/** Three minutes of silence and the batch becomes one idea. */
export const IDEA_BATCH_WINDOW_MS = 180_000;
/** Tolerance for QStash scheduler jitter. */
export const IDEA_BATCH_SLACK_MS = 10_000;
