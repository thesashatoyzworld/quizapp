import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';

const REDIRECT_URL = 'https://t.me/testtoyzbot?start=masterclass';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const broadcastId = searchParams.get('bc') || 'unknown';

  if (uid) {
    const userId = parseInt(uid, 10);
    if (userId > 0) {
      await trackEvent({
        event_type: 'broadcast_click',
        user_id: userId,
        utm_source: `broadcast_${broadcastId}`,
      }).catch(() => {});
    }
  }

  return NextResponse.redirect(REDIRECT_URL);
}
