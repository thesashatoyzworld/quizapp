import { prisma } from '@/lib/prisma';
import { listChats, listChatMessages, type CpMessage } from '@/lib/chatplace';

// Найти человека по нику и достать его переписку из инста-директа.
//
// Порядок поиска, от дешёвого к дорогому:
//   1. ig_lead — четыре тысячи людей из воронок, id чата уже сохранён
//   2. ig_chat — ники, собранные фоном (cron-ig-chats дважды в день)
//   3. свежий список чатов по имени — один запрос, без карточек
//
// Карточки чатов здесь не дёргаем принципиально. Раньше поиск перебирал их
// сотнями и упирался в 429 от Cloudflare, а ошибки глохли в catch: помощник
// молча отвечал «не нашёл» на человека, который в директе есть.

export type SalesLead = {
  handle: string | null;
  name: string | null;
  chatId: string;
  automationName: string | null;
  keyword: string | null;
  status: string | null;
  formKind: string | null; // анкета на менторство — таким из холодной не пишем
  note: string | null;
};

export type SalesThread = { lead: SalesLead; messages: CpMessage[] };

const clean = (s: string) => s.trim().replace(/^@/, '').toLowerCase();

async function fromLeads(handle: string): Promise<SalesLead | null> {
  const h = clean(handle);
  const row = await prisma.igLead.findFirst({
    where: {
      chatId: { not: null },
      OR: [
        { username: { equals: h, mode: 'insensitive' } },
        { name: { contains: h, mode: 'insensitive' } },
      ],
    },
    orderBy: { lastEventAt: 'desc' },
  });
  if (!row?.chatId) return null;
  return {
    handle: row.username,
    name: row.name,
    chatId: row.chatId,
    automationName: row.automationName,
    keyword: row.keyword,
    status: row.status,
    formKind: row.formKind,
    note: row.note,
  };
}

function toLead(id: string, name: string | null, nick: string | null): SalesLead {
  return {
    handle: nick,
    name,
    chatId: id,
    automationName: null,
    keyword: null,
    status: null,
    formKind: null,
    note: null,
  };
}

// Ники, собранные фоном. Один запрос к базе, никакой нагрузки на ChatPlace.
async function fromChatCache(handle: string): Promise<SalesLead | null> {
  const h = clean(handle);
  const row = await prisma.igChat.findFirst({
    where: {
      OR: [
        { username: { equals: h, mode: 'insensitive' } },
        { name: { contains: h, mode: 'insensitive' } },
      ],
    },
    orderBy: { lastMessageAt: 'desc' },
  });
  return row ? toLead(row.chatId, row.name, row.username) : null;
}

// Последняя попытка: свежий список чатов. Ников там нет, поэтому сверяем имя —
// ассистент может назвать человека и по имени, как он подписан в директе.
async function fromRecentByName(handle: string): Promise<SalesLead | null> {
  const h = clean(handle);
  if (h.length < 3) return null;
  const chats = await listChats(2);
  const hit = chats.find((c) => clean(c.clientName || '').includes(h));
  return hit ? toLead(hit.id, hit.clientName, null) : null;
}

/** Ник или кусок имени → переписка. `null`, если человека не нашли. */
export async function findThread(handle: string): Promise<SalesThread | null> {
  const lead =
    (await fromLeads(handle)) ||
    (await fromChatCache(handle)) ||
    (await fromRecentByName(handle));
  if (!lead) return null;

  const raw = await listChatMessages(lead.chatId, 40);
  const messages = raw
    .filter((m) => m.messageType !== 2) // служебные записи в переписку не входят
    .sort((a, b) => a.createdAt - b.createdAt);

  return { lead, messages };
}

/** Переписка в том виде, в каком её читает модель. */
export function renderThread(messages: CpMessage[]): string {
  if (!messages.length) return '(переписки ещё нет, человек не писал)';
  return messages
    .map((m) => {
      const when = new Date(m.createdAt * 1000).toISOString().slice(0, 16).replace('T', ' ');
      const who = m.side === 'client' ? 'ЧЕЛОВЕК' : 'МЫ';

      // Кодовое слово под постом — это не реплика в разговоре, а нажатие
      // кнопки: человек написал «хочукаквася», чтобы бот прислал материалы.
      // Без пометки модель принимает его за высказывание и отвечает на него
      // («о, узнал себя в васе»), хотя человек ничего подобного не говорил.
      const isComment = m.mediaFiles?.some((f) => (f.typeName || '').toLowerCase().includes('comment'));

      const media = m.mediaFiles
        ?.filter((f) => !(f.typeName || '').toLowerCase().includes('comment'))
        .map((f) => f.typeName)
        .filter(Boolean);

      const mark = isComment
        ? ' (кодовое слово в комментарии под постом, не сообщение в переписке)'
        : media?.length
          ? ` [${media.join(', ')}]`
          : '';

      return `[${when}] ${who}${mark}: ${plain(m.message)}`;
    })
    .join('\n');
}

// Сообщения бота приходят разметкой: <p>, <br>, ссылки тегом. Модели это
// только мешает, поэтому оставляем текст и голые адреса.
function plain(html: string | null): string {
  return (html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>\s*<p>/gi, ' ')
    .replace(/<a[^>]*href="([^"]+)"[^>]*>.*?<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
