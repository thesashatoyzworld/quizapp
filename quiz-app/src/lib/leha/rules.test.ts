import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_LIMIT,
  SETTLE_MS,
  almatyHour,
  decideRun,
  decideTrigger,
  deliveryOf,
  inWorkHours,
  lehaMode,
  nextWorkMoment,
  type TriggerFacts,
} from './rules';
import { outgoingRow } from './log';

/** Момент по Алмате: UTC+5. */
const almaty = (day: number, hour: number, min = 0) => new Date(Date.UTC(2026, 9, day, hour - 5, min));

const lead = (over: Partial<NonNullable<TriggerFacts['lead']>> = {}) => ({
  id: 1,
  username: 'someone',
  telegramId: null,
  createdAt: almaty(20, 12, 0),
  ...over,
});

const facts = (over: Partial<TriggerFacts> = {}): TriggerFacts => ({
  mode: 'shadow',
  lead: lead(),
  clientMsgsSinceLead: 1,
  ourMsgsSinceLead: 0,
  hasDraft: false,
  draftsOnDueDay: 0,
  now: almaty(20, 12, 1),
  ...over,
});

test('режим по умолчанию shadow, live только явным флагом', () => {
  assert.equal(lehaMode(undefined), 'shadow');
  assert.equal(lehaMode(''), 'shadow');
  assert.equal(lehaMode('lve'), 'shadow');
  assert.equal(lehaMode('true'), 'shadow');
  assert.equal(lehaMode('live'), 'live');
  assert.equal(lehaMode(' live '), 'live');
  assert.equal(lehaMode('off'), 'off');
});

test('выключен: молчит', () => {
  assert.deepEqual(decideTrigger(facts({ mode: 'off' })), { go: false, reason: 'off' });
});

test('днём первое сообщение после анкеты: черновик через паузу', () => {
  const now = almaty(20, 12, 1);
  assert.deepEqual(decideTrigger(facts({ now })), { go: true, dueAt: new Date(now.getTime() + SETTLE_MS) });
});

test('без анкеты не пишет', () => {
  assert.deepEqual(decideTrigger(facts({ lead: null })), { go: false, reason: 'no_lead' });
});

// Анкета с сайта бывает с почтой вместо телеграма. Человек уже написал в личку
// и сообщение привязалось к анкете, значит чат известен: отвечаем.
test('анкета без телеграма, но человек написал: пишет', () => {
  const now = almaty(20, 12, 1);
  assert.deepEqual(decideTrigger(facts({ lead: lead({ username: null, telegramId: null }), now })), {
    go: true,
    dueAt: new Date(now.getTime() + SETTLE_MS),
  });
});

test('старая анкета: это уже не ответ на заявку', () => {
  const r = decideTrigger(facts({ lead: lead({ createdAt: almaty(16, 12) }), now: almaty(20, 12) }));
  assert.deepEqual(r, { go: false, reason: 'stale_lead' });
});

test('отвечает только на первое сообщение после анкеты', () => {
  assert.deepEqual(decideTrigger(facts({ clientMsgsSinceLead: 2 })), { go: false, reason: 'not_first' });
  assert.deepEqual(decideTrigger(facts({ clientMsgsSinceLead: 0 })), { go: false, reason: 'not_first' });
});

test('Саша уже ответил сам: не вмешивается', () => {
  assert.deepEqual(decideTrigger(facts({ ourMsgsSinceLead: 1 })), { go: false, reason: 'sasha_answered' });
});

test('второй черновик по той же анкете не заводит', () => {
  assert.deepEqual(decideTrigger(facts({ hasDraft: true })), { go: false, reason: 'already_drafted' });
});

test('не больше 10 первых сообщений в сутки', () => {
  assert.equal(DAILY_LIMIT, 10);
  assert.equal(decideTrigger(facts({ draftsOnDueDay: 9 })).go, true);
  assert.deepEqual(decideTrigger(facts({ draftsOnDueDay: 10 })), { go: false, reason: 'daily_limit' });
  assert.deepEqual(decideTrigger(facts({ draftsOnDueDay: 25 })), { go: false, reason: 'daily_limit' });
});

