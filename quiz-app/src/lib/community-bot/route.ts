// Бот в «Сообществе»: что делать с новой веткой. Чистые функции без сети и
// базы — их проверяют тесты, а обращение к модели и отправка живут рядом.
//
// Рутину (где найти, как устроен кабинет, какой сервис взять) бот закрывает
// сам по справке и оглавлению материалов. Всё остальное — метод, проверка
// работы, личные договорённости, победы — остаётся Саше: бот молчит.

/** Флаг включения. По умолчанию выключен: без него ветки идут Саше, как раньше. */
export const FLAG = 'COMMUNITY_BOT';

export function botEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env[FLAG] === '1';
}

/**
 * Что про вопрос решила модель.
 *   routine  — ответ есть в справке или оглавлении, бот отвечает сам
 *   personal — организационное, но зависит от человека: доступ, оплата, договорённости
 *   method   — как делать контент, оффер, продажи; почему не работает
 *   review   — прислал работу или просит оценить своё
 *   social   — победа, отчёт, благодарность, без вопроса
 */
export type Kind = 'routine' | 'personal' | 'method' | 'review' | 'social';
export const KINDS: readonly Kind[] = ['routine', 'personal', 'method', 'review', 'social'];

export interface NewPost {
  id: string;
  category: string;
  title: string;
  body: string;
  images: string[];
}

/** Ссылки на документы и соцсети: человек прислал работу, а не спросил, где что лежит. */
const WORK_LINK = /(docs\.google|drive\.google|figma\.com|instagram\.com|youtu\.?be|tiktok\.com|vercel\.app|workers\.dev|tilda|notion\.so|canva\.com)/i;

/** Длиннее — это уже текст на проверку, а не вопрос «где найти». */
const MAX_QUESTION = 1200;

export type PreRoute =
  | { kind: 'skip' } // не вопрос: проверка, победа, отчёт, анонс — бот не вмешивается
  | { kind: 'review' } // прислали работу — сразу Саше
  | { kind: 'ask' }; // спросить модель

/**
 * Решение до модели: дешёвое и предсказуемое. Модель видит только ветки
 * «Вопрос» без приложенной работы — остальное ей и не нужно видеть.
 */
export function preRoute(post: NewPost): PreRoute {
  if (post.category !== 'question') return { kind: 'skip' };
  const text = `${post.title}\n${post.body}`;
  if (post.images.length > 0) return { kind: 'review' };
  if (WORK_LINK.test(text)) return { kind: 'review' };
  if (post.body.length > MAX_QUESTION) return { kind: 'review' };
  return { kind: 'ask' };
}

/** Ответ модели как пришёл: может быть битым, поэтому всё необязательное. */
export interface ModelVerdict {
  kind?: unknown;
  answer?: unknown;
}

export type Decision =
  | { action: 'answer'; text: string }
  | { action: 'notify'; kind: Exclude<Kind, 'routine'> };

/** Ответ бота короткий: длиннее — значит модель начала объяснять метод. */
const MAX_ANSWER = 700;

/** Цены и суммы бот не называет никогда: они меняются и зависят от человека. */
const MONEY = /(\d[\d\s]*(₽|руб|р\.|\$|usd|тыс))|(₽)/i;

/** Длинное тире Саша не пишет — заменяем на дефис с пробелами. */
export function tidy(text: string): string {
  return text.replace(/\s*—\s*/g, ' - ').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Финальное слово за кодом, а не за моделью: отвечаем, только если модель
 * сама назвала вопрос рутиной и дала короткий ответ без денег. Во всех
 * сомнительных случаях — молчим и зовём Сашу.
 */
export function decide(v: ModelVerdict | null): Decision {
  const kind = KINDS.includes(v?.kind as Kind) ? (v!.kind as Kind) : 'method';
  const answer = typeof v?.answer === 'string' ? tidy(v.answer) : '';

  if (kind !== 'routine') return { action: 'notify', kind };
  if (!answer || answer.length > MAX_ANSWER || MONEY.test(answer)) {
    return { action: 'notify', kind: 'personal' };
  }
  return { action: 'answer', text: answer };
}

/** Подпись под ответом бота: видно, что это не Саша, и куда идти, если не помогло. */
export const BOT_SIGNATURE =
  '🤖 Ответил бот-помощник по справке кабинета. Если не то, напиши ниже, Саша посмотрит.';

export function signed(text: string): string {
  return `${text}\n\n${BOT_SIGNATURE}`;
}
