import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DS_ID = process.env.NOTION_EVENTS_DB_ID!;

const ALLOWED = ['admin_dm_sent', 'admin_dm_replied'];

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { event_type, user_id, username, first_name } = await request.json();

  if (!ALLOWED.includes(event_type)) {
    return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 });
  }
  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const page = await notion.pages.create({
    parent: { data_source_id: EVENTS_DS_ID },
    properties: {
      event_type: { title: [{ text: { content: event_type } }] },
      user_id: { number: user_id },
      username: { rich_text: [{ text: { content: username || '' } }] },
      first_name: { rich_text: [{ text: { content: first_name || '' } }] },
      utm_source: { rich_text: [{ text: { content: '' } }] },
      result_id: { rich_text: [{ text: { content: '' } }] },
      result_title: { rich_text: [{ text: { content: '' } }] },
      result_stage: { rich_text: [{ text: { content: '' } }] },
      amount: { number: null },
      timestamp: { date: { start: new Date().toISOString() } },
    },
  });

  return NextResponse.json({ ok: true, pageId: page.id });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pageId } = await request.json();
  if (!pageId) return NextResponse.json({ error: 'Missing pageId' }, { status: 400 });

  await notion.pages.update({ page_id: pageId, archived: true });

  return NextResponse.json({ ok: true });
}
