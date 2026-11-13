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
    assert.deepStrictEqual(me, { uid: 'u1', maxPerVideo: 5, active: null, last: null, week: null });
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

test('plans: weekly cap, versions clamp, slot back on failure, refill reminder', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-test-'));
  const now = Date.now();
  const day = 24 * 3600e3;
  fs.writeFileSync(path.join(dataDir, 'quota.json'), JSON.stringify({ 111: [now - 2 * day], 222: [now - 8 * day], 333: [now - 6 * day, now - day] }));
  const { sign, planOf } = require('../server');
  const { SECRET } = require('./helpers');
  const tok = (uid, plan) => sign({ uid: String(uid), plan, exp: Math.floor(now / 1000) + 3600 }, SECRET);
  const s = await start({ dataDir, maxBytes: 1024 });
  try {
    const post = (t) => fetch(`${s.base}/api/jobs?count=5`, { method: 'POST', headers: { Authorization: `Bearer ${t}` }, body: Buffer.alloc(16) });
    // 1 a week, used 2 days ago → blocked, 5 days left, friend hint.
    let r = await post(tok(111, { w: 1, v: 2 }));
    assert.strictEqual(r.status, 429);
    let b = await r.json();
    assert.strictEqual(b.code, 'week');
    assert.match(b.error, /через 5 дней\. Приведи друга/);
    // Used 8 days ago → free again (16 junk bytes then fail the probe: past the gate).
    assert.strictEqual((await post(tok(222, { w: 1, v: 2 }))).status, 400);
    // 2 a week with two used → blocked; 3 a week → passes.
    assert.strictEqual((await post(tok(333, { w: 2, v: 2 }))).status, 429);
    assert.strictEqual((await post(tok(333, { w: 3, v: 2 }))).status, 400);
    // Paid (w: 0) is never blocked.
    assert.strictEqual((await post(tok(111, { w: 0, v: 5 }))).status, 400);
    // /api/me shows the week.
    const me = await (await fetch(`${s.base}/api/me?t=${tok(111, { w: 1, v: 2 })}`)).json();
    assert.strictEqual(me.maxPerVideo, 2);
    assert.strictEqual(me.week.limit, 1);
    assert.strictEqual(me.week.used, 1);
    assert.ok(me.week.nextAt > now + 4 * day);
    const paid = await (await fetch(`${s.base}/api/me?t=${tok(111, { w: 0, v: 5 })}`)).json();
    assert.strictEqual(paid.week, null);
    assert.strictEqual(paid.maxPerVideo, 5);
  } finally { await s.close(); }
  // Old tokens.
  assert.deepStrictEqual(planOf({ uid: '1', free: true }), { w: 1, v: 2 });
  assert.deepStrictEqual(planOf({ uid: '1' }), { w: 0, v: 5 });
  assert.deepStrictEqual(planOf({ uid: '1', plan: { w: 9, v: 99 } }), { w: 9, v: 5 });
});

test('restart gives the week slot back for a video that produced nothing', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-test-'));
  const t0 = Date.now() - 1000;
  fs.writeFileSync(path.join(dataDir, 'quota.json'), JSON.stringify({ 444: [t0] }));
  fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify({
    q: { id: 'q', uid: '444', key: '444:fp', stem: 'v', src: path.join(dataDir, 'none.bin'), count: 2, status: 'queued', done: 0, failed: 0, versions: [], createdAt: t0, quotaAt: t0 },
  }));
  const s = await start({ dataDir });
  try {
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(path.join(dataDir, 'quota.json'))), {});
  } finally { await s.close(); }
});

test('reminders: only 09-21 Almaty, numeric uids, logged', async () => {
  const sent = [];
  const s = await start({ sendReminder: async (uid, text) => { sent.push([uid, text]); return true; } });
  try {
    const { reminders, tickReminders } = s.server.uniq;
    reminders['555:check'] = { uid: '555', kind: 'check', at: 0 };
    const night = Date.UTC(2026, 10, 11, 20, 0); // 01:00 Almaty
    assert.strictEqual(await tickReminders(night), 0);
    const noon = Date.UTC(2026, 10, 11, 7, 0); // 12:00 Almaty
    assert.strictEqual(await tickReminders(noon), 1);
    assert.strictEqual(sent[0][0], '555');
    assert.match(sent[0][1], /Глянь охваты/);
    assert.strictEqual(await tickReminders(noon), 0);
  } finally { await s.close(); }
});

test('page events: whitelisted and logged with the plan', async () => {
  const { sign } = require('../server');
  const { SECRET } = require('./helpers');
  const s = await start();
  try {
    const t = sign({ uid: '777', plan: { w: 1, v: 2 }, exp: Math.floor(Date.now() / 1000) + 600 }, SECRET);
    const ev = (what) => fetch(`${s.base}/api/ev`, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ev: what }) });
    assert.strictEqual((await ev('open')).status, 200);
    assert.strictEqual((await ev('rm -rf')).status, 400);
    assert.strictEqual((await fetch(`${s.base}/api/ev`, { method: 'POST', body: '{"ev":"open"}' })).status, 401);
    const log = fs.readFileSync(path.join(s.dataDir, 'log.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    assert.ok(log.some((e) => e.ev === 'page' && e.uid === '777' && e.what === 'open' && e.free === true));
  } finally { await s.close(); }
});

test('send to the bot posts every version as a video, skips ones over 50 MB', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-test-'));
  const files = [1, 2].map((i) => { const f = path.join(dataDir, `v${i}.mp4`); fs.writeFileSync(f, 'x'); return f; });
  fs.writeFileSync(path.join(dataDir, 'jobs.json'), JSON.stringify({
    j1: { id: 'j1', uid: '555', key: '555:fp', stem: 'v', src: '', count: 2, status: 'done', done: 2, failed: 0, finishedAt: Date.now(),
      versions: [{ i: 1, size: 1, file: files[0] }, { i: 2, size: 60e6, file: files[1] }] },
  }));
  const posted = [];
  const s = await start({ dataDir, tgToken: 'x', postVideo: async (uid, file, caption) => { posted.push([uid, file, caption]); return true; } });
  try {
    assert.strictEqual((await fetch(`${s.base}/api/jobs/j1/send?t=${token('other')}`, { method: 'POST' })).status, 404);
    const r = await fetch(`${s.base}/api/jobs/j1/send?t=${token('555')}`, { method: 'POST' });
    assert.strictEqual(r.status, 202);
    for (let i = 0; i < 50 && !fs.readFileSync(path.join(dataDir, 'log.jsonl'), 'utf8').includes('"ev":"sent"'); i++) await new Promise((x) => setTimeout(x, 20));
    assert.deepStrictEqual(posted.map((p) => [p[0], p[1]]), [['555', files[0]]]);
    assert.match(posted[0][2], /Версия 1 из 2/);
    const sent = fs.readFileSync(path.join(dataDir, 'log.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).find((e) => e.ev === 'sent');
    assert.deepStrictEqual({ sent: sent.sent, big: sent.big, failed: sent.failed }, { sent: 1, big: 1, failed: 0 });
  } finally { await s.close(); }
});
