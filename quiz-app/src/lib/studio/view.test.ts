import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateVariants, fmt, localDate, pickSnapshot, shortcodeOf, weekStart, type ItemView, type Snapshot } from './view';
import { actorForKey, createStudioSession, verifyStudioSession } from './keys';

function item(p: Partial<ItemView> & { id: string }): ItemView {
  return {
    kind: 'reel', title: 't', variant: null, copyNo: null, stage: 'published', planDate: null, briefUrl: null,
    briefText: null, hasBriefHtml: false, shortcode: null, mediaId: null, briefId: null, permalink: null, publishedAt: null, author: 'sasha', ...p,
  };
}

function snap(ageHours: number, views: number | null, extra: Partial<Snapshot> = {}): Snapshot {
  const takenAt = new Date(Date.UTC(2026, 10, 1) + ageHours * 3600_000).toISOString();
  return {
    takenAt, ageHours, views, reach: null, likes: null, comments: null, shares: null, saved: null,
    skipRate: null, avgWatchMs: null, follows: null, profileVisits: null, ...extra,
  };
}

test('shortcode из ссылок на рилс и пост', () => {
  assert.equal(shortcodeOf('https://www.instagram.com/reel/DfPdRztO_E7/?igsh=x'), 'DfPdRztO_E7');
  assert.equal(shortcodeOf('instagram.com/p/DecXG4ttrnK/'), 'DecXG4ttrnK');
  assert.equal(shortcodeOf('https://youtube.com/shorts/abc'), null);
  assert.equal(shortcodeOf(''), null);
});

test('снимок: первый не младше 48 часов', () => {
  assert.equal(pickSnapshot([snap(20, 100), snap(44, 200)]), null);
  assert.equal(pickSnapshot([snap(96, 900), snap(20, 100), snap(50, 500)])?.views, 500);
  assert.equal(pickSnapshot(undefined), null);
});

test('группа копий: лучшая, среднее, ещё рано', () => {
  const items = [
    item({ id: 'a', variant: 'mama', copyNo: 1, shortcode: 'A' }),
    item({ id: 'b', variant: 'mama', copyNo: 2, shortcode: 'B' }),
    item({ id: 'c', variant: 'mama', copyNo: 3, shortcode: 'C' }), // only 20h old
    item({ id: 'd', variant: 'ded', copyNo: 1, stage: 'edit' }), // not out yet
    item({ id: 'e', variant: 'ded', copyNo: 2, stage: 'skip' }),
  ];
  const stats = {
    A: [snap(30, 50), snap(54, 1000, { avgWatchMs: 4000 })],
    B: [snap(49, 3000, { avgWatchMs: null })],
    C: [snap(20, 99999)],
  };
  const [mama, ded] = aggregateVariants(items, stats);
  assert.equal(mama.copies.length, 3);
  assert.equal(mama.published, 3);
  assert.equal(mama.measured, 2);
  assert.equal(mama.best?.item.id, 'b');
  assert.equal(mama.avg.views, 2000);
  assert.equal(mama.avg.avgWatchMs, 4000); // missing values are skipped, not zeros
  assert.equal(ded.copies.length, 1); // skip is not a copy
  assert.equal(ded.measured, 0);
  assert.equal(ded.best, null);
  assert.equal(ded.avg.views, null);
});

test('формат: пусто не ноль, подписки рилса нет в API', () => {
  assert.equal(fmt('views', null, 'reel'), '–');
  assert.equal(fmt('views', 0, 'reel'), '0');
  assert.equal(fmt('follows', 5, 'reel'), 'нет в API');
  assert.equal(fmt('follows', 5, 'carousel'), '5');
  assert.equal(fmt('avgWatchMs', 4250, 'reel'), '4,3 с');
});

test('неделя и дата в UTC+5', () => {
  assert.equal(localDate('2026-11-08T20:00:00Z'), '2026-11-09');
  assert.equal(weekStart('2026-11-08'), '2026-11-02'); // Sunday → Monday before
  assert.equal(weekStart('2026-11-09'), '2026-11-09');
});

test('ключи и сессия студии', () => {
  const env = 'danya:dddddddddddddddddddd,sasha:ssssssssssssssssssss';
  assert.equal(actorForKey('dddddddddddddddddddd', env), 'danya');
  assert.equal(actorForKey('ssssssssssssssssssss', env), 'sasha');
  assert.equal(actorForKey('wrong', env), null);
  assert.equal(actorForKey('', env), null);
  assert.equal(actorForKey('dddddddddddddddddddd', ''), null);
  const token = createStudioSession('danya', env)!;
  assert.equal(verifyStudioSession(token, env), 'danya');
  assert.equal(verifyStudioSession(token, 'danya:rotatedrotatedrotated'), null);
  assert.equal(verifyStudioSession(token.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')), env), null);
  assert.equal(verifyStudioSession(createStudioSession('danya', env, Date.now() - 100 * 864e5), env), null);
});
