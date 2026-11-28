import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paidViaLabel, type PaidVia } from './paid-via';

const row = (p: Partial<PaidVia>): PaidVia => ({
  source: 'potok',
  co_src: null, co_method: null, co_utm: null, co_from: null, co_post: null, ...p,
});

test('метка поста дописывается к пути оплаты', () => {
  assert.equal(paidViaLabel(row({ co_src: 'text', co_method: 'paylink', co_post: 'tg2811' })), 'text · пост tg2811');
  assert.equal(paidViaLabel(row({ co_src: 'potok', co_post: 'tg2811' })), 'Поток Спроса · пост tg2811');
});

test('без метки поста подпись прежняя', () => {
  assert.equal(paidViaLabel(row({ co_src: 'video' })), 'video');
  assert.equal(paidViaLabel(row({ co_method: 'paylink' })), 'ссылка на оплату');
  assert.equal(paidViaLabel(row({ source: 'web_redeem' })), 'выдано вручную');
});
