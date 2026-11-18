import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOverrides, hideNotice, hotId, isUsed, mapExhibit, mapMuzey, parsePokazano, pickPoints, takeNotice, visibleTo, type MuzeyExhibit } from './muzey';

function ex(id: string, p: Partial<MuzeyExhibit> = {}): Record<string, unknown> {
  return { id, sut: 's', doslovno: `цитата ${id}`, kto: 'Саша', taym: '00:01:00', tsifra: null, pokazyvat: 'да', istochnik: 'Созвон', data: '2026-11-01', src_sha: 'x', portret: 'p', ...p };
}

const input = {
  goryachee: [
    { mysl: 'Горячая', eksponaty: ['E3', 'E2'], sozvonov: 6, sozvonov_3dnya: 2, posledniy: '2026-11-17', novaya: true },
  ],
  smysly: [
    { id: 'S1', formula: 'Повторяет', eksponaty: ['E1', 'E4'], ves: 3, bol: 1 },
    { id: 'S2', formula: 'Один раз', eksponaty: ['E5'], ves: 1, bol: 0 },
    { id: 'S3', formula: 'Только клиент', eksponaty: ['E6'], ves: 2, bol: 0 },
  ],
  eksponaty: [
    ex('E1'), ex('E2', { data: '2026-11-10' }), ex('E3', { data: '2026-11-05', tsifra: '200к' }),
    ex('E4', { pokazyvat: 'с согласия' }), ex('E5'), ex('E6', { kto: 'Клиент' }),
  ],
};

test('hot id is stable and order independent', () => {
  assert.equal(hotId(['E3', 'E2']), hotId(['E2', 'E3']));
  assert.match(hotId(['E1']), /^G-[0-9a-f]{8}$/);
});

test('mapMuzey: hot first, meanings with ves >= 2, extra exhibit fields dropped', () => {
  const { points, exhibits } = mapMuzey(input);
  assert.deepEqual(points.map((p) => p.kind), ['hot', 'smysl', 'smysl']);
  assert.deepEqual(points.map((p) => p.id).slice(1), ['S1', 'S3']);
  assert.match(points[0].why, /6 созвонов.*за 3 дня 2, новая мысль/);
  assert.equal(points[1].why, 'повторил в 3 источниках, боль у 1');
  assert.equal(exhibits.length, 6);
  assert.equal('src_sha' in exhibits[0], false);
});

test('tsifra with Cyrillic letters in the key is read', () => {
  assert.equal(mapExhibit({ id: 'E9', 'tsифра': '5 млн' }).tsifra, '5 млн');
  assert.equal(mapExhibit({ id: 'E9', 'tsifра': 7 }).tsifra, '7');
  assert.equal(mapExhibit({ id: 'E9', tsifra: null }).tsifra, null);
});

test('visibility: only Sasha; Danya only «да», Sasha also «с согласия», nobody «нет»', () => {
  const e = (p: Partial<MuzeyExhibit>) => mapExhibit(ex('E', p));
  assert.equal(visibleTo(e({ pokazyvat: 'да' }), 'danya'), true);
  assert.equal(visibleTo(e({ pokazyvat: 'с согласия' }), 'danya'), false);
  assert.equal(visibleTo(e({ pokazyvat: null }), 'danya'), false);
  assert.equal(visibleTo(e({ pokazyvat: 'с согласия' }), 'sasha'), true);
  assert.equal(visibleTo(e({ pokazyvat: 'нет' }), 'sasha'), false);
  assert.equal(visibleTo(e({ kto: 'Рамиль' }), 'sasha'), false);
});

test('pickPoints: hot first, quotes with a number first, hidden quotes dropped', () => {
  const { points, exhibits } = mapMuzey(input);
  const danya = pickPoints(points, exhibits, [], 'danya');
  assert.deepEqual(danya.map((p) => p.id), [points[0].id, 'S1']); // S3 has no Sasha quote
  assert.equal(danya[0].hot, true);
  assert.deepEqual(danya[0].quotes.map((q) => q.exhibit), ['E3', 'E2']);
  assert.deepEqual(danya[1].quotes.map((q) => q.exhibit), ['E1']); // E4 «с согласия» hidden
  const sasha = pickPoints(points, exhibits, [], 'sasha');
  assert.deepEqual(sasha[1].quotes.map((q) => q.exhibit).sort(), ['E1', 'E4']);
});

test('a point is used when more than half of its exhibits are taken', () => {
  assert.equal(isUsed(['E1', 'E2'], new Set(['E1'])), false);
  assert.equal(isUsed(['E1', 'E2', 'E3'], new Set(['E1', 'E2'])), true);
  assert.equal(isUsed([], new Set(['E1'])), false);
  const { points, exhibits } = mapMuzey(input);
  const left = pickPoints(points, exhibits, [{ exhibitIds: ['E2', 'E3'] }], 'danya');
  assert.deepEqual(left.map((p) => p.id), ['S1']);
});

test('pokazano parse and notice escaping', () => {
  assert.deepEqual(parsePokazano([{ mysl: 'a', eksponaty: ['E1'], karusel: 'k', data: '2026-11-18' }, { mysl: '' }]), [
    { mysl: 'a', eksponaty: ['E1'], karusel: 'k', data: '2026-11-18' },
  ]);
  assert.equal(takeNotice('a <b> & c', 'slug'), 'Даня взял поинт из музея: a &lt;b&gt; &amp; c → slug');
});

test('overrides: hidden points leave podbor, a new title is shown, the original is kept', () => {
  const { points, exhibits } = mapMuzey(input);
  const edited = applyOverrides(points, [
    { pointId: points[0].id, hidden: true, reason: 'мимо', title: null },
    { pointId: 'S1', hidden: false, reason: null, title: 'Новая формулировка' },
  ]);
  const left = pickPoints(edited, exhibits, [], 'danya');
  assert.deepEqual(left.map((p) => p.id), ['S1']);
  assert.equal(left[0].title, 'Новая формулировка');
  assert.equal(edited[1].originalTitle, 'Повторяет');
  assert.equal(edited[0].hideReason, 'мимо');
  assert.equal(hideNotice('a & b', true, '<x>'), 'Даня убрал поинт из музея как «мимо»: a &amp; b\nПричина: &lt;x&gt;');
});
