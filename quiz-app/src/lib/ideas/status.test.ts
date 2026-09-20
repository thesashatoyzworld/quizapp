import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IDEA_STATUSES,
  IDEA_STATUS_LABEL,
  normalizeStatus,
  statusDbValues,
  isIdeaStatus,
} from './status';

test('the ladder is the six Paddy steps plus a way out', () => {
  assert.deepEqual(
    [...IDEA_STATUSES],
    ['raw', 'picked', 'packing', 'brief', 'filming', 'published', 'rejected'],
  );
  for (const s of IDEA_STATUSES) assert.ok(IDEA_STATUS_LABEL[s]);
});

test('old values keep working without touching the rows', () => {
  assert.equal(normalizeStatus('in_work'), 'packing');
  assert.equal(normalizeStatus('shipped'), 'published');
  assert.equal(normalizeStatus('raw'), 'raw');
  assert.equal(normalizeStatus('nonsense'), 'raw');
});

test('filtering by a step also catches the rows still on the old value', () => {
  assert.deepEqual(statusDbValues('packing'), ['packing', 'in_work']);
  assert.deepEqual(statusDbValues('published'), ['published', 'shipped']);
  assert.deepEqual(statusDbValues('raw'), ['raw']);
});

test('only ladder values are accepted from the browser', () => {
  assert.equal(isIdeaStatus('brief'), true);
  assert.equal(isIdeaStatus('in_work'), false);
});
