// Клиент ChatPlace (chatplace.io) — Instagram-бот @thesashatoyz.
//
// У ChatPlace нет обычного REST: единственный рабочий вход — MCP-эндпоинт,
// JSON-RPC 2.0 поверх HTTP. Отвечает он либо чистым JSON, либо потоком SSE,
// поэтому ответ разбираем в двух вариантах. Полезная нагрузка инструмента
// приходит строкой в result.content[0].text — её и парсим.

const MCP_URL = process.env.CHATPLACE_MCP_URL || 'https://mcp.chatplace.io/mcp';

export const IG_BOT_ID = process.env.CHATPLACE_BOT_ID || '019d8576-a72c-70d0-87df-5fa9c2e46804';

let rpcId = 0;

export class ChatPlaceError extends Error {}

async function call<T>(tool: string, args: Record<string, unknown> = {}): Promise<T> {
  const key = process.env.CHATPLACE_API_KEY;
  if (!key) throw new ChatPlaceError('CHATPLACE_API_KEY не задан');

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: ++rpcId,
      method: 'tools/call',
      params: { name: tool, arguments: args },
    }),
    cache: 'no-store',
  });

  if (!res.ok) throw new ChatPlaceError(`${tool}: HTTP ${res.status} ${await res.text()}`);

  const raw = await res.text();
  const envelope = parseEnvelope(raw);

  if (envelope?.error) throw new ChatPlaceError(`${tool}: ${envelope.error.message || 'RPC error'}`);

  const text = envelope?.result?.content?.[0]?.text;
  if (typeof text !== 'string') throw new ChatPlaceError(`${tool}: пустой ответ`);

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ChatPlaceError(`${tool}: ответ не JSON — ${text.slice(0, 200)}`);
  }
}

type Envelope = {
  error?: { message?: string };
  result?: { content?: { text?: string }[] };
};

// SSE-ответ приходит строками «data: {...}» — берём последний кадр с полезной нагрузкой.
function parseEnvelope(raw: string): Envelope | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed) as Envelope;
    } catch {
      return null;
    }
  }
  let last: Envelope | null = null;
  for (const line of trimmed.split('\n')) {
    if (!line.startsWith('data:')) continue;
    try {
      last = JSON.parse(line.slice(5).trim()) as Envelope;
    } catch {
      /* кадр не JSON — пропускаем */
    }
  }
  return last;
}

// ─── Типы ответов, которые нам нужны ───

export type CpAutomation = {
  id: string;
  name: string;
  statusName: string;
  startMessages: string[];
  totalClients: number;
  totalConversions: number;
  conversionRate: number;
  lastRunAt: string | null;
};

export type CpClient = {
  id: string;
  name: string | null;
  username: string | null;
  eventTime: number; // unix seconds
};

export type CpChat = {
  id: string;
  clientId: string;
  clientName: string | null;
  status: number; // 1 active | 2 stopped | 3 unsubscribe
  statusName: string;
  type: number; // 1 open (оператор) | 2 closed (бот)
  typeName: string;
  lastMessageAt: number;
};

export type CpMessage = {
  id: string;
  side: 'bot' | 'client';
  message: string | null;
  createdAt: number;
  messageType: number; // 1 chat text | 2 log text (служебное)
  messageTypeName: string;
  mediaFiles: { type: number; typeName: string; url: string; name: string }[];
};

// ─── Обёртки над инструментами ───

export function listAutomations(botId: string = IG_BOT_ID): Promise<CpAutomation[]> {
  return call<CpAutomation[]>('automations_list_with_stats', { botId });
}

type ClientsPage = {
  items: CpClient[];
  pagination: { totalItems: number; currentPage: number; lastPage: number };
};

// Все, кто заходил в автоматизацию. Страницы по 100, с потолком, чтобы
// случайно не выкачивать десятки тысяч в один заход. startDate (Y-m-d)
// ограничивает выборку свежими — для инкрементальной синхронизации.
export async function listAutomationClients(
  automationId: string,
  maxPages = 30,
  startDate?: string
): Promise<CpClient[]> {
  const out: CpClient[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await call<ClientsPage>('automations_clients', {
      automationId,
      page,
      limit: 100,
      ...(startDate ? { startDate } : {}),
    });
    out.push(...(res.items || []));
    if (!res.pagination || page >= res.pagination.lastPage) break;
  }
  return out;
}

type ChatsPage = {
  items: CpChat[];
  lastItemId: string | null;
  lastItemTimestamp: string | number | null;
  hasNextItems: boolean;
};

// Чаты идут keyset-пагинацией от свежих к старым.
export async function listChats(maxPages = 20): Promise<CpChat[]> {
  const out: CpChat[] = [];
  let cursor: { lastItemId?: string; lastItemTimestamp?: number } = {};
  for (let page = 0; page < maxPages; page++) {
    const res = await call<ChatsPage>('chats_list', { limit: 100, ...cursor });
    out.push(...(res.items || []));
    if (!res.hasNextItems || !res.lastItemId) break;
    cursor = { lastItemId: res.lastItemId, lastItemTimestamp: Number(res.lastItemTimestamp) };
  }
  return out;
}

export function listChatMessages(chatId: string, limit = 40): Promise<CpMessage[]> {
  return call<CpMessage[]>('chats_messages', { chatId, limit, page: 1 });
}
