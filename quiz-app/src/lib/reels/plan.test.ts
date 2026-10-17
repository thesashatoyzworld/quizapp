import { test } from 'node:test';
import assert from 'node:assert/strict';
import { autoPlan, codeOf, columnOf, addDays, summarize, SAME_REEL_GAP_DAYS, type ReelVersionView } from './plan';

function v(p: Partial<ReelVersionView> & { id: string }): ReelVersionView {
  return {
    briefId: 'b1', reel: '1', title: 't', version: '', order: 0, stage: 'done', planDate: null,
    code: null, uploadedAt: null, plays: null, likes: null, comments: null, statsAt: null, note: '', ...p,
  };
}

test('shortcode из ссылки и голого кода', () => {
  assert.equal(codeOf('https://www.instagram.com/reel/DePWawxtUQB/?igsh=abc'), 'DePWawxtUQB');
  assert.equal(codeOf('instagram.com/reels/DeM5KVJt-r4'), 'DeM5KVJt-r4');
  assert.equal(codeOf('https://www.instagram.com/stasskozin/reel/DefCuw-N4aM/'), 'DefCuw-N4aM');
  assert.equal(codeOf('https://www.instagram.com/p/DecXG4ttrnK/'), 'DecXG4ttrnK');
  assert.equal(codeOf('  DecXG4ttrnK '), 'DecXG4ttrnK');
  assert.equal(codeOf('привет'), null);
  assert.equal(codeOf('https://youtube.com/shorts/abc'), null);
});

test('колонка по этапу и дате', () => {
  assert.equal(columnOf({ stage: 'done', planDate: null }), 'done');
  assert.equal(columnOf({ stage: 'done', planDate: '2026-10-20' }), 'plan');
  assert.equal(columnOf({ stage: 'up', planDate: null }), 'up');
  assert.equal(columnOf({ stage: 'skip', planDate: null }), null);
});

test('addDays переходит через месяц', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-10-17', SAME_REEL_GAP_DAYS), '2026-10-19');
});

test('autoPlan: по одной в день начиная с завтра, по порядку', () => {
  const out = autoPlan([
    v({ id: 'b', reel: '2', order: 2 }),
    v({ id: 'a', reel: '1', order: 1 }),
  ], '2026-10-17');
  assert.deepEqual(out, [{ id: 'a', planDate: '2026-10-18' }, { id: 'b', planDate: '2026-10-19' }]);
});

test('autoPlan: занятые дни пропускает, выложенные и пропущенные не занимают', () => {
  const out = autoPlan([
    v({ id: 'x', reel: '9', planDate: '2026-10-18' }),
    v({ id: 'u', reel: '8', stage: 'up', planDate: '2026-10-19', uploadedAt: '2026-10-10' }),
    v({ id: 's', reel: '7', stage: 'skip', planDate: '2026-10-19' }),
    v({ id: 'a', reel: '1', order: 1 }),
    v({ id: 'b', reel: '2', order: 2 }),
  ], '2026-10-17');
  assert.deepEqual(out, [{ id: 'a', planDate: '2026-10-19' }, { id: 'b', planDate: '2026-10-20' }]);
});

test('autoPlan: версии одного ролика не ближе чем через день', () => {
  const out = autoPlan([
    v({ id: 'a1', reel: '04', order: 1 }),
    v({ id: 'a2', reel: '04', order: 2 }),
    v({ id: 'b1', reel: '07', order: 3 }),
  ], '2026-10-17');
  assert.deepEqual(out, [
    { id: 'a1', planDate: '2026-10-18' },
    { id: 'a2', planDate: '2026-10-20' },
    { id: 'b1', planDate: '2026-10-19' },
  ]);
});

test('autoPlan: отсчёт от выложенной версии того же ролика', () => {
  const out = autoPlan([
    v({ id: 'up', reel: '04', stage: 'up', uploadedAt: '2026-10-18' }),
    v({ id: 'n', reel: '04', order: 1 }),
    v({ id: 'other', reel: '04', briefId: 'b2', order: 2 }),
  ], '2026-10-17');
  // Тот же номер в другом ТЗ — другой ролик.
  assert.deepEqual(out, [{ id: 'n', planDate: '2026-10-20' }, { id: 'other', planDate: '2026-10-18' }]);
});

test('autoPlan: в ТЗ и уже назначенные не трогает', () => {
  const out = autoPlan([v({ id: 't', stage: 'tz' }), v({ id: 'p', planDate: '2026-10-25' })], '2026-10-17');
  assert.deepEqual(out, []);
});

test('summarize: непроверенные не считаются нулём', () => {
  const s = summarize([
    v({ id: 'a', stage: 'up', plays: 100, statsAt: '2026-10-17T05:00:00Z', title: 'A' }),
    v({ id: 'b', stage: 'up', plays: null }),
    v({ id: 'c', planDate: '2026-10-21', title: 'C' }),
    v({ id: 'd', planDate: '2026-10-19', title: 'D' }),
    v({ id: 'e', stage: 'skip' }),
  ]);
  assert.equal(s.uploaded, 2);
  assert.equal(s.total, 4);
  assert.equal(s.plays, 100);
  assert.equal(s.unchecked, 1);
  assert.equal(s.best?.id, 'a');
  assert.equal(s.next?.id, 'd');
  assert.equal(summarize([v({ id: 'z', stage: 'up' })]).plays, null);
});
