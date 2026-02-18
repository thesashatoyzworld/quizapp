import { Client } from '@notionhq/client';
import CampaignsClient, { Campaign, FunnelStats } from './CampaignsClient';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

async function getCampaigns(): Promise<Campaign[]> {
  const all: Campaign[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      const type = p.properties.event_type?.title?.[0]?.plain_text as string;
      if (type !== 'campaign_reel') continue;

      const raw = (p.properties.result_title?.rich_text?.[0]?.plain_text as string) || '{}';
      let data: { name?: string; platform?: string; comments?: number; keywords?: number } = {};
      try { data = JSON.parse(raw); } catch { /* ignore */ }

      all.push({
        pageId: p.id as string,
        name: data.name || 'Без названия',
        platform: data.platform || 'instagram',
        comments: data.comments || 0,
        keywords: data.keywords || 0,
        date: (p.properties.timestamp?.date?.start as string) || '',
      });
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function getFunnelStats(): Promise<FunnelStats> {
  let botStart = 0;
  let quizCompleted = 0;
  let sales = 0;
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const p of response.results as any[]) {
      const type = p.properties.event_type?.title?.[0]?.plain_text as string;
      const utm = (p.properties.utm_source?.rich_text?.[0]?.plain_text as string) || '';

      if (type === 'bot_start' && utm === 'instagram') botStart++;
      if (type === 'quiz_complete') quizCompleted++;
      if (type === 'payment_success' || type === 'connectors_payment') sales++;
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return { botStart, quizCompleted, sales };
}

export default async function CampaignsPage() {
  const [campaigns, stats] = await Promise.all([getCampaigns(), getFunnelStats()]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Кампании
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Воронка по рилсам
        </p>
      </div>

      <CampaignsClient stats={stats} campaigns={campaigns} />
    </div>
  );
}
