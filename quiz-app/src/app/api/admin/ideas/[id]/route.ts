import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { IDEA_STATUSES } from '@/lib/ideas/types';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };

  if (!body.status || !IDEA_STATUSES.includes(body.status as never)) {
    return NextResponse.json({ error: `status must be one of ${IDEA_STATUSES.join(', ')}` }, { status: 400 });
  }

  const idea = await prisma.idea.update({ where: { id }, data: { status: body.status } });
  return NextResponse.json({ ok: true, status: idea.status });
}
