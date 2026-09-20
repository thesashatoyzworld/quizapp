/**
 * Запись сообщений групп, где бот сидит админом.
 *
 * До этого группа «Коннекторы» не логировалась никуда: у бота включён privacy
 * mode, телеграм отдаёт ему только команды и упоминания, а истории чата боту не
 * отдаёт в принципе. Поэтому ответить на вопрос «а что клиент писал в группе»
 * было нечем — ни базы, ни выгрузки.
 *
 * Чтобы записи начали появляться, privacy боту надо снять руками в BotFather
 * (/setprivacy → Disable). Код к этому готов заранее: пока privacy включён,
 * сюда просто ничего не приходит.
 */
/** «Коннекторы». Список расширяется переменной, без правки кода. */
const DEFAULT_CHAT_IDS = ['-1002115856669'];

export function loggedGroupIds(): string[] {
  const raw = (process.env.GROUP_LOG_CHAT_IDS || '').trim();
  if (!raw) return DEFAULT_CHAT_IDS;
  return raw
    .split(/[,\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function isLoggedGroup(chatId: number | string): boolean {
  return loggedGroupIds().includes(String(chatId));
}

export interface GroupMessage {
  chat: { id: number; type?: string; title?: string };
  message_id?: number;
  message_thread_id?: number;
  date?: number;
  text?: string;
  caption?: string;
  from?: { id?: number; first_name?: string; last_name?: string; username?: string };
  voice?: { duration?: number };
  video_note?: { duration?: number };
  photo?: unknown[];
  document?: { file_name?: string };
  reply_to_message?: {
    message_id?: number;
    forum_topic_created?: { name?: string };
  };
}

export interface GroupMessageRow {
  id: string;
  chatId: string;
  threadId: number | null;
  topic: string | null;
  userId: string | null;
  username: string | null;
  name: string | null;
  text: string;
  mediaType: string | null;
  createdAt: Date;
}

function mediaOf(msg: GroupMessage): string | null {
  if (msg.voice) return 'voice';
  if (msg.video_note) return 'video';
  if (msg.photo?.length) return 'photo';
  if (msg.document) return 'file';
  return null;
}

/**
 * Разбор апдейта в строку таблицы. Чистая: ничего не пишет и не читает, чтобы
 * её можно было проверить тестом без базы и без телеграма.
 *
 * Голосовые кладём заглушкой и не расшифровываем: в группе говорят много, а
 * расшифровка стоит денег. Понадобится — добьём отдельной задачей по media_ref.
 */
export function rowFromMessage(msg: GroupMessage): GroupMessageRow {
  const media = mediaOf(msg);
  const said = (msg.text || msg.caption || '').trim();
  const name = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ');

  const stamp = (sec?: number) =>
    sec ? ` ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : '';

  let text = said;
  if (!text && media === 'voice') text = `[голосовое${stamp(msg.voice?.duration)}]`;
  if (!text && media === 'video') text = `[кружок${stamp(msg.video_note?.duration)}]`;
  if (!text && media === 'photo') text = '[картинка]';
  if (!text && media === 'file') text = `[файл ${msg.document?.file_name || ''}`.trim() + ']';

  return {
    id: `${msg.chat.id}:${msg.message_id ?? 0}`,
    chatId: String(msg.chat.id),
    threadId: msg.message_thread_id ?? null,
    topic: msg.reply_to_message?.forum_topic_created?.name || null,
    userId: msg.from?.id ? String(msg.from.id) : null,
    username: msg.from?.username || null,
    name: name || null,
    text,
    mediaType: media,
    createdAt: new Date((msg.date ?? Math.floor(Date.now() / 1000)) * 1000),
  };
}

/**
 * Пишем через create, как в личке: телеграм повторяет апдейт, если не дождался
 * ответа, и конфликт по ключу означает повтор, а не новое сообщение.
 * Ошибку глотаем: потерянная строка лога не повод ронять вебхук.
 */
export async function saveGroupMessage(msg: GroupMessage): Promise<boolean> {
  try {
    // Ленивый импорт: чистую часть файла проверяет тест, а он не должен
    // тянуть за собой клиента базы.
    const { prisma } = await import('@/lib/prisma');
    await prisma.tgGroupMsg.create({ data: rowFromMessage(msg) });
    return true;
  } catch {
    return false;
  }
}
