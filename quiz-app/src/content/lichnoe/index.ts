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

import { LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_04 } from './lichnyy-sozvon-evgeniya-2026-09-04';

import { LICHNOE_LICHNYY_SOZVON_DANIEL_2026_09_07 } from './lichnyy-sozvon-daniel-2026-09-07';

import { LICHNOE_LICHNYY_SOZVON_AZAMAT_2026_09_08 } from './lichnyy-sozvon-azamat-2026-09-08';

import { LICHNOE_LICHNYY_SOZVON_MOVLATGIREI_2026_09_11 } from './lichnyy-sozvon-movlatgirei-2026-09-11';

import { LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_11 } from './lichnyy-sozvon-evgeniya-2026-09-11';

export interface LichnyMaterial {
  slug: string;
  /** Кому виден материал. Telegram id, ничего кроме них не открывает доступ. */
  telegramIds: number[];
  /** Чей это созвон. Уходит только не-владельцу карточки: клиенту своё имя ни к чему. */
  client: string;
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
    slug: 'lichnyy-sozvon-evgeniya-2026-09-11',
    telegramIds: [934091008, 788334680],
    client: "Женя Сокольчик",
    title: "Личный созвон 11 сентября",
    subtitle: "Кейсы на финишной прямой, ракурс статьи-конвертера и эксперимент с монтажом по таймеру",
    date: '2026-09-11',
    duration: "40 мин",
    tags: ["кейсы", "контент", "монтаж", "анкета"],
    kinescopeId: 'mY3eDygLMxs4h5AaPJCedo',
    html: LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_11,
  },
  {
    slug: 'lichnyy-sozvon-movlatgirei-2026-09-11',
    telegramIds: [700694308, 788334680],
    client: "Мовлатгирей Костоев",
    title: "Собираем оффер «Хозяин голоса»",
    subtitle: "Выбрали сегмент: хоббисты, 70% твоих денег. Назвали программу, разобрали, что писать текстом, и что делать с базой из шестидесяти человек",
    date: '2026-09-11',
    duration: "54 мин",
    tags: ["оффер", "контент", "база"],
    kinescopeId: 'tcfv9Bgr6c2WCxkcXB2Rgc',
    html: LICHNOE_LICHNYY_SOZVON_MOVLATGIREI_2026_09_11,
  },
  {
    slug: 'lichnyy-sozvon-azamat-2026-09-08',
    telegramIds: [176922773, 788334680],
    client: "Азамат Гимаев",
    title: "Личный созвон: созвоны, эмоции и сегмент",
    subtitle: "Почему созвоны не закрываются, как перестать отпускать на «подумаю» и с какого сегмента начинаем контент",
    date: '2026-09-08',
    duration: "61 мин",
    tags: ["созвоны", "продажи", "сегмент"],
    kinescopeId: 'aH6nQcsPm3TqcwSbDRNQ5g',
    html: LICHNOE_LICHNYY_SOZVON_AZAMAT_2026_09_08,
  },
  {
    slug: 'lichnyy-sozvon-daniel-2026-09-07',
    telegramIds: [397715074, 788334680],
    client: 'Даниэл Осипов',
    title: "Собираем оффер под корпоративы",
    subtitle: "Твои этапы работы это и есть продукт. Плюс вопрос про бюджет в анкету и проблемы клиента как источник денег.",
    date: '2026-09-07',
    duration: "75 мин",
    tags: ["оффер", "корпоративы", "контент"],
    kinescopeId: 'icuMB5Z1rZGHu5QmiL4uEa',
    html: LICHNOE_LICHNYY_SOZVON_DANIEL_2026_09_07,
  },
  {
    slug: 'lichnyy-sozvon-evgeniya-2026-09-04',
    telegramIds: [934091008, 788334680],
    client: 'Женя Сокольчик',
    title: "Личный созвон 4 сентября",
    subtitle: "Первая продажа на новом чеке, отстройка через травмы и задачи на неделю",
    date: '2026-09-04',
    duration: "72 мин",
    tags: ["созвон", "кейсы", "контент", "позиционирование"],
    kinescopeId: 'gudD6LY6DwXGX7AdK4KGte',
    html: LICHNOE_LICHNYY_SOZVON_EVGENIYA_2026_09_04,
  },
  {
    slug: 'lichnyy-sozvon-evgeniya-2026-08-28',
    // Саша видит свои же созвоны: это его записи, он их и вёл.
    telegramIds: [934091008, 788334680],
    client: 'Женя Сокольчик',
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
    client: 'Константин Бобров',
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
    client: 'Дарья Басина',
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
export type LichnyCard = Omit<LichnyMaterial, 'html' | 'telegramIds' | 'client'> & {
  hasVideo: boolean;
  /** Имя клиента. Приходит только тому, кто смотрит чужой материал, то есть Саше. */
  client?: string;
};

/**
 * Владелец материала это первый telegram id в списке: тот, для кого созвон.
 * Остальным (Саше) карточка отдаёт имя клиента, иначе список из пяти «личных
 * созвонов» не различить. Сам клиент своё имя на карточке не видит.
 */
export function toCard(m: LichnyMaterial, viewerId?: number): LichnyCard {
  const { html: _html, telegramIds, client, ...rest } = m;
  void _html;
  const isOwner = viewerId !== undefined && telegramIds[0] === viewerId;
  return { ...rest, hasVideo: !!m.kinescopeId, ...(isOwner ? {} : { client }) };
}
