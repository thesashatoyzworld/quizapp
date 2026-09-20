import { test } from 'node:test';
import assert from 'node:assert/strict';
import { batchKeyOf, isBatchClosed, tgMessageLink, extractLinks } from './batch';
import type { IngestMessage } from './types';

function msg(over: Partial<IngestMessage> = {}): IngestMessage {
  return {
    source: 'sneg-220',
    chatId: -1004399547083,
    threadId: 220,
    messageId: 1,
    authorId: '788334680',
    authorUsername: 'sashatoyzwork',
    at: '2026-09-20T10:00:00.000Z',
    text: null,
    voiceTranscript: null,
    attachments: [],
    tgLink: '',
    ...over,
  };
}

test('batch key is chat, thread and author', () => {
  assert.equal(batchKeyOf(msg()), '-1004399547083:220:788334680');
  assert.equal(batchKeyOf(msg({ threadId: null })), '-1004399547083:0:788334680');
  assert.equal(batchKeyOf(msg({ authorId: null })), '-1004399547083:220:anon');
});

test('different authors in one thread are different batches', () => {
  assert.notEqual(batchKeyOf(msg()), batchKeyOf(msg({ authorId: '111' })));
});

test('batch closes after 170 seconds of silence, not earlier', () => {
  const last = new Date('2026-09-20T10:00:00.000Z');
  assert.equal(isBatchClosed(last, new Date('2026-09-20T10:02:00.000Z')), false);
  assert.equal(isBatchClosed(last, new Date('2026-09-20T10:02:49.000Z')), false);
  assert.equal(isBatchClosed(last, new Date('2026-09-20T10:02:50.000Z')), true);
  assert.equal(isBatchClosed(last, new Date('2026-09-20T10:05:00.000Z')), true);
});

test('forum message link contains thread', () => {
  assert.equal(
    tgMessageLink(-1004399547083, 220, 812),
    'https://t.me/c/4399547083/220/812'
  );
  assert.equal(
    tgMessageLink(-1004399547083, null, 812),
    'https://t.me/c/4399547083/812'
  );
});

test('links from text are extracted with domain', () => {
  const links = extractLinks('check https://www.instagram.com/reel/ABC/ and also http://youtu.be/xyz');
  assert.deepEqual(links, [
    { url: 'https://www.instagram.com/reel/ABC/', domain: 'instagram.com' },
    { url: 'http://youtu.be/xyz', domain: 'youtu.be' },
  ]);
  assert.deepEqual(extractLinks(null), []);
  assert.deepEqual(extractLinks('no links'), []);
});

test('same link twice is not duplicated', () => {
  const links = extractLinks('https://youtu.be/xyz and again https://youtu.be/xyz');
  assert.equal(links.length, 1);
});
