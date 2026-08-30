import { prisma } from '@/lib/prisma';
import InstagramClient from './InstagramClient';

export type IgKeywordData = {
  id: number;
  keyword: string;
  replyText: string;
  active: boolean;
  createdAt: string;
  replyCount: number;
};

export type IgReplyData = {
  id: number;
  commentId: string;
  igUsername: string | null;
  commentText: string | null;
  replySent: boolean;
  error: string | null;
  createdAt: string;
  keyword: { keyword: string };
};

export type IgLogData = {
  id: number;
  payload: string;
  createdAt: string;
};

export type IgStats = {
  totalReplies: number;
  successReplies: number;
  successRate: number;
  activeKeywords: number;
};

export default async function InstagramPage() {
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
    console.error('[Instagram page] DB error:', e);
    return (
      <div>
        <h1 style={{ color: 'var(--text-primary)' }}>Instagram Auto-Reply</h1>
        <p style={{ color: '#ff4444' }}>Database error: {String(e)}</p>
      </div>
    );
  }

  // Count replies per keyword
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
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Instagram Auto-Reply
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Keyword-based comment detection and automatic replies for @thesashatoyz
        </p>
      </div>

      <InstagramClient
        initialKeywords={keywords}
        initialReplies={replies}
        initialLogs={logs}
        initialStats={stats}
      />
    </div>
  );
}
