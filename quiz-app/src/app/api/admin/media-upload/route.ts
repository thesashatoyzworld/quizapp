import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BOT_TOKEN = process.env.BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '788334680';

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  const type = formData.get('type') as 'photo' | 'video' | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 });
  }
  if (type !== 'photo' && type !== 'video') {
    return NextResponse.json({ error: 'type must be photo or video' }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: `Файл слишком большой: ${(file.size / 1024 / 1024).toFixed(1)} MB. Bot API лимит 50 MB.` },
      { status: 413 }
    );
  }

  const tgForm = new FormData();
  tgForm.append('chat_id', ADMIN_CHAT_ID);
  tgForm.append(type, file, file.name);

  const method = type === 'photo' ? 'sendPhoto' : 'sendVideo';

  let tgResp: Response;
  try {
    tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      body: tgForm,
    });
  } catch (e) {
    return NextResponse.json({ error: `Network error talking to TG: ${e}` }, { status: 502 });
  }

  const data = (await tgResp.json()) as {
    ok: boolean;
    description?: string;
    result?: {
      photo?: { file_id: string; file_size?: number }[];
      video?: { file_id: string };
    };
  };

  if (!data.ok || !data.result) {
    return NextResponse.json({ error: data.description || 'TG upload failed' }, { status: 500 });
  }

  let fileId: string | undefined;
  if (type === 'photo') {
    const photos = data.result.photo || [];
    fileId = photos[photos.length - 1]?.file_id;
  } else {
    fileId = data.result.video?.file_id;
  }

  if (!fileId) {
    return NextResponse.json({ error: 'no file_id in TG response' }, { status: 500 });
  }

  return NextResponse.json({ success: true, fileId, type });
}
