import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seatsLine, CHAIN } from './bron360';
import { uniqPaid } from '../lib/uniq/access';

test('seats line is honest: nothing at 0, soft at 1-4, count from 5', () => {
  assert.equal(seatsLine(0), '');
  assert.equal(seatsLine(3), 'первые места уже бронируют.');
  assert.equal(seatsLine(5), 'осталось 25 из 30 мест по 10 000.');
  assert.equal(seatsLine(31), 'осталось 0 из 30 мест по 10 000.');
});

test('chain has 6 steps, no em dash, last one starts with the seats line only when there are bookings', () => {
  assert.equal(CHAIN.length, 6);
  for (const s of CHAIN) assert.ok(!s.text(7).includes('\u2014'), s.key);
  assert.ok(CHAIN[5].text(0).startsWith('цена 10 000'));
  assert.ok(CHAIN[5].text(6).startsWith('осталось 24 из 30'));
});

test('booking unlocks the uniqualizer like tier 2', () => {
  assert.equal(uniqPaid(1, {}), false);
  assert.equal(uniqPaid(1, { bron360: 0 }), true);
  assert.equal(uniqPaid(1, { uroven: 1 }), false);
});
