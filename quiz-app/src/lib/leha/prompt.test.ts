import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEHA_SYSTEM, cleanReply, renderLead, systemWithExamples, type LeadForPrompt } from './prompt';

const lead: LeadForPrompt = {
  id: 7,
  kind: 'mentor',
  firstName: 'Тест',
  who: 'тренер',
  hasProduct: 'да',
  product: 'онлайн ведение',
  level: null,
  tried: '',
  want: 'стабильный доход',
  income: '50–150к',
  hours: null,
  following: null,
  readiness: 'пока думаю',
  followers: '1–5 тыс',
};

test('анкета без пустых полей и с тем, что человек написал', () => {
  const out = renderLead(lead, ['привет) анкета на менторство - Тест, #7']);
  assert.match(out, /что это: анкета на менторство/);
  assert.match(out, /свой продукт: да: онлайн ведение/);
  assert.match(out, /> привет\) анкета/);
  assert.doesNotMatch(out, /что пробовал/);
  assert.doesNotMatch(out, /уровень/);
});

test('лист ожидания называется листом ожидания', () => {
  assert.match(renderLead({ ...lead, kind: 't2' }, []), /лист ожидания тарифа 2/);
});

test('живые примеры только из окружения', () => {
  assert.equal(systemWithExamples(''), LEHA_SYSTEM);
  assert.match(systemWithExamples('пример'), /Примеры .*\nпример$/);
});

test('ссылку и цену в первом сообщении не пропускает', () => {
  assert.equal(cleanReply('Тест привет, глянь https://example.com ?').text, null);
  assert.equal(cleanReply('Тест привет, вот t.me/x ?').text, null);
  assert.equal(cleanReply('Тест привет, курс стоит 5 450 ₽?').text, null);
  assert.equal(cleanReply('Тест привет, всего 30 тыс?').problem, 'в тексте цена');
});

test('чистит кавычки и длинное тире, помечает сообщение без вопроса', () => {
  assert.deepEqual(cleanReply('«Тест привет — вижу анкету?»'), { text: 'Тест привет - вижу анкету?', problem: null });
  assert.deepEqual(cleanReply('Тест привет, вижу анкету'), { text: 'Тест привет, вижу анкету', problem: 'нет вопроса' });
  assert.equal(cleanReply('   ').problem, 'пусто');
  assert.equal(cleanReply('а'.repeat(500) + '?').problem, 'слишком длинно');
});

test('в промпте нет цитат и имён из живой переписки', () => {
  assert.doesNotMatch(LEHA_SYSTEM, /#\d{2,}/);
  assert.doesNotMatch(LEHA_SYSTEM, /@\w/);
});
