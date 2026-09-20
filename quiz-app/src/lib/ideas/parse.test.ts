import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallbackTitle, normalizeParse, buildParsePrompt, parseIdea } from './parse';
import type { DraftIdea } from './types';

function draft(over: Partial<DraftIdea> = {}): DraftIdea {
  return {
    source: 'sneg-220',
    chatId: '-1004399547083',
    threadId: 220,
    firstMessageId: 1,
    lastMessageId: 1,
    authorUsername: 'sashatoyzwork',
    tgLink: 'https://t.me/c/4399547083/220/1',
    rawText: null,
    voiceTranscript: null,
    occurredAt: new Date('2026-09-20T10:00:00.000Z'),
    refs: [],
    ...over,
  };
}

test('fallback title is first seven words of source', () => {
  const t = fallbackTitle(
    draft({ rawText: 'длинное видео: я попробовал все способы создания контента и вот который сработал' })
  );
  assert.equal(t, 'длинное видео: я попробовал все способы создания…');
});

test('fallback title takes transcription if no text', () => {
  assert.equal(fallbackTitle(draft({ voiceTranscript: 'мысль про лестницу Ханта' })), 'мысль про лестницу Ханта');
});

test('without text and transcription title mentions references', () => {
  const t = fallbackTitle(draft({ refs: [
    { kind: 'photo', fileId: 'a', thumbFileId: null, url: null, domain: null, caption: null, messageId: 1, tgLink: '', position: 0 },
  ] }));
  assert.equal(t, 'Референс без подписи');
});

test('model response is parsed and cleaned', () => {
  const p = normalizeParse(
    '{"title":"Video on Hantas ladder","type":"bigvideo","summary":"shoot big video","tags":["funnel","hunt","ladder","goals","other","junk"]}',
    draft({ rawText: 'shoot big video on Hantas ladder' })
  );
  assert.equal(p.parsed, true);
  assert.equal(p.title, 'Video on Hantas ladder');
  assert.equal(p.type, 'bigvideo');
  assert.equal(p.tags.length, 5);
});

test('response in triple quotes still parses', () => {
  const p = normalizeParse('```json\n{"title":"Test","type":"reel","summary":null,"tags":[]}\n```', draft());
  assert.equal(p.parsed, true);
  assert.equal(p.type, 'reel');
});

test('unknown type becomes other, but parse is counted as done', () => {
  const p = normalizeParse('{"title":"Test","type":"video","summary":"x","tags":[]}', draft());
  assert.equal(p.type, 'other');
  assert.equal(p.parsed, true);
});

test('garbage instead of JSON gives fallback title and parsed false', () => {
  const p = normalizeParse('извините, не могу', draft({ rawText: 'снять рилс про цены' }));
  assert.equal(p.parsed, false);
  assert.equal(p.type, 'other');
  assert.equal(p.title, 'снять рилс про цены');
  assert.match(p.parseError ?? '', /JSON/);
});

test('empty title from model is counted as parse failure', () => {
  const p = normalizeParse('{"title":"","type":"reel","summary":"x","tags":[]}', draft({ rawText: 'снять рилс' }));
  assert.equal(p.parsed, false);
  assert.equal(p.title, 'снять рилс');
});

test('photo with no caption skips the model call and returns fallback', async () => {
  // No ANTHROPIC_API_KEY in the test env, so if parseIdea reached the API
  // call it would throw and land in the catch with a non-null parseError.
  // parseError staying null here proves the early return fired instead.
  const p = await parseIdea(draft({ refs: [
    { kind: 'photo', fileId: 'a', thumbFileId: null, url: null, domain: null, caption: null, messageId: 1, tgLink: '', position: 0 },
  ] }));
  assert.equal(p.parsed, false);
  assert.equal(p.parseError, null);
  assert.equal(p.title, 'Референс без подписи');
});

test('prompt includes text, transcription and attachment list', () => {
  const prompt = buildParsePrompt(
    draft({
      rawText: 'вот текст',
      voiceTranscript: 'вот расшифровка',
      refs: [
        { kind: 'photo', fileId: 'a', thumbFileId: null, url: null, domain: null, caption: null, messageId: 1, tgLink: '', position: 0 },
        { kind: 'link', fileId: null, thumbFileId: null, url: 'https://youtu.be/x', domain: 'youtu.be', caption: null, messageId: 1, tgLink: '', position: 1 },
      ],
    })
  );
  assert.match(prompt, /вот текст/);
  assert.match(prompt, /вот расшифровка/);
  assert.match(prompt, /photo/);
  assert.match(prompt, /youtu\.be/);
});
