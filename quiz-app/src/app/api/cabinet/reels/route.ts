import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isLichka, loadSpace, verifiedViewer } from '@/lib/reels/store';
import { codeOf, todayIso } from '@/lib/reels/plan';

export const runtime = 'nodejs';

// Раздел «Ролики» глазами клиента лички: своя доска от ТЗ до выложенного.
// Гейт строго по человеку: всё ищется по его telegram_id, чужого здесь нет.
//
//   GET  /api/cabinet/reels            → { identified, hasReels, space }
//   GET  /api/cabinet/reels?brief=<id> → { html } — документ ТЗ
//   POST /api/cabinet/reels            → отметить версию выложенной по ссылке
//
// И чтение, и запись — только по подписанной initData или сессии-cookie:
// внутри лежат ТЗ клиента, голому ?telegramId их не отдаём.

export async function GET(request: NextRequest) {
  try {
    const telegramId = verifiedViewer(request);
    if (!telegramId) return NextResponse.json({ success: true, identified: false, hasReels: false, space: null });
    if (!(await isLichka(telegramId))) {
      return NextResponse.json({ success: true, identified: true, hasReels: false, space: null });
    }

    const briefId = request.nextUrl.searchParams.get('brief');
    if (briefId) {
      const brief = await prisma.reelBrief.findFirst({
        where: { id: briefId, telegramId: BigInt(telegramId) },
        select: { html: true },
      });
      if (!brief?.html) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({ html: brief.html });
    }

    const space = await loadSpace(BigInt(telegramId));
    const hasReels = space.briefs.length + space.versions.length > 0;
    return NextResponse.json({ success: true, identified: true, hasReels, space: hasReels ? space : null });
  } catch (error) {
    console.error('[Cabinet] reels error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Клиент сам отмечает, что выложил версию: вставляет ссылку на рилс.
export async function POST(request: NextRequest) {
  try {
    const telegramId = verifiedViewer(request);
    if (!telegramId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isLichka(telegramId))) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const versionId = typeof body?.versionId === 'string' ? body.versionId : '';
    const code = codeOf(typeof body?.link === 'string' ? body.link : '');
    if (!versionId) return NextResponse.json({ error: 'Missing versionId' }, { status: 400 });
    if (!code) return NextResponse.json({ error: 'Нужна ссылка вида instagram.com/reel/…' }, { status: 400 });

    // Чужая версия для него не существует: 404, а не 403.
    const version = await prisma.reelVersion.findFirst({
      where: { id: versionId, telegramId: BigInt(telegramId), stage: { not: 'skip' } },
      select: { id: true, code: true },
    });
    if (!version) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const today = todayIso();
    // Другая ссылка = другой рилс: старые цифры к нему не относятся.
    const sameReel = version.code === code;
    await prisma.reelVersion.update({
      where: { id: version.id },
      data: {
        stage: 'up', code, uploadedAt: new Date(`${today}T00:00:00Z`), planDate: null,
        ...(sameReel ? {} : { plays: null, likes: null, comments: null, statsAt: null }),
      },
    });
    return NextResponse.json({ ok: true, code, uploadedAt: today });
  } catch (error) {
    console.error('[Cabinet] reels publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
