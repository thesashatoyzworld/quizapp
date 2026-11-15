import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { Conflict, createBoard, getBoard, renameBoard, saveBoard } from '@/lib/board/data';

export const dynamic = 'force-dynamic';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/** ?slug=… → схема целиком. Клиент опрашивает, чтобы подхватить чужие правки. */
export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) return unauthorized();
  const slug = request.nextUrl.searchParams.get('slug') ?? '';
  const board = await getBoard(slug);
  if (!board) return NextResponse.json({ error: 'не найдена' }, { status: 404 });
  return NextResponse.json({ board });
}

type Body =
  | { action: 'save'; slug: string; data: unknown; baseVersion: number }
  | { action: 'create'; title: string }
  | { action: 'rename'; slug: string; title: string };

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return unauthorized();
  const body = (await request.json().catch(() => null)) as Body | null;
  try {
    if (body?.action === 'save') {
      return NextResponse.json({ ok: true, board: await saveBoard(body.slug, body.data, Number(body.baseVersion)) });
    }
    if (body?.action === 'create' && body.title?.trim()) {
      return NextResponse.json({ ok: true, board: await createBoard(body.title.trim()) });
    }
    if (body?.action === 'rename' && body.title?.trim()) {
      await renameBoard(body.slug, body.title.trim());
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'не понял запрос' }, { status: 400 });
  } catch (error) {
    if (error instanceof Conflict) return NextResponse.json({ error: 'conflict', board: error.board }, { status: 409 });
    console.error('[Admin Board]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
