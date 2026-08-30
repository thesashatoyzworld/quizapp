import { prisma } from '@/lib/prisma';
import type { LeadStatusValue } from '@/lib/leads';
import {
  sleep,
  listAutomations,
  listAutomationClients,
  listChats,
  listChatMessages,
  type CpChat,
} from '@/lib/chatplace';

// Лиды Instagram: люди, зашедшие в воронки ChatPlace по кодовому слову.
// Слепок человека приходит из ChatPlace, статус и заметку ведём у себя —
// синхронизация их не перетирает.

export type IgLead = {
  id: string;
  clientId: string;
  username: string | null;
  name: string | null;
  automationId: string;
  automationName: string | null;
  keyword: string | null;
  firstSeenAt: string;
  lastEventAt: string;
  chatId: string | null;
  chatStatus: string | null;
  chatHandler: string | null;
  status: LeadStatusValue;
  note: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type IgAutomationOption = { id: string; name: string; keyword: string | null; count: number };

export type IgMessage = { at: string; side: 'bot' | 'client'; text: string };

// Сколько дней назад заглядывать при обычной синхронизации. Полная (все люди
// за всё время) идёт только когда таблица пустая или её попросили руками.
const INCREMENTAL_DAYS = 14;

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Разметка ChatPlace приходит в HTML (<p>…</p>) — в таблице она не нужна.
function stripHtml(s: string | null): string {
  if (!s) return '';
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

export type SyncResult = {
  automations: number;
  seen: number;
  created: number;
  updated: number;
  full: boolean;
  failed: string[]; // воронки, которые ChatPlace не отдал
};

type Snapshot = {
  clientId: string;
  automationId: string;
  username: string | null;
  name: string | null;
  automationName: string | null;
  keyword: string | null;
  firstSeenAt: Date;
  lastEventAt: Date;
  chatId: string | null;
  chatStatus: string | null;
  chatHandler: string | null;
};

const BATCH = 250;

// Пишем пачками одним INSERT … ON CONFLICT: людей бывает несколько тысяч, и
// поштучный upsert через пул Supabase занимает минуты. В SET нет status, note
// и updated_by — то, что ведёт ассистент, синхронизация не трогает.
async function writeBatch(rows: Snapshot[]): Promise<void> {
  if (rows.length === 0) return;

  const COLS = 13;
  const placeholders: string[] = [];
  const values: unknown[] = [];

  rows.forEach((r, i) => {
    const b = i * COLS;
    placeholders.push(`(${Array.from({ length: COLS }, (_, k) => `$${b + k + 1}`).join(',')})`);
    values.push(
      crypto.randomUUID(),
      r.clientId,
      r.automationId,
      r.username,
      r.name,
      r.automationName,
      r.keyword,
      r.firstSeenAt,
      r.lastEventAt,
      r.chatId,
      r.chatStatus,
      r.chatHandler,
      new Date()
    );
  });

  await prisma.$executeRawUnsafe(
    `INSERT INTO ig_lead
       (id, client_id, automation_id, username, name, automation_name, keyword,
        first_seen_at, last_event_at, chat_id, chat_status, chat_handler, synced_at)
     VALUES ${placeholders.join(',')}
     ON CONFLICT (client_id, automation_id) DO UPDATE SET
       username        = EXCLUDED.username,
       name            = EXCLUDED.name,
       automation_name = EXCLUDED.automation_name,
       keyword         = EXCLUDED.keyword,
       last_event_at   = EXCLUDED.last_event_at,
       chat_id         = EXCLUDED.chat_id,
       chat_status     = EXCLUDED.chat_status,
       chat_handler    = EXCLUDED.chat_handler,
       synced_at       = EXCLUDED.synced_at,
       updated_at      = EXCLUDED.synced_at`,
    ...values
  );
}

export async function syncIgLeads(opts: { full?: boolean } = {}): Promise<SyncResult> {
  const known = await prisma.igLead.count();
  const full = opts.full === true;

  const automations = (await listAutomations()).filter((a) => a.totalClients > 0);

  // Чаты тянем один раз на всю синхронизацию: по ним видно, жив ли диалог и
  // кто его ведёт — бот или оператор.
  let chatByClient = new Map<string, CpChat>();
  try {
    const chats = await listChats(full ? 40 : 10);
    chatByClient = new Map(chats.map((c) => [c.clientId, c]));
  } catch {
    // без чатов список людей всё равно собирается — просто без их состояния
  }

  const startDate = full ? undefined : ymd(new Date(Date.now() - INCREMENTAL_DAYS * 864e5));

  let seen = 0;
  let batch: Snapshot[] = [];

  const failed: string[] = [];
  // Воронки, которые ChatPlace не отдал с первого раза, пробуем ещё раз в конце.
  const retryQueue: typeof automations = [];

  for (const a of automations) {
    const keyword = a.startMessages?.[0] || null;

    // Одна упавшая воронка не должна ронять всю сверку — остальные доедут.
    let clients;
    try {
      clients = await listAutomationClients(a.id, full ? 60 : 10, startDate);
    } catch (e) {
      console.error('[ig-sync] воронка', a.name, e);
      retryQueue.push(a);
      continue;
    }

    for (const c of clients) {
      seen++;
      const at = new Date(c.eventTime * 1000);
      const chat = chatByClient.get(c.id);

      batch.push({
        clientId: c.id,
        automationId: a.id,
        username: c.username || null,
        name: c.name || null,
        automationName: a.name,
        keyword,
        firstSeenAt: at,
        lastEventAt: at,
        chatId: chat?.id ?? null,
        chatStatus: chat?.statusName ?? null,
        chatHandler: chat?.typeName ?? null,
      });

      if (batch.length >= BATCH) {
        await writeBatch(batch);
        batch = [];
      }
    }
  }
  await writeBatch(batch);

  // Второй заход по упавшим — после паузы ChatPlace обычно отвечает.
  for (const a of retryQueue) {
    const keyword = a.startMessages?.[0] || null;
    try {
      await sleep(2000);
      const clients = await listAutomationClients(a.id, full ? 60 : 10, startDate);
      const rows = clients.map((c) => {
        const at = new Date(c.eventTime * 1000);
        const chat = chatByClient.get(c.id);
        return {
          clientId: c.id,
          automationId: a.id,
          username: c.username || null,
          name: c.name || null,
          automationName: a.name,
          keyword,
          firstSeenAt: at,
          lastEventAt: at,
          chatId: chat?.id ?? null,
          chatStatus: chat?.statusName ?? null,
          chatHandler: chat?.typeName ?? null,
        };
      });
      seen += rows.length;
      for (let i = 0; i < rows.length; i += BATCH) await writeBatch(rows.slice(i, i + BATCH));
    } catch (e) {
      console.error('[ig-sync] воронка (повтор)', a.name, e);
      failed.push(keyword || a.name);
    }
  }

  // Сколько из увиденных оказались новыми — считаем по приросту таблицы:
  // это надёжнее, чем гадать по времени создания записи.
  const created = Math.max(0, (await prisma.igLead.count()) - known);
  return { automations: automations.length, seen, created, updated: seen - created, full, failed };
}

// Людей тысячи, в таблицу тянем только свежий срез — по воронке, если её
// выбрали. Фильтр по статусу и поиск дальше делает уже сама страница.
export const IG_PAGE_SIZE = 500;

export async function getIgLeads(opts: { automationId?: string } = {}): Promise<IgLead[]> {
  const rows = await prisma.igLead.findMany({
    where: opts.automationId ? { automationId: opts.automationId } : undefined,
    orderBy: { lastEventAt: 'desc' },
    take: IG_PAGE_SIZE,
  });
  return rows.map((r) => ({
    id: r.id,
    clientId: r.clientId,
    username: r.username,
    name: r.name,
    automationId: r.automationId,
    automationName: r.automationName,
    keyword: r.keyword,
    firstSeenAt: r.firstSeenAt.toISOString(),
    lastEventAt: r.lastEventAt.toISOString(),
    chatId: r.chatId,
    chatStatus: r.chatStatus,
    chatHandler: r.chatHandler,
    status: r.status as LeadStatusValue,
    note: r.note,
    updatedBy: r.updatedBy,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getIgAutomationOptions(): Promise<IgAutomationOption[]> {
  const grouped = await prisma.igLead.groupBy({
    by: ['automationId', 'automationName', 'keyword'],
    _count: { _all: true },
  });
  return grouped
    .map((g) => ({
      id: g.automationId,
      name: g.automationName || g.automationId,
      keyword: g.keyword,
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getLastSyncAt(): Promise<string | null> {
  const row = await prisma.igLead.findFirst({ orderBy: { syncedAt: 'desc' }, select: { syncedAt: true } });
  return row ? row.syncedAt.toISOString() : null;
}

// Переписка человека — подгружается по клику, живьём из ChatPlace.
// Служебные строки (messageType 2, вроде ActiveStatusLabel) отбрасываем.
export async function getIgThread(chatId: string): Promise<IgMessage[]> {
  const msgs = await listChatMessages(chatId, 40);
  return msgs
    .filter((m) => m.messageType === 1)
    .map((m) => ({
      at: new Date(m.createdAt * 1000).toISOString(),
      side: m.side,
      text: stripHtml(m.message) || (m.mediaFiles?.length ? `[${m.mediaFiles[0].typeName}]` : ''),
    }))
    .filter((m) => m.text)
    .reverse();
}
