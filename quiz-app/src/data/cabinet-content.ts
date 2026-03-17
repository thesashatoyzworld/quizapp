// Cabinet content data — announcements, calendar events, feed content per archetype

// ═══════════════════════════════════════
// ANNOUNCEMENTS
// ═══════════════════════════════════════

export interface Announcement {
  id: string;
  date: string; // ISO date
  title: string;
  content: string;
  actionText?: string;
  actionUrl?: string;
}

export const announcements: Announcement[] = [
  {
    id: 'ann-1',
    date: '2026-03-15',
    title: 'Запуск личного кабинета',
    content: 'Теперь все ваши материалы, события и рекомендации — в одном месте. Кабинет работает прямо внутри Telegram.',
  },
  {
    id: 'ann-2',
    date: '2026-03-10',
    title: 'Новый мастер-класс: Продающий контент 2.0',
    content: 'Обновлённая версия мастер-класса с новыми кейсами и промптами для нейросетей. Доступен для всех участников.',
    actionText: 'Подробнее',
    actionUrl: '/masterclass',
  },
  {
    id: 'ann-3',
    date: '2026-03-01',
    title: 'Коннекторы: набор в новую группу',
    content: 'Открыт набор в мартовскую группу программы Коннекторы. Осталось 7 мест из 10.',
    actionText: 'Узнать подробности',
    actionUrl: '/connectors',
  },
];

// ═══════════════════════════════════════
// CALENDAR EVENTS
// ═══════════════════════════════════════

export interface CalendarEvent {
  id: string;
  date: string; // ISO datetime
  title: string;
  description: string;
  joinUrl?: string;
  type: 'masterclass' | 'group_call' | 'webinar' | 'deadline';
}

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    date: '2026-03-20T17:00:00+03:00',
    title: 'Групповой созвон: разбор контента',
    description: 'Разберём контент участников в прямом эфире. Подготовьте 2-3 последних поста.',
    joinUrl: 'https://t.me/sashatoyz',
    type: 'group_call',
  },
  {
    id: 'evt-2',
    date: '2026-03-25T18:00:00+03:00',
    title: 'Вебинар: AI-промпты для контента',
    description: 'Покажу как использовать нейросети для создания продающего контента за 15 минут.',
    joinUrl: 'https://t.me/sashatoyz',
    type: 'webinar',
  },
  {
    id: 'evt-3',
    date: '2026-04-01T23:59:00+03:00',
    title: 'Дедлайн: домашнее задание неделя 2',
    description: 'Последний день для сдачи домашнего задания второй недели программы.',
    type: 'deadline',
  },
];

// ═══════════════════════════════════════
// FEED CONTENT PER ARCHETYPE
// ═══════════════════════════════════════

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'tip' | 'exercise' | 'case';
  url?: string;
}

export interface ArchetypeFeed {
  archetype: string;
  archetypeName: string;
  intro: string;
  items: FeedItem[];
}

