import { NextRequest, NextResponse } from 'next/server';
import { HUKI, allText, categoryText, resolveAccess } from '@/lib/huki';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Файлы базы для нейронки: GET ?f=all — вся база, ?f=NN — одна категория.
// Раньше лежали в public/huki, теперь только по пропуску.

export async function GET(request: NextRequest) {
  const access = await resolveAccess(request);
  if (!access.ok) {
    return NextResponse.redirect(new URL('/huki', request.nextUrl.origin));
  }

  const f = request.nextUrl.searchParams.get('f') || 'all';
  const cat = f === 'all' ? null : HUKI.find((c) => c.file === f);
  if (f !== 'all' && !cat) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const text = '﻿' + (cat ? categoryText(cat) + '\n' : allText());
  const name = cat ? `huki-${cat.file}.txt` : 'huki-vse.txt';
  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
