import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { debugToken, discoverAccount, exchangeCode, readState } from '@/lib/instagram/connect';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Back to the cabinet host (world.*), where the kb_session cookie lives; the callback
// itself is on thesashatoyz.com because that is the URI registered in Meta.
const CABINET = (process.env.NEXT_PUBLIC_CABINET_URL || 'https://world.thesashatoyz.com').replace(/\/$/, '');

// Meta redirects here after the login dialog (registered redirect URI, exact).
// The student is identified by the signed state, not by a cookie: in Telegram the
// dialog opens in an outside browser where the cabinet session may not exist.
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const back = (q: string) => NextResponse.redirect(`${CABINET}/optimizator?${q}`);
  const fail = (reason: string) => back(`ig=error&reason=${reason}`);

  if (p.get('error')) {
    console.log('[ig-connect] dialog error', p.get('error'), p.get('error_reason'));
    return fail('denied');
  }
  const telegramId = readState(p.get('state'));
  if (!telegramId) return fail('state');
  const code = p.get('code');
  if (!code) return fail('code');

  try {
    const token = await exchangeCode(code);
    const info = await debugToken(token);
    console.log('[ig-connect] token', JSON.stringify({ tg: telegramId, type: info.type, expires_at: info.expires_at, scopes: info.scopes }));
    const acc = await discoverAccount(token, info);
    if (!acc) return fail('no_account');

    const data = {
      igUserId: acc.id,
      username: acc.username,
      fbUserId: info.user_id ?? null,
      accessToken: token,
      tokenType: info.type ?? null,
      expiresAt: info.expires_at ? new Date(info.expires_at * 1000) : null,
      scopes: info.scopes ?? [],
      status: 'active',
      lastError: null,
      connectedAt: new Date(),
    };
    await prisma.instagramConnection.upsert({
      where: { telegramId: BigInt(telegramId) },
      create: { telegramId: BigInt(telegramId), ...data },
      update: data,
    });
    console.log('[ig-connect] connected', telegramId, acc.id, acc.username);
    return back('ig=connected');
  } catch (e) {
    console.error('[ig-connect] callback failed', telegramId, (e as Error).message);
    return fail('server');
  }
}
