import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const FOLLOWUP_DS_ID = process.env.NOTION_FOLLOWUP_DB_ID!;

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';
  const resultId = searchParams.get('result_id');

  try {
    const response = await notion.dataSources.query({
      data_source_id: FOLLOWUP_DS_ID,
      page_size: 100,
    });

    let users = (response.results as any[]).map((p) => ({
      id: p.id as string,
      user_id: p.properties.user_id?.number as number | null,
      username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
      first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
      result_id: (p.properties.result_id?.select?.name as string) || '',
      registered_at: (p.properties.registered_at?.date?.start as string) || '',
      messages_sent: (p.properties.messages_sent?.number as number) ?? 0,
      paid: (p.properties.paid?.checkbox as boolean) ?? false,
    }));

    if (filter === 'paid') users = users.filter(u => u.paid);
    if (filter === 'archetype' && resultId) users = users.filter(u => u.result_id === resultId);

    users.sort((a, b) => new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime());

    return NextResponse.json({ users, total: users.length });
  } catch (error) {
    console.error('[Admin Users]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
