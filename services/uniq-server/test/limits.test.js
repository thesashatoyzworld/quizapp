'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { reserve, refund } = require('../server');
const { start, token } = require('./helpers');

test('reserve clamps to remaining and rejects at the limit', () => {
  const u = {};
  assert.deepStrictEqual(reserve(u, 'k', 3), { count: 3, used: 3 });
  assert.deepStrictEqual(reserve(u, 'k', 5), { count: 2, used: 5 });
  const r = reserve(u, 'k', 1);
  assert.strictEqual(r.used, 5);
  assert.match(r.error, /лимит 5 версий/);
  assert.deepStrictEqual(reserve(u, 'other', 5), { count: 5, used: 5 });
});

test('refund returns failed versions', () => {
  const u = { k: 5 };
  refund(u, 'k', 2);
  assert.strictEqual(u.k, 3);
  refund(u, 'k', 3);
  assert.strictEqual(u.k, undefined);
});

test('restart fails unfinished jobs and refunds them', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-test-'));
  const src = path.join(dataDir, 'leftover.bin');
  fs.writeFileSync(src, 'x');
  fs.writeFileSync(path.join(dataDir, 'usage.json'), JSON.stringify({ 'u1:fp': 5, 'u2:fp': 2 }));
  fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify({
    a: { id: 'a', uid: 'u1', key: 'u1:fp', stem: 'v', src, count: 3, status: 'running', done: 1, failed: 0, versions: [] },
    b: { id: 'b', uid: 'u2', key: 'u2:fp', stem: 'v', src, count: 2, status: 'queued', done: 0, failed: 0, versions: [] },
  }));
  const s = await start({ dataDir });
  try {
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(dataDir, 'usage.json'))), { 'u1:fp': 3 });
    assert.ok(!fs.existsSync(src));
    const a = await (await fetch(`${s.base}/api/jobs/a`, { headers: { Authorization: `Bearer ${token('u1')}` } })).json();
    assert.strictEqual(a.status, 'done');
    assert.strictEqual(a.failed, 2);
    const b = await (await fetch(`${s.base}/api/jobs/b`, { headers: { Authorization: `Bearer ${token('u2')}` } })).json();
    assert.strictEqual(b.status, 'failed');
    assert.ok(b.error);
    const me = await (await fetch(`${s.base}/api/me`, { headers: { Authorization: `Bearer ${token('u2')}` } })).json();
    assert.strictEqual(me.active, null);
  } finally { await s.close(); }
});

test('auth, ownership and size limit', async () => {
  const s = await start({ maxBytes: 1024 });
  try {
    assert.strictEqual((await fetch(`${s.base}/api/me`)).status, 401);
    const me = await (await fetch(`${s.base}/api/me?t=${token('u1')}`)).json();
    assert.deepStrictEqual(me, { uid: 'u1', maxPerVideo: 5, active: null });
    const big = await fetch(`${s.base}/api/jobs?count=1`, {
      method: 'POST', headers: { Authorization: `Bearer ${token('u1')}` }, body: Buffer.alloc(4096) });
    assert.strictEqual(big.status, 413);
    const notVideo = await fetch(`${s.base}/api/jobs?count=1`, {
      method: 'POST', headers: { Authorization: `Bearer ${token('u1')}` }, body: Buffer.from('hello') });
    assert.strictEqual(notVideo.status, 400);
    assert.ok((await notVideo.json()).error);
    assert.strictEqual((await fetch(`${s.base}/api/jobs?count=9`, {
      method: 'POST', headers: { Authorization: `Bearer ${token('u1')}` }, body: 'x' })).status, 400);
    assert.strictEqual((await fetch(`${s.base}/api/jobs/nope?t=${token('u1')}`)).status, 404);
    assert.deepStrictEqual(fs.readdirSync(path.join(s.dataDir, 'uploads')), []);
  } finally { await s.close(); }
});
