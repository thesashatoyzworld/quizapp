import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportUrl, extractUrls } from './sources';

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
