import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tgFromOrderId } from './order-id';

test('телеграм из order_id прайс-ссылки', () => {
  assert.equal(tgFromOrderId('deal_mtr31ighuqj2_700694308_6d5xd5'), 700694308);
  assert.equal(tgFromOrderId('deal_mtr31ighuqj2_0_6d5xd5'), null);
});

test('телеграм из order_id тарифа, потока и МК', () => {
  assert.equal(tgFromOrderId('uroven_t2_123456789'), 123456789);
  assert.equal(tgFromOrderId('uroven_t2_web_abc'), null);
  assert.equal(tgFromOrderId('potok_sprosa_38145714'), 38145714);
  assert.equal(tgFromOrderId('potok_sprosa_web_muvkc4kp4v0mdh'), null);
  assert.equal(tgFromOrderId('mkdengi_511780922'), 511780922);
});

test('номер заказа Продамуса и чужие форматы не дают телеграм', () => {
  assert.equal(tgFromOrderId('49564018'), null);
  assert.equal(tgFromOrderId(''), null);
  assert.equal(tgFromOrderId('sync_mk_1700000000000'), null);
});
