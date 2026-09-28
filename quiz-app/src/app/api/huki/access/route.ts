import { NextRequest, NextResponse } from 'next/server';
import { HUKI, HUKI_PROMPT, PASS_COOKIE, PASS_TTL_SEC, resolveAccess, signPass } from '@/lib/huki';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Открыть базу хуков целиком.
//
//   POST { initData?, pass? } → { ok: true, via, data, pass? } | { ok: false, reason }
//
// initData — из мини-аппа (подписана Телеграмом), pass — из ссылки
// «Открыть в браузере». При успехе ставим cookie-пропуск на год, чтобы
// в этом браузере база открывалась сразу.

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { initData?: string; pass?: string };
    const access = await resolveAccess(request, { initData: body.initData, pass: body.pass });

    if (!access.ok) {
      return NextResponse.json({ ok: false, reason: access.reason });
    }

    const secret = process.env.SESSION_SECRET || process.env.BOT_TOKEN || '';
    const pass = access.telegramId ? signPass(access.telegramId, secret) : null;

    const res = NextResponse.json({ ok: true, via: access.via, data: HUKI, prompt: HUKI_PROMPT, pass });
    if (pass && access.via !== 'cabinet') {
      res.cookies.set(PASS_COOKIE, pass, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: PASS_TTL_SEC,
      });
    }
    return res;
  } catch (e) {
    console.error('[huki/access]', e);
    return NextResponse.json({ ok: false, reason: 'error' }, { status: 500 });
  }
}
