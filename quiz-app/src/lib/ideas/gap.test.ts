import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findGapIndex } from './gap';
import { IDEA_BATCH_WINDOW_MS } from './types';

function at(iso: string) {
  return { at: iso };
}

test('no gap when all messages are within the batch window', () => {
  const messages = [
    at('2026-09-20T10:00:00.000Z'),
    at('2026-09-20T10:01:00.000Z'),
    at('2026-09-20T10:02:00.000Z'),
  ];
  assert.equal(findGapIndex(messages), -1);
});

test('single message is never a gap', () => {
  assert.equal(findGapIndex([at('2026-09-20T10:00:00.000Z')]), -1);
});

test('empty list is never a gap', () => {
  assert.equal(findGapIndex([]), -1);
});

test('backfill of months collapses into a gap after every isolated message', () => {
  const messages = [
    at('2026-01-05T10:00:00.000Z'),
    at('2026-03-11T09:00:00.000Z'),
    at('2026-03-11T09:01:00.000Z'),
    at('2026-06-20T18:00:00.000Z'),
  ];
  // First gap is right after the very first (lone) message.
  assert.equal(findGapIndex(messages), 0);
});

test('only the first gap is reported, not later ones', () => {
  const messages = [
    at('2026-09-20T10:00:00.000Z'),
    at('2026-09-20T10:01:00.000Z'),
    at('2026-09-25T10:00:00.000Z'),
    at('2026-10-01T10:00:00.000Z'),
  ];
  assert.equal(findGapIndex(messages), 1);
});

test('exactly the window width is not a gap, one millisecond more is', () => {
  const start = Date.parse('2026-09-20T10:00:00.000Z');
  const exact = [at(new Date(start).toISOString()), at(new Date(start + IDEA_BATCH_WINDOW_MS).toISOString())];
  assert.equal(findGapIndex(exact), -1);

  const over = [at(new Date(start).toISOString()), at(new Date(start + IDEA_BATCH_WINDOW_MS + 1).toISOString())];
  assert.equal(findGapIndex(over), 0);
});
