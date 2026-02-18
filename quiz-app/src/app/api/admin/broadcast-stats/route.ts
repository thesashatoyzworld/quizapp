import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  void request;

  try {
    const response = await notion.dataSources.query({
      data_source_id: EVENTS_DB_ID,
      filter: {
        property: 'event_type',
        title: { equals: 'broadcast_click' },
      },
      page_size: 100,
    });

    // Group by broadcast_id (stored in utm_source as "broadcast_XXXX")
    const statsMap: Record<string, { clicks: number; uniqueUsers: Set<number> }> = {};

    (response.results as any[]).forEach((p) => {
      const utm = (p.properties.utm_source?.rich_text?.[0]?.plain_text as string) || '';
      const broadcastId = utm.replace('broadcast_', '') || 'unknown';
      const userId = p.properties.user_id?.number as number | null;

      if (!statsMap[broadcastId]) statsMap[broadcastId] = { clicks: 0, uniqueUsers: new Set() };
      statsMap[broadcastId].clicks++;
      if (userId) statsMap[broadcastId].uniqueUsers.add(userId);
    });

    const stats = Object.entries(statsMap).map(([id, s]) => ({
      broadcastId: id,
      clicks: s.clicks,
      uniqueClicks: s.uniqueUsers.size,
    })).sort((a, b) => b.clicks - a.clicks);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[Admin Broadcast Stats]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
