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
      page_size: 100,
    });

    const events = (response.results as any[]).map((p) => ({
      type: p.properties.event_type?.title?.[0]?.plain_text as string,
      timestamp: p.properties.timestamp?.date?.start as string,
      user_id: p.properties.user_id?.number as number | null,
      username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
      result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
      utm_source: (p.properties.utm_source?.rich_text?.[0]?.plain_text as string) || '',
    })).filter(e => e.type && e.type !== 'admin_config');

    const funnelSteps = ['bot_start', 'webapp_open', 'quiz_complete', 'subscribe_click', 'payment_click', 'payment_success'];
    const funnel: Record<string, Set<number>> = {};
    funnelSteps.forEach(s => { funnel[s] = new Set(); });

    const counts: Record<string, number> = {};
    const recentEvents: Array<{ timestamp: string; event_type: string; username: string; result_id: string }> = [];

    events.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
      if (e.user_id && funnel[e.type]) {
        funnel[e.type].add(e.user_id);
      }
      recentEvents.push({
        timestamp: e.timestamp,
        event_type: e.type,
        username: e.username,
        result_id: e.result_id,
      });
    });

    recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const funnelData = funnelSteps.map(step => ({
      step,
      count: funnel[step].size,
      raw: counts[step] || 0,
    }));

    return NextResponse.json({
      counts,
      funnel: funnelData,
      recent: recentEvents.slice(0, 10),
      total_events: events.length,
    });
  } catch (error) {
    console.error('[Admin Stats]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