test('рабочие часы 9:00-21:00 по Алмате', () => {
  assert.equal(almatyHour(almaty(20, 9)), 9);
  assert.equal(inWorkHours(almaty(20, 8, 59)), false);
  assert.equal(inWorkHours(almaty(20, 9, 0)), true);
  assert.equal(inWorkHours(almaty(20, 20, 59)), true);
  assert.equal(inWorkHours(almaty(20, 21, 0)), false);
  assert.equal(inWorkHours(almaty(20, 3)), false);
});

test('ночью черновик назначается на 9:00', () => {
  assert.deepEqual(nextWorkMoment(almaty(20, 23, 30)), almaty(21, 9));
  assert.deepEqual(nextWorkMoment(almaty(21, 2)), almaty(21, 9));
  assert.deepEqual(nextWorkMoment(almaty(21, 8, 59)), almaty(21, 9));
  const r = decideTrigger(facts({ lead: lead({ createdAt: almaty(20, 22) }), now: almaty(20, 23) }));
  assert.deepEqual(r, { go: true, dueAt: almaty(21, 9) });
});

test('сообщение в 20:59: пауза уводит за 21:00, значит утро', () => {
  const r = decideTrigger(facts({ lead: lead({ createdAt: almaty(20, 20, 50) }), now: almaty(20, 20, 59) }));
  assert.deepEqual(r, { go: true, dueAt: almaty(21, 9) });
});

test('задача проснулась: всё перепроверяется', () => {
  const day = almaty(21, 10);
  assert.deepEqual(decideRun({ mode: 'shadow', status: 'queued', ourMsgsSinceLead: 0, now: day }), { kind: 'draft' });
  assert.deepEqual(decideRun({ mode: 'shadow', status: 'queued', ourMsgsSinceLead: 2, now: day }), {
    kind: 'close',
    status: 'answered',
  });
  assert.deepEqual(decideRun({ mode: 'off', status: 'queued', ourMsgsSinceLead: 0, now: day }), {
    kind: 'close',
    status: 'off',
  });
  assert.deepEqual(decideRun({ mode: 'live', status: 'queued', ourMsgsSinceLead: 0, now: almaty(21, 22) }), {
    kind: 'wait',
    until: almaty(22, 9),
  });
  assert.deepEqual(decideRun({ mode: 'live', status: 'skipped', ourMsgsSinceLead: 0, now: day }), { kind: 'noop' });
  assert.deepEqual(decideRun({ mode: 'live', status: 'sent', ourMsgsSinceLead: 0, now: day }), { kind: 'noop' });
});

test('shadow никогда не шлёт сам, live шлёт только днём', () => {
  assert.equal(deliveryOf('shadow', almaty(21, 12)), 'review');
  assert.equal(deliveryOf('off', almaty(21, 12)), 'review');
  assert.equal(deliveryOf('live', almaty(21, 12)), 'send');
  assert.equal(deliveryOf('live', almaty(21, 21, 5)), 'review');
  assert.equal(deliveryOf('live', almaty(22, 4)), 'review');
});

test('отправленное пишется в переписку стороной Саши', () => {
  const row = outgoingRow('555', { message_id: 77, date: 1_760_000_000 }, 'Вася привет', {
    username: 'vasya',
    name: 'Вася',
    leadId: 12,
  });
  assert.equal(row.side, 'us');
  assert.equal(row.id, '555:77');
  assert.equal(row.chatId, '555');
  assert.equal(row.leadId, 12);
  assert.equal(row.text, 'Вася привет');
  assert.deepEqual(row.createdAt, new Date(1_760_000_000_000));
  assert.equal(outgoingRow('555', { message_id: 1, date: 1 }, 'x', null).side, 'us');
});
