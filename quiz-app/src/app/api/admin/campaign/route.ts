import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { getAdminSession } from '@/lib/admin-auth';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, platform, date, comments, keywords } = await request.json();

  const data = JSON.stringify({ name, platform, comments: Number(comments), keywords: Number(keywords) });

  const page = await notion.pages.create({
    parent: { database_id: EVENTS_DB_ID },
    properties: {
      event_type: { title: [{ text: { content: 'campaign_reel' } }] },
      timestamp: { date: { start: date } },
      result_title: { rich_text: [{ text: { content: data } }] },
    },
  });

  return NextResponse.json({ ok: true, pageId: (page as any).id });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pageId } = await request.json();
  await notion.pages.update({ page_id: pageId, archived: true });
  return NextResponse.json({ ok: true });
}
