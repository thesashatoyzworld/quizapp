import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { needsConsent, parsePositions, parseProblems, parseStories } from './library-parse';
import { anonymousWho, filterLibrary, forDanya, personNames, redactText, type LibraryEntry } from './library';

// The real bases live outside the repo; these tests run where they exist (Sasha's machine).
const HYP = '/Users/sashatoyz/Documents/ClaudeCode/Projects/GSD-BRAND/clients/sasha/audience-hypothesis';
const POS = `${HYP}/ugly/BAZA-POZICIY.md`;
const STORIES = '/Users/sashatoyz/Documents/Vault/Работа/Карусели/База историй и пруфов.md';
const PROB = `${HYP}/problems`;
const have = (p: string) => fs.existsSync(p);
const json = (f: string) => JSON.parse(fs.readFileSync(`${PROB}/${f}`, 'utf8'));

test('позиции: 114, A17 / B48 / C49, ядро 46, топ 15', { skip: !have(POS) }, () => {
  const all = parsePositions(fs.readFileSync(POS, 'utf8'));
  const graded = all.filter((e) => e.grade);
  assert.equal(graded.length, 114);
  assert.deepEqual(['A', 'B', 'C'].map((g) => graded.filter((e) => e.grade === g).length), [17, 48, 49]);
  assert.equal(graded.filter((e) => e.flags.includes('core')).length, 46);
  assert.equal(graded.filter((e) => e.flags.includes('top')).length, 15);
  assert.equal(new Set(graded.map((e) => e.code)).size, 114);
  const z4 = graded.find((e) => e.code === 'Z4')!;
  assert.equal(z4.group, 'Не залетает и винит себя');
  assert.ok(z4.quote?.includes('Первый кадр'));
  assert.ok(z4.flags.includes('consent')); // «Цифры Стаса согласовать»
  assert.ok(all.some((e) => e.title === 'Не использовать как пруф' && e.warnings));
});

test('истории: 149 записей с буквенными номерами, справка с предупреждениями', { skip: !have(STORIES) }, () => {
  const all = parseStories(fs.readFileSync(STORIES, 'utf8'));
  const stories = all.filter((e) => !e.flags.includes('reference'));
  assert.equal(stories.length, 149);
  assert.ok(['1а', '1б', '46в', '136в', '137'].every((c) => stories.some((e) => e.code === c)));
  assert.ok(stories.every((e) => e.flags.includes('used') || e.flags.includes('unused')));
  const refs = all.filter((e) => e.flags.includes('reference')).map((e) => e.title);
  assert.ok(refs.includes('Расхождения в цифрах'));
  assert.ok(refs.some((t) => t.startsWith('Чужие кейсы')));
});

test('проблемы: комментарии по портретам, голос, 35 пересечений', { skip: !have(PROB) }, () => {
  const all = parseProblems(json('problems.json'), json('problems-voice.json'), json('mapping.json'));
  const comments = all.filter((e) => e.flags.includes('comments'));
  const voice = all.filter((e) => e.flags.includes('voice'));
  assert.equal(comments.length, 47);
  assert.equal(voice.length, 78);
  assert.equal(comments.filter((e) => e.group === 'Боится выложить').length, 9);
  assert.equal(voice.filter((e) => e.group === 'Хороший эксперт без денег (ЭБД)').length, 12);
  assert.equal(voice.filter((e) => e.flags.includes('overlap')).length, 35);
  assert.ok(all.some((e) => e.code === 'BV.0') && all.some((e) => e.code === 'K1.0'));
});

test('согласие клиента: кириллица и падежи', () => {
  assert.equal(needsConsent('Цифры Стаса согласовать'), true);
  assert.equal(needsConsent('кейс Льва: до/после'), true);
  assert.equal(needsConsent('Стасик'), false);
  assert.equal(needsConsent('левый край и лев в зоопарке'), false);
  assert.equal(needsConsent('Катя, кондитеры'), true);
});

