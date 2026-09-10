import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { setClientTrack, type Track } from '@/lib/clients';

const ALLOWED: Track[] = ['lichka', 'group', 't2', 'service'];

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { accessId, track } = (await req.json()) as { accessId?: string; track?: Track };
  if (!accessId || !track || !ALLOWED.includes(track)) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  await setClientTrack(accessId, track);
  return NextResponse.json({ ok: true });
}
