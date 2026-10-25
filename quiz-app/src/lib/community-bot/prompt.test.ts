import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSystem } from './prompt';
import { buildMap, materialText } from '@/lib/kb/map';

test('в промпте есть справка: предобучение, карта оффера, Нейронки', () => {
  const s = buildSystem();
  assert.match(s, /Предобучение/);
  assert.match(s, /Карта оффера/);
  assert.match(s, /«Нейронки»/);
  assert.match(s, /Оффер: карта на \$3000/);
});

test('справка вошла в карту kb-бота отдельным разделом', () => {
  const guide = buildMap().filter((e) => e.section === 'guide');
  const slugs = guide.map((e) => e.slug);
  for (const slug of ['predobuchenie', 'karta-offera', 'neyronki']) assert.ok(slugs.includes(slug), slug);
  const karta = guide.find((e) => e.slug === 'karta-offera')!;
  assert.equal(karta.external, true); // ведёт в библиотеку воркшопов
  assert.match(materialText(karta), /скелет оффера/);
});

test('в справке нет длинного тире', () => {
  for (const e of buildMap().filter((x) => x.section === 'guide')) {
    assert.doesNotMatch(materialText(e), /—/, e.slug);
  }
});
