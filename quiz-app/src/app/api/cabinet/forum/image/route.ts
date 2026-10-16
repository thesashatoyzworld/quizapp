import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveViewer } from '@/lib/forum';

export const runtime = 'nodejs';

// Картинки сообщества.
//
//   POST /api/cabinet/forum/image  (multipart: file, width, height) → { id }
//   GET  /api/cabinet/forum/image?id=<uuid>                         → сама картинка
//
// Сжимает клиент (длинная сторона до 1600px, JPEG), сюда приходит уже готовое.
// Отдача без проверки доступа: <img> в Mini App не умеет слать подписанный
// заголовок, а cookie там нет. Защищает неугадываемый uuid — ссылку видят только
// участники ветки.

const MAX_BYTES = 3 * 1024 * 1024;
const MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: NextRequest) {
  try {
    const viewer = await resolveViewer(request);
    if (!viewer?.allowed) {
      return NextResponse.json({ success: false, error: 'Нет доступа' }, { status: 403 });
    }
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: 'Нет файла' }, { status: 400 });
    }
    if (!MIMES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Нужна картинка' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'Картинка больше 3 МБ' }, { status: 400 });
    }
    const width = Math.max(1, Math.min(10000, Number(form.get('width')) || 1));
    const height = Math.max(1, Math.min(10000, Number(form.get('height')) || 1));
    const data = Buffer.from(await file.arrayBuffer());
    const row = await prisma.forumImage.create({
      data: { ownerTg: BigInt(viewer.telegramId), mime: file.type, data, width, height },
      select: { id: true },
    });
    return NextResponse.json({ success: true, id: row.id, width, height });
  } catch (error) {
    console.error('[forum] image upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse('not found', { status: 404 });
  const row = await prisma.forumImage.findUnique({ where: { id }, select: { mime: true, data: true } });
  if (!row) return new NextResponse('not found', { status: 404 });
  return new NextResponse(new Uint8Array(row.data), {
    headers: {
      'Content-Type': row.mime,
      // Картинка по id не меняется никогда.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
