'use strict';
const test = require('node:test');
const assert = require('node:assert');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { start, token } = require('./helpers');

// Raw socket so the path reaches the server exactly as a scanner sends it (fetch would normalize it).
function raw(base, reqPath, headers = '') {
  const { port } = new URL(base);
  return new Promise((resolve, reject) => {
    const sock = net.connect(port, '127.0.0.1', () => sock.write(`GET ${reqPath} HTTP/1.1\r\nHost: x\r\n${headers}Connection: close\r\n\r\n`));
    let data = '';
    sock.on('data', (d) => { data += d; });
    sock.on('end', () => resolve(+(/^HTTP\/1\.1 (\d+)/.exec(data) || [])[1]));
    sock.on('error', reject);
  });
}

test('junk and traversal paths never crash the server', async () => {
  const s = await start();
  const auth = `Authorization: Bearer ${token('u1')}\r\n`;
  try {
    // A job owned by u1 with one version, plus a secret file next to the data dir.
    const dir = path.join(s.dataDir, 'out', 'job1');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, '1.mp4'), 'mp4');
    fs.writeFileSync(path.join(s.dataDir, '.env'), 'SECRET');
    s.server.uniq.jobs.set('job1', { id: 'job1', uid: 'u1', stem: 'v', status: 'done', count: 1, done: 1, failed: 0,
      versions: [{ i: 1, size: 3, file: path.join(dir, '1.mp4') }], finishedAt: Date.now() });

    const junk = ['//%2e%2e%2f%2eenv', '//', '/%', '/..%2f', '/%2e%2e/%2e%2e/etc/passwd', '//x/../..', '/files/../.env',
      '/files/job1/..%2f..%2f.env', '/files/job1/..%2f1.mp4', '/files/%2e%2e/1.mp4', '/api/jobs/..%2fjob1', '*'];
    for (const p of junk) {
      for (const h of ['', auth]) {
        const code = await raw(s.base, p, h);
        assert.ok([400, 401, 404].includes(code), `${p} -> ${code}`);
      }
    }
    // Still alive and still serves the legit file.
    assert.strictEqual(await raw(s.base, '/health'), 200);
    assert.strictEqual(await raw(s.base, '/files/job1/1.mp4', auth), 200);
    assert.strictEqual(await raw(s.base, '/files/job1/1.mp4', `Authorization: Bearer ${token('u2')}\r\n`), 404);
  } finally { await s.close(); }
});
