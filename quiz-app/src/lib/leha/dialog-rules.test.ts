import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPrices } from '@/content/prices';
import {
  DIALOG_DAILY_LIMIT,
  DIALOG_MAX_LEN,
  REMIND_TEXT,
  checkLinks,
  cleanDialogReply,
  decideReminder,
  hasMaterialLink,
  remindAt,
  decideDialogRun,
  dialogChats,
  dialogDelivery,
  dialogDueAt,
  extractAmounts,
  isDialogChat,
  normalizeLink,
  sashaTookOver,
  sentToday,
  type DialogRunFacts,
} from './dialog-rules';
import { dialogRules } from './dialog-prompt';

/** Момент по Алмате: UTC+5. */
const almaty = (day: number, hour: number, min = 0) => new Date(Date.UTC(2026, 9, day, hour - 5, min));
const P = newPrices();

const facts = (over: Partial<DialogRunFacts> = {}): DialogRunFacts => ({
  mode: 'live',
  inList: true,
  status: 'active',
  dueAt: almaty(26, 12, 0),
  updatedAt: almaty(26, 11, 58),
  lastSide: 'client',
  sentToday: 0,
  sashaWrote: false,
  now: almaty(26, 12, 1),
  ...over,
});

test('список чатов: через запятую, с пробелами', () => {
  assert.deepEqual(dialogChats(' 450843326, 123 ,,'), ['450843326', '123']);
  assert.equal(isDialogChat('450843326', '1,450843326'), true);
  assert.equal(isDialogChat('450843326', ''), false);
  assert.equal(isDialogChat('450843326', undefined as unknown as string), dialogChats().includes('450843326'));
});

test('ответ через паузу днём, ночью в 9:00', () => {
  assert.equal(dialogDueAt(almaty(26, 12, 0)).getTime(), almaty(26, 12, 0).getTime() + 90 * 1000);
  assert.equal(dialogDueAt(almaty(26, 23, 30)).getTime(), almaty(27, 9, 0).getTime());
  assert.equal(dialogDueAt(almaty(27, 3, 0)).getTime(), almaty(27, 9, 0).getTime());
});

test('пишет, когда пауза прошла и последнее слово за человеком', () => {
  assert.deepEqual(decideDialogRun(facts()), { kind: 'compose' });
});

test('чат не в списке или режим off: молчит', () => {
  assert.equal(decideDialogRun(facts({ inList: false })).kind, 'noop');
  assert.equal(decideDialogRun(facts({ mode: 'off' })).kind, 'noop');
});

test('человек дописал: dueAt сдвинулся, ждём до него', () => {
  const step = decideDialogRun(facts({ dueAt: almaty(26, 12, 3) }));
  assert.deepEqual(step, { kind: 'wait', until: almaty(26, 12, 3) });
});

test('ночью ждёт утра', () => {
  const step = decideDialogRun(facts({ dueAt: almaty(26, 21, 30), now: almaty(26, 22, 0) }));
  assert.deepEqual(step, { kind: 'wait', until: almaty(27, 9, 0) });
});

test('два сообщения подряд не пишет', () => {
  assert.equal(decideDialogRun(facts({ lastSide: 'us' })).kind, 'noop');
  assert.equal(decideDialogRun(facts({ lastSide: null })).kind, 'noop');
});

test('дневной лимит: ждёт завтрашних 9:00', () => {
  const step = decideDialogRun(facts({ sentToday: DIALOG_DAILY_LIMIT }));
  assert.deepEqual(step, { kind: 'wait', until: almaty(27, 9, 0) });
  assert.equal(decideDialogRun(facts({ sentToday: DIALOG_DAILY_LIMIT - 1 })).kind, 'compose');
});

test('Саша написал сам: стоп', () => {
  assert.deepEqual(decideDialogRun(facts({ sashaWrote: true })), { kind: 'stop', reason: 'sasha_wrote' });
});

test('ждёт Сашу или остановлен: молчит', () => {
  for (const status of ['pending', 'escalated', 'stopped']) {
    assert.equal(decideDialogRun(facts({ status })).kind, 'noop', status);
  }
});

test('другая задача пишет: ждём рядом, если есть на что отвечать', () => {
  assert.equal(decideDialogRun(facts({ status: 'composing' })).kind, 'wait');
  assert.equal(decideDialogRun(facts({ status: 'composing', dueAt: null })).kind, 'noop');
  // Упавшая задача не держит чат вечно.
  const stale = facts({ status: 'composing', updatedAt: almaty(26, 11, 0) });
  assert.equal(decideDialogRun(stale).kind, 'compose');
});

