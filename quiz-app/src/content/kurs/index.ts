// ─────────────────────────────────────────────────────────────
// «Новый уровень контента» — основной курс в кабинете.
//
// Один урок = запись (Kinescope) + статья с картинками и интерактивами.
// Статья лежит рядом отдельным модулем, его генерирует
// GSD-BRAND/scripts/kurs-to-ts.mjs из деки курса. Здесь только метаданные.
//
// Добавить урок: снять видео → залить (`scripts/upload-razbor.mjs`) →
// `node scripts/kurs-to-ts.mjs NN` → импортировать модуль, проставить
// kinescopeId и duration, снять `soon`.
// ─────────────────────────────────────────────────────────────

import { VSTUPLENIE_00 } from './00-vstuplenie';
import { CEL_I_MOTIVACIYA_01 } from './01-cel-i-motivaciya';
import { UROVEN_1_02 } from './02-uroven-1';
import { UROVEN_2_03 } from './03-uroven-2';
import { UROVEN_3_04 } from './04-uroven-3';
import { UROVEN_4_05 } from './05-uroven-4';
import { UROVEN_5_06 } from './06-uroven-5';
import { OBSHAYA_FORMULA_07 } from './07-obshaya-formula';
import { UROVEN_6_08 } from './08-uroven-6';

/** Курс открыт на всех тарифах «Нового уровня контента». */
export const KURS_ROLE = 'uroven';
export const KURS_MIN_TIER = 1;

export interface Lesson {
  slug: string;
  /** метка части: «Начало», «Ур. 1» — как в оглавлении курса */
  badge: string;
  title: string;
  /** одна строка: что внутри */
  subtitle: string;
  /** что человек делает руками после урока */
  task: string;
  /** длительность записи, человекочитаемо. Пусто, пока записи нет */
  duration: string;
  /** Kinescope embed slug. Пусто = урок ещё не снят */
  kinescopeId: string;
  /** полный HTML статьи для iframe. Пусто = статья ещё не выложена */
  html: string;
}

export const LESSONS: Lesson[] = [
  {
    slug: '00-vstuplenie',
    badge: 'Начало',
    title: 'Шесть уровней навыка',
    subtitle: 'Карта целиком, диагностика своего уровня, как пользоваться курсом и что делать, если откатило',
    task: 'найти свой уровень',
    duration: '21 мин',
    kinescopeId: 'iyjMntsgQERhfE7oiJb7Rx',
    html: VSTUPLENIE_00,
  },
  {
    slug: '01-cel-i-motivaciya',
    badge: 'Общий',
    title: 'Цель и мотивация блога',
    subtitle: 'Приёмник и передатчик, ручка громкости, почему на контент никогда не будет времени, цепочка «зачем» и антивидение',
    task: 'понять, зачем вам этот блог',
    duration: '43 мин',
    kinescopeId: 'rKGLqhYyCj47rvwzugEJLk',
    html: CEL_I_MOTIVACIYA_01,
  },
  {
    slug: '02-uroven-1',
    badge: 'Ур. 1',
    title: 'Хочу, но не делаю',
    subtitle: 'Шесть замков на двери: осуждение, неудача, перфекционизм, самозванец, эго, мотивация. И как обойти каждый',
    task: 'просто начать выкладывать',
    duration: '53 мин',
    kinescopeId: 'oY1fjZSpcXVHiwsvRSguGk',
    html: UROVEN_1_02,
  },
  {
    slug: '03-uroven-2',
    badge: 'Ур. 2',
    title: 'Делал, но бросил',
    subtitle: 'Долина отчаяния, разбор пяти причин выхода и возвращение с пониженной планкой',
    task: 'понять, что выбило, и вернуться',
    duration: '13 мин',
    kinescopeId: '8VKym8i1pJH7dxNCnf8kAT',
    html: UROVEN_2_03,
  },
  {
    slug: '04-uroven-3',
    badge: 'Ур. 3',
    title: 'Делаю, но бесит',
    subtitle: 'Три опоры комфортной среды: форма, ваша правда, ваша ставка. Плюс баланс «хочу» и «надо»',
    task: 'убрать сопротивление из процесса',
    duration: '41 мин',
    kinescopeId: '0Y1yv7JXCneHxLFnW5S93c',
    html: UROVEN_3_04,
  },
  {
    slug: '05-uroven-4',
    badge: 'Ур. 4',
    title: 'Не бесит, но жрёт время',
    subtitle: 'Снять оценку, поставить рамки времени, коллекционировать вместо создания, купить чужое время',
    task: 'сжать время, а не найти его',
    duration: '39 мин',
    kinescopeId: 'uB6WrLP8v8JjYsDpzoz9q3',
    html: UROVEN_4_05,
  },
  {
    slug: '06-uroven-5',
    badge: 'Ур. 5 · теория',
    title: 'Времени хватает, а отклика нет',
    subtitle: 'Разворот камеры, эго, промежуточные результаты и формула единицы: смысл, пруф, упаковка',
    task: 'поймать промежуточные результаты',
    duration: '29 мин',
    kinescopeId: '42tmfddTfPG8mXtdYAB83v',
    html: UROVEN_5_06,
  },
  {
    slug: '07-obshaya-formula',
    badge: 'Ур. 5 · практика',
    title: 'Собираем единицу руками',
    subtitle: 'Карта смыслов, пруф, упаковка, поток спроса и четыре способа поиска заходов, умножение и докрутка',
    task: 'собрать свою карту смыслов',
    duration: '35 мин',
    kinescopeId: 'qkhRLjdV5RhehGMSHwEgif',
    html: OBSHAYA_FORMULA_07,
  },
  {
    slug: '08-uroven-6',
    badge: 'Ур. 6',
    title: 'Всё работает, хочу больше',
    subtitle: 'Масштаб это не объём: два пути роста, переупаковка, площадки с органикой, команда и платный трафик',
    task: 'тиражировать то, что работает',
    duration: '31 мин',
    kinescopeId: 'kFf2Z8s3UM2W1PXPuqSzzL',
    html: UROVEN_6_08,
  },
  {
    slug: '09-final',
    badge: 'Финал',
    title: 'Что у вас теперь есть',
    subtitle: 'Карта пройденного пути, три принципа и ритм на дальше',
    task: 'жить по своей карте',
    duration: '',
    kinescopeId: '',
    html: '',
  },
];

export function findLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

/** Карточка для списка: всё, кроме тяжёлого HTML. */
export type LessonCard = Omit<Lesson, 'html'> & { ready: boolean };

export function toCard(l: Lesson): LessonCard {
  const { html: _html, ...rest } = l;
  void _html;
  return { ...rest, ready: !!l.html };
}
