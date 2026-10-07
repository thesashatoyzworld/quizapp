import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPairs, type Msg } from './pairs';

const t0 = Date.UTC(2026, 9, 7, 4, 0);
const m = (id: number, min: number, owner: boolean, text: string, over: Partial<Msg> = {}): Msg => ({
  id,
  at: new Date(t0 + min * 60_000),
  owner,
  who: owner ? 'Саша' : '@nick',
  text,
  replyTo: null,
  thread: 2331,
  ...over,
});

test('подряд идущие ответы Саши склеиваются, вопрос из сообщений до них', () => {
  const p = buildPairs([
    m(1, 0, false, 'глянь карусель пожалуйста'),
    m(2, 1, false, 'вот ссылка'),
    m(3, 5, true, 'первый слайд через желаемое будущее'),
    m(4, 6, true, 'остальное гуд, вешай в закреп'),
  ]);
  assert.equal(p.length, 1);
  assert.match(p[0].question, /глянь карусель[\s\S]*вот ссылка/);
  assert.match(p[0].answer, /желаемое будущее[\s\S]*вешай в закреп/);
});

test('reply берёт именно то сообщение, на которое ответили', () => {
  const p = buildPairs([
    m(1, 0, false, 'какой визуал лучше?'),
    m(2, 1, false, 'а я вот рилс выложил', { who: '@other' }),
    m(3, 5, true, 'текст и пара своих фоток', { replyTo: 1 }),
  ]);
  assert.equal(p[0].question, '@nick: какой визуал лучше?');
});

test('ссылка на созвон и короткие реплики не считаются ответом', () => {
  assert.equal(buildPairs([m(1, 0, false, 'ссылку дай'), m(2, 1, true, 'https://us06web.zoom.us/j/1')]).length, 0);
  assert.equal(buildPairs([m(1, 0, false, 'вопрос'), m(2, 1, true, 'да')]).length, 0);
});

test('сообщение из другой темы вопросом не становится', () => {
  const p = buildPairs([
    m(1, 0, false, 'начинаем созвон?', { thread: 9 }),
    m(2, 1, true, 'смотри, оффер надо сузить под одну аудиторию'),
  ]);
  assert.equal(p.length, 0);
});
