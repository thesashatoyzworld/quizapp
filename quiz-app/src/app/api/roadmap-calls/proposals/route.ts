import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { callSecretOk } from '@/lib/roadmap/call-secret';
import { normalizePayload, saveAndNotify } from '@/lib/roadmap/call-proposals';

export const runtime = 'nodejs';

// POST /api/roadmap-calls/proposals
// The server pipeline posts what it heard for each client on a group call.
// Stored as pending, Sasha gets one bot message; roadmaps change only after his tap.
// Idempotent on jobId: a retry returns the same proposal and does not message twice.
export async function POST(req: NextRequest) {
  if (!callSecretOk(req.headers.get('x-roadmap-secret'))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  // Keys per active roadmap: slugs and task keys the proposal may reference.
  const roadmaps = await prisma.roadmap.findMany({
    where: { archived: false },
    select: { slug: true, tasks: { select: { key: true } } },
  });
  const known = new Map(
    roadmaps.map((r) => [r.slug, new Set(r.tasks.map((t) => t.key).filter((k): k is string => Boolean(k)))]),
  );

  const parsed = normalizePayload(body, known);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const saved = await saveAndNotify(parsed.payload);
  return NextResponse.json({ ok: true, ...saved, clients: parsed.payload.perClient.length });
}
