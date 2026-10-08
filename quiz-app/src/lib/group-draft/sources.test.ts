import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportUrl, extractUrls, isLoginWall, needsBrowser } from './sources';

test('гугл-док, таблица с вкладкой и презентация идут в экспорт', () => {
  assert.equal(
    exportUrl('https://docs.google.com/document/d/ABC/edit?usp=sharing'),
    'https://docs.google.com/document/d/ABC/export?format=txt',
  );
  assert.equal(
    exportUrl('https://docs.google.com/spreadsheets/d/XYZ/edit?gid=146#gid=146'),
    'https://docs.google.com/spreadsheets/d/XYZ/export?format=csv&gid=146',
  );
  assert.equal(
    exportUrl('https://docs.google.com/presentation/d/P1/edit'),
    'https://docs.google.com/presentation/d/P1/export/txt',
  );
});

test('инстаграм и телеграм не открываем, лендинг как есть', () => {
  assert.equal(exportUrl('https://www.instagram.com/p/Dd/'), null);
  assert.equal(exportUrl('https://t.me/lutovfitness/66'), null);
  assert.equal(exportUrl('https://improvnik.com'), 'https://improvnik.com');
});

test('ссылки без хвостовой пунктуации и без повторов', () => {
  assert.deepEqual(extractUrls('глянь https://a.com/x, и https://a.com/x.'), ['https://a.com/x']);
});

test('артефакты Claude открываем через браузер, лендинги сначала простым запросом', () => {
  assert.equal(needsBrowser('https://claude.ai/artifact/MLdm#a8c3'), true);
  assert.equal(needsBrowser('https://mysite-ashen.vercel.app/'), false);
});

test('страница входа вместо содержимого считается закрытой', () => {
  assert.equal(isLoginWall('## Sign in to view this page\n[Sign in](https://claude.ai/login)'), true);
  assert.equal(isLoginWall('Алексей Кузнецов, персональное сопровождение 90 дней'), false);
});