test('редакция для Дани', () => {
  assert.equal(redactText('пиши @makhabbat.pr или mail@x.ru, +7 912 345-67-89'), 'пиши [ник] или [почта], [телефон]');
  assert.equal(redactText('донор @osybvideo ×29,6', ['@osybvideo']), 'донор @osybvideo ×29,6');
  assert.equal(redactText('«цитата» (Леонид 02.10, 00:00:52)'), '«цитата» (клиент 02.10, 00:00:52)');
  assert.equal(redactText('сентябрь 1 869 790, tg 6013902004'), 'сентябрь 1 869 790, tg [id]');
  assert.equal(redactText('t.me/sashatoyz/1630'), '[ссылка]');
  assert.equal(anonymousWho('Махаббат @makhabbat.pr (не купила)'), 'не купила');
  assert.equal(anonymousWho('Волеслав'), 'участник');

  const base: LibraryEntry = {
    id: 'problem:BV.0', base: 'problem', code: 'BV.0', title: 't', grade: null, group: 'g',
    body: '> «текст» (Махаббат @makhabbat.pr (не купила))', quote: 'текст', source: null, warnings: null, flags: ['voice'],
    usedIn: null, visibility: 'all', sort: 1, updatedBy: 'import', updatedAt: '',
    extra: { quotes: [{ who: 'Махаббат @makhabbat.pr (не купила)', text: 'текст', source: 'dwy_leads #58' }] },
  };
  const d = forDanya(base)!;
  assert.equal(d.body, '> «текст» (не купила)');
  assert.deepEqual(d.extra.quotes, [{ who: 'не купила', text: 'текст', source: null }]);
  assert.equal(forDanya({ ...base, visibility: 'sasha' }), null);
  const counted = forDanya({ ...base, body: '**Покупали:** оценка ~8 (Бобров, Никита, alkuz_fit1)\n**Сколько:** ~12 (ветка natalie_onlineng)', extra: { buyersEst: 'оценка ~8 (Бобров)' } })!;
  assert.equal(counted.body, '**Покупали:** оценка ~8\n**Сколько:** ~12');
  assert.equal(counted.extra.buyersEst, 'оценка ~8');

  // speaker names (with case endings) are gone everywhere in Danya's view; Саша stays
  const names = personNames([base, { ...base, extra: { quotes: [{ who: 'Женя @x (т3)', text: 'q' }, { who: 'Саша', text: 'q' }] } }]);
  assert.ok(names.includes('Махаббат') && names.includes('Женя') && names.includes('Стас') && !names.includes('Саша'));
  const named = forDanya(
    { ...base, base: 'story', body: 'кейс Жени и Женей, Стаса; Саша заплатил; Женька', extra: { screen: 'Кейсы/Женя (рилс).jpg', note: 'донор @osybvideo, лид @lead1' } },
    { names, handles: ['@osybvideo'] },
  )!;
  assert.equal(named.body, 'кейс [имя] и [имя], [имя]; Саша заплатил; Женька');
  assert.deepEqual(named.extra, { screen: 'Кейсы/[имя] (рилс).jpg', note: 'донор @osybvideo, лид [ник]' });
});

test('фильтры библиотеки', () => {
  const e = (p: Partial<LibraryEntry>): LibraryEntry => ({
    id: 'x', base: 'position', code: 'Z1', title: 'Казино', grade: 'C', group: 'Не залетает', body: '', quote: null, source: null,
    warnings: null, flags: [], usedIn: null, visibility: 'all', extra: {}, sort: 0, updatedBy: 'import', updatedAt: '', ...p,
  });
  const list = [e({ id: 'a', flags: ['core'] }), e({ id: 'b', grade: 'A', title: 'Первые 3 секунды' }), e({ id: 'c', base: 'story', flags: ['unused'] })];
  assert.deepEqual(filterLibrary(list, { base: 'position', core: true }).map((x) => x.id), ['a']);
  assert.deepEqual(filterLibrary(list, { grade: 'A' }).map((x) => x.id), ['b']);
  assert.deepEqual(filterLibrary(list, { q: 'секунды' }).map((x) => x.id), ['b']);
  assert.deepEqual(filterLibrary(list, { unused: true }).map((x) => x.id), ['c']);
});
