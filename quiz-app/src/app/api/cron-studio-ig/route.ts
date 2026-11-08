// Daily pull of Sasha's Instagram posts and their numbers for «Студия».
// Runs on Vercel (vercel.json), so snapshots accumulate with the laptop off.

import { NextRequest, NextResponse } from 'next/server';
import { syncInstagram } from '@/lib/studio/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await syncInstagram()) });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown';
    console.error('[studio] cron failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
