import { test } from 'node:test';
import assert from 'node:assert/strict';
import { botEnabled, decide, preRoute, signed, tidy, BOT_SIGNATURE, type NewPost } from './route';

// Все вопросы синтетические: придуманы под тест, реальных веток здесь нет.
const post = (over: Partial<NewPost> = {}): NewPost => ({
  id: 'p1',
  category: 'question',
  title: 'Где найти предобучение?',
  body: 'Не вижу его в кабинете',
  images: [],
  ...over,
});

test('флаг выключен по умолчанию и включается только единицей', () => {
  assert.equal(botEnabled({}), false);
  assert.equal(botEnabled({ COMMUNITY_BOT: '0' }), false);
  assert.equal(botEnabled({ COMMUNITY_BOT: 'true' }), false);
  assert.equal(botEnabled({ COMMUNITY_BOT: '1' }), true);
});

test('бот смотрит только ветки «Вопрос»', () => {
  for (const category of ['review', 'win', 'report', 'announce']) {
    assert.deepEqual(preRoute(post({ category })), { kind: 'skip' });
  }
  assert.deepEqual(preRoute(post()), { kind: 'ask' });
});

test('приложенная работа уходит Саше без модели', () => {
  assert.deepEqual(preRoute(post({ images: ['img'] })), { kind: 'review' });
  assert.deepEqual(
    preRoute(post({ body: 'глянь оффер https://docs.google.com/document/d/x/edit' })),
    { kind: 'review' },
  );
  assert.deepEqual(preRoute(post({ body: 'вот карусель https://www.instagram.com/p/abc/' })), { kind: 'review' });
  assert.deepEqual(preRoute(post({ body: 'длинный текст оффера '.repeat(100) })), { kind: 'review' });
});

test('рутина с коротким ответом — бот отвечает', () => {
  const d = decide({ kind: 'routine', answer: 'Предобучение в разделе «Новый уровень контента», пролистай ниже.' });
  assert.equal(d.action, 'answer');
});

test('метод, проверка, личное и победы — бот молчит', () => {
  assert.deepEqual(decide({ kind: 'method', answer: '' }), { action: 'notify', kind: 'method' });
  assert.deepEqual(decide({ kind: 'review', answer: '' }), { action: 'notify', kind: 'review' });
  assert.deepEqual(decide({ kind: 'personal', answer: '' }), { action: 'notify', kind: 'personal' });
  assert.deepEqual(decide({ kind: 'social', answer: '' }), { action: 'notify', kind: 'social' });
});

test('метод с ответом всё равно не публикуется', () => {
  const d = decide({ kind: 'method', answer: 'Сделай первый слайд через желаемое будущее.' });
  assert.deepEqual(d, { action: 'notify', kind: 'method' });
});

test('битый или пустой ответ модели — молчим и зовём Сашу', () => {
  assert.deepEqual(decide(null), { action: 'notify', kind: 'method' });
  assert.deepEqual(decide({ kind: 'что-то' }), { action: 'notify', kind: 'method' });
  assert.deepEqual(decide({ kind: 'routine', answer: '' }), { action: 'notify', kind: 'personal' });
  assert.deepEqual(decide({ kind: 'routine', answer: 42 }), { action: 'notify', kind: 'personal' });
});

test('цены и длинные лекции бот не публикует', () => {
  assert.deepEqual(decide({ kind: 'routine', answer: 'Продление стоит 5 000 ₽' }), { action: 'notify', kind: 'personal' });
  assert.deepEqual(decide({ kind: 'routine', answer: 'а'.repeat(800) }), { action: 'notify', kind: 'personal' });
});

test('длинное тире заменяется, ответ подписан ботом', () => {
  assert.equal(tidy('Карта оффера — это скелет'), 'Карта оффера - это скелет');
  const s = signed('ответ');
  assert.ok(s.startsWith('ответ'));
  assert.ok(s.endsWith(BOT_SIGNATURE));
  assert.match(BOT_SIGNATURE, /бот/);
});
