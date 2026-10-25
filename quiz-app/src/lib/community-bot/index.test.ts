import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleNewPost, type BotDeps } from './index';
import type { ModelVerdict, NewPost } from './route';

// Сеть и база — моки: ни одного настоящего сообщения тест не отправляет.
function mocks(env: Record<string, string | undefined>, verdict: ModelVerdict | null | Error = null) {
  const calls: string[] = [];
  const deps: BotDeps = {
    env,
    ask: async () => {
      calls.push('ask');
      if (verdict instanceof Error) throw verdict;
      return verdict;
    },
    addBotComment: async (_id, text) => { calls.push(`comment:${text.split('\n')[0]}`); },
    notifyAdmin: async (_p, _n, notice) => { calls.push(`admin:${notice.kind}`); },
    notifyNewPost: async () => { calls.push('newpost'); },
  };
  return { deps, calls };
}

const post: NewPost = {
  id: 'p1', category: 'question', title: 'Что такое карта оффера?', body: 'И где её взять', images: [],
};

test('флаг выключен — ничего не происходит', async () => {
  for (const env of [{}, { COMMUNITY_BOT: '0' }, { COMMUNITY_BOT: '' }]) {
    const { deps, calls } = mocks(env, { kind: 'routine', answer: 'в воркшопе' });
    assert.equal(await handleNewPost(post, 'Ученик', deps), 'off');
    assert.deepEqual(calls, []);
  }
});

test('рутина: бот отвечает в ветку и сообщает Саше, что ответил', async () => {
  const { deps, calls } = mocks({ COMMUNITY_BOT: '1' }, { kind: 'routine', answer: 'Карта оффера лежит в воркшопе «Солдаут вашего продукта».' });
  assert.equal(await handleNewPost(post, 'Ученик', deps), 'answered');
  assert.deepEqual(calls, ['ask', 'comment:Карта оффера лежит в воркшопе «Солдаут вашего продукта».', 'admin:answered']);
});

test('вопрос по методу: бот молчит, Саше уходит «вопрос по методу»', async () => {
  const q = { ...post, title: 'Почему рилс не набирает просмотры?', body: 'Удержание хорошее, а охвата нет' };
  const { deps, calls } = mocks({ COMMUNITY_BOT: '1' }, { kind: 'method', answer: '' });
  assert.equal(await handleNewPost(q, 'Ученик', deps), 'method');
  assert.deepEqual(calls, ['ask', 'admin:method']);
});

test('ветка «На проверку»: модель не зовём, бот не пишет', async () => {
  const { deps, calls } = mocks({ COMMUNITY_BOT: '1' }, { kind: 'routine', answer: 'x' });
  assert.equal(await handleNewPost({ ...post, category: 'review' }, 'Ученик', deps), 'skip');
  assert.deepEqual(calls, ['newpost']);
});

test('вопрос с приложенной работой: сразу Саше как проверка', async () => {
  const { deps, calls } = mocks({ COMMUNITY_BOT: '1' }, { kind: 'routine', answer: 'x' });
  assert.equal(await handleNewPost({ ...post, images: ['img'] }, 'Ученик', deps), 'review');
  assert.deepEqual(calls, ['admin:review']);
});

test('личный вопрос про доступ: бот молчит, Саше «вопрос к тебе»', async () => {
  const { deps, calls } = mocks({ COMMUNITY_BOT: '1' }, { kind: 'personal', answer: '' });
  assert.equal(await handleNewPost({ ...post, title: 'У меня закрыт курс' }, 'Ученик', deps), 'personal');
  assert.deepEqual(calls, ['ask', 'admin:personal']);
});

test('победа в ветке «Вопрос»: бот молчит, обычное уведомление', async () => {
  const { deps, calls } = mocks({ COMMUNITY_BOT: '1' }, { kind: 'social', answer: '' });
  assert.equal(await handleNewPost({ ...post, title: 'Первая продажа!' }, 'Ученик', deps), 'social');
  assert.deepEqual(calls, ['ask', 'newpost']);
});

test('модель упала: ветка уходит Саше как обычно', async () => {
  const orig = console.error;
  console.error = () => {};
  try {
    const { deps, calls } = mocks({ COMMUNITY_BOT: '1' }, new Error('timeout'));
    assert.equal(await handleNewPost(post, 'Ученик', deps), 'error');
    assert.deepEqual(calls, ['ask', 'newpost']);
  } finally {
    console.error = orig;
  }
});
