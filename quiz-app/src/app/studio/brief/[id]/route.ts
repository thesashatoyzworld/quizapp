// Brief HTML for a studio item, for Sasha or Danya only. Served as its own
// document under a CSP sandbox (opaque origin): the brief can run its own
// scripts but cannot read our cookies or call our API as the viewer.

import { NextResponse } from 'next/server';
import { currentActor, getBriefHtml } from '@/lib/studio/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentActor())) return new NextResponse('Нет доступа', { status: 401 });
  const html = await getBriefHtml((await params).id);
  if (!html) return new NextResponse('ТЗ не найдено', { status: 404 });
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': 'sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox',
      'x-robots-tag': 'noindex',
      'cache-control': 'private, no-store',
    },
  });
}
