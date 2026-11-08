import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actorForKey, keyFromRequest, ownKey } from './keys';

const env = 'danya:dddddddddddddddddddd,sasha:ssssssssssssssssssss';
const who = (url: string, auth?: string) => actorForKey(keyFromRequest(url, auth), env);

test('ключ MCP в адресе: верный, неверный, без ключа', () => {
  assert.equal(who('https://x.com/api/mcp?key=dddddddddddddddddddd'), 'danya');
  assert.equal(who('https://x.com/api/mcp?key=ssssssssssssssssssss'), 'sasha');
  assert.equal(who('https://x.com/api/mcp?key=wrong'), null);
  assert.equal(who('https://x.com/api/mcp?key='), null);
  assert.equal(who('https://x.com/api/mcp'), null);
  assert.equal(who('not a url'), null);
});

test('ключ MCP в заголовке важнее адреса', () => {
  assert.equal(who('https://x.com/api/mcp', 'Bearer dddddddddddddddddddd'), 'danya');
  assert.equal(who('https://x.com/api/mcp?key=dddddddddddddddddddd', 'Bearer wrong'), null);
  assert.equal(who('https://x.com/api/mcp', 'Basic abc'), null);
});

test('свой ключ только себе', () => {
  assert.equal(ownKey('danya', env), 'dddddddddddddddddddd');
  assert.equal(ownKey('sasha', env), 'ssssssssssssssssssss');
  assert.equal(ownKey('danya', ''), null);
});
