import { NextRequest, NextResponse } from 'next/server';
import { callSecretOk } from '@/lib/roadmap/call-secret';
import { listCandidates } from '@/lib/roadmap/call-proposals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/roadmap-calls/candidates
// Active roadmaps with their tasks: the server pipeline matches the people it
// heard on a group call against this list. Header x-roadmap-secret.
export async function GET(req: NextRequest) {
  if (!callSecretOk(req.headers.get('x-roadmap-secret'))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  return NextResponse.json({ ok: true, candidates: await listCandidates() });
}
