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

export const LICHNOE: LichnyMaterial[] = [];

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
