import { prisma } from '@/lib/prisma';
import { listChats, getChat, sleep } from '@/lib/chatplace';

// Сбор ников из инста-директа в таблицу ig_chat.
//
// Зачем отдельная таблица: список чатов ChatPlace отдаёт имя, но не ник.
// Ник лежит только в карточке чата, а карточки под нагрузкой отвечают 429 —
// Cloudflare просит ждать по тридцать секунд. Собирать их в момент вопроса
// нельзя, поэтому собираем заранее и понемногу.
//
// После первого прохода работы почти нет: в директ приходит около сорока
// новых людей в день, а у известных ник не меняется.

export type ChatsSyncResult = {
  seen: number;      // сколько чатов посмотрели в списке
  known: number;     // из них уже с ником в нашей базе
  fromLeads: number; // ников взяли из ig_lead, не потратив ни одного запроса
  fetched: number;   // сколько карточек всё-таки запросили
  handles: number;   // сколько ников получили из карточек
  failed: number;
  total: number;     // всего ников в базе после прохода
};

// Двое одновременно и почти секунда между парами: на десяти Cloudflare
// отвечал 429 подряд. Скорость не нужна, задача фоновая.
const PARALLEL = 2;
const PAUSE_MS = 900;

export async function syncIgChats(
  opts: { chats?: number; budget?: number } = {},
): Promise<ChatsSyncResult> {
  const wantChats = opts.chats ?? 400;
  // Сколько карточек разрешено запросить за один заход. В облаке важнее
  // уложиться в отведённое функции время, чем собрать всех разом.
  const budget = opts.budget ?? 120;

  const chats = (await listChats(Math.ceil(wantChats / 100))).slice(0, wantChats);

  const known = new Set(
    (
      await prisma.igChat.findMany({
        where: { username: { not: null } },
        select: { chatId: true },
      })
    ).map((r) => r.chatId),
  );

  // Половину ников знаем даром: люди из воронок уже лежат в ig_lead вместе с
  // ником, а список чатов отдаёт clientId — по нему и сходятся. Запросы к
  // ChatPlace тратим только на тех, кого в воронках не было.
  const leadHandles = new Map(
    (
      await prisma.igLead.findMany({
        where: { username: { not: null } },
        select: { clientId: true, username: true },
      })
    ).map((l) => [l.clientId, l.username as string]),
  );

  let fromLeads = 0;
  const rest: typeof chats = [];

  for (const c of chats) {
    if (known.has(c.id)) continue;
    const nick = leadHandles.get(c.clientId);
    if (!nick) {
      rest.push(c);
      continue;
    }
    const row = {
      clientId: c.clientId,
      username: nick,
      name: c.clientName,
      lastMessageAt: new Date(c.lastMessageAt * 1000),
    };
    await prisma.igChat.upsert({
      where: { chatId: c.id },
      create: { chatId: c.id, ...row },
      update: row,
    });
    fromLeads++;
  }

  const todo = rest.slice(0, budget);

  let handles = 0;
  let failed = 0;

  for (let i = 0; i < todo.length; i += PARALLEL) {
    const batch = todo.slice(i, i + PARALLEL);
    const cards = await Promise.all(
      batch.map((c) =>
        getChat(c.id).catch((e) => {
          failed++;
          console.error('[ig-chats] карточка недоступна:', c.id, String(e).slice(0, 120));
          return null;
        }),
      ),
    );

    for (const [j, card] of cards.entries()) {
      const c = batch[j];
      const row = {
        clientId: c.clientId,
        username: card?.username ?? null,
        name: c.clientName,
        lastMessageAt: new Date(c.lastMessageAt * 1000),
      };
      await prisma.igChat.upsert({
        where: { chatId: c.id },
        create: { chatId: c.id, ...row },
        update: row,
      });
      if (card?.username) handles++;
    }
    await sleep(PAUSE_MS);
  }

  const total = await prisma.igChat.count({ where: { username: { not: null } } });

  return {
    seen: chats.length,
    known: known.size,
    fromLeads,
    fetched: todo.length,
    handles,
    failed,
    total,
  };
}
