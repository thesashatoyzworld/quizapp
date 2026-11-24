import { NextRequest, NextResponse } from 'next/server';
import { igViewer, loginUrl } from '@/lib/instagram/connect';

export const runtime = 'nodejs';

// Start of Instagram connect (t2/t3 only): Meta login dialog with a signed state.
//   GET /api/cabinet/instagram/connect          → 302 to Meta (browser, kb_session cookie)
//   GET /api/cabinet/instagram/connect?json=1   → { url } (Mini App: x-tg-init-data header,
//                                                   the client opens the url itself)
export async function GET(request: NextRequest) {
  const json = request.nextUrl.searchParams.get('json') === '1';
  const back = (reason: string) => json
    ? NextResponse.json({ error: reason }, { status: reason === 'login' ? 401 : 403 })
    : NextResponse.redirect(new URL(`/optimizator?ig=error&reason=${reason}`, request.url));
  try {
    const v = await igViewer(request);
    if (!v.id) return back('login');
    if (!v.allowed) return back('tier');
    const url = loginUrl(v.id);
    return json ? NextResponse.json({ url }) : NextResponse.redirect(url);
  } catch (e) {
    console.error('[ig-connect] start failed', (e as Error).message);
    return back('server');
  }
}
