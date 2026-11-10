'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createMonitor, digestText, readLog } = require('../monitor');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-mon-'));

test('log is append-only JSONL that survives re-creation', () => {
  const dir = tmp();
  createMonitor({ dataDir: dir, send: async () => true }).log('job', { uid: 'a', done: 5 });
  createMonitor({ dataDir: dir, send: async () => true }).log('start', { killed: 0 });
  const ev = readLog(path.join(dir, 'log.jsonl'));
  assert.deepStrictEqual(ev.map((e) => e.ev), ['job', 'start']);
});

test('alert with the same key is throttled', async () => {
  const sent = [];
  const m = createMonitor({ dataDir: tmp(), send: async (t) => { sent.push(t); return true; } });
  await m.alert('x', 'one');
  await m.alert('x', 'two');
  await m.alert('y', 'three');
  assert.strictEqual(sent.length, 2);
  assert.match(sent[0], /Уникализатор: one/);
});

test('digest counts jobs, users, failures and restarts in the window', () => {
  const from = 1000, to = 1000 + 86400000;
  const ev = [
    { t: 2000, ev: 'job', uid: 'a', done: 5, failed: 0, procSec: 200, waitSec: 0, queue: 0 },
    { t: 3000, ev: 'job', uid: 'b', done: 4, failed: 1, procSec: 160, waitSec: 120, queue: 2 },
    { t: 3500, ev: 'start', killed: 1 },
    { t: 3600, ev: 'reject', uid: 'c', reason: 'limit' },
    { t: 10, ev: 'job', uid: 'old', done: 5, failed: 5, procSec: 1, waitSec: 0 },
  ];
  const s = digestText(ev, { from, to });
  assert.match(s, /Роликов: 2, людей: 2, версий: 9/);
  assert.match(s, /Одна версия в среднем: 40 с/);
  assert.match(s, /С ошибками: 1/);
  assert.match(s, /Перезапусков сервиса: 1/);
  assert.match(s, /Отказов по лимитам: 1/);
  assert.match(s, /Очередь доходила до: 2/);
});

test('daily digest fires once at the configured UTC hour', async () => {
  const sent = [];
  const m = createMonitor({ dataDir: tmp(), digestHourUtc: 4, send: async (t) => { sent.push(t); return true; } });
  const at4 = Date.UTC(2026, 10, 10, 4, 5);
  assert.strictEqual(await m.maybeDigest(Date.UTC(2026, 10, 10, 3, 55)), false);
  assert.strictEqual(await m.maybeDigest(at4), true);
  assert.strictEqual(await m.maybeDigest(at4 + 600000), false);
  assert.strictEqual(sent.length, 1);
  assert.match(sent[0], /Уникализатор за сутки/);
});
