import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inline, renderMarkdown, plainPreview, prUrl } from './md';

test('html in text is escaped', () => {
  assert.equal(inline('<script>x</script> & co'), '&lt;script&gt;x&lt;/script&gt; &amp; co');
});

test('bold, code and links', () => {
  assert.equal(inline('**a** `b<c>`'), '<strong>a</strong> <code>b&lt;c&gt;</code>');
  assert.equal(
    inline('[docs](https://example.com/a)'),
    '<a href="https://example.com/a" target="_blank" rel="noreferrer">docs</a>',
  );
});

test('javascript: links stay plain text', () => {
  assert.equal(inline('[x](javascript:alert(1))'), '[x](javascript:alert(1))');
});

test('bare urls are linked without trailing punctuation', () => {
  assert.equal(
    inline('see https://example.com/x.'),
    'see <a href="https://example.com/x" target="_blank" rel="noreferrer">https://example.com/x</a>.',
  );
});

test('PR mentions become GitHub links, quizapp by default', () => {
  assert.equal(prUrl(undefined, '5'), 'https://github.com/thesashatoyzworld/quizapp/pull/5');
  assert.equal(prUrl('agent-hub', '7'), 'https://github.com/thesashatoyzworld/agent-hub/pull/7');
  assert.match(inline('PR quizapp #12 done'), /href="https:\/\/github.com\/thesashatoyzworld\/quizapp\/pull\/12"/);
  assert.match(inline('PR #3'), /pull\/3"/);
});

test('code path links to a saved file when resolver knows it', () => {
  const html = inline('file `dir/a.html` and `other.md`', {
    codeHref: (c) => (c === 'dir/a.html' ? '/admin/shtab/file/f1' : null),
  });
  assert.equal(html, 'file <a href="/admin/shtab/file/f1"><code>dir/a.html</code></a> and <code>other.md</code>');
});

test('blocks: heading, lists, hr, table, code fence', () => {
  const html = renderMarkdown(
    ['# Title', '', 'one', 'two', '', '- a', '- [x] b', '', '1. c', '---', '| h1 | h2 |', '|---|---|', '| x | y |', '```', '<b>', '```'].join('\n'),
  );
  assert.equal(
    html,
    [
      '<h2>Title</h2>',
      '<p>one<br>two</p>',
      '<ul><li>a</li><li>☑ b</li></ul>',
      '<ol><li>c</li></ol>',
      '<hr>',
      '<div class="md-table"><table><thead><tr><th>h1</th><th>h2</th></tr></thead><tbody><tr><td>x</td><td>y</td></tr></tbody></table></div>',
      '<pre><code>&lt;b&gt;</code></pre>',
    ].join('\n'),
  );
});

test('preview drops headings and markup', () => {
  assert.equal(plainPreview('# Head\n\n**Bold** line\n- item `x`\nthird\nfourth', 3), 'Bold line item x third');
  assert.equal(plainPreview('a'.repeat(300), 3, 10), 'aaaaaaaaa…');
});