export const archetypeFeeds: ArchetypeFeed[] = [
  {
    archetype: 'invisible',
    archetypeName: 'Эксперт-невидимка',
    intro: 'Ваша главная задача — стать видимым. Вот материалы, которые помогут сделать первые шаги.',
    items: [
      {
        id: 'inv-1',
        title: 'Как начать вести контент, если страшно',
        description: 'Пошаговый план первых 7 дней. Без стресса и перфекционизма.',
        type: 'article',
      },
      {
        id: 'inv-2',
        title: '5 форматов для старта',
        description: 'Простые форматы контента, которые не требуют показывать лицо.',
        type: 'tip',
      },
      {
        id: 'inv-3',
        title: 'Упражнение: первый пост за 10 минут',
        description: 'Напишите свой первый продающий пост по готовому шаблону.',
        type: 'exercise',
      },
      {
        id: 'inv-4',
        title: 'Кейс: от 0 до 500 подписчиков за месяц',
        description: 'Как фитнес-тренер начал с нуля и вышел на стабильный поток заявок.',
        type: 'case',
      },
    ],
  },
  {
    archetype: 'doer',
    archetypeName: 'Делатель без системы',
    intro: 'Вы уже делаете много — но хаотично. Вот как собрать всё в рабочую систему.',
    items: [
      {
        id: 'doer-1',
        title: 'Почему шаблоны не работают',
        description: 'Разбор главной ошибки: копировать форму без понимания механики.',
        type: 'article',
      },
      {
        id: 'doer-2',
        title: 'Единая механика контента',
        description: '3 элемента, которые превращают хаос в систему.',
        type: 'tip',
      },
      {
        id: 'doer-3',
        title: 'Упражнение: аудит контента',
        description: 'Проверьте последние 10 постов — что работает, что нет.',
        type: 'exercise',
      },
      {
        id: 'doer-4',
        title: 'Кейс: из хаоса в 300к/месяц',
        description: 'Как коуч перестал метаться и выстроил воронку за 2 недели.',
        type: 'case',
      },
    ],
  },
  {
    archetype: 'generous',
    archetypeName: 'Щедрый эксперт',
    intro: 'Вы даёте много пользы, но привлекаете студентов, а не клиентов. Вот как это изменить.',
    items: [
      {
        id: 'gen-1',
        title: 'Почему полезный контент отпугивает клиентов',
        description: 'Парадокс экспертности: чем больше учите — тем меньше покупают.',
        type: 'article',
      },
      {
        id: 'gen-2',
        title: 'Продажа = помощь',
        description: 'Как перестать бояться продавать и начать помогать.',
        type: 'tip',
      },
      {
        id: 'gen-3',
        title: 'Упражнение: трансформация поста',
        description: 'Возьмите обучающий пост и превратите его в продающий за 5 минут.',
        type: 'exercise',
      },
      {
        id: 'gen-4',
        title: 'Кейс: Маша — 2 000 000 за месяц',
        description: 'Как сценарист перешла от бесплатной пользы к системным продажам.',
        type: 'case',
      },
    ],
  },
  {
    archetype: 'unstable',
    archetypeName: 'Нестабильные результаты',
    intro: 'У вас уже получается — но нестабильно. Вот как превратить интуицию в систему.',
    items: [
      {
        id: 'unst-1',
        title: 'Интуиция vs Система',
        description: 'Почему «то густо, то пусто» — это не про лень, а про отсутствие воронки.',
        type: 'article',
      },
      {
        id: 'unst-2',
        title: 'Оцифровка воронки за 30 минут',
        description: 'Простой фреймворк для понимания, где вы теряете деньги.',
        type: 'tip',
      },
      {
        id: 'unst-3',
        title: 'Упражнение: неделя стабильности',
        description: 'План на 7 дней: публикация + анализ + корректировка.',
        type: 'exercise',
      },
      {
        id: 'unst-4',
        title: 'Кейс: от 100к до 500к стабильно',
        description: 'Как Вася-тренер перестал зависеть от настроения.',
        type: 'case',
      },
    ],
  },
  {
    archetype: 'scale',
    archetypeName: 'Готовы к масштабированию',
    intro: 'Контент работает — пора масштабировать. Вот стратегии для следующего уровня.',
    items: [
      {
        id: 'scale-1',
        title: 'Потолок сольной модели',
        description: 'Почему «больше контента» не равно «больше денег».',
        type: 'article',
      },
      {
        id: 'scale-2',
        title: '3 рычага масштабирования',
        description: 'Делегирование, продукты, автоматизация — что выбрать первым.',
        type: 'tip',
      },
      {
        id: 'scale-3',
        title: 'Упражнение: матрица продуктов',
        description: 'Создайте продуктовую линейку из того, что уже есть.',
        type: 'exercise',
      },
      {
        id: 'scale-4',
        title: 'Кейс: от 500к к 1.5М без выгорания',
        description: 'Как эксперт перестал продавать время и начал продавать системы.',
        type: 'case',
      },
    ],
  },
];

// ═══════════════════════════════════════
// CATALOG — all available content (free + paid)
// Used on Materials page to show what's available
// ═══════════════════════════════════════

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'link' | 'telegram_group';
  isFree: boolean;
  /** Product slug — if set, user needs to purchase this product to access */
  productSlug?: string;
  /** Direct URL for free items (paid items get URL from DB) */
  url?: string;
  sortOrder: number;
}

export interface CatalogSection {
  id: string;
  name: string;
  description: string;
  items: CatalogItem[];
}

