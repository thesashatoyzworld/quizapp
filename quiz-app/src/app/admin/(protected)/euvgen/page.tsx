import { Client } from '@notionhq/client';
import EuvgenClient from './EuvgenClient';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

export type EgEvent = {
  type: string;
  timestamp: string;
  user_id: number | null;
  username: string;
  first_name: string;
  utm_source: string;
};

async function getEgEvents(): Promise<EgEvent[]> {
  const all: EgEvent[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      const type = p.properties.event_type?.title?.[0]?.plain_text as string;
      if (!type || !type.startsWith('eg_')) continue;
      all.push({
        type,
        timestamp: (p.properties.timestamp?.date?.start as string) || '',
        user_id: p.properties.user_id?.number as number | null,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
        utm_source: (p.properties.utm_source?.rich_text?.[0]?.plain_text as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return all;
}

export default async function EuvgenPage() {
  const events = await getEgEvents();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          EuvgenGlob — Авто из Китая
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {events.length} событий · @Globenko_auto
        </p>
      </div>
      <EuvgenClient events={events} />
    </div>
  );
}