test('счётчик за сутки обнуляется в полночь по Алмате', () => {
  const day = new Date(Date.UTC(2026, 9, 25, 19, 0)); // полночь 26.10 по Алмате
  assert.equal(sentToday(day, 7, almaty(26, 15)), 7);
  assert.equal(sentToday(day, 7, almaty(27, 9)), 0);
  assert.equal(sentToday(null, 7, almaty(26, 15)), 0);
});

test('Саша в чате: своя реплика после включения без метки Лёхи', () => {
  const enabled = almaty(26, 10, 0);
  const row = (over: object) => ({ side: 'us', mediaRef: null, text: 'текст', createdAt: almaty(26, 11, 0), ...over });
  assert.equal(sashaTookOver([row({})], enabled, null), true);
  assert.equal(sashaTookOver([row({ mediaRef: 'sent-by:leha' })], enabled, null), false);
  assert.equal(sashaTookOver([row({ createdAt: almaty(26, 7, 52) })], enabled, null), false, 'до включения не считается');
  assert.equal(sashaTookOver([row({ text: 'Лёхин текст ' })], enabled, 'Лёхин текст'), false, 'эхо без метки');
  assert.equal(sashaTookOver([row({ side: 'client' })], enabled, null), false);
  assert.equal(sashaTookOver([row({ mediaRef: 'sent-by:cabinet' })], enabled, null), true, 'из кабинета это Саша');
});

test('ссылки: нормализация и список', () => {
  assert.equal(normalizeLink('https://www.TheSashaToyz.com/cases/vasya/?utm_source=telegram&utm_medium=dm'), 'thesashatoyz.com/cases/vasya');
  assert.equal(checkLinks('глянь https://thesashatoyz.com/cases/vasya?utm_source=telegram').verdict, 'ok');
  // тариф 1 сейчас не предлагаем: ссылка чужая, разговор встаёт
  assert.equal(checkLinks('вот https://world.thesashatoyz.com/pay/t1?u=450843326').verdict, 'foreign');
  assert.equal(checkLinks('вот https://world.thesashatoyz.com/pay/t2?k=svoi&u=1').verdict, 'personal');
  assert.equal(checkLinks('youtu.be/yPVe749WQIc').verdict, 'ok');
  const bad = checkLinks('вот https://thesashatoyz.com/cases/kto-to и t.me/sashatoyz');
  assert.equal(bad.verdict, 'foreign');
  assert.equal(bad.bad.length, 2);
  assert.equal(checkLinks('payform.ru/abc').verdict, 'foreign');
});

test('суммы: только с валютой рядом', () => {
  assert.deepEqual(extractAmounts('стоимость 6 550 ₽ разово'), [6550]);
  assert.deepEqual(extractAmounts('12000р в месяц'), [12000]);
  assert.deepEqual(extractAmounts('155к рублей сразу или 60 тыс. руб'), [155000, 60000]);
  assert.deepEqual(extractAmounts('у Васи 535 подписчиков и 500к в месяц'), []);
});

test('чистка: тире, ёлочки, кавычки вокруг', () => {
  const r = cleanDialogReply('"понял — тогда глянь статью «казино»"', P);
  assert.equal(r.text, 'понял - тогда глянь статью "казино"');
  assert.equal(r.problem, null);
});

test('чистка: цена не из прайса', () => {
  const r = cleanDialogReply('сделаю за 9 990 ₽', P);
  assert.match(r.problem || '', /цена не из прайса/);
  assert.equal(cleanDialogReply(`тариф 1 стоит ${P.t1} ₽, рассрочка от ${Math.round(P.t1 / 24)} ₽ в месяц`, P).problem, null);
  assert.equal(cleanDialogReply(`за три месяца ${P.groupOnce / 1000}к ₽ одним платежом`, P).problem, null);
});

test('чистка: чужая ссылка и личная ссылка', () => {
  assert.match(cleanDialogReply('вот https://example.com/x', P).problem || '', /ссылка не из списка/);
  const personal = cleanDialogReply('лови https://world.thesashatoyz.com/pay/t2?k=svoi&u=1', P);
  assert.equal(personal.problem, null);
  assert.equal(personal.personal, true);
});

