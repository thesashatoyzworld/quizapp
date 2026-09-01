import { prisma } from '@/lib/prisma';
import type { IgKeywordData, IgReplyData, IgLogData, IgStats } from '../admin/(protected)/instagram/autoreply/page';
import IgDashboardShell from './IgDashboardShell';

export default async function IgDashboardPage() {
  let keywordsRaw, repliesRaw, logsRaw, totalReplies, successReplies, activeKeywords;

  try {
    [keywordsRaw, repliesRaw, logsRaw, totalReplies, successReplies, activeKeywords] = await Promise.all([
      prisma.igKeyword.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.igReply.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { keyword: { select: { keyword: true } } },
      }),
      prisma.igWebhookLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.igReply.count(),
      prisma.igReply.count({ where: { replySent: true } }),
      prisma.igKeyword.count({ where: { active: true } }),
    ]);
  } catch (e) {
    console.error('[IG Dashboard] DB error:', e);
    return (
      <div style={{ padding: '40px', color: '#ff4444', fontFamily: 'system-ui' }}>
        Database connection error. Please try again later.
      </div>
    );
  }

  const replyCountMap = new Map<number, number>();
  for (const r of repliesRaw) {
    replyCountMap.set(r.keywordId, (replyCountMap.get(r.keywordId) || 0) + 1);
  }

  const keywords: IgKeywordData[] = keywordsRaw.map(kw => ({
    id: kw.id,
    keyword: kw.keyword,
    replyText: kw.replyText,
    active: kw.active,
    createdAt: kw.createdAt.toISOString(),
    replyCount: replyCountMap.get(kw.id) || 0,
  }));

  const replies: IgReplyData[] = repliesRaw.map(r => ({
    id: r.id,
    commentId: r.commentId,
    igUsername: r.igUsername,
    commentText: r.commentText,
    replySent: r.replySent,
    error: r.error,
    createdAt: r.createdAt.toISOString(),
    keyword: r.keyword,
  }));

  const logs: IgLogData[] = logsRaw.map(l => ({
    id: l.id,
    payload: l.payload,
    createdAt: l.createdAt.toISOString(),
  }));

  const stats: IgStats = {
    totalReplies,
    successReplies,
    successRate: totalReplies > 0 ? Math.round((successReplies / totalReplies) * 100) : 0,
    activeKeywords,
  };

  return (
    <IgDashboardShell
      initialKeywords={keywords}
      initialReplies={replies}
      initialLogs={logs}
      initialStats={stats}
    />
  );
}
