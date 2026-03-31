import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const TOKEN = process.env.IG_PAGE_TOKEN;
const ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
const API = 'https://graph.facebook.com/v25.0';

interface ScanLog {
  type: 'info' | 'match' | 'success' | 'error';
  message: string;
  timestamp: string;
}

async function igApi(path: string, method = 'GET', body: Record<string, unknown> | null = null) {
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${url}${separator}access_token=${TOKEN}`;

  const opts: RequestInit = { method, headers: {} };
  if (body) {
    (opts.headers as Record<string, string>)['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, opts);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  void request;

  if (!TOKEN || !ACCOUNT_ID) {
    return NextResponse.json({ error: 'IG_PAGE_TOKEN or IG_ACCOUNT_ID not configured' }, { status: 500 });
  }

  const logs: ScanLog[] = [];
  const now = () => new Date().toISOString();

  logs.push({ type: 'info', message: `Scanning @thesashatoyz (${ACCOUNT_ID})...`, timestamp: now() });

  try {
    // 1. Fetch recent media
    const media = await igApi(`/${ACCOUNT_ID}/media?fields=id,caption,timestamp,media_type&limit=5`);

    if (!media.data?.length) {
      logs.push({ type: 'info', message: 'No recent media found', timestamp: now() });
      return NextResponse.json({ logs, matches: 0 });
    }

    logs.push({ type: 'info', message: `Found ${media.data.length} recent posts`, timestamp: now() });

    // 2. Load active keywords from DB
    const keywords = await prisma.igKeyword.findMany({ where: { active: true } });
    if (!keywords.length) {
      logs.push({ type: 'info', message: 'No active keywords configured', timestamp: now() });
      return NextResponse.json({ logs, matches: 0 });
    }

    logs.push({ type: 'info', message: `Active keywords: ${keywords.map(k => `"${k.keyword}"`).join(', ')}`, timestamp: now() });

    let totalMatches = 0;

    // 3. Scan comments on each post
    for (const post of media.data) {
      const caption = (post.caption || '').slice(0, 40);
      logs.push({ type: 'info', message: `Checking post: "${caption}..." (${post.media_type})`, timestamp: now() });

      let comments;
      try {
        comments = await igApi(`/${post.id}/comments?fields=id,text,username,timestamp&limit=50`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        logs.push({ type: 'error', message: `Cannot read comments: ${msg}`, timestamp: now() });
        continue;
      }

      if (!comments.data?.length) {
        logs.push({ type: 'info', message: '  No comments', timestamp: now() });
        continue;
      }

      logs.push({ type: 'info', message: `  ${comments.data.length} comments found`, timestamp: now() });

      for (const comment of comments.data) {
        const textLower = (comment.text || '').toLowerCase();

        for (const kw of keywords) {
          if (!textLower.includes(kw.keyword.toLowerCase())) continue;

          // Check dedup
          const existing = await prisma.igReply.findUnique({
            where: { commentId: comment.id },
          });
          if (existing) {
            logs.push({ type: 'info', message: `  Already processed: @${comment.username} "${comment.text}"`, timestamp: now() });
            continue;
          }

          totalMatches++;
          logs.push({
            type: 'match',
            message: `  MATCH: @${comment.username} said "${comment.text}" → keyword "${kw.keyword}"`,
            timestamp: now(),
          });

          // Save to DB
          const reply = await prisma.igReply.create({
            data: {
              keywordId: kw.id,
              commentId: comment.id,
              igUserId: comment.username || 'unknown',
              igUsername: comment.username || null,
              mediaId: post.id,
              commentText: comment.text,
              replySent: false,
            },
          });

          // 4. Send public comment reply
          try {
            await igApi(`/${comment.id}/replies`, 'POST', {
              message: '✅ Sent you a link in Direct!',
            });
            logs.push({ type: 'success', message: `  Comment reply sent to @${comment.username}`, timestamp: now() });
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            logs.push({ type: 'error', message: `  Comment reply failed: ${msg}`, timestamp: now() });
          }

          // 5. Send Private Reply (DM)
          try {
            await igApi(`/${ACCOUNT_ID}/messages`, 'POST', {
              recipient: { comment_id: comment.id },
              message: { text: kw.replyText },
            });
            await prisma.igReply.update({
              where: { id: reply.id },
              data: { replySent: true },
            });
            logs.push({ type: 'success', message: `  Private Reply (DM) sent to @${comment.username}!`, timestamp: now() });
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            await prisma.igReply.update({
              where: { id: reply.id },
              data: { error: msg },
            });
            logs.push({ type: 'error', message: `  DM failed: ${msg}`, timestamp: now() });
          }

          break; // one keyword per comment
        }
      }
    }

    logs.push({ type: 'info', message: `Scan complete. ${totalMatches} new match(es) found.`, timestamp: now() });
    return NextResponse.json({ logs, matches: totalMatches });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.push({ type: 'error', message: `Scan failed: ${msg}`, timestamp: now() });
    return NextResponse.json({ logs, matches: 0 }, { status: 500 });
  }
}
