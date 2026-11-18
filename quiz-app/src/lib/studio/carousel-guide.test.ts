import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkGuideEdit, guideEditNotice, guideToMarkdown } from './carousel-guide';

test('checkGuideEdit trims, rejects empty, keeps title optional', () => {
  assert.deepEqual(checkGuideEdit({ body: '  текст\r\n ', note: '' }), { body: 'текст', note: null });
  assert.deepEqual(checkGuideEdit({ title: ' Раздел ', body: 'x', note: ' почему ' }), { title: 'Раздел', body: 'x', note: 'почему' });
  assert.equal(checkGuideEdit({ body: '   ' }), 'пустой текст раздела');
  assert.equal(checkGuideEdit({ title: ' ', body: 'x' }), 'пустое название раздела');
});

test('guideEditNotice escapes HTML and links the Studio', () => {
  const t = guideEditNotice('Голос <Саши>', 'убрал & добавил');
  assert.match(t, /^Даня поправил раздел «Голос &lt;Саши&gt;»/);
  assert.match(t, /Заметка: убрал &amp; добавил/);
  assert.match(t, /href="https:\/\/world\.thesashatoyz\.com\/admin\/studio"/);
  assert.doesNotMatch(guideEditNotice('a', null), /Заметка/);
  assert.match(guideEditNotice('a', null, true), /^Даня вернул старую версию раздела/);
});

test('guideToMarkdown keeps the order and names the slugs', () => {
  const md = guideToMarkdown([{ slug: 'order', title: 'Порядок', body: '1. раз' }, { slug: 'card', title: 'Карточка', body: 'два' }]);
  assert.ok(md.indexOf('## Порядок (раздел order)') < md.indexOf('## Карточка (раздел card)'));
});