test('чистка: женский род о себе и служебное', () => {
  assert.match(cleanDialogReply('посмотрела твой профиль\nкласс', P).problem || '', /женском роде/);
  assert.match(cleanDialogReply('я тоже видела такое', P).problem || '', /женском роде/);
  // Про собеседницу можно.
  assert.equal(cleanDialogReply('а ты видела мой кейс по фитнесу?', P).problem, null);
  assert.equal(cleanDialogReply('видела.. нет, видел', P).text, null);
  assert.equal(cleanDialogReply('я бот и не могу', P).text, null);
});

test('чистка: пусто и простыня', () => {
  assert.equal(cleanDialogReply('  ', P).problem, 'пусто');
  assert.equal(cleanDialogReply('а'.repeat(DIALOG_MAX_LEN + 1), P).problem, 'слишком длинно');
});

test('доставка: live шлёт сам только чистое днём', () => {
  const base = { mode: 'live' as const, callSasha: null, problem: null, personal: false, hasText: true, now: almaty(26, 12) };
  assert.equal(dialogDelivery(base), 'send');
  assert.equal(dialogDelivery({ ...base, now: almaty(26, 21, 5) }), 'review');
  assert.equal(dialogDelivery({ ...base, callSasha: 'просит созвон' }), 'escalate');
  // ссылка на оплату т2/т3 уходит сама
  assert.equal(dialogDelivery({ ...base, personal: true }), 'send');
  assert.equal(dialogDelivery({ ...base, problem: 'цена не из прайса' }), 'escalate');
  assert.equal(dialogDelivery({ ...base, hasText: false }), 'escalate');
  assert.equal(dialogDelivery({ ...base, mode: 'shadow' }), 'review');
  assert.equal(dialogDelivery({ ...base, mode: 'shadow', problem: 'x' }), 'review');
});

test('промпт: прайс, ссылка оплаты с его id, без длинного тире', () => {
  const text = dialogRules(P, '450843326');
  assert.ok(text.includes('https://world.thesashatoyz.com/pay/t3?k=svoi&u=450843326'));
  assert.ok(!text.includes('/pay/t1'));
  assert.ok(text.includes('бесплатные материалы'));
  assert.ok(text.includes('12 000'));
  assert.ok(text.includes('155 000'));
  assert.ok(!text.includes('—'));
  assert.ok(!/«|»/.test(text.replace(/«[^»]*»/g, '')), 'ёлочки только парные в названиях');
});

test('напоминание: только про материал и только если никто не писал', () => {
  const mat = 'посмотри, чтоб понимать как я работаю\nhttps://thesashatoyz.com/cases/danya?utm_source=telegram&utm_medium=dm';
  assert.equal(hasMaterialLink(mat), true);
  assert.equal(hasMaterialLink('лови https://world.thesashatoyz.com/pay/t3?k=svoi&u=1'), false);
  assert.equal(hasMaterialLink('а ты смотрел мои материалы?'), false);

  const base = {
    mode: 'live' as const,
    inList: true,
    status: 'active',
    sashaWrote: false,
    last: { side: 'us', text: mat },
    lastSentText: mat,
    now: almaty(27, 12),
  };
  assert.equal(decideReminder(base).kind, 'send');
  assert.equal(decideReminder({ ...base, last: { side: 'client', text: 'посмотрел' } }).kind, 'noop');
  assert.equal(decideReminder({ ...base, last: { side: 'us', text: REMIND_TEXT }, lastSentText: REMIND_TEXT }).kind, 'noop');
  assert.equal(decideReminder({ ...base, sashaWrote: true }).kind, 'noop');
  assert.equal(decideReminder({ ...base, mode: 'shadow' }).kind, 'noop');
  assert.equal(decideReminder({ ...base, status: 'stopped' }).kind, 'noop');
  assert.deepEqual(decideReminder({ ...base, now: almaty(27, 23) }), { kind: 'wait', until: almaty(28, 9) });
});

test('напоминание через сутки, ночью переносится на 9:00', () => {
  assert.deepEqual(remindAt(almaty(26, 12)), almaty(27, 12));
  assert.deepEqual(remindAt(almaty(26, 20, 30)), almaty(27, 20, 30));
  assert.deepEqual(remindAt(almaty(26, 22)), almaty(28, 9));
});
