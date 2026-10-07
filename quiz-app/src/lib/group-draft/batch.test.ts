import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answeredByOwner, batchKey, parseBatchKey, isQuiet, messageIdOf, type BatchRow } from './batch';

const at = (min: number) => new Date(Date.UTC(2026, 9, 7, 4, min));
const row = (messageId: number, min: number, over: Partial<BatchRow> = {}): BatchRow => ({
  messageId,
  userId: '1',
  text: '',
  replyToId: null,
  createdAt: at(min),
  ...over,
});

test('ключ пачки туда и обратно, общий чат без темы', () => {
  assert.deepEqual(parseBatchKey(batchKey('-100211', 2331, '42')), { chatId: '-100211', threadId: 2331, userId: '42' });
  assert.deepEqual(parseBatchKey(batchKey('-100211', null, '42')), { chatId: '-100211', threadId: null, userId: '42' });
});

test('message_id берётся из ключа строки', () => {
  assert.equal(messageIdOf('-1002115856669:9876'), 9876);
});

test('тишина две минуты закрывает пачку', () => {
  assert.equal(isQuiet(at(0), at(1)), false);
  assert.equal(isQuiet(at(0), at(2)), true);
});

test('Саша ответил reply на сообщение из пачки', () => {
  const batch = [row(10, 0), row(11, 1)];
  assert.equal(answeredByOwner(batch, [row(12, 3, { replyToId: 10 })], 'nick'), true);
  assert.equal(answeredByOwner(batch, [row(12, 3, { replyToId: 5 })], 'nick'), false);
});

test('Саша упомянул человека после его вопроса', () => {
  const batch = [row(10, 0)];
  assert.equal(answeredByOwner(batch, [row(12, 3, { text: '@Nick смотри' })], 'nick'), true);
  assert.equal(answeredByOwner(batch, [row(9, 0, { text: '@nick раньше' , createdAt: new Date(at(0).getTime() - 1000) })], 'nick'), false);
});
