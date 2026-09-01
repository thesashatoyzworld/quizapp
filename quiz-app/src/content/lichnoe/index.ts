// ─────────────────────────────────────────────────────────────
// Личное — персональные материалы: записи личных созвонов с конспектами.
//
// Отличие от «Разборов»: там гейт по тарифу (все со 2-3 видят всё), здесь
// гейт по конкретному человеку. Материал виден только тем telegram id,
// которые перечислены в telegramIds. Ни тариф, ни роль не открывают чужое.
//
// Добавить материал: сгенерировать модуль с HTML (из KONSPEKT.html скриптом
// publish-lichnoe.mjs в GSD-BRAND), импортировать, дописать запись. Новые сверху.
// ─────────────────────────────────────────────────────────────

import { LICHNOE_LICHNYY_SOZVON_2026_08_05 } from './lichnyy-sozvon-2026-08-05';

import { LICHNOE_LICHNYY_SOZVON_KONSTANTIN_2026_08_05 } from './lichnyy-sozvon-konstantin-2026-08-05';

import { LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_08_28 } from './lichnyy-sozvon-evgeniya-2026-08-28';

export interface LichnyMaterial {
  slug: string;
  /** Кому виден материал. Telegram id, ничего кроме них не открывает доступ. */
  telegramIds: number[];
  title: string;
  /** одна строка: о чём созвон */
  subtitle: string;
  /** дата, ISO — для сортировки и подписи */
  date: string;
  /** длительность записи, человекочитаемо */
  duration: string;
  /** метки: что разбирали */
  tags: string[];
  /** Kinescope embed slug. Пусто = записи ещё нет, показываем только конспект. */
  kinescopeId: string;
  /** полный HTML-документ конспекта, рендерится в iframe */
  html: string;
}

export const LICHNOE: LichnyMaterial[] = [
  {
    slug: 'lichnyy-sozvon-evgeniya-2026-08-28',
    // Саша видит свои же созвоны: это его записи, он их и вёл.
    telegramIds: [934091008, 788334680],
    title: "Личный созвон 28 августа",
    subtitle: "Оффер на созвон, база тех, кто уже касался, и кейсы через ситуацию",
    date: '2026-08-28',
    duration: "93 мин",
    tags: ["оффер", "база", "кейсы", "контент"],
    kinescopeId: 'k3R8boFcRxMWUgc6ZP7wPq',
    html: LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_08_28,
  },
  {
    slug: 'lichnyy-sozvon-konstantin-2026-08-05',
    // Саша (788334680) видит свои же созвоны: это его записи, он их и вёл.
    telegramIds: [309034389, 788334680],
    title: "Что для тебя очевидно, для покупателя козырь",
    subtitle: "Разобрали сегмент, собрали карту из шести смыслов и договорились с чего начинается контент: чужой рабочий заход и пинг-понг",
    date: '2026-08-05',
    duration: "60 мин",
    tags: ["сегмент", "карта смыслов", "пруфы", "форматы"],
    kinescopeId: '8zpLxr4n2EemNKceS82fkj',
    html: LICHNOE_LICHNYY_SOZVON_KONSTANTIN_2026_08_05,
  },
  {
    slug: 'lichnyy-sozvon-2026-08-05',
    telegramIds: [866228378, 788334680],
    title: "Как вытащить себя из круга «почистила, полежала, деньги кончились»",
    subtitle: "Разложили продукты, собрали тарифную сетку 30/60/100 и план: список покупателей, два оффера, две анкеты",
    date: '2026-08-05',
    duration: "63 мин",
    tags: ["тарифы", "офферы", "диагностика", "рассрочка"],
    kinescopeId: 'j36K6FUncUHbkbAMcYVbsD',
    html: LICHNOE_LICHNYY_SOZVON_2026_08_05,
  },
];

/** Материалы, доступные конкретному человеку. */
export function forTelegram(telegramId: number): LichnyMaterial[] {
  return LICHNOE.filter((m) => m.telegramIds.includes(telegramId));
}

/** Найти материал, но только если он принадлежит этому человеку. */
export function findForTelegram(slug: string, telegramId: number): LichnyMaterial | undefined {
  return LICHNOE.find((m) => m.slug === slug && m.telegramIds.includes(telegramId));
}

/** Карточка для списка: всё, кроме тяжёлого HTML и списка получателей. */
export type LichnyCard = Omit<LichnyMaterial, 'html' | 'telegramIds'> & { hasVideo: boolean };

export function toCard(m: LichnyMaterial): LichnyCard {
  const { html: _html, telegramIds: _ids, ...rest } = m;
  void _html;
  void _ids;
  return { ...rest, hasVideo: !!m.kinescopeId };
}
