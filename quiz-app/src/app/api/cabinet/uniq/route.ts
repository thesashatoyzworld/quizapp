import { NextRequest, NextResponse } from 'next/server';
import { verifiedViewer } from '@/lib/reels/store';
import { tiersForTelegram } from '@/lib/kb/tier';
import { signUniqToken } from '@/lib/uniq/token';
import { uniqPaid, uniqPlan, uniqTabVisible, UNIQ_ADMINS } from '@/lib/uniq/access';
import { isChannelMember, UNIQ_CHANNEL_URL } from '@/lib/uniq/channel';
import { refStats, type RefStats } from '@/lib/uniq/referral';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Section «Уникализатор»: hands a short-lived token for the VPS (uniq.thesashatoyz.com),
// which does the upload, the ffmpeg work and the 5-per-video limit itself.
//
//   GET /api/cabinet/uniq → { token, url, max, free, plan, ref } | { error, code }. Tier 2-3 unlimited; everyone else
//   (tier 1, «Поток спроса», no tariff) is on the free plan: 1 video a week + 1 per friend (up to 5), 2 versions.
//
// Identity is signed only (x-tg-init-data or kb_session cookie), never a bare ?telegramId.

const OFFERS = ['uroven', 'potok', '360'] as const;
type Offer = (typeof OFFERS)[number];

const fail = (status: number, code: string, error: string) =>
  NextResponse.json({ error, code }, { status, headers: { 'Cache-Control': 'no-store' } });

// The subscription screen happens before the page has a VPS token, so the cabinet logs it.
async function vpsEvent(uid: number, ev: string) {
  const secret = process.env.UNIQ_SECRET || '';
  if (!secret) return;
  try {
    await fetch(`${process.env.UNIQ_URL || 'https://uniq.thesashatoyz.com'}/api/ev`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${signUniqToken({ uid, plan: uniqPlan(false, 0) }, secret)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ev }),
      signal: AbortSignal.timeout(1500),
    });
  } catch { /* analytics only */ }
}

function nameFromInitData(initData: string | null, id: number): string | undefined {
  if (!initData) return undefined;
  try {
    const u = JSON.parse(new URLSearchParams(initData).get('user') || '{}') as { id?: number; first_name?: string; last_name?: string; username?: string };
    if (u.id !== id) return undefined;
    return [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.username || undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const id = verifiedViewer(request);
  if (!id) return fail(401, 'auth', 'Войди через Telegram, чтобы открыть уникализатор.');

  let tiers: Record<string, number>;
  try {
    tiers = await tiersForTelegram(id);
  } catch (err) {
    console.error('[uniq] access check failed:', err);
    return fail(500, 'server_error', 'Не получилось проверить доступ. Обнови страницу.');
  }

  // Sasha previewing as a person without a tariff (?as=free): no tiers, and the channel
  // screen is shown until he presses «Я подписался» (?checked=1), since he owns the channel.
  const q = request.nextUrl.searchParams;
  const asFree = q.get('as') === 'free' && UNIQ_ADMINS.has(id);
  if (asFree) tiers = {};

  // Until Sasha opens it to everyone (UNIQ_OPEN=1): students, tier 3, testers only.
  if (!asFree && !uniqPaid(id, tiers) && !uniqTabVisible(id, undefined, tiers)) return fail(403, 'paid', 'Уникализатор открыт ученикам курса «Новый уровень».');

  // Free users: subscription to the channel is the price. Telegram outage → let them through.
  if (!uniqPaid(id, tiers) || asFree) {
    const checked = q.get('checked') === '1';
    const member = asFree && !checked ? false : await isChannelMember(id);
    if (member === false) {
      await vpsEvent(id, checked ? 'sub_no' : 'sub_screen');
      return NextResponse.json(
        { error: 'Уникализатор бесплатный для подписчиков канала. Подпишись и вернись сюда.', code: 'subscribe', channel: UNIQ_CHANNEL_URL },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (checked) await vpsEvent(id, 'sub_ok');
  }

  const secret = process.env.UNIQ_SECRET || '';
  if (!secret) {
    console.error('[uniq] UNIQ_SECRET is not set');
    return fail(500, 'not_configured', 'Уникализатор ещё не настроен. Напиши Саше.');
  }
  // Name is cosmetic (VPS logs); taken only when initData is the identity source.
  const free = asFree || !uniqPaid(id, tiers);
  let ref: RefStats | null = null;
  if (free) {
    try { ref = await refStats(id); } catch (err) { console.error('[uniq] referral stats failed:', err); }
  }
  const plan = uniqPlan(!free, ref?.credited || 0);
  // A/B offer on the final screen (free plan only): «Новый уровень» / «Поток Спроса» / «Личный бренд на 360».
  // Tier 1 students see 360 (the step up); «Поток» buyers split course / 360; the rest split three ways by uid.
  let offer: Offer | null = null;
  if (free) {
    const forced = asFree ? q.get('cta') : null;
    const pool: Offer[] = 'uroven' in tiers ? ['360'] : 'potok' in tiers ? ['uroven', '360'] : ['uroven', 'potok', '360'];
    offer = forced && (OFFERS as readonly string[]).includes(forced) ? (forced as Offer) : pool[id % pool.length];
  }
  const token = signUniqToken({ uid: id, name: nameFromInitData(request.headers.get('x-tg-init-data'), id), plan }, secret);
  return NextResponse.json(
    { token, url: process.env.UNIQ_URL || 'https://uniq.thesashatoyz.com', max: plan.v, free, plan, ref, offer },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
