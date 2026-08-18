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
  /** материал доступен только с этого тарифа продукта и выше; ниже — показан под замком */
  minTier?: number;
  /** подпись под замком, если тариф ниже minTier (что и на каком тарифе доступно) */
  lockedNote?: string;
  /** заголовок-разделитель, рисуется ПЕРЕД этим материалом (группировка внутри раздела) */
  subhead?: string;
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
  /**
   * Персональный раздел: показывается только тем, у кого личные материалы есть
   * (rooms-эндпоинт отдаёт hasPersonal). Остальным его в кабинете нет вовсе —
   * ни открытым, ни под замком.
   */
  personal?: boolean;
  /**
   * Раздел с маршрутной картой: показывается только тем, чья карта открыта
   * Сашей (rooms-эндпоинт отдаёт hasRoadmap). Остальным его в кабинете нет.
   */
  roadmap?: boolean;
}

export const SECTIONS: Section[] = [
  {
    key: 'karta',
    role: null,
    roadmap: true,
    title: 'Карта',
    subtitle: 'Где ты сейчас и что делаем дальше',
    materials: [
      { kind: 'article', title: 'Твоя маршрутная карта', url: '/karta', note: 'Цель периода, пройденный путь и шаги на эту неделю. Отмечай сделанное — я вижу.' },
    ],
  },
  {
    key: 'lichnoe',
    role: null,
    personal: true,
    title: 'Личное',
    subtitle: 'Твои личные созвоны — видишь только ты',
    materials: [
      { kind: 'live', title: 'Записи личных созвонов', url: '/lichnoe', note: 'Видео встреч и конспект по таймкодам: что решили и что делать дальше.' },
    ],
  },
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
    key: 'uroven',
    role: 'uroven',
    title: 'Новый уровень контента',
    subtitle: '6 уровней навыка · доступ с 7 августа',
    landingUrl: 'https://thesashatoyz.com/uroven',
    materials: [
      { kind: 'recording', title: 'Формула вирусного контента', url: '/formula', note: 'Полный видеокурс по контенту — 25 уроков.', subhead: 'Предобучение · доступно сразу' },
      { kind: 'recording', title: 'Продающий Контент 3.0', url: 'https://kabinet.thesashatoyz.com/w/prodayushchiy-kontent-3', note: 'Мастеркласс + методичка: карта смыслов и 4 способа упаковки.' },
      { kind: 'recording', title: 'Видеоуроки по 6 уровням', url: '/kurs', note: 'Запись каждого урока плюс тот же разбор текстом, с картинками и интерактивами.', subhead: 'Основной курс' },
      { kind: 'link', title: 'Промпты', url: '/prompty', note: 'Семь инструментов к урокам: копируешь в нейронку и отвечаешь голосовыми. Работать лучше в Claude.' },
      { kind: 'link', title: 'Поток спроса', url: '/potok', note: 'Как находить заходы, которые уже сработали, и наливать внутрь свой смысл. Методичка и правила для нейронки, нужен компьютер.' },
      { kind: 'slides', title: 'Методички и задания', url: '', note: 'Материалы к каждому уровню.' },
      { kind: 'chat', title: 'Чат с обратной связью', url: '', minTier: 2, lockedNote: 'Доступно на тарифах 2 и 3.' },
      { kind: 'recording', title: 'Библиотека воркшопов', url: 'https://kabinet.thesashatoyz.com/w', note: 'Все прошлые воркшопы и мини-курсы.', minTier: 2, lockedNote: 'Доступно на тарифах 2 и 3.', subhead: 'Полная библиотека' },
    ],
  },
  {
    key: 'razbory',
    role: 'uroven',
    title: 'Разборы',
    subtitle: 'Реальные созвоны учеников по шагам',
    landingUrl: 'https://thesashatoyz.com/uroven',
    materials: [
      { kind: 'recording', title: 'Разборы созвонов', url: '/razbory', note: 'Записи и конспекты по таймкодам: что сработало, где посыпалось.', minTier: 2, lockedNote: 'Доступно на тарифах 2 и 3.' },
    ],
  },
  {
    key: 'sozvony',
    role: 'uroven',
    title: 'Групповые созвоны',
    subtitle: 'Записи регулярных встреч группы',
    landingUrl: 'https://thesashatoyz.com/uroven',
    materials: [
      { kind: 'live', title: 'Записи созвонов', url: '/sozvony', note: 'Видео встреч и конспекты по таймкодам: что разбирали и что делать дальше.', minTier: 2, lockedNote: 'Доступно на тарифах 2 и 3.' },
    ],
  },
  {
    key: 'sync',
    role: 'sync',
    title: 'Синхронизация',
    subtitle: 'Личное сопровождение',
    landingUrl: '', // TODO Саша: лендинг продукта Синхронизация
    materials: [
      { kind: 'recording', title: 'Библиотека воркшопов', url: 'https://kabinet.thesashatoyz.com/w', note: 'Все воркшопы и мини-курсы — доступны полностью.' },
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
