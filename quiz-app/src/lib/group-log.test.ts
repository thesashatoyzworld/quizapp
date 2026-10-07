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

test('картинка: берётся самый крупный размер, mime jpeg', () => {
  const row = rowFromMessage(
    msg({ text: undefined, photo: [{ file_id: 'small' }, { file_id: 'big' }] }),
  );
  assert.equal(row.fileId, 'big');
  assert.equal(row.fileMime, 'image/jpeg');
  assert.equal(row.mediaType, 'photo');
});

test('pdf файлом: file_id и mime документа', () => {
  const row = rowFromMessage(
    msg({ document: { file_id: 'doc1', file_name: 'оффер.pdf', mime_type: 'application/pdf' } }),
  );
  assert.equal(row.fileId, 'doc1');
  assert.equal(row.fileMime, 'application/pdf');
});

test('ответ на сообщение пишется, корень темы форума нет', () => {
  const inTopic = rowFromMessage(
    msg({ message_thread_id: 2331, reply_to_message: { message_id: 2331, forum_topic_created: { name: 'вопросы' } } }),
  );
  assert.equal(inTopic.replyToId, null);

  const reply = rowFromMessage(msg({ message_thread_id: 2331, reply_to_message: { message_id: 9800 } }));
  assert.equal(reply.replyToId, 9800);
});
