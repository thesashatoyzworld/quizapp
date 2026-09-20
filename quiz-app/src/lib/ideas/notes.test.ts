import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NOTE_KINDS,
  isNoteKind,
  noteTarget,
  normalizeNoteText,
  countByKind,
  feedSummary,
  chosenTitle,
} from './notes';

test('kinds are the five the card knows', () => {
  assert.deepEqual([...NOTE_KINDS], ['core', 'thesis', 'title', 'thumb', 'task']);
  assert.equal(isNoteKind('title'), true);
  assert.equal(isNoteKind('headline'), false);
});

test('targets follow Paddy: ten titles, five thumbnail frames', () => {
  assert.equal(noteTarget('title'), 10);
  assert.equal(noteTarget('thumb'), 5);
  assert.equal(noteTarget('thesis'), null);
  assert.equal(noteTarget('core'), null);
});

test('text is trimmed, collapsed and stripped of list marks', () => {
  assert.equal(normalizeNoteText('  как я нашёл  '), 'как я нашёл');
  assert.equal(normalizeNoteText('строка\nвторая   часть'), 'строка вторая часть');
  assert.equal(normalizeNoteText('- тезис'), 'тезис');
  assert.equal(normalizeNoteText('• тезис'), 'тезис');
  assert.equal(normalizeNoteText('3. тезис'), 'тезис');
  assert.equal(normalizeNoteText('   '), '');
});

test('counts are per kind and never undefined', () => {
  const c = countByKind([
    { kind: 'title', text: 'a' },
    { kind: 'title', text: 'b' },
    { kind: 'thesis', text: 'c' },
  ]);
  assert.equal(c.title, 2);
  assert.equal(c.thesis, 1);
  assert.equal(c.thumb, 0);
  assert.equal(c.core, 0);
  assert.equal(c.task, 0);
});

test('feed summary shows only what exists', () => {
  assert.equal(feedSummary([]), '');
  assert.equal(
    feedSummary([
      { kind: 'core', text: 'суть' },
      { kind: 'thesis', text: 'a' },
      { kind: 'thesis', text: 'b' },
      { kind: 'title', text: 'т1' },
      { kind: 'thumb', text: 'кадр' },
      { kind: 'task', text: 'снять', done: false },
      { kind: 'task', text: 'сделано', done: true },
    ]),
    'тезисов 2 · заголовков 1/10 · кадров 1/5 · задач 1',
  );
});

test('summary hides tasks once all are done', () => {
  assert.equal(feedSummary([{ kind: 'task', text: 'снять', done: true }]), '');
});

test('chosen title is the one marked, titles only', () => {
  assert.equal(
    chosenTitle([
      { kind: 'title', text: 'первый' },
      { kind: 'title', text: 'второй', chosen: true },
      { kind: 'thesis', text: 'не заголовок', chosen: true },
    ]),
    'второй',
  );
  assert.equal(chosenTitle([{ kind: 'title', text: 'один' }]), null);
});
