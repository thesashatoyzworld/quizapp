import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leaksMeta, parseReply, renderExamples } from './prompt';

test('JSON с ответом и заметкой', () => {
  const r = parseReply('{"reply": "гуд\\nдавай дальше", "note": "смотрел pdf"}');
  assert.equal(r.reply, 'гуд\nдавай дальше');
  assert.equal(r.note, 'смотрел pdf');
});

test('reply null значит отвечать не надо', () => {
  assert.equal(parseReply('{"reply": null, "note": ""}').reply, null);
});

test('мусор вокруг JSON не мешает, длинное тире убирается', () => {
  const r = parseReply('вот:\n{"reply": "слайд 1 — убрать", "note": ""}\n');
  assert.equal(r.reply, 'слайд 1 - убрать');
});

test('битый ответ не роняет', () => {
  assert.equal(parseReply('не json').reply, null);
});

test('примеры собираются в блоки, пустые пропускаются', () => {
  assert.equal(renderExamples([], []), '');
  const s = renderExamples([{ question: 'q', answer: 'a' }], [{ question: 'q2', draft: 'd', sent: 's' }]);
  assert.match(s, /ученик: q\nСаша: a/);
  assert.match(s, /Саша отправил: s/);
});

test('служебное для Саши в ответе ученику ловится', () => {
  assert.equal(leaksMeta('не видел файл с оффером, скинь ещё раз'), true);
  assert.equal(leaksMeta('по цене это не ко мне'), true);
  assert.equal(leaksMeta('цену сам не подтверждаю'), true);
  assert.equal(leaksMeta('гуд\nподсуши текст и вешай в закреп'), false);
});
