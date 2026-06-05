// ─────────────────────────────────────────────────────────────
// Кабинет = одно пространство для всех. Список ВСЕХ разделов, которые
// человек видит, открыт у него доступ или нет.
//
//   role = null  → бесплатный раздел, открыт всегда.
//   role = 'mk' | 'sync' | 'group' → платный: открыт, если есть активный
//                  доступ с этой ролью; иначе показан под замком (витрина).
//
// Открытый раздел рисует materials (url:'' = «скоро»).
// Замкнутый раздел рисует lockedPreview («что внутри») + кнопку покупки.
// Саша наполняет ссылки/превью прямо здесь, в одном файле.
// ─────────────────────────────────────────────────────────────

export type MaterialKind = 'live' | 'recording' | 'slides' | 'chat' | 'article' | 'podcast' | 'link';

export interface RoomMaterial {
  kind: MaterialKind;
  title: string;
  url: string; // пусто = «скоро»
  note?: string;
}

export interface Section {
  key: string;
  role: string | null; // null = бесплатно (открыто всем)
  title: string;
  subtitle: string;
  /** плашка справа сверху: «Открыто» / «10 000 ₽ / мес» */
  badge: string;
  /** материалы открытого раздела */
  materials: RoomMaterial[];
  /** что внутри — буллеты для замкнутого раздела */
  lockedPreview?: string[];
  /** кнопка покупки для замкнутого раздела */
  lockedCta?: { text: string; href: string };
}

const BOT = 'https://t.me/testtoyzbot';

export const SECTIONS: Section[] = [
  {
    key: 'free',
    role: null,
    title: 'Бесплатные материалы',
    subtitle: 'Статьи, подкасты, разборы — открыто всем',
    badge: 'Открыто',
    materials: [
      { kind: 'article', title: 'Статьи', url: '', note: 'Лонгриды и разборы. Скоро добавим.' },
      { kind: 'podcast', title: 'Подкаст «По чесноку»', url: '', note: 'Выпуски подкаста. Скоро добавим.' },
    ],
  },
  {
    key: 'mk',
    role: 'mk',
    title: 'Разрешение быстрых денег',
    subtitle: 'Мастер-класс · 7 дней',
    badge: '4 884 ₽',
    materials: [
      { kind: 'live', title: 'Прямой эфир', url: '', note: 'Ссылка на встречу. Появится перед стартом.' },
      { kind: 'recording', title: 'Записи встреч', url: '', note: 'Все записи остаются у тебя.' },
      { kind: 'slides', title: 'Презентация', url: '', note: 'Материалы и слайды мастер-класса.' },
      { kind: 'chat', title: 'Чат группы', url: '', note: 'Закрытый чат на время мастер-класса.' },
    ],
    lockedPreview: [
      '7 дней практики на живых встречах',
      'Записи всех встреч остаются у тебя',
      'Закрытый чат группы',
    ],
    lockedCta: { text: 'Участвовать · 4 884 ₽', href: `${BOT}?start=mk_dengi` },
  },
  {
    key: 'sync',
    role: 'sync',
    title: 'Синхронизация',
    subtitle: 'Личное сопровождение',
    badge: '10 000 ₽ / мес',
    materials: [
      { kind: 'live', title: 'Созвоны', url: '', note: 'Регулярные личные встречи.' },
      { kind: 'chat', title: 'Личный чат', url: '', note: 'Связь между встречами.' },
    ],
    lockedPreview: [
      'Регулярные личные созвоны',
      'Разбор твоих задач вживую',
      'Доступ к закрытым материалам',
    ],
    lockedCta: { text: 'Оформить · 10 000 ₽/мес', href: `${BOT}?start=mk_sync` },
  },
  {
    key: 'group',
    role: 'group',
    title: 'Группа',
    subtitle: 'Групповая работа',
    badge: '10 000 ₽ / нед',
    materials: [
      { kind: 'live', title: 'Групповые созвоны', url: '', note: 'Еженедельные встречи группы.' },
      { kind: 'chat', title: 'Чат группы', url: '', note: 'Рабочий чат участников.' },
    ],
    lockedPreview: [
      'Еженедельные групповые созвоны',
      'Рабочий чат участников',
      'Совместные разборы',
    ],
    lockedCta: { text: 'Вступить · 10 000 ₽/нед', href: `${BOT}?start=mk_group` },
  },
];
