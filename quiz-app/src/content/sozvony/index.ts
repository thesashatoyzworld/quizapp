// ─────────────────────────────────────────────────────────────
// Групповые созвоны — раздел кабинета для тарифов 2 и 3 «Нового уровня контента».
//
// Один созвон = запись встречи (Kinescope) + конспект по таймкодам.
// Конспект лежит рядом отдельным модулем (генерируется из KONSPEKT.html
// в GSD-BRAND/clients/sasha/sozvony/<дата>/). Здесь только метаданные и сборка.
//
// Добавить созвон: сгенерировать модуль с HTML, импортировать,
// дописать запись в SOZVONY. Новые сверху.
// ─────────────────────────────────────────────────────────────

import { SOZVON_2026_08_03 } from './2026-08-03';

/** Минимальный тариф «Нового уровня контента», с которого открыты созвоны. */
export const SOZVONY_MIN_TIER = 2;
export const SOZVONY_ROLE = 'uroven';

export interface Sozvon {
  slug: string;
  title: string;
  /** одна строка: о чём была встреча */
  subtitle: string;
  /** дата созвона, ISO — для сортировки и подписи */
  date: string;
  /** длительность записи, человекочитаемо */
  duration: string;
  /** метки: темы встречи */
  tags: string[];
  /** кто разбирался на встрече */
  participants: string[];
  /** Kinescope embed slug. Пусто = записи ещё нет, показываем только конспект. */
  kinescopeId: string;
  /** полный HTML-документ конспекта, рендерится в iframe */
  html: string;
}

export const SOZVONY: Sozvon[] = [
  {
    slug: '2026-08-03',
    title: 'Оффер на бесплатный созвон и как перестать откладывать контент',
    subtitle: 'Что писать в оффере на консультацию, зачем две карусели вместо одной и почему скрипт продаж мешает продавать',
    date: '2026-08-03',
    duration: '65 мин',
    tags: ['оффер на консультацию', 'контент', 'продающий созвон', 'цена и ценность'],
    participants: ['Степан', 'Азамат', 'Аня', 'Наталья'],
    kinescopeId: 'jAz4xRSGJx6P7yFB45Xi9a',
    html: SOZVON_2026_08_03,
  },
];

export function findSozvon(slug: string): Sozvon | undefined {
  return SOZVONY.find((s) => s.slug === slug);
}

/** Карточка для списка: всё, кроме тяжёлого HTML. */
export type SozvonCard = Omit<Sozvon, 'html'> & { hasVideo: boolean };

export function toCard(s: Sozvon): SozvonCard {
  const { html: _html, ...rest } = s;
  void _html;
  return { ...rest, hasVideo: !!s.kinescopeId };
}
