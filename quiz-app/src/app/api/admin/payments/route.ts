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
        title: { equals: 'payment_success' },
      },
      page_size: 100,
    });

    const payments = (response.results as any[]).map((p) => ({
      id: p.id as string,
      timestamp: (p.properties.timestamp?.date?.start as string) || '',
      username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
      first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
      user_id: p.properties.user_id?.number as number | null,
      result_id: (p.properties.result_id?.rich_text?.[0]?.plain_text as string) || '',
      amount: (p.properties.amount?.number as number) ?? 0,
      utm_source: (p.properties.utm_source?.rich_text?.[0]?.plain_text as string) || '',
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = payments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({ payments, total, count: payments.length });
  } catch (error) {
    console.error('[Admin Payments]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
