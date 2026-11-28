// Server-only. Free Оптимизатор for channel subscribers (lead magnet, like the Уникализатор):
// 1 full analysis per person for good, +1 for every friend who subscribes and finishes their
// first analysis, up to FREE_MAX. A run costs ~$1 (Opus + bundles + body edit), so the quota is
// lifetime, not monthly: it lives in optimizator_usage under the month key FREE_MONTH.
//
// OPT_OPEN=1 (Vercel) opens it to everyone. Without it only Sasha sees it, via ?as=free.
import { prisma } from '@/lib/prisma';
import { sendBotMessage } from '@/lib/telegram';
import { isChannelMember } from '@/lib/uniq/channel';

export const FREE_MONTH = 'free';
export const FREE_BASE = 1;
export const FREE_MAX = 5;
export const OPT_REF_CAP = FREE_MAX - FREE_BASE;
const BOT_USERNAME = 'testtoyzbot';
const CABINET = 'https://world.thesashatoyz.com';

export const optFreeOpen = (env = process.env.OPT_OPEN) => env === '1';
export const optRefLink = (telegramId: number) => `https://t.me/${BOT_USERNAME}?start=opt_${telegramId}`;
export const freeLimit = (credited: number) => Math.min(FREE_MAX, FREE_BASE + Math.max(0, credited));

export type OptRefStats = { link: string; invited: number; credited: number; cap: number };

export async function optRefStats(telegramId: number): Promise<OptRefStats> {
  const rows = await prisma.$queryRaw<{ invited: bigint; credited: bigint }[]>`
    SELECT count(*) AS invited, count(credited_at) AS credited
      FROM optimizator_referrals WHERE referrer_id = ${BigInt(telegramId)}`;
  const invited = Number(rows[0]?.invited ?? 0);
  const credited = Math.min(OPT_REF_CAP, Number(rows[0]?.credited ?? 0));
  return { link: optRefLink(telegramId), invited, credited, cap: OPT_REF_CAP };
}

/** «opt_<id>» from /start → the referrer id; plain «opt» or «opt_<campaign>» → null. */
export function parseOptRef(param: string): number | null {
  const m = /^opt_(\d{3,15})$/.exec(param);
  return m ? Number(m[1]) : null;
}

/** First referrer wins, nobody refers themselves, a person who already ran an analysis is not new. */
export async function rememberOptReferral(friendId: number, referrerId: number): Promise<boolean> {
  if (friendId === referrerId) return false;
  const ran = await prisma.optimizatorUsage.count({ where: { telegramId: BigInt(friendId), count: { gt: 0 } } });
  if (ran > 0) return false;
  const n = await prisma.$executeRaw`
    INSERT INTO optimizator_referrals (friend_id, referrer_id) VALUES (${BigInt(friendId)}, ${BigInt(referrerId)})
    ON CONFLICT (friend_id) DO NOTHING`;
  return n > 0;
}

/**
 * After a free person's first successful analysis: if a friend brought them and they follow the
 * channel, the friend gets +1 analysis and a message in the bot. Never throws.
 */
export async function creditOptReferral(friendId: number): Promise<void> {
  try {
    const rows = await prisma.$queryRaw<{ referrer_id: bigint }[]>`
      SELECT referrer_id FROM optimizator_referrals WHERE friend_id = ${BigInt(friendId)} AND credited_at IS NULL`;
    if (!rows.length) return;
    if ((await isChannelMember(friendId)) === false) return;
    const referrerId = Number(rows[0].referrer_id);
    const before = await optRefStats(referrerId);
    if (before.credited >= OPT_REF_CAP) return;
    // Conditional update: a repeated call cannot credit twice.
    const upd = await prisma.$executeRaw`
      UPDATE optimizator_referrals SET credited_at = now() WHERE friend_id = ${BigInt(friendId)} AND credited_at IS NULL`;
    if (!upd) return;
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(friendId) }, select: { firstName: true, username: true } }).catch(() => null);
    const who = user?.firstName || (user?.username ? `@${user.username}` : 'Твой друг');
    const n = before.credited + 1;
    await sendBotMessage(
      referrerId,
      `${who} сделал первый разбор в оптимизаторе, друг засчитан.\n\nТебе +1 разбор сценария, его можно сделать прямо сейчас.${n >= OPT_REF_CAP ? ' Это максимум для бесплатного.' : ` Каждый следующий друг даёт ещё +1, всего до ${FREE_MAX}.`}`,
      { inline_keyboard: [[{ text: 'Открыть оптимизатор', web_app: { url: `${CABINET}/optimizator` } }]] },
      null,
    );
  } catch (err) {
    console.error('[optimizator/free] credit failed:', err);
  }
}

/** Funnel events of the free optimizer (type opt_ev, metadata.ev). Never throws. */
export async function optEvent(telegramId: number, ev: string, extra: Record<string, unknown> = {}): Promise<void> {
  try {
    await prisma.event.create({ data: { type: 'opt_ev', source: 'optimizator', telegramId: BigInt(telegramId), metadata: { ev, ...extra } } });
  } catch (err) {
    console.error('[optimizator/free] event failed:', err);
  }
}
