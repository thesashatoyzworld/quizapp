// ─────────────────────────────────────────────────────────────
// Клиент написал самому боту, а не Саше.
//
// Бот через Telegram Business пишет от имени Саши только в чаты, где человек
// отвечал за последние сутки. Тем, кто молчит неделю, пинг уходит от бота
// (30.09.2026), и ответ прилетает боту. Раньше его забирала база знаний и
// отвечала «по материалам» на «привет, да всё норм», а Саша ответа не видел.
//
// Теперь сообщение клиента из базы:
//   • пишется в tg_personal_msg с account = 'bot' — тогда оно видно в
//     «Деньгах на столе» (клиенты ждут ответа) рядом с рабочим и личным;
//   • уходит Саше на оба аккаунта, медиа пересылается как есть.
// Базе знаний остаются только вопросы (есть «?»): на них клиент ждёт ответа
// по материалам, и Саше они всё равно видны.
// ─────────────────────────────────────────────────────────────

export const BOT_ACCOUNT = 'bot';

const BOT_TOKEN = process.env.BOT_TOKEN;

export interface BotReplyMessage {
  message_id?: number;
  date?: number;
  chat: { id: number };
  from?: { id?: number; username?: string; first_name?: string; last_name?: string };
  text?: string;
  caption?: string;
  voice?: unknown;
  video_note?: unknown;
  video?: unknown;
  photo?: unknown;
  document?: unknown;
  sticker?: unknown;
}

/** Текст для лога и уведомления плюс тип медиа, если оно есть. */
export function describeReply(m: BotReplyMessage): { text: string; mediaType: string | null } {
  const said = (m.text || m.caption || '').trim();
  const mediaType = m.voice
    ? 'voice'
    : m.video_note
      ? 'video_note'
      : m.video
        ? 'video'
        : m.photo
          ? 'photo'
          : m.document
            ? 'document'
            : m.sticker
              ? 'sticker'
              : null;
  const label: Record<string, string> = {
    voice: '[голосовое]',
    video_note: '[кружок]',
    video: '[видео]',
    photo: '[фото]',
    document: '[файл]',
    sticker: '[стикер]',
  };
  const tag = mediaType ? label[mediaType] : '';
  const text = [tag, said].filter(Boolean).join(' ') || '[сообщение]';
  return { text, mediaType };
}

/** Вопрос по материалам, а не ответ на пинг: на такое пусть отвечает база знаний. */
export function isQuestion(text: string | undefined): boolean {
  return !!text && text.includes('?');
}

async function forward(toChatId: string, m: BotReplyMessage): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/forwardMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: toChatId, from_chat_id: m.chat.id, message_id: m.message_id }),
    });
  } catch (e) {
    console.error('[client-bot-reply] forward failed', e);
  }
}

/**
 * true — это клиент из базы, сообщение записано и Саша о нём знает.
 * false — не клиент, пусть идёт дальше по обычным веткам.
 */
export async function catchClientReply(m: BotReplyMessage): Promise<boolean> {
  // Тянем лениво, как в group-log: разбор сообщения тестируется без базы.
  const { inBase } = await import('./clients-base');
  const { prisma } = await import('./prisma');
  const { notifyAdminDetailed } = await import('./telegram');

  const chatId = String(m.chat.id);
  if (!(await inBase(chatId, m.from?.username))) return false;

  const { text, mediaType } = describeReply(m);
  try {
    await prisma.tgPersonalMsg.create({
      data: {
        id: `${BOT_ACCOUNT}:${chatId}:${m.message_id ?? m.date ?? Date.now()}`,
        account: BOT_ACCOUNT,
        chatId,
        side: 'client',
        username: m.from?.username || null,
        name: [m.from?.first_name, m.from?.last_name].filter(Boolean).join(' ') || null,
        text,
        mediaType,
        mediaRef: null,
        createdAt: m.date ? new Date(m.date * 1000) : new Date(),
      },
    });
  } catch {
    // Повтор апдейта: уже записали и уже сказали Саше.
    return true;
  }

  const who = [m.from?.first_name, m.from?.last_name].filter(Boolean).join(' ') || chatId;
  const nick = m.from?.username ? ` @${m.from.username}` : '';
  const refs = await notifyAdminDetailed(`💬 ${who}${nick} ответил(а) боту:\n\n${text}`, {
    parseMode: null,
    alsoWork: true,
  });
  if (mediaType && m.message_id) {
    for (const r of refs) await forward(r.chatId, m);
  }
  return true;
}
