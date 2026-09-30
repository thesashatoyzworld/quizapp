import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeReply, isQuestion } from './client-bot-reply';

const base = { message_id: 1, date: 0, chat: { id: 1 } };

test('text reply is kept as is', () => {
  assert.deepEqual(describeReply({ ...base, text: ' да, всё норм ' }), { text: 'да, всё норм', mediaType: null });
});

test('voice gets a label', () => {
  assert.deepEqual(describeReply({ ...base, voice: {} }), { text: '[голосовое]', mediaType: 'voice' });
});

test('photo keeps its caption', () => {
  assert.deepEqual(describeReply({ ...base, photo: [{}], caption: 'вот сайт' }), {
    text: '[фото] вот сайт',
    mediaType: 'photo',
  });
});

test('empty message still has a text', () => {
  assert.equal(describeReply(base).text, '[сообщение]');
});

test('only messages with a question mark go to the knowledge base', () => {
  assert.equal(isQuestion('а где урок про офферы?'), true);
  assert.equal(isQuestion('привет, да вот работаю над сайтом'), false);
  assert.equal(isQuestion(undefined), false);
});
