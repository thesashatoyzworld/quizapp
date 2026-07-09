import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/notion';

const DEFAULT_REDIRECT = 'https://t.me/testtoyzbot';
// Куда разрешено редиректить (защита от open-redirect): только наши ресурсы.
const ALLOWED = [/^https:\/\/t\.me\//i, /^https:\/\/([a-z0-9-]+\.)?thesashatoyz\.com\//i];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const broadcastId = searchParams.get('bc') || 'unknown';
  const to = searchParams.get('to');

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

  const target = to && ALLOWED.some((re) => re.test(to)) ? to : DEFAULT_REDIRECT;
  return NextResponse.redirect(target);
}
