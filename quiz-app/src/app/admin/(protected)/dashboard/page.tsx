import { Client } from '@notionhq/client';
import DashboardClient, { RawEvent } from './DashboardClient';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;
const FOLLOWUP_DB_ID = process.env.NOTION_FOLLOWUP_DB_ID!;

async function getAllEvents(): Promise<RawEvent[]> {
  const all: RawEvent[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      const type = p.properties.event_type?.title?.[0]?.plain_text as string;
      if (!type || type === 'admin_config') continue;
      all.push({
        type,
        timestamp: (p.properties.timestamp?.date?.start as string) || '',
        user_id: p.properties.user_id?.number as number | null,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
        result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
        utm_source: (p.properties.utm_source?.rich_text?.[0]?.plain_text as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return all;
}

async function getUsernameMap(): Promise<Map<number, { username: string; first_name: string }>> {
  const map = new Map<number, { username: string; first_name: string }>();
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      const uid = p.properties.user_id?.number as number | null;
      if (!uid) continue;
      map.set(uid, {
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return map;
}

export default async function DashboardPage() {
  const [events, usernameMap] = await Promise.all([getAllEvents(), getUsernameMap()]);

  // Build username map from the events themselves (payment_click, quiz_complete, etc. have username)
  const eventUsernameMap = new Map<number, { username: string; first_name: string }>();
  for (const e of events) {
    if (e.user_id && (e.username || e.first_name)) {
      const existing = eventUsernameMap.get(e.user_id);
      if (!existing || (e.username && !existing.username)) {
        eventUsernameMap.set(e.user_id, { username: e.username, first_name: e.first_name });
      }
    }
  }

  // Enrich events missing username — check FollowUpQueue, then events map
  for (const e of events) {
    if (!e.user_id || (e.username && e.first_name)) continue;
    const fromQueue = usernameMap.get(e.user_id);
    if (fromQueue) {
      if (!e.username) e.username = fromQueue.username;
      if (!e.first_name) e.first_name = fromQueue.first_name;
    }
    const fromEvents = eventUsernameMap.get(e.user_id);
    if (fromEvents) {
      if (!e.username) e.username = fromEvents.username;
      if (!e.first_name) e.first_name = fromEvents.first_name;
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Дашборд
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {events.length} событий всего
        </p>
      </div>
      <DashboardClient events={events} />
    </div>
  );
}
