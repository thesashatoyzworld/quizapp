// YouTube release plan for /admin/kontent. Edited by hand in the repo,
// no DB table on purpose: two or three videos a month, one editor.

export type PlanVideo = {
  id: string;
  title: string;
  /** Chip color, any CSS color. */
  color: string;
  /** YYYY-MM-DD */
  releaseDate: string;
};

export type PlanEventKind = 'step' | 'shoot' | 'release' | 'free' | 'done';

export type PlanEvent = {
  /** YYYY-MM-DD */
  date: string;
  /** Omitted for a free slot that is not tied to a video yet. */
  videoId?: string;
  text: string;
  who?: string;
  kind: PlanEventKind;
};

export type PlanNote = {
  label: string;
  paragraphs: string[];
  /** Red frame: a risk to watch. */
  risk?: boolean;
};

export const PLAN_KICKER = 'YouTube · выход по пятницам';

export const PLAN_VIDEOS: PlanVideo[] = [
  { id: 'azam', title: 'Азам', color: '#00f0ff', releaseDate: '2026-10-02' },
  { id: 'mln', title: '1,5 млн за месяц', color: '#ff4fbf', releaseDate: '2026-10-09' },
  { id: 'tash', title: 'Из Ташкента', color: '#ffd24f', releaseDate: '2026-10-23' },
];

export const PLAN_EVENTS: PlanEvent[] = [
  { date: '2026-09-23', videoId: 'azam', kind: 'done', text: 'Созвон с Азамом записан' },
  { date: '2026-09-24', videoId: 'azam', kind: 'done', text: 'ТЗ и zip для Дани готовы' },

  { date: '2026-09-26', videoId: 'azam', kind: 'step', text: 'Проверить, что zip у Дани. Сверить подписчиков Азама (на плашке 23 000)', who: 'Саша' },
  { date: '2026-09-26', videoId: 'mln', kind: 'done', text: 'Референсы заголовков и обложек' },

  { date: '2026-09-27', videoId: 'azam', kind: 'step', text: 'Упаковка: заголовок, обложка, описание, главы', who: 'Claude' },
  { date: '2026-09-27', videoId: 'mln', kind: 'step', text: 'План ролика: cold open, главы, кадры', who: 'Claude' },

  { date: '2026-09-28', videoId: 'azam', kind: 'step', text: 'Саша выбирает заголовок и обложку' },
  { date: '2026-09-28', videoId: 'mln', kind: 'step', text: 'Саша правит план' },

  { date: '2026-09-29', videoId: 'azam', kind: 'step', text: 'Черновой монтаж', who: 'Даня' },

  { date: '2026-09-30', videoId: 'azam', kind: 'step', text: 'Правки списком с таймкодами', who: 'Саша' },
  { date: '2026-09-30', videoId: 'mln', kind: 'step', text: 'Финал плана. Итог месяца известен' },

  { date: '2026-10-01', videoId: 'azam', kind: 'step', text: 'Финал, загрузка отложенной публикацией' },
  { date: '2026-10-01', videoId: 'mln', kind: 'shoot', text: 'Съёмка' },

  { date: '2026-10-02', videoId: 'azam', kind: 'release', text: 'Выход ролика' },
  { date: '2026-10-02', videoId: 'mln', kind: 'step', text: 'Запасной день съёмки. Расшифровка, ТЗ, zip Дане' },

  { date: '2026-10-03', videoId: 'mln', kind: 'step', text: 'Монтаж', who: 'Даня' },
  { date: '2026-10-04', videoId: 'mln', kind: 'step', text: 'Монтаж', who: 'Даня' },
  { date: '2026-10-05', videoId: 'mln', kind: 'step', text: 'Монтаж', who: 'Даня' },

  { date: '2026-10-06', videoId: 'mln', kind: 'step', text: 'Черновой монтаж', who: 'Даня' },
  { date: '2026-10-06', videoId: 'mln', kind: 'step', text: 'Заголовок и обложка по референсам', who: 'Claude' },

  { date: '2026-10-07', videoId: 'mln', kind: 'step', text: 'Правки списком. Выбор заголовка и обложки', who: 'Саша' },
  { date: '2026-10-07', videoId: 'tash', kind: 'step', text: 'Список кадров для поездки', who: 'Claude' },
  { date: '2026-10-08', videoId: 'mln', kind: 'step', text: 'Финал, загрузка отложенной публикацией' },
  { date: '2026-10-09', videoId: 'mln', kind: 'release', text: 'Выход ролика' },
  { date: '2026-10-09', videoId: 'tash', kind: 'shoot', text: 'Поездка 9–15.10: снимаем в Ташкенте' },

  { date: '2026-10-15', videoId: 'tash', kind: 'step', text: 'Возвращение. Исходники Дане', who: 'Саша' },
  { date: '2026-10-16', kind: 'free', text: 'Слот свободен. Нужен ролик из созвона: материал Дане до 8.10' },
  { date: '2026-10-16', videoId: 'tash', kind: 'step', text: 'Расшифровка, ТЗ, хроно', who: 'Claude' },
  { date: '2026-10-17', videoId: 'tash', kind: 'step', text: 'Монтаж', who: 'Даня' },
  { date: '2026-10-18', videoId: 'tash', kind: 'step', text: 'Монтаж', who: 'Даня' },
  { date: '2026-10-19', videoId: 'tash', kind: 'step', text: 'Монтаж', who: 'Даня' },
  { date: '2026-10-20', videoId: 'tash', kind: 'step', text: 'Черновой монтаж', who: 'Даня' },
  { date: '2026-10-20', videoId: 'tash', kind: 'step', text: 'Заголовок и обложка', who: 'Claude' },
  { date: '2026-10-21', videoId: 'tash', kind: 'step', text: 'Правки списком. Выбор заголовка и обложки', who: 'Саша' },
  { date: '2026-10-22', videoId: 'tash', kind: 'step', text: 'Финал, загрузка отложенной публикацией' },
  { date: '2026-10-23', videoId: 'tash', kind: 'release', text: 'Выход ролика' },
];

export const PLAN_NOTES: PlanNote[] = [
  {
    label: 'Где тонко',
    risk: true,
    paragraphs: [
      'Съёмка 1,5 млн. Если она уезжает на 3.10, успеваем за счёт дня правок. Позже выход переезжает на 16.10.',
      'Заголовок выбираем после съёмки: по референсам лучше растут ролики с неназванным итогом.',
    ],
  },
  {
    label: '16.10',
    paragraphs: [
      'Ролика пока нет. Берём самый сильный кейс из созвонов 28.09–8.10: без отдельной съёмки, Даня монтирует 9–13.10, пока Саша в Ташкенте. Выбрать созвон к 6.10.',
    ],
  },
];
