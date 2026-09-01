import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { syncIgLeads } from '@/lib/ig-leads';

export const maxDuration = 60;

// Тянет свежих людей из воронок ChatPlace. По умолчанию — за последние две
// недели; ?full=1 выкачивает всех за всё время (долго, нужно только на первый
// раз или если что-то потерялось).
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const full = new URL(request.url).searchParams.get('full') === '1';

  try {
    const result = await syncIgLeads({ full });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error('[ig-sync]', e);
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
}
