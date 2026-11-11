'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { start, token } = require('./helpers');

const FF = process.env.UNIQ_FFMPEG || 'ffmpeg';

function makeVideo(file, seconds) {
  execFileSync(FF, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=540x960:rate=25', '-f', 'lavfi',
    '-i', 'sine=frequency=440', '-t', String(seconds), '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac',
    '-shortest', file]);
}

async function poll(base, id, t) {
  for (;;) {
    const j = await (await fetch(`${base}/api/jobs/${id}?t=${t}`)).json();
    if (j.status === 'done' || j.status === 'failed') return j;
    await new Promise((r) => setTimeout(r, 300));
  }
}

const upload = (base, t, file, count, name = 'Мой ролик.mp4') => fetch(`${base}/api/jobs?count=${count}`, {
  method: 'POST', duplex: 'half',
  headers: { Authorization: `Bearer ${t}`, 'X-Filename': encodeURIComponent(name), 'Content-Type': 'video/mp4' },
  body: fs.readFileSync(file) });

test('end to end: 3 + clamped 2 versions, all distinct, 6th rejected', { timeout: 300000 }, async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-e2e-'));
  const src = path.join(tmp, 'in.mp4');
  makeVideo(src, 4);
  const firsts = [];
  const s = await start({ notifyFirst: (uid) => firsts.push(uid) });
  const t = token('u-e2e');
  try {
    let r = await upload(s.base, t, src, 3);
    assert.strictEqual(r.status, 200);
    const a = await r.json();
    assert.deepStrictEqual({ count: a.count, used: a.used, remaining: a.remaining }, { count: 3, used: 3, remaining: 2 });

    // One active job per user.
    assert.strictEqual((await upload(s.base, t, src, 1)).status, 409);
    const me = await (await fetch(`${s.base}/api/me?t=${t}`)).json();
    assert.strictEqual(me.active.id, a.jobId);

    const ja = await poll(s.base, a.jobId, t);
    assert.strictEqual(ja.status, 'done');
    assert.strictEqual(ja.versions.length, 3);

    r = await upload(s.base, t, src, 5);
    const b = await r.json();
    assert.deepStrictEqual({ count: b.count, used: b.used, remaining: b.remaining }, { count: 2, used: 5, remaining: 0 });
    const jb = await poll(s.base, b.jobId, t);
    assert.strictEqual(jb.versions.length, 2);

    const hashes = new Set();
    for (const v of [...ja.versions, ...jb.versions]) {
      const res = await fetch(`${s.base}${v.url}?t=${t}`);
      assert.strictEqual(res.status, 200);
      assert.match(res.headers.get('content-disposition'), /filename\*=UTF-8''%D0%9C%D0%BE%D0%B9/);
      const buf = Buffer.from(await res.arrayBuffer());
      assert.strictEqual(buf.length, v.size);
      assert.strictEqual(buf.subarray(4, 8).toString(), 'ftyp');
      const out = path.join(tmp, `o${hashes.size}.mp4`);
      fs.writeFileSync(out, buf);
      const info = execFileSync(FF, ['-hide_banner', '-i', out, '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
      assert.ok(info !== undefined);
      hashes.add(crypto.createHash('sha1').update(buf).digest('hex'));
    }
    assert.strictEqual(hashes.size, 5);
    // The cabinet hears about the first video once, not about the second.
    assert.deepStrictEqual(firsts, ['u-e2e']);

    // Monitoring log: start, two enqueues, the busy reject and both finished jobs with timings.
    const log = fs.readFileSync(path.join(s.dataDir, 'log.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    const jobsLogged = log.filter((e) => e.ev === 'job');
    assert.deepStrictEqual(jobsLogged.map((e) => [e.uid, e.done, e.failed]), [['u-e2e', 3, 0], ['u-e2e', 2, 0]]);
    assert.ok(jobsLogged.every((e) => e.procSec >= 0 && e.srcBytes > 0 && e.srcSec === 4 && e.outBytes > 0));
    assert.ok(log.some((e) => e.ev === 'reject' && e.reason === 'busy'));
    assert.strictEqual(log[0].ev, 'start');

    // Other users can't download.
    assert.strictEqual((await fetch(`${s.base}${ja.versions[0].url}?t=${token('someone-else')}`)).status, 404);

    // History keeps all 5 versions under uid:fingerprint, so they were picked mutually distant.
    const hist = JSON.parse(fs.readFileSync(path.join(s.dataDir, 'history.json')));
    const keys = Object.keys(hist);
    assert.strictEqual(keys.length, 1);
    assert.match(keys[0], /^u-e2e:/);
    assert.strictEqual(hist[keys[0]].versions.length, 5);

    r = await upload(s.base, t, src, 1);
    assert.strictEqual(r.status, 429);
    const e = await r.json();
    assert.deepStrictEqual({ used: e.used, max: e.max }, { used: 5, max: 5 });
    assert.match(e.error, /лимит 5 версий/);

    // Another user gets their own quota for the same file.
    r = await upload(s.base, token('u-other'), src, 1);
    assert.strictEqual(r.status, 200);
    await poll(s.base, (await r.json()).jobId, token('u-other'));

    assert.deepStrictEqual(fs.readdirSync(path.join(s.dataDir, 'uploads')), []);
  } finally { await s.close(); }
});

test('rejects videos longer than 3 minutes', { timeout: 120000 }, async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-e2e-'));
  const src = path.join(tmp, 'long.mp4');
  execFileSync(FF, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=black:size=64x64:rate=1', '-t', '181',
    '-c:v', 'libx264', '-preset', 'ultrafast', src]);
  const s = await start();
  try {
    const r = await upload(s.base, token('u-long'), src, 1);
    assert.strictEqual(r.status, 400);
    assert.strictEqual((await r.json()).error, 'ролик длиннее 3 минут');
  } finally { await s.close(); }
});
