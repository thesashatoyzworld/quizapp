'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { sign, verify } = require('../server');

const S = 'secret';
const now = () => Math.floor(Date.now() / 1000);

test('valid token verifies', () => {
  const t = sign({ uid: 'u1', name: 'Аня', exp: now() + 60 }, S);
  assert.deepStrictEqual(verify(t, S), { uid: 'u1', name: 'Аня', exp: JSON.parse(Buffer.from(t.split('.')[0], 'base64url')).exp });
});

test('expired token rejected', () => {
  assert.strictEqual(verify(sign({ uid: 'u1', exp: now() - 1 }, S), S), null);
});

test('missing exp or uid rejected', () => {
  assert.strictEqual(verify(sign({ uid: 'u1' }, S), S), null);
  assert.strictEqual(verify(sign({ exp: now() + 60 }, S), S), null);
});

test('tampered payload or signature rejected', () => {
  const t = sign({ uid: 'u1', exp: now() + 60 }, S);
  const [, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ uid: 'admin', exp: now() + 60 })).toString('base64url');
  assert.strictEqual(verify(`${forged}.${sig}`, S), null);
  assert.strictEqual(verify(`${t}x`, S), null);
  assert.strictEqual(verify(t, 'other-secret'), null);
  assert.strictEqual(verify('garbage', S), null);
  assert.strictEqual(verify('', S), null);
});

test('cabinet-style signing matches', () => {
  // Same construction the cabinet uses: base64url(JSON) + "." + base64url(HMAC_SHA256(payloadPart)).
  const crypto = require('crypto');
  const p = Buffer.from(JSON.stringify({ uid: 'u2', exp: now() + 60 })).toString('base64url');
  const s = crypto.createHmac('sha256', S).update(p).digest('base64url');
  assert.strictEqual(verify(`${p}.${s}`, S).uid, 'u2');
});
