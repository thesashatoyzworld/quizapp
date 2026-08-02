// ─────────────────────────────────────────────────────────────
// Разборы — раздел кабинета для тарифов 2 и 3 «Нового уровня контента».
//
// Один разбор = запись (Kinescope) + текстовый конспект по таймкодам.
// Конспект лежит рядом отдельным модулем (генерируется из RAZBOR.html
// в GSD-BRAND скриптом html2ts). Здесь только метаданные и сборка.
//
// Добавить новый разбор: сгенерировать модуль с HTML, импортировать,
// дописать запись в RAZBORY. Новые сверху.
// ─────────────────────────────────────────────────────────────

import { PRODAYUSHCHIY_SOZVON_2026_08_02 } from './prodayushchiy-sozvon-2026-08-02';

/** Минимальный тариф «Нового уровня контента», с которого открыты разборы. */
export const RAZBORY_MIN_TIER = 2;
export const RAZBORY_ROLE = 'uroven';

export interface Razbor {
  slug: string;
  title: string;
  /** одна строка: что именно разбирается */
  subtitle: string;
  /** дата разбора, ISO — для сортировки и подписи */
  date: string;
  /** длительность записи, человекочитаемо */
  duration: string;
  /** метки: ниша, тип разбора */
  tags: string[];
  /** Kinescope embed slug. Пусто = записи ещё нет, показываем только конспект. */
  kinescopeId: string;
  /** полный HTML-документ конспекта, рендерится в iframe */
  html: string;
}

export const RAZBORY: Razbor[] = [
  {
    slug: 'prodayushchiy-sozvon-2026-08-02',
    title: 'Продающий созвон: где посыпалась продажа',
    subtitle: 'Бесплатная диагностика фитнес-тренера. Клиент ушёл думать, разбираем почему',
    date: '2026-08-02',
    duration: '63 мин',
    tags: ['продающий созвон', 'диагностика', 'работа с возражениями'],
    kinescopeId: '',
    html: PRODAYUSHCHIY_SOZVON_2026_08_02,
  },
];

export function findRazbor(slug: string): Razbor | undefined {
  return RAZBORY.find((r) => r.slug === slug);
}

/** Карточка для списка: всё, кроме тяжёлого HTML. */
export type RazborCard = Omit<Razbor, 'html'> & { hasVideo: boolean };

export function toCard(r: Razbor): RazborCard {
  const { html: _html, ...rest } = r;
  void _html;
  return { ...rest, hasVideo: !!r.kinescopeId };
}
