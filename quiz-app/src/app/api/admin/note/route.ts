import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DS_ID = process.env.NOTION_EVENTS_DB_ID!;

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { user_id, username, first_name, note } = await request.json();
  if (!user_id || !note) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const page = await notion.pages.create({
    parent: { data_source_id: EVENTS_DS_ID },
    properties: {
      event_type: { title: [{ text: { content: 'admin_note' } }] },
      user_id: { number: user_id },
      username: { rich_text: [{ text: { content: username || '' } }] },
      first_name: { rich_text: [{ text: { content: first_name || '' } }] },
      result_title: { rich_text: [{ text: { content: note } }] },
      result_id: { rich_text: [{ text: { content: '' } }] },
      result_stage: { rich_text: [{ text: { content: '' } }] },
      utm_source: { rich_text: [{ text: { content: '' } }] },
      amount: { number: null },
      timestamp: { date: { start: new Date().toISOString() } },
    },
  });

  return NextResponse.json({ ok: true, pageId: page.id });
}
