import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { trackEvent } from '@/lib/notion';

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

  await trackEvent({ event_type, user_id, username, first_name });

  return NextResponse.json({ ok: true });
}
