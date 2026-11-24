import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GraphError, fetchRecentMedia, igViewer } from '@/lib/instagram/connect';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Connected Instagram of the viewer (owner only, t2/t3).
//   GET    → { allowed, connected, username?, connectedAt?, media?, error? }
//   DELETE → { ok } disconnect: the row and the token are deleted.
export async function GET(request: NextRequest) {
  const v = await igViewer(request);
  if (!v.id) return NextResponse.json({ identified: false, allowed: false });
  if (!v.allowed) return NextResponse.json({ identified: true, allowed: false });
  const c = await prisma.instagramConnection.findUnique({ where: { telegramId: BigInt(v.id) } });
  if (!c || c.status !== 'active') return NextResponse.json({ identified: true, allowed: true, connected: false, expired: c?.status === 'revoked' });

  const head = { identified: true, allowed: true, connected: true, username: c.username, connectedAt: c.connectedAt };
  try {
    const media = await fetchRecentMedia(c.igUserId, c.accessToken);
    await prisma.instagramConnection.update({ where: { id: c.id }, data: { lastSyncAt: new Date(), lastError: null } });
    return NextResponse.json({ ...head, media });
  } catch (e) {
    const msg = (e as Error).message;
    console.error('[ig-connect] stats failed', v.id, msg);
    // 190 = token invalid or access removed in Instagram/Facebook settings: ask to reconnect.
    const revoked = e instanceof GraphError && e.code === 190;
    await prisma.instagramConnection.update({
      where: { id: c.id }, data: { lastError: msg.slice(0, 500), ...(revoked ? { status: 'revoked' } : {}) },
    });
    if (revoked) return NextResponse.json({ identified: true, allowed: true, connected: false, expired: true });
    return NextResponse.json({ ...head, media: [], error: 'Instagram не ответил. Попробуй обновить страницу позже.' });
  }
}

export async function DELETE(request: NextRequest) {
  const v = await igViewer(request);
  if (!v.id) return NextResponse.json({ error: 'login' }, { status: 401 });
  await prisma.instagramConnection.deleteMany({ where: { telegramId: BigInt(v.id) } });
  console.log('[ig-connect] disconnected', v.id);
  return NextResponse.json({ ok: true });
}
