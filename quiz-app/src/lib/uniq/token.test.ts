import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { signUniqToken, verifyUniqToken, UNIQ_TOKEN_TTL_S } from './token';
import { uniqPaid, uniqPlan, uniqTabVisible } from './access';

const SECRET = 'test-secret';
const NOW = 1_800_000_000;

test('token format matches the VPS contract', () => {
  const t = signUniqToken({ uid: 788334680, name: 'Саша' }, SECRET, NOW);
  const [p, s] = t.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(p, 'base64url').toString('utf8')), { uid: '788334680', exp: NOW + UNIQ_TOKEN_TTL_S, name: 'Саша' });
  assert.equal(s, createHmac('sha256', SECRET).update(p).digest('base64url'));
  assert.equal(UNIQ_TOKEN_TTL_S, 7200);
});

test('sign then verify', () => {
  const t = signUniqToken({ uid: '42' }, SECRET, NOW);
  const d = verifyUniqToken(t, SECRET, NOW + 10);
  assert.equal(d?.uid, '42');
  assert.equal(d?.name, undefined);
});

test('tampered payload or wrong secret fails', () => {
  const t = signUniqToken({ uid: '42' }, SECRET, NOW);
  const [, s] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ uid: '1', exp: NOW + 9999 })).toString('base64url');
  assert.equal(verifyUniqToken(`${forged}.${s}`, SECRET, NOW), null);
  assert.equal(verifyUniqToken(t, 'other', NOW), null);
  assert.equal(verifyUniqToken(`${t}.x`, SECRET, NOW), null);
  assert.equal(verifyUniqToken('', SECRET, NOW), null);
});

test('expired token fails', () => {
  const t = signUniqToken({ uid: '42' }, SECRET, NOW);
  assert.ok(verifyUniqToken(t, SECRET, NOW + UNIQ_TOKEN_TTL_S - 1));
  assert.equal(verifyUniqToken(t, SECRET, NOW + UNIQ_TOKEN_TTL_S), null);
});

test('sign refuses an empty secret', () => {
  assert.throws(() => signUniqToken({ uid: '42' }, '', NOW));
});

test('beta gate: Sasha and testers until UNIQ_OPEN=1', () => {
  assert.equal(uniqTabVisible(788334680, {}), true);
  assert.equal(uniqTabVisible(555, {}), false);
  assert.equal(uniqTabVisible(6013902004, {}), false);
  assert.equal(uniqTabVisible(555, {}, { uroven: 3 }), true);
  assert.equal(uniqTabVisible(555, {}, { uroven: 2 }), false);
  assert.equal(uniqTabVisible(null, {}, { uroven: 3 }), false);
  assert.equal(uniqTabVisible(555, { testers: '111, 555' }), true);
  assert.equal(uniqTabVisible(null, { testers: '555' }), false);
  assert.equal(uniqTabVisible(null, { open: '1' }), true);
  assert.equal(uniqTabVisible(555, { open: '1' }), true);
});

test('paid: uroven tier ≥ 1 or admin', () => {
  assert.equal(uniqPaid(555, { uroven: 1 }), false);
  assert.equal(uniqPaid(555, { uroven: 2 }), true);
  assert.equal(uniqPaid(555, { uroven: 3 }), true);
  assert.deepEqual(uniqPlan(true, 0), { w: 0, v: 5 });
  assert.deepEqual(uniqPlan(false, 0), { w: 1, v: 2 });
  assert.deepEqual(uniqPlan(false, 1), { w: 2, v: 2 });
  assert.deepEqual(uniqPlan(false, 9), { w: 5, v: 2 });
  assert.equal(uniqPaid(555, { uroven: 0 }), false);
  assert.equal(uniqPaid(555, { potok: 0 }), false);
  assert.equal(uniqPaid(6013902004, {}), true);
  const planned = verifyUniqToken(signUniqToken({ uid: 1, plan: { w: 2, v: 2 } }, 's'), 's');
  assert.deepEqual(planned?.plan, { w: 2, v: 2 });
  assert.equal(verifyUniqToken(signUniqToken({ uid: 1 }, 's'), 's')?.plan, undefined);
});
