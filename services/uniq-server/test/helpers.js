'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createServer, sign } = require('../server');

const SECRET = 'test-secret';

async function start(opts = {}) {
  const dataDir = opts.dataDir || fs.mkdtempSync(path.join(os.tmpdir(), 'uniq-test-'));
  const server = createServer({ secret: SECRET, dataDir, ffmpeg: process.env.UNIQ_FFMPEG || 'ffmpeg', notifyFirst: () => {}, ...opts });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, base, dataDir, close: () => new Promise((r) => server.close(r)) };
}

const token = (uid, ttl = 3600) => sign({ uid, exp: Math.floor(Date.now() / 1000) + ttl }, SECRET);

module.exports = { start, token, SECRET };
