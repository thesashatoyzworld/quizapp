import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { isIdeaStatus, statusDbValues } from './status';

export type IdeaListItem = Prisma.IdeaGetPayload<{ include: { refs: true } }>;

export interface IdeaFilters {
  type?: string;
  source?: string;
  status?: string;
  q?: string;
}

export async function listIdeas(f: IdeaFilters): Promise<IdeaListItem[]> {
  const where: Prisma.IdeaWhereInput = {};
  if (f.type) where.type = f.type;
  if (f.source) where.source = f.source;
  // A row can still carry a pre-ladder value, so one step means several
  // stored values.
  if (f.status && isIdeaStatus(f.status)) where.status = { in: statusDbValues(f.status) };
  if (f.q) {
    where.OR = [
      { title: { contains: f.q, mode: 'insensitive' } },
      { summary: { contains: f.q, mode: 'insensitive' } },
      { rawText: { contains: f.q, mode: 'insensitive' } },
      { voiceTranscript: { contains: f.q, mode: 'insensitive' } },
    ];
  }

  return prisma.idea.findMany({
    where,
    include: { refs: { orderBy: { position: 'asc' } } },
    orderBy: { occurredAt: 'desc' },
    take: 200,
  });
}

/**
 * Файл отдаёт agent-hub: file_id открывается только токеном того бота,
 * который файл получил.
 */
export function mediaUrl(fileId: string): string {
  const base = (process.env.AGENT_HUB_URL || '').replace(/\/$/, '');
  const secret = (process.env.IDEA_MEDIA_SECRET || '').trim();
  if (!base || !secret) return '';
  const sig = createHmac('sha256', secret).update(fileId).digest('hex').slice(0, 16);
  return `${base}/api/idea-media?file_id=${encodeURIComponent(fileId)}&sig=${sig}`;
}
