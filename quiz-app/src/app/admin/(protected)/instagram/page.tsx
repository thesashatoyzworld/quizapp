import { prisma } from '@/lib/prisma';
import InstagramClient from './InstagramClient';

export type IgKeywordData = {
  id: number;
  keyword: string;
  replyText: string;
  active: boolean;
  createdAt: string;
  _count: { replies: number };
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
  const [keywords, replies, logs, totalReplies, successReplies, activeKeywords] = await Promise.all([
    prisma.igKeyword.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { replies: true } } },
    }),
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
        initialKeywords={JSON.parse(JSON.stringify(keywords))}
        initialReplies={JSON.parse(JSON.stringify(replies))}
        initialLogs={JSON.parse(JSON.stringify(logs))}
        initialStats={stats}
      />
    </div>
  );
}
