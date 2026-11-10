'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { start } = require('./helpers');

test('preflight from allowed origin', async () => {
  const s = await start();
  try {
    const r = await fetch(`${s.base}/api/jobs`, { method: 'OPTIONS', headers: {
      Origin: 'https://thesashatoyz.com', 'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,x-filename' } });
    assert.strictEqual(r.status, 204);
    assert.strictEqual(r.headers.get('access-control-allow-origin'), 'https://thesashatoyz.com');
    assert.match(r.headers.get('access-control-allow-headers'), /Authorization/);
    assert.match(r.headers.get('access-control-allow-headers'), /X-Filename/);
    assert.match(r.headers.get('access-control-allow-methods'), /POST/);
  } finally { await s.close(); }
});

test('no CORS headers for unknown origin', async () => {
  const s = await start();
  try {
    const r = await fetch(`${s.base}/health`, { headers: { Origin: 'https://evil.example' } });
    assert.strictEqual(r.headers.get('access-control-allow-origin'), null);
    assert.deepStrictEqual(await r.json(), { ok: true, queue: 0 });
  } finally { await s.close(); }
});

test('origins come from config', async () => {
  const s = await start({ origins: 'https://a.example' });
  try {
    const r = await fetch(`${s.base}/health`, { headers: { Origin: 'https://a.example' } });
    assert.strictEqual(r.headers.get('access-control-allow-origin'), 'https://a.example');
  } finally { await s.close(); }
});
