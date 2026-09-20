// Splits a sorted run of messages at the first long silence.
//
// The backfill posts months of history within seconds, so a batch key
// (chat + thread + author) can hold a whole conversation history in one
// findMany. Without a split by the messages' own timestamps, everything
// collapses into one idea dated to the oldest message. The same bug bites
// a lost assemble job in live use: an old, forgotten row would otherwise
// silently glue itself onto the next message from that author, even a
// week later.
import { IDEA_BATCH_WINDOW_MS } from './types';

/**
 * Returns the index of the last message before the first gap wider than
 * IDEA_BATCH_WINDOW_MS, or -1 if there is no such gap (the whole run is
 * one uninterrupted batch). Messages must already be sorted by messageId.
 */
export function findGapIndex(messages: { at: string }[]): number {
  for (let i = 0; i < messages.length - 1; i++) {
    const at = Date.parse(messages[i].at);
    const next = Date.parse(messages[i + 1].at);
    if (next - at > IDEA_BATCH_WINDOW_MS) return i;
  }
  return -1;
}
