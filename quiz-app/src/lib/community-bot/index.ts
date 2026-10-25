// Бот «Сообщества»: новая ветка ученика → ответ бота или уведомление Саше.
//
// Сеть и база приходят зависимостями: в проде — настоящие, в тестах — моки.
// Флаг COMMUNITY_BOT=1 проверяется первым делом: выключен — ни одного вызова.

import { botEnabled, decide, preRoute, signed, type Kind, type ModelVerdict, type NewPost } from './route';

export type Outcome = 'off' | 'skip' | 'answered' | 'personal' | 'method' | 'review' | 'social' | 'error';

/** Кому и что сообщить Саше. kind = null — обычное «новая ветка», как без бота. */
export type AdminNotice =
  | { kind: Exclude<Kind, 'routine'> }
  | { kind: 'answered'; answer: string };

export interface BotDeps {
  env: Record<string, string | undefined>;
  ask: (question: string) => Promise<ModelVerdict | null>;
  /** Комментарий от имени бота в ветку + уведомление автору ветки. */
  addBotComment: (postId: string, text: string) => Promise<void>;
  /** Уведомление Саше о ветке с пометкой, что с ней сделал бот. */
  notifyAdmin: (post: NewPost, authorName: string, notice: AdminNotice) => Promise<void>;
  /** Обычное уведомление о новой ветке — то же, что уходит без бота. */
  notifyNewPost: (post: NewPost, authorName: string) => Promise<void>;
}

export async function handleNewPost(post: NewPost, authorName: string, deps: BotDeps): Promise<Outcome> {
  if (!botEnabled(deps.env)) return 'off';

  const pre = preRoute(post);
  if (pre.kind === 'skip') {
    await deps.notifyNewPost(post, authorName);
    return 'skip';
  }
  if (pre.kind === 'review') {
    await deps.notifyAdmin(post, authorName, { kind: 'review' });
    return 'review';
  }

  let verdict: ModelVerdict | null;
  try {
    verdict = await deps.ask(`${post.title}\n\n${post.body}`.trim());
  } catch (e) {
    // Модель недоступна — ветка уходит Саше как обычно, ученик не теряется.
    console.error('[community-bot] ask failed', e);
    await deps.notifyNewPost(post, authorName);
    return 'error';
  }

  const d = decide(verdict);
  if (d.action === 'answer') {
    await deps.addBotComment(post.id, signed(d.text));
    await deps.notifyAdmin(post, authorName, { kind: 'answered', answer: d.text });
    return 'answered';
  }

  if (d.kind === 'social') {
    await deps.notifyNewPost(post, authorName);
    return 'social';
  }
  await deps.notifyAdmin(post, authorName, { kind: d.kind });
  return d.kind;
}
