import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const tab = searchParams.get('tab') || 'keywords';

  if (tab === 'keywords') {
    const keywords = await prisma.igKeyword.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Count replies per keyword
    const replyCounts = await prisma.igReply.groupBy({
      by: ['keywordId'],
      _count: true,
    });
    const countMap = new Map(replyCounts.map(r => [r.keywordId, r._count]));
    const result = keywords.map(kw => ({
      ...kw,
      replyCount: countMap.get(kw.id) || 0,
    }));
    return NextResponse.json({ keywords: result });
  }

  if (tab === 'replies') {
    const replies = await prisma.igReply.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { keyword: { select: { keyword: true } } },
    });
    return NextResponse.json({ replies });
  }

  if (tab === 'logs') {
    const logs = await prisma.igWebhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return NextResponse.json({ logs });
  }

  if (tab === 'stats') {
    const [totalReplies, successReplies, activeKeywords] = await Promise.all([
      prisma.igReply.count(),
      prisma.igReply.count({ where: { replySent: true } }),
      prisma.igKeyword.count({ where: { active: true } }),
    ]);
    return NextResponse.json({
      stats: {
        totalReplies,
        successReplies,
        successRate: totalReplies > 0 ? Math.round((successReplies / totalReplies) * 100) : 0,
        activeKeywords,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid tab' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  if (action === 'add_keyword') {
    const { keyword, replyText } = body;
    if (!keyword?.trim() || !replyText?.trim()) {
      return NextResponse.json({ error: 'keyword and replyText required' }, { status: 400 });
    }
    const created = await prisma.igKeyword.create({
      data: { keyword: keyword.trim(), replyText: replyText.trim() },
    });
    return NextResponse.json({ ok: true, keyword: created });
  }

  if (action === 'toggle_keyword') {
    const { id, active } = body;
    const updated = await prisma.igKeyword.update({
      where: { id },
      data: { active },
    });
    return NextResponse.json({ ok: true, keyword: updated });
  }

  if (action === 'delete_keyword') {
    const { id } = body;
    await prisma.igKeyword.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
