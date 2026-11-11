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
    assert.deepStrictEqual(me, { uid: 'u1', maxPerVideo: 5, active: null, bonusUsed: 0 });
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

test('free users: one video per day, students unlimited', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-test-'));
  const now = Date.now();
  fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify({
    a: { id: 'a', uid: 'f1', key: 'f1:fp', stem: 'v', count: 5, status: 'done', done: 5, failed: 0, versions: [], createdAt: now - 3600e3, finishedAt: now - 3000e3 },
    b: { id: 'b', uid: 'f2', key: 'f2:fp', stem: 'v', count: 5, status: 'done', done: 0, failed: 5, versions: [], createdAt: now - 3600e3, finishedAt: now - 3000e3 },
  }));
  const { sign } = require('../server');
  const { SECRET } = require('./helpers');
  const tok = (uid, free) => sign({ uid, free, exp: Math.floor(now / 1000) + 3600 }, SECRET);
  const s = await start({ dataDir, maxBytes: 1024 });
  try {
    const post = (t) => fetch(`${s.base}/api/jobs?count=1`, { method: 'POST', headers: { Authorization: `Bearer ${t}` }, body: Buffer.alloc(16) });
    const r = await post(tok('f1', true));
    assert.strictEqual(r.status, 429);
    const body = await r.json();
    assert.strictEqual(body.code, 'free');
    assert.match(body.error, /через 23 ч/);
    // Same uid as a student, and a free user whose only job produced nothing: past the gate (16 junk bytes fail probe).
    assert.strictEqual((await post(tok('f1', false))).status, 400);
    assert.strictEqual((await post(tok('f2', true))).status, 400);
  } finally { await s.close(); }
});

test('free users: bonus videos from friends past the daily cap', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-test-'));
  const now = Date.now();
  fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify({
    a: { id: 'a', uid: 'f1', key: 'f1:fp', stem: 'v', count: 5, status: 'done', done: 5, failed: 0, versions: [], createdAt: now - 3600e3, finishedAt: now - 3000e3 },
    c: { id: 'c', uid: 'f3', key: 'f3:fp', stem: 'v', count: 5, status: 'done', done: 5, failed: 0, versions: [], createdAt: now - 3600e3, finishedAt: now - 3000e3 },
  }));
  fs.writeFileSync(path.join(dataDir, 'bonus.json'), JSON.stringify({ f3: 1 }));
  const { sign } = require('../server');
  const { SECRET } = require('./helpers');
  const tok = (uid, bonus) => sign({ uid, free: true, bonus, exp: Math.floor(now / 1000) + 3600 }, SECRET);
  const s = await start({ dataDir, maxBytes: 1024 });
  try {
    const post = (t) => fetch(`${s.base}/api/jobs?count=1`, { method: 'POST', headers: { Authorization: `Bearer ${t}` }, body: Buffer.alloc(16) });
    assert.strictEqual((await post(tok('f1', 1))).status, 400); // has an unspent bonus: past the gate
    assert.strictEqual((await post(tok('f3', 1))).status, 429); // the only bonus is spent
    assert.strictEqual((await post(tok('f3', 2))).status, 400); // second friend credited
    const me = await (await fetch(`${s.base}/api/me?t=${tok('f3', 2)}`)).json();
    assert.strictEqual(me.bonusUsed, 1);
  } finally { await s.close(); }
});
