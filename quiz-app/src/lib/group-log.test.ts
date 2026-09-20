import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rowFromMessage, isLoggedGroup, type GroupMessage } from './group-log';

function msg(over: Partial<GroupMessage> = {}): GroupMessage {
  return {
    chat: { id: -1002115856669, type: 'supergroup', title: 'Коннекторы' },
    message_id: 100,
    date: 1789905600, // 2026-09-20T12:00:00Z
    from: { id: 630949415, first_name: 'Дарья', last_name: 'Волошина', username: 'dashAstro' },
    text: 'вот мой оффер на разбор',
    ...over,
  };
}

test('текстовое сообщение разбирается в строку с автором и временем', () => {
  const row = rowFromMessage(msg());
  assert.equal(row.id, '-1002115856669:100');
  assert.equal(row.chatId, '-1002115856669');
  assert.equal(row.userId, '630949415');
  assert.equal(row.username, 'dashAstro');
  assert.equal(row.name, 'Дарья Волошина');
  assert.equal(row.text, 'вот мой оффер на разбор');
  assert.equal(row.mediaType, null);
  assert.equal(row.createdAt.toISOString(), '2026-09-20T12:00:00.000Z');
});

test('тема форума пишется номером и именем, когда телеграм его дал', () => {
  const row = rowFromMessage(
    msg({ message_thread_id: 220, reply_to_message: { forum_topic_created: { name: 'Дарья' } } }),
  );
  assert.equal(row.threadId, 220);
  assert.equal(row.topic, 'Дарья');
});

test('без темы поля пустые, а не нули', () => {
  const row = rowFromMessage(msg());
  assert.equal(row.threadId, null);
  assert.equal(row.topic, null);
});

test('голосовое кладётся заглушкой с длительностью, расшифровки не ждём', () => {
  const row = rowFromMessage(msg({ text: undefined, voice: { duration: 75 } }));
  assert.equal(row.mediaType, 'voice');
  assert.equal(row.text, '[голосовое 1:15]');
});

test('подпись к картинке важнее заглушки', () => {
  const row = rowFromMessage(msg({ text: undefined, caption: 'скрин переписки', photo: [{}] }));
  assert.equal(row.mediaType, 'photo');
  assert.equal(row.text, 'скрин переписки');
});

test('картинка без подписи всё равно оставляет след', () => {
  const row = rowFromMessage(msg({ text: undefined, photo: [{}] }));
  assert.equal(row.text, '[картинка]');
});

test('пишем только те группы, которые названы', () => {
  assert.equal(isLoggedGroup(-1002115856669), true);
  assert.equal(isLoggedGroup('-1002115856669'), true);
  assert.equal(isLoggedGroup(-5496403099), false); // DANIEL x TOYZ, там свой бот
});
