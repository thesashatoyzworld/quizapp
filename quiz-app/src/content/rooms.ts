// ─────────────────────────────────────────────────────────────
// Контент «комнат» кабинета — что человек видит после оплаты продукта.
//
// Ключ = role из каталога (mk / sync / group / …). Кабинет берёт активные
// доступы человека, находит комнату по role и рисует её материалы.
//
// Ссылки с url:'' показываются как «появится перед стартом» (заглушка) —
// Саша вставляет реальные эфир/записи/презу/чат сюда, в один файл.
// ─────────────────────────────────────────────────────────────

export type MaterialKind = 'live' | 'recording' | 'slides' | 'chat' | 'link';

export interface RoomMaterial {
  kind: MaterialKind;
  title: string;
  /** пусто = ещё не готово, показываем заглушку */
  url: string;
  note?: string;
}

export interface Room {
  role: string;
  title: string;
  subtitle: string;
  materials: RoomMaterial[];
}

export const ROOMS: Record<string, Room> = {
  mk: {
    role: 'mk',
    title: 'Разрешение быстрых денег',
    subtitle: 'Мастер-класс · 7 дней',
    materials: [
      {
        kind: 'live',
        title: 'Прямой эфир',
        url: '', // TODO Саша: ссылка на Zoom-эфир
        note: 'Ссылка на встречу. Появится здесь перед стартом.',
      },
      {
        kind: 'recording',
        title: 'Записи встреч',
        url: '', // TODO Саша: ссылка на записи
        note: 'Все записи остаются у тебя. Добавляются после каждой встречи.',
      },
      {
        kind: 'slides',
        title: 'Презентация',
        url: '', // TODO Саша: ссылка на презу
        note: 'Материалы и слайды мастер-класса.',
      },
      {
        kind: 'chat',
        title: 'Чат группы',
        url: '', // TODO Саша: invite-ссылка на чат когорты
        note: 'Закрытый чат на время мастер-класса.',
      },
    ],
  },
};

export function getRoom(role: string): Room | null {
  return ROOMS[role] || null;
}
