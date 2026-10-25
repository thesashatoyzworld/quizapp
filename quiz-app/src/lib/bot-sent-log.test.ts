import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plainText, sentRow } from './bot-sent-log';

test('row is ours, from the bot, with the sender in media_ref', () => {
  const at = new Date('2026-10-25T10:00:00Z');
  assert.deepEqual(sentRow({ chatId: 42, messageId: 7, text: ' привет ', by: 'payment-reminder', at }), {
    id: 'bot:42:7',
    account: 'bot',
    chatId: '42',
    side: 'us',
    username: null,
    name: null,
    text: 'привет',
    mediaType: null,
    mediaRef: 'sent-by:payment-reminder',
    createdAt: at,
  });
});

test('group message id keeps its own prefix', () => {
  assert.equal(sentRow({ chatId: 42, messageId: 'g7', text: 'ok', by: 'group-reply' }).id, 'bot:42:g7');
});

test('html is shown as the person sees it', () => {
  assert.equal(plainText('оплата <b>«Тариф»</b> &amp; доступ', 'HTML'), 'оплата «Тариф» & доступ');
});

test('markdown and plain text are kept as is', () => {
  assert.equal(plainText('*жирный* <b>', 'Markdown'), '*жирный* <b>');
  assert.equal(plainText('a <b>', null), 'a <b>');
});

test('empty text still gets a placeholder', () => {
  assert.equal(sentRow({ chatId: 1, messageId: 1, text: '<b></b>', by: 'x', parseMode: 'HTML' }).text, '[сообщение]');
});
