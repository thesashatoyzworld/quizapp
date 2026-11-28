import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDonorOverrides, mapDonory, overridesForBank, pickThemes, urlOf } from './donory';

const input = {
  temy: [
    { id: 'T1', name: 'показывать себя', items: ['A', 'B', 'yt:1'], ves: 12, authors: 3, sources: ['instagram-carousel', 'youtube-long'], hits: 1, flops: 0, used: 1, max_x: 22.9, last: '2026-11-20' },
    { id: 'T2', name: 'приёмы для охватов', items: ['C'], ves: 5, authors: 1, sources: ['instagram-reel'], hits: 0, flops: 0, used: 0, max_x: 40 },
    { id: 'T3', name: 'пустая', items: ['NOPE'], ves: 99 },
  ],
  eksponaty: {
    A: { id: 'A', source: 'instagram-carousel', author: 'ellika', hook: 'рынку нечего покупать', his: 'вас не видно', x: 22.9, likes: 4480, date: '2026-10-23', used: { our_code: 'Df1', our_x: 0.35 } },
    B: { id: 'B', source: 'instagram-carousel', author: 'kate', hook: 'покажи лицо', x: 5 },
    'yt:1': { id: 'yt:1', source: 'youtube-long', author: 'Катя', hook: 'личный бренд', x: 8, url: 'https://www.youtube.com/watch?v=1' },
    C: { id: 'C', source: 'instagram-reel', author: 'ivan', hook: 'хитрые приёмы', x: 40 },
  },
};

test('mapDonory keeps the bank order, drops themes without known exhibits', () => {
  const { themes, exhibits } = mapDonory(input);
  assert.deepEqual(themes.map((t) => t.id), ['T1', 'T2']);
  assert.equal(exhibits.find((e) => e.id === 'A')?.ourCode, 'Df1');
  assert.equal(themes[0].maxX, 22.9);
});

test('urls: carousels and reels get Instagram links, YouTube keeps its own', () => {
  assert.equal(urlOf({ id: 'A', source: 'instagram-carousel' }), 'https://www.instagram.com/p/A/');
  assert.equal(urlOf({ id: 'C', source: 'instagram-reel' }), 'https://www.instagram.com/reel/C/');
  assert.equal(urlOf({ id: 'yt:1', source: 'youtube-long', url: 'u' }), 'u');
});

test('overrides: rename, hide, merge moves exhibits and re-sorts', () => {
  const { themes } = mapDonory(input);
  const out = applyDonorOverrides(themes, [
    { themeId: 'T2', hidden: false, reason: null, name: null, mergedInto: 'T1' },
    { themeId: 'T1', hidden: false, reason: null, name: 'нужно показывать себя', mergedInto: null },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].name, 'нужно показывать себя');
  assert.equal(out[0].originalName, 'показывать себя');
  assert.deepEqual(out[0].mergedFrom, ['T2']);
  assert.equal(out[0].exhibitIds.length, 4);
  assert.equal(out[0].ves, 17);
  const hid = applyDonorOverrides(themes, [{ themeId: 'T2', hidden: true, reason: 'мимо', name: null, mergedInto: null }]);
  assert.equal(pickThemes(hid, mapDonory(input).exhibits, []).length, 1);
  assert.equal(pickThemes(hid, mapDonory(input).exhibits, [], { withHidden: true }).length, 2);
});

test('merge loops do not hang or lose themes', () => {
  const { themes } = mapDonory(input);
  const out = applyDonorOverrides(themes, [
    { themeId: 'T1', hidden: false, reason: null, name: null, mergedInto: 'T2' },
    { themeId: 'T2', hidden: false, reason: null, name: null, mergedInto: 'T1' },
  ]);
  assert.ok(out.length >= 1);
  assert.equal(out.reduce((n, t) => n + t.exhibitIds.length, 0), 4);
});

test('pickThemes: platform and query filters, best example by multiple, taken listed', () => {
  const { themes, exhibits } = mapDonory(input);
  const taken = [{ themeId: 'T1', exhibitId: 'A', zahod: 'вас не видно', karusel: 'n-1', actor: 'danya', createdAt: '2026-11-28', itemId: null }];
  const yt = pickThemes(themes, exhibits, taken, { platform: 'youtube-long' });
  assert.deepEqual(yt.map((t) => t.id), ['T1']);
  assert.equal(yt[0].best?.id, 'A');
  assert.equal(yt[0].platforms['instagram-carousel'], 2);
  assert.equal(yt[0].taken[0].karusel, 'n-1');
  assert.equal(yt[0].ours, '1 из 1');
  assert.deepEqual(pickThemes(themes, exhibits, [], { query: 'хитрые' }).map((t) => t.id), ['T2']);
});

test('overridesForBank speaks the bank format', () => {
  assert.deepEqual(overridesForBank([{ themeId: 'T2', hidden: true, reason: 'r', name: null, mergedInto: 'T1' }]),
    [{ id: 'T2', hidden: true, reason: 'r', name: null, merged_into: 'T1' }]);
});
