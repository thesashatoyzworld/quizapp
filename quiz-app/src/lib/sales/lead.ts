import { prisma } from '@/lib/prisma';
import { listChats, listChatMessages, getChat, sleep, type CpMessage } from '@/lib/chatplace';

// Найти человека по нику и достать его переписку из инста-директа.
//
// Сначала смотрим в ig_lead: там четыре тысячи людей из воронок, и у каждого
// уже сохранён id чата. Кого там нет (написал сам, минуя кодовое слово) —
// ищем среди свежих чатов ChatPlace по нику и имени.

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

// Сколько свежих чатов перебрать по нику, если по имени не совпало.
// В директ пишут около сорока человек в день, а спрашивают обычно про тех,
// кто писал на этой неделе. Сотней не обойтись: живой Александр стоял на
// 84-м месте через сутки после своего сообщения.
const PROBE_CHATS = 250;
const PROBE_PARALLEL = 10;

async function fromChats(handle: string): Promise<SalesLead | null> {
  const h = clean(handle);
  const chats = await listChats(4);

  const mk = (id: string, name: string | null, nick: string | null): SalesLead => ({
    handle: nick,
    name,
    chatId: id,
    automationName: null,
    keyword: null,
    status: null,
    formKind: null,
    note: null,
  });

  // Сначала дешёвый проход: в списке есть имя, но нет ника.
  const byName = chats.find((c) => clean(c.clientName || '').includes(h));
  if (byName) return mk(byName.id, byName.clientName, null);

  // Ник лежит только в карточке чата, поэтому свежие приходится перебирать.
  // Пачками: по одному это минуты ожидания, а десяток одновременных запросов
  // ChatPlace держит.
  const probe = chats.slice(0, PROBE_CHATS);
  for (let i = 0; i < probe.length; i += PROBE_PARALLEL) {
    const batch = probe.slice(i, i + PROBE_PARALLEL);
    const cards = await Promise.all(
      batch.map((c) => getChat(c.id).catch(() => null)), // недоступный чат не повод бросать поиск
    );
    for (const [j, full] of cards.entries()) {
      if (full?.username && clean(full.username) === h) {
        return mk(batch[j].id, batch[j].clientName, full.username);
      }
    }
    await sleep(120);
  }
  return null;
}

/** Ник или кусок имени → переписка. `null`, если человека не нашли. */
export async function findThread(handle: string): Promise<SalesThread | null> {
  const lead = (await fromLeads(handle)) || (await fromChats(handle));
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
      const media = m.mediaFiles?.length
        ? ` [${m.mediaFiles.map((f) => f.typeName).join(', ')}]`
        : '';
      return `[${when}] ${who}${media}: ${(m.message || '').replace(/\s+/g, ' ')}`;
    })
    .join('\n');
}
