// Server-only. Referral for the free Уникализатор: a friend counts once they finished their
// first video and follow the channel; each counted friend is one bonus video (up to REF_CAP).
import { prisma } from '@/lib/prisma';

export const REF_CAP = 10;
export const BOT_USERNAME = 'testtoyzbot';
export const refLink = (telegramId: number) => `https://t.me/${BOT_USERNAME}?start=uniq_${telegramId}`;

export type RefStats = { link: string; invited: number; credited: number; cap: number };

export async function refStats(telegramId: number): Promise<RefStats> {
  const rows = await prisma.uniqReferral.findMany({ where: { referrerId: BigInt(telegramId) }, select: { creditedAt: true } });
  const credited = Math.min(REF_CAP, rows.filter((r) => r.creditedAt).length);
  return { link: refLink(telegramId), invited: rows.length, credited, cap: REF_CAP };
}

/** Parse «uniq_<id>» from /start. Returns the referrer id, or null for a plain «uniq». */
export function parseRefParam(param: string): number | null {
  const m = /^uniq_(\d{3,15})$/.exec(param);
  return m ? Number(m[1]) : null;
}

/**
 * Remember who brought the friend. First referrer wins; nobody refers themselves; a person
 * who already finished a video (the VPS told us, so a row exists as credited or they are a
 * referrer already) is not new. Returns true when the row was created.
 */
export async function rememberReferral(friendId: number, referrerId: number): Promise<boolean> {
  if (friendId === referrerId) return false;
  const created = await prisma.uniqReferral.createMany({
    data: [{ friendId: BigInt(friendId), referrerId: BigInt(referrerId) }],
    skipDuplicates: true,
  });
  return created.count > 0;
}
