import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { optEvent } from '@/lib/optimizator/free';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Funnel events of the free optimizer from the page (offer views/clicks, invite share/copy).
//   POST /api/cabinet/optimizator/ev {ev} → { ok }
const ALLOWED = /^(cta_(view|click)_(uroven|potok|360)|share|copy|sub_open)$/;

export async function POST(request: NextRequest) {
  const id = verifiedViewer(request);
  if (!id) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const ev = typeof body?.ev === 'string' ? body.ev : '';
  if (!ALLOWED.test(ev)) return NextResponse.json({ ok: false }, { status: 400 });
  await optEvent(id, ev);
  return NextResponse.json({ ok: true });
}
