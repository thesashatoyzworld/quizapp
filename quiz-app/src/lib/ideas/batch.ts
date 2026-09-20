import {
  IDEA_BATCH_SLACK_MS,
  IDEA_BATCH_WINDOW_MS,
  type IngestMessage,
} from './types';

/**
 * A batch is one author in one thread. Danya and Sasha write to a thread
 * in turns, so they should not be glued into one idea.
 */
export function batchKeyOf(m: IngestMessage): string {
  return `${m.chatId}:${m.threadId ?? 0}:${m.authorId ?? 'anon'}`;
}

export function isBatchClosed(lastAt: Date, now: Date): boolean {
  return now.getTime() - lastAt.getTime() >= IDEA_BATCH_WINDOW_MS - IDEA_BATCH_SLACK_MS;
}

/**
 * Link to a supergroup or channel message. chat_id looks like -100<number>,
 * only the number remains in the link.
 */
export function tgMessageLink(chatId: number, threadId: number | null, messageId: number): string {
  const internal = String(chatId).replace(/^-100/, '').replace(/^-/, '');
  return threadId
    ? `https://t.me/c/${internal}/${threadId}/${messageId}`
    : `https://t.me/c/${internal}/${messageId}`;
}

const URL_RE = /https?:\/\/[^\s<>"')]+/g;

export function extractLinks(text: string | null): { url: string; domain: string }[] {
  if (!text) return [];
  const seen = new Set<string>();
  const out: { url: string; domain: string }[] = [];
  for (const raw of text.match(URL_RE) ?? []) {
    const url = raw.replace(/[.,;:!?]+$/, '');
    if (seen.has(url)) continue;
    seen.add(url);
    let domain = '';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      continue;
    }
    out.push({ url, domain });
  }
  return out;
}
