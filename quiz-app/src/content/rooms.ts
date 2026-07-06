// ─────────────────────────────────────────────────────────────
// Кабинет = одно пространство для всех. Список ВСЕХ разделов, которые
// человек видит, открыт у него доступ или нет.
//
//   role = null  → бесплатный раздел, открыт всегда.
//   role = 'mk' | 'sync' | 'group' → платный: открыт, если есть активный
//                  доступ; иначе показан ЗАКРЫТЫМ — просто «это есть, но
//                  закрыто», без цен и продажи.
//
// Кабинет НЕ продаёт. Если человек хочет закрытый раздел — клик уводит его
// на landingUrl (продающий лендинг продукта). Цены/офферы живут там, не тут.
//
// Открытый раздел рисует materials (url:'' = «скоро»).
// Саша наполняет ссылки прямо здесь, в одном файле.
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
  /** материалы открытого раздела */
  materials: RoomMaterial[];
  /** куда вести, если раздел закрыт и человек хочет его получить (лендинг продукта) */
  landingUrl?: string;
}

export const SECTIONS: Section[] = [
  {
    key: 'free',
    role: null,
    title: 'Бесплатные материалы',
    subtitle: 'Статьи, подкасты, разборы — открыто всем',
    materials: [
      { kind: 'article', title: 'Статьи', url: 'https://thesashatoyz.com/blog', note: 'Лонгриды и разборы.' },
      { kind: 'podcast', title: 'Подкаст «По чесноку»', url: 'https://thesashatoyz.com/podcast', note: 'Все выпуски.' },
    ],
  },
  {
    key: 'mk',
    role: 'mk',
    title: 'Разрешение быстрых денег',
    subtitle: 'Мастер-класс · 7 дней',
    landingUrl: 'https://thesashatoyz.com/mk-dengi',
    materials: [
      { kind: 'live', title: 'Прямой эфир', url: '', note: 'Ссылка на встречу. Появится перед стартом.' },
      { kind: 'recording', title: 'Записи встреч', url: '', note: 'Все записи остаются у тебя.' },
      { kind: 'slides', title: 'Презентация', url: '', note: 'Материалы и слайды мастер-класса.' },
      { kind: 'chat', title: 'Чат группы', url: '', note: 'Закрытый чат на время мастер-класса.' },
    ],
  },
  {
    key: 'uroven',
    role: 'uroven',
    title: 'Новый уровень контента',
    subtitle: '6 уровней навыка · доступ с 1 августа',
    landingUrl: 'https://thesashatoyz.com/uroven',
    materials: [
      { kind: 'recording', title: 'Предобучение: библиотека воркшопов', url: 'https://kabinet.thesashatoyz.com/w', note: 'Прошлые воркшопы и мини-курс — доступны сразу.' },
      { kind: 'recording', title: 'Видеоуроки по 6 уровням', url: '', note: 'Откроются 1 августа.' },
      { kind: 'slides', title: 'Методички и задания', url: '', note: 'Материалы к каждому уровню.' },
      { kind: 'chat', title: 'Чат с обратной связью', url: '', note: 'Тарифы 2 и 3. Откроется перед стартом.' },
      { kind: 'live', title: 'Групповые созвоны', url: '', note: 'Тарифы 2 и 3. Расписание перед стартом.' },
    ],
  },
  {
    key: 'sync',
    role: 'sync',
    title: 'Синхронизация',
    subtitle: 'Личное сопровождение',
    landingUrl: '', // TODO Саша: лендинг продукта Синхронизация
    materials: [
      { kind: 'live', title: 'Созвоны', url: '', note: 'Регулярные личные встречи.' },
      { kind: 'chat', title: 'Личный чат', url: '', note: 'Связь между встречами.' },
    ],
  },
  {
    key: 'group',
    role: 'group',
    title: 'Группа',
    subtitle: 'Групповая работа',
    landingUrl: '', // TODO Саша: лендинг продукта Группа
    materials: [
      { kind: 'live', title: 'Групповые созвоны', url: '', note: 'Еженедельные встречи группы.' },
      { kind: 'chat', title: 'Чат группы', url: '', note: 'Рабочий чат участников.' },
    ],
  },
];
