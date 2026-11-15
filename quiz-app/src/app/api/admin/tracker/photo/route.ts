import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { cleanTags } from '@/lib/tracker/actions';
import { listTasks } from '@/lib/tracker/data';
import { readNotebook, type ImageType } from '@/lib/tracker/photo';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const TYPES: ImageType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Фото страницы тетрадки (data URL, ужатое на телефоне) → предложенные задачи. Ничего не создаёт. */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { image?: string } | null;
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(String(body?.image ?? ''));
  if (!m || !TYPES.includes(m[1] as ImageType)) {
    return NextResponse.json({ error: 'нужна картинка jpeg, png или webp' }, { status: 400 });
  }
  if (m[2].length > 4_000_000) return NextResponse.json({ error: 'фото слишком большое' }, { status: 400 });

  try {
    const tasks = await listTasks();
    const active = tasks.filter((t) => !t.archived);
    const tags = [...new Set(tasks.flatMap((t) => t.tags))];
    const found = await readNotebook({
      base64: m[2],
      mediaType: m[1] as ImageType,
      tags,
      titles: active.map((t) => t.title),
    });
    return NextResponse.json({
      tasks: found.map((t) => ({ ...t, tags: cleanTags(t.tags) })),
    });
  } catch (error) {
    console.error('[Admin Tracker Photo]', error);
    return NextResponse.json({ error: 'не получилось прочитать фото, попробуй ещё раз' }, { status: 500 });
  }
}
