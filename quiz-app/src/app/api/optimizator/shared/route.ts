import { NextRequest, NextResponse } from 'next/server';
import { getSharedRun } from '@/lib/optimizator/store';
import { readShareToken } from '@/lib/optimizator/share';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public read-only view of one run, by a signed share token (see lib/optimizator/share.ts).
//   GET /api/optimizator/shared?t=<id>.<sig> → { run } | { error }
export async function GET(request: NextRequest) {
  const id = readShareToken(request.nextUrl.searchParams.get('t'));
  if (!id) return NextResponse.json({ error: 'Ссылка на разбор неверная' }, { status: 404 });
  try {
    const run = await getSharedRun(id);
    if (!run) return NextResponse.json({ error: 'Разбор не найден' }, { status: 404 });
    return NextResponse.json({ run }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[optimizator] shared run failed:', err);
    return NextResponse.json({ error: 'Не получилось открыть разбор. Обнови страницу.' }, { status: 500 });
  }
}
