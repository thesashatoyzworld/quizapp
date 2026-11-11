import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUniqToken } from '@/lib/uniq/token';
import { tiersForTelegram } from '@/lib/kb/tier';
import { uniqPaid } from '@/lib/uniq/access';
import { isChannelMember } from '@/lib/uniq/channel';
import { REF_CAP, refStats } from '@/lib/uniq/referral';
import { sendBotMessage } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called by the VPS (uniq.thesashatoyz.com) once per person, when their first video is done.
// Auth: the same HMAC token format, signed by the VPS with UNIQ_SECRET.
// If the person came by a friend's link and is a free user following the channel, the friend
// gets a bonus video and a message in the bot.
//
//   POST /api/cabinet/uniq/first  (Authorization: Bearer <token{uid}>) → { ok, credited }

export async function POST(request: NextRequest) {
  const bearer = /^Bearer (.+)$/.exec(request.headers.get('authorization') || '');
  const auth = verifyUniqToken(bearer?.[1] || '', process.env.UNIQ_SECRET || '');
  if (!auth || !/^\d+$/.test(auth.uid)) return NextResponse.json({ ok: false }, { status: 401 });
  const friendId = Number(auth.uid);

  const ref = await prisma.uniqReferral.findUnique({ where: { friendId: BigInt(friendId) } });
  if (!ref || ref.creditedAt) return NextResponse.json({ ok: true, credited: false });

  // Students do not count (they would invite each other for free); the friend must follow the channel.
  const tiers = await tiersForTelegram(friendId).catch(() => ({}) as Record<string, number>);
  if (uniqPaid(friendId, tiers)) return NextResponse.json({ ok: true, credited: false, reason: 'student' });
  if ((await isChannelMember(friendId)) === false) return NextResponse.json({ ok: true, credited: false, reason: 'channel' });

  const referrerId = Number(ref.referrerId);
  const before = await refStats(referrerId);
  if (before.credited >= REF_CAP) return NextResponse.json({ ok: true, credited: false, reason: 'cap' });

  // Conditional update: a repeated call from the VPS cannot credit twice.
  const upd = await prisma.uniqReferral.updateMany({
    where: { friendId: BigInt(friendId), creditedAt: null },
    data: { creditedAt: new Date() },
  });
  if (!upd.count) return NextResponse.json({ ok: true, credited: false });

  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(friendId) }, select: { firstName: true, username: true } }).catch(() => null);
  const who = user?.firstName || (user?.username ? `@${user.username}` : 'Твой друг');
  const n = before.credited + 1;
  await sendBotMessage(
    referrerId,
    `${who} сделал первый ролик в уникализаторе, друг засчитан.\n\nУ тебя +1 бонусный ролик на 5 версий, он не сгорает. Друзей засчитано: ${n} из ${REF_CAP}.`,
    { inline_keyboard: [[{ text: 'Открыть уникализатор', web_app: { url: 'https://world.thesashatoyz.com/uniq' } }]] },
    null,
  );
  return NextResponse.json({ ok: true, credited: true });
}