export const catalogSections: CatalogSection[] = [
  {
    id: 'free-materials',
    name: 'Бесплатные материалы',
    description: 'Начните с этих материалов — они доступны всем',
    items: [
      {
        id: 'free-1',
        title: 'Гайд: 5 ошибок в контенте, которые стоят клиентов',
        description: 'PDF-гайд на 12 страниц с примерами и решениями',
        type: 'pdf',
        isFree: true,
        url: 'https://example.com/free-guide-5-errors.pdf',
        sortOrder: 1,
      },
      {
        id: 'free-2',
        title: 'Чек-лист: продающий пост за 15 минут',
        description: 'Пошаговый чек-лист для создания продающего контента',
        type: 'pdf',
        isFree: true,
        url: 'https://example.com/free-checklist.pdf',
        sortOrder: 2,
      },
      {
        id: 'free-3',
        title: 'Видео: как найти свою нишу',
        description: 'Бесплатный урок из мастер-класса (25 мин)',
        type: 'video',
        isFree: true,
        url: 'https://example.com/free-video-niche.mp4',
        sortOrder: 3,
      },
    ],
  },
  {
    id: 'masterclass-section',
    name: 'Мастер-класс «Продающий контент»',
    description: '5 материалов — видео, PDF, промпты',
    items: [
      {
        id: 'mc-1',
        title: 'Запись мастер-класса',
        description: 'Полная запись эфира (2ч 15мин)',
        type: 'video',
        isFree: false,
        productSlug: 'masterclass',
        sortOrder: 1,
      },
      {
        id: 'mc-2',
        title: 'Презентация мастер-класса',
        description: 'PDF со всеми слайдами',
        type: 'pdf',
        isFree: false,
        productSlug: 'masterclass',
        sortOrder: 2,
      },
      {
        id: 'mc-3',
        title: '3 промпта для нейросетей',
        description: 'Готовые промпты для создания контента',
        type: 'pdf',
        isFree: false,
        productSlug: 'masterclass',
        sortOrder: 3,
      },
      {
        id: 'mc-4',
        title: 'Шаблон «Богатая ЦА»',
        description: 'Бонусный материал для анализа аудитории',
        type: 'pdf',
        isFree: false,
        productSlug: 'masterclass',
        sortOrder: 4,
      },
      {
        id: 'mc-5',
        title: 'Чат участников МК',
        description: 'Telegram группа для обсуждения',
        type: 'telegram_group',
        isFree: false,
        productSlug: 'masterclass',
        sortOrder: 5,
      },
    ],
  },
  {
    id: 'connectors-section',
    name: 'Программа «Коннекторы»',
    description: '12-недельная система для экспертов',
    items: [
      {
        id: 'con-1',
        title: 'Модуль 1: Фундамент',
        description: 'Видеоурок — 45 мин',
        type: 'video',
        isFree: false,
        productSlug: 'connectors-basic',
        sortOrder: 1,
      },
      {
        id: 'con-2',
        title: 'Модуль 2: Контент-система',
        description: 'Видеоурок — 60 мин',
        type: 'video',
        isFree: false,
        productSlug: 'connectors-basic',
        sortOrder: 2,
      },
      {
        id: 'con-3',
        title: 'Модуль 3: Продающий контент',
        description: 'Видеоурок — 50 мин',
        type: 'video',
        isFree: false,
        productSlug: 'connectors-basic',
        sortOrder: 3,
      },
      {
        id: 'con-4',
        title: 'Рабочая тетрадь',
        description: 'PDF с заданиями на 12 недель',
        type: 'pdf',
        isFree: false,
        productSlug: 'connectors-basic',
        sortOrder: 4,
      },
      {
        id: 'con-5',
        title: 'Групповой чат',
        description: 'Telegram группа участников',
        type: 'telegram_group',
        isFree: false,
        productSlug: 'connectors-basic',
        sortOrder: 5,
      },
    ],
  },
];

// ═══════════════════════════════════════
// METODICHKI — step-by-step guides and frameworks
// ═══════════════════════════════════════

export interface Metodichka {
  id: string;
  title: string;
  description: string;
  stepsCount: number;
  estimatedTime: string;
  isFree: boolean;
  /** Product slug — if set, user needs to purchase this product to access */
  productSlug?: string;
  /** Direct URL for free items */
  url?: string;
  tags: string[];
}

