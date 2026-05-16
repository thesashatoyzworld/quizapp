import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const EVENTS_DB_ID = process.env.NOTION_EVENTS_DB_ID!;
const FOLLOWUP_DS_ID = process.env.NOTION_FOLLOWUP_DB_ID!;
const BOT_TOKEN = process.env.BOT_TOKEN!;
const WEBAPP_URL = (process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://quizapp-ivory-delta.vercel.app').replace(/\/$/, '');

// Always exclude admin and test accounts
const DEFAULT_EXCLUDE = new Set([788334680, 6013902004]);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAllUsers(extraExclude: Set<number>) {
  const users = new Map<number, { uid: number; username: string; first_name: string }>();
  const excludeIds = new Set([...DEFAULT_EXCLUDE, ...extraExclude]);

  // From Events DB
  const evResp = await notion.dataSources.query({ data_source_id: EVENTS_DB_ID, page_size: 100 });
  for (const p of evResp.results as any[]) {
    const uid = p.properties.user_id?.number as number;
    if (!uid || uid <= 0) continue;
    if (!users.has(uid)) {
      users.set(uid, {
        uid,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
      });
    }
  }

  // From FollowUpQueue (mark paid users for exclusion)
  const fResp = await notion.dataSources.query({ data_source_id: FOLLOWUP_DS_ID, page_size: 100 });
  for (const p of fResp.results as any[]) {
    const uid = p.properties.user_id?.number as number;
    if (!uid) continue;
    const paid = p.properties.paid?.checkbox as boolean;
    if (paid) excludeIds.add(uid);
    if (!users.has(uid)) {
      users.set(uid, {
        uid,
        username: (p.properties.username?.rich_text?.[0]?.plain_text as string) || '',
        first_name: (p.properties.first_name?.rich_text?.[0]?.plain_text as string) || '',
      });
    }
  }

  return [...users.values()].filter(u => !excludeIds.has(u.uid));
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    broadcastId: string;
    photoFileId?: string;
    videoFileId?: string;
    mediaType?: 'photo' | 'video';
    caption: string;
    linkOffset?: number;
    linkLength?: number;
    extraExclude?: number[];
    dryRun?: boolean;
  };

  const { broadcastId, photoFileId, videoFileId, caption, linkOffset, linkLength, dryRun } = body;
  const mediaType: 'photo' | 'video' = body.mediaType || 'photo';
  const mediaFileId = mediaType === 'video' ? videoFileId : photoFileId;

  if (!broadcastId || !mediaFileId || !caption) {
    return NextResponse.json(
      { error: `broadcastId, ${mediaType}FileId, caption required` },
      { status: 400 }
    );
  }

  try {
    const extraExclude = new Set<number>((body.extraExclude || []).map(Number));
    const targets = await getAllUsers(extraExclude);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        total: targets.length,
        users: targets.map(u => ({ uid: u.uid, username: u.username })),
      });
    }

    let sent = 0, failed = 0, blocked = 0;
    const errors: string[] = [];

    for (const user of targets) {
      const trackUrl = `${WEBAPP_URL}/api/bc?uid=${user.uid}&bc=${broadcastId}`;

      const entities: object[] = [];
      if (linkOffset !== undefined && linkLength !== undefined) {
        entities.push({ offset: linkOffset, length: linkLength, type: 'text_link', url: trackUrl });
      }

      const tgMethod = mediaType === 'video' ? 'sendVideo' : 'sendPhoto';
      const tgPayload: Record<string, unknown> = {
        chat_id: user.uid,
        [mediaType]: mediaFileId,
        caption,
        ...(entities.length > 0 ? { caption_entities: entities } : {}),
      };
      if (mediaType === 'video') {
        tgPayload.supports_streaming = true;
      }

      const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${tgMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgPayload),
      });

      const data = await resp.json() as { ok: boolean; error_code?: number; description?: string };

      if (data.ok) {
        sent++;
      } else if (data.error_code === 403) {
        blocked++;
      } else {
        failed++;
        errors.push(`${user.uid}: ${data.description}`);
      }

      await sleep(1100); // ~1 msg/sec rate limit
    }

    return NextResponse.json({ success: true, total: targets.length, sent, failed, blocked, errors });
  } catch (error) {
    console.error('[Admin Broadcast Send]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
