// ─────────────────────────────────────────────────────────────
// Нейронки — раздел кабинета для тарифов 2 и 3 «Нового уровня контента».
//
// Один материал = запись экрана (Kinescope) + конспект по таймкодам:
// как своими руками собрать через нейронку то, за что обычно платят
// подрядчику. Конспект лежит рядом отдельным модулем (генерируется из
// ARTICLE.html в GSD-BRAND скриптом neyronki-to-ts.mjs).
//
// Добавить новый материал: сгенерировать модуль с HTML, импортировать,
// дописать запись в NEYRONKI. Новые сверху.
// ─────────────────────────────────────────────────────────────

import { SAIT_CHEREZ_CLAUDE_2026_09_16 } from './sait-cherez-claude-2026-09-16';

/** Минимальный тариф «Нового уровня контента», с которого открыты нейронки. */
export const NEYRONKI_MIN_TIER = 2;
export const NEYRONKI_ROLE = 'uroven';

export interface Neyronka {
  slug: string;
  title: string;
  /** одна строка: что человек умеет после просмотра */
  subtitle: string;
  /** дата записи, ISO — для сортировки и подписи */
  date: string;
  /** длительность записи, человекочитаемо */
  duration: string;
  /** метки: инструмент, задача */
  tags: string[];
  /** Kinescope embed slug. Пусто = записи ещё нет, показываем только конспект. */
  kinescopeId: string;
  /** полный HTML-документ конспекта, рендерится в iframe */
  html: string;
}

export const NEYRONKI: Neyronka[] = [
  {
    slug: 'sait-cherez-claude-2026-09-16',
    title: 'Лендинг: от оффера до своего домена',
    subtitle: 'Оффер превращаем в страницу в интернете, заявки с неё падают в телеграм. Без программиста и дизайнера',
    date: '2026-09-16',
    duration: '60 мин',
    tags: ['Claude', 'лендинг', 'Telegram-бот', 'хостинг'],
    kinescopeId: '',
    html: SAIT_CHEREZ_CLAUDE_2026_09_16,
  },
];

export function findNeyronka(slug: string): Neyronka | undefined {
  return NEYRONKI.find((n) => n.slug === slug);
}

/** Карточка для списка: всё, кроме тяжёлого HTML. */
export type NeyronkaCard = Omit<Neyronka, 'html'> & { hasVideo: boolean };

export function toCard(n: Neyronka): NeyronkaCard {
  const { html: _html, ...rest } = n;
  void _html;
  return { ...rest, hasVideo: !!n.kinescopeId };
}