export const metodichki: Metodichka[] = [
  {
    id: 'met-1',
    title: 'Первый продающий пост',
    description: 'Пошаговая методичка: от идеи до публикации за 30 минут. Подойдёт даже если вы никогда не писали продающий контент.',
    stepsCount: 7,
    estimatedTime: '30 мин',
    isFree: true,
    url: 'https://example.com/metodichka-first-post.pdf',
    tags: ['контент', 'старт'],
  },
  {
    id: 'met-2',
    title: 'Анализ целевой аудитории',
    description: 'Фреймворк для глубокого понимания вашей аудитории. Кто они, что болит, почему купят.',
    stepsCount: 5,
    estimatedTime: '1 час',
    isFree: true,
    url: 'https://example.com/metodichka-audience.pdf',
    tags: ['аудитория', 'стратегия'],
  },
  {
    id: 'met-3',
    title: 'Контент-план на месяц',
    description: 'Система создания контент-плана, который генерирует заявки. Включает шаблон и 30 идей для постов.',
    stepsCount: 10,
    estimatedTime: '2 часа',
    isFree: false,
    productSlug: 'masterclass',
    tags: ['контент', 'план'],
  },
  {
    id: 'met-4',
    title: 'Продающая воронка в Telegram',
    description: 'Как построить воронку продаж внутри Telegram: от первого касания до оплаты. Пошаговый гайд с примерами.',
    stepsCount: 12,
    estimatedTime: '3 часа',
    isFree: false,
    productSlug: 'connectors-basic',
    tags: ['воронка', 'telegram'],
  },
  {
    id: 'met-5',
    title: 'AI-промпты для контента',
    description: 'Готовые промпты для ChatGPT и Claude: генерация идей, написание постов, создание сторис. 15 промптов с инструкциями.',
    stepsCount: 15,
    estimatedTime: '45 мин',
    isFree: false,
    productSlug: 'masterclass',
    tags: ['AI', 'промпты'],
  },
  {
    id: 'met-6',
    title: 'Оцифровка результатов',
    description: 'Как превратить вашу экспертизу в измеримые кейсы. Фреймворк для сбора и оформления результатов клиентов.',
    stepsCount: 8,
    estimatedTime: '1.5 часа',
    isFree: false,
    productSlug: 'connectors-basic',
    tags: ['кейсы', 'продажи'],
  },
];

export function getMetodichki(): Metodichka[] {
  return metodichki;
}

export function getFreeMetodichki(): Metodichka[] {
  return metodichki.filter(m => m.isFree);
}

// ═══════════════════════════════════════
// CONNECTOR FEED (Lenta Konnectora)
// ═══════════════════════════════════════

export interface ConnectorFeedPost {
  id: string;
  date: string;
  title: string;
  content: string;
  type: 'insight' | 'update' | 'behind_the_scenes' | 'tip';
}

export const connectorFeedPosts: ConnectorFeedPost[] = [
  {
    id: 'cfp-1',
    date: '2026-03-17',
    title: 'Почему я перестал считать подписчиков',
    content: 'Раньше каждое утро начинал с проверки числа подписчиков. Потом понял: 1000 правильных подписчиков > 40 000 случайных. Одна из моих учениц с 1000 подписчиков заработала 500к. Другая с 8500 — 800к. Дело не в числах, а в качестве связи с аудиторией.',
    type: 'insight',
  },
  {
    id: 'cfp-2',
    date: '2026-03-15',
    title: 'Обновление: запуск кабинета',
    content: 'Наконец-то запустил личный кабинет прямо в Telegram. Все материалы, методички, календарь — в одном месте. Это часть большой идеи: строить систему, а не зависеть от алгоритмов.',
    type: 'update',
  },
  {
    id: 'cfp-3',
    date: '2026-03-13',
    title: 'Как я строю этот проект с AI',
    content: 'Один человек + AI = маленькая компания. Весь этот кабинет, квиз, воронка — построено мной и Claude. Без команды разработчиков. Это тот самый рычаг кода, о котором я пишу.',
    type: 'behind_the_scenes',
  },
  {
    id: 'cfp-4',
    date: '2026-03-10',
    title: 'Совет дня: не учите — продавайте решение',
    content: 'Самая частая ошибка экспертов: учить в контенте. Люди не хотят учиться — они хотят результат. Покажите результат, объясните механику (не инструкцию), и дайте путь к решению через ваш продукт.',
    type: 'tip',
  },
];

export function getConnectorFeed(): ConnectorFeedPost[] {
  return [...connectorFeedPosts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

// Helper to get feed by archetype ID
export function getFeedByArchetype(archetype: string): ArchetypeFeed | null {
  return archetypeFeeds.find(f => f.archetype === archetype) || null;
}

// Get upcoming events (from today forward)
export function getUpcomingEvents(): CalendarEvent[] {
  const now = new Date();
  return calendarEvents
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Get announcements (newest first)
export function getAnnouncementsSorted(): Announcement[] {
  return [...announcements].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Get catalog sections
export function getCatalogSections(): CatalogSection[] {
  return catalogSections;
}
