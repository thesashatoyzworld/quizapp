import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { signTicket } from '@/lib/telegram-login';
import { isReviewId } from '@/lib/instagram/connect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Entry for Meta App Review reviewers, who have no Telegram:
//   GET /api/cabinet/instagram/review?key=<STATS_REVIEW_KEY>
// Logs in as the fixed demo account STATS_REVIEW_TG_ID through the normal
// browser flow (ticket → /api/cabinet/open → kb_session) and opens /optimizator.
// The demo account owns no student data; it sees only its own Instagram block.
export async function GET(request: NextRequest) {
  const want = process.env.STATS_REVIEW_KEY || '';
  const demo = Number(process.env.STATS_REVIEW_TG_ID || 0);
  if (!want || !isReviewId(demo)) return new NextResponse('Not found', { status: 404 });

  const a = Buffer.from(request.nextUrl.searchParams.get('key') || '');
  const b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return new NextResponse('Not found', { status: 404 });

  const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
  if (!secret) return NextResponse.json({ error: 'server misconfigured' }, { status: 500 });
  const url = new URL('/api/cabinet/open', request.nextUrl.origin);
  url.searchParams.set('ticket', signTicket(demo, secret));
  url.searchParams.set('to', '/optimizator');
  console.log('[ig-connect] review entry used');
  return NextResponse.redirect(url);
}
