import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isLichka, loadSpace, verifiedViewer } from '@/lib/reels/store';
import { FORUM_ADMINS } from '@/lib/forum';
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
//
// Саша (админы кабинета) видит доски всех, у кого они заведены, и выбирает
// клиента через ?client=<telegram_id>; отмечать выложенное может за любого.

/** Клиенты с заведённой доской, для переключателя у админа. */
async function boards(): Promise<{ telegramId: string; name: string }[]> {
  const rows = await prisma.reelSpace.findMany({ select: { telegramId: true, clientName: true } });
  return rows
    .map((r) => ({ telegramId: String(r.telegramId), name: r.clientName || String(r.telegramId) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

/** Чья доска: своя у клиента, выбранная (или первая) у админа. null — доски нет. */
async function ownerOf(viewer: number, picked: string | null) {
  if (FORUM_ADMINS.has(viewer)) {
    const clients = await boards();
    const id = clients.find((c) => c.telegramId === picked)?.telegramId ?? clients[0]?.telegramId;
    return { owner: id ? BigInt(id) : null, clients };
  }
  return { owner: (await isLichka(viewer)) ? BigInt(viewer) : null, clients: null };
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = verifiedViewer(request);
    if (!telegramId) return NextResponse.json({ success: true, identified: false, hasReels: false, space: null });
    const { owner, clients } = await ownerOf(telegramId, request.nextUrl.searchParams.get('client'));
    if (!owner) return NextResponse.json({ success: true, identified: true, hasReels: false, space: null, clients });

    const briefId = request.nextUrl.searchParams.get('brief');
    if (briefId) {
      const brief = await prisma.reelBrief.findFirst({
        where: { id: briefId, telegramId: owner },
        select: { html: true },
      });
      if (!brief?.html) return NextResponse.json({ error: 'not found' }, { status: 404 });
      return NextResponse.json({ html: brief.html });
    }

    const space = await loadSpace(owner);
    const hasReels = space.briefs.length + space.versions.length > 0;
    return NextResponse.json({
      success: true, identified: true, hasReels, space: hasReels ? space : null,
      clients, client: clients ? String(owner) : undefined,
    });
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
    const body = await request.json().catch(() => ({}));
    const { owner } = await ownerOf(telegramId, typeof body?.client === 'string' ? body.client : null);
    if (!owner) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const versionId = typeof body?.versionId === 'string' ? body.versionId : '';
    const code = codeOf(typeof body?.link === 'string' ? body.link : '');
    if (!versionId) return NextResponse.json({ error: 'Missing versionId' }, { status: 400 });
    if (!code) return NextResponse.json({ error: 'Нужна ссылка вида instagram.com/reel/…' }, { status: 400 });

    // Чужая версия для него не существует: 404, а не 403.
    const version = await prisma.reelVersion.findFirst({
      where: { id: versionId, telegramId: owner, stage: { not: 'skip' } },
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
