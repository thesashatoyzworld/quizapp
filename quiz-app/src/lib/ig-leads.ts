import { prisma } from '@/lib/prisma';
import type { LeadStatusValue } from '@/lib/leads';
import {
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

export type SyncResult = { automations: number; seen: number; created: number; updated: number; full: boolean };

export async function syncIgLeads(opts: { full?: boolean } = {}): Promise<SyncResult> {
  const known = await prisma.igLead.count();
  const full = opts.full || known === 0;

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
  let created = 0;
  let updated = 0;

  for (const a of automations) {
    const clients = await listAutomationClients(a.id, full ? 60 : 10, startDate);
    const keyword = a.startMessages?.[0] || null;

    for (const c of clients) {
      seen++;
      const at = new Date(c.eventTime * 1000);
      const chat = chatByClient.get(c.id);

      const snapshot = {
        username: c.username || null,
        name: c.name || null,
        automationName: a.name,
        keyword,
        lastEventAt: at,
        chatId: chat?.id ?? null,
        chatStatus: chat?.statusName ?? null,
        chatHandler: chat?.typeName ?? null,
        syncedAt: new Date(),
      };

      const res = await prisma.igLead.upsert({
        where: { clientId_automationId: { clientId: c.id, automationId: a.id } },
        create: { clientId: c.id, automationId: a.id, firstSeenAt: at, ...snapshot },
        update: snapshot, // status, note и updatedBy остаются нашими
        select: { createdAt: true, updatedAt: true },
      });
      if (res.createdAt.getTime() === res.updatedAt.getTime()) created++;
      else updated++;
    }
  }

  return { automations: automations.length, seen, created, updated, full };
}

export async function getIgLeads(): Promise<IgLead[]> {
  const rows = await prisma.igLead.findMany({ orderBy: { lastEventAt: 'desc' }, take: 1000 });
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
