// Worker API for the VPS recognizer (services/budget-shots/run.mjs).
// GET: next pending screenshot with the prompt and schema. POST: its result.
import { NextRequest, NextResponse } from 'next/server';
import { SHOT_SCHEMA, completeShot, failShot, pendingShots, shotPrompt } from '@/lib/budget/shots';

export const dynamic = 'force-dynamic';

function authorized(req: NextRequest) {
  return !!process.env.CRON_SECRET && req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const shots = await pendingShots(1);
  return NextResponse.json({ prompt: shotPrompt(), schema: SHOT_SCHEMA, shots });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string; output?: unknown; error?: string } | null;
  const id = String(body?.id || '');
  if (!id) return NextResponse.json({ error: 'нет id' }, { status: 400 });
  try {
    if (body?.error || !body?.output || typeof body.output !== 'object') {
      await failShot(id, String(body?.error || 'нет ответа от распознавания'));
      return NextResponse.json({ ok: true });
    }
    const result = await completeShot(id, body.output as Record<string, unknown>);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error('[budget-shots POST]', error);
    await failShot(id, 'не получилось записать результат').catch(() => {});
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
