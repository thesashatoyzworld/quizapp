import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assembleIdea } from './assemble';
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
    tgLink: 'https://t.me/c/4399547083/220/1',
    ...over,
  };
}

test('album of three photos with caption is one idea with three thumbnails', () => {
  const draft = assembleIdea([
    msg({ messageId: 10, tgLink: 'https://t.me/c/4399547083/220/10', attachments: [{ kind: 'photo', fileId: 'a', thumbFileId: 'ta' }] }),
    msg({ messageId: 11, tgLink: 'https://t.me/c/4399547083/220/11', attachments: [{ kind: 'photo', fileId: 'b', thumbFileId: 'tb' }] }),
    msg({
      messageId: 12,
      tgLink: 'https://t.me/c/4399547083/220/12',
      text: 'вот такой монтаж хочу',
      attachments: [{ kind: 'photo', fileId: 'c', thumbFileId: 'tc' }],
    }),
  ]);

  assert.equal(draft.firstMessageId, 10);
  assert.equal(draft.lastMessageId, 12);
  assert.equal(draft.rawText, 'вот такой монтаж хочу');
  assert.equal(draft.refs.filter((r) => r.kind === 'photo').length, 3);
  assert.deepEqual(draft.refs.map((r) => r.position), [0, 1, 2]);
  assert.equal(draft.tgLink, 'https://t.me/c/4399547083/220/10');
});

test('messages are sorted by messageId, not order in array', () => {
  const draft = assembleIdea([
    msg({ messageId: 5, text: 'второе' }),
    msg({ messageId: 4, text: 'первое' }),
  ]);
  assert.equal(draft.rawText, 'первое\n\nвторое');
  assert.equal(draft.firstMessageId, 4);
});

test('voice returns transcription as separate field and remains a reference', () => {
  const draft = assembleIdea([
    msg({
      messageId: 7,
      voiceTranscript: 'идея для большого видео про лестницу Ханта',
      attachments: [{ kind: 'voice', fileId: 'v1' }],
    }),
  ]);
  assert.equal(draft.voiceTranscript, 'идея для большого видео про лестницу Ханта');
  assert.equal(draft.rawText, null);
  assert.equal(draft.refs[0].kind, 'voice');
  assert.equal(draft.refs[0].fileId, 'v1');
});

test('two transcriptions are joined with blank line', () => {
  const draft = assembleIdea([
    msg({ messageId: 1, voiceTranscript: 'первая мысль' }),
    msg({ messageId: 2, voiceTranscript: 'вторая мысль' }),
  ]);
  assert.equal(draft.voiceTranscript, 'первая мысль\n\nвторая мысль');
});

test('link from text becomes reference with domain', () => {
  const draft = assembleIdea([
    msg({ messageId: 3, text: 'референс https://www.instagram.com/reel/ABC/' }),
  ]);
  const link = draft.refs.find((r) => r.kind === 'link');
  assert.equal(link?.url, 'https://www.instagram.com/reel/ABC/');
  assert.equal(link?.domain, 'instagram.com');
  assert.equal(draft.rawText, 'референс https://www.instagram.com/reel/ABC/');
});

test('idea time is the first message time', () => {
  const draft = assembleIdea([
    msg({ messageId: 2, at: '2026-09-20T10:01:00.000Z' }),
    msg({ messageId: 1, at: '2026-09-20T10:00:00.000Z' }),
  ]);
  assert.equal(draft.occurredAt.toISOString(), '2026-09-20T10:00:00.000Z');
});

test('empty list is an error, not an empty idea', () => {
  assert.throws(() => assembleIdea([]), /empty batch/);
});
