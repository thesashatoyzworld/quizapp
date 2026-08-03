import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getTelegramFilePath, downloadTelegramFile } from '@/lib/telegram';

// Прокси к файлам Telegram: file_id сам по себе не открывается в браузере,
// а прямая ссылка на api.telegram.org содержит токен бота.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { fileId } = await params;

  try {
    const path = await getTelegramFilePath(fileId);
    const buffer = await downloadTelegramFile(path);

    const ext = path.split('.').pop()?.toLowerCase() || '';
    const type =
      ext === 'oga' || ext === 'ogg' ? 'audio/ogg'
      : ext === 'mp4' ? 'video/mp4'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'png' ? 'image/png'
      : 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: { 'Content-Type': type, 'Cache-Control': 'private, max-age=3600' },
    });
  } catch (error) {
    console.error('intake-file failed', fileId, error);
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
