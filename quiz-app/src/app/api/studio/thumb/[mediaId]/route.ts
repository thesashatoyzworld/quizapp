// Post thumbnail for «Студия». IG CDN URLs are signed and expire, so we keep
// a resolved URL for ~24h (studio_thumbs) and re-resolve it when stale or
// when the CDN refuses it. The image is streamed through, so the browser only
// ever sees our URL and caches it for a day.

import { NextResponse } from 'next/server';
import { cachedThumb, currentActor, isKnownMedia, saveThumb } from '@/lib/studio/store';
import { resolveThumb } from '@/lib/studio/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FRESH_MS = 24 * 3600_000;

export async function GET(_req: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  if (!(await currentActor())) return new NextResponse(null, { status: 401 });
  const { mediaId } = await params;
  if (!/^\d+$/.test(mediaId) || !(await isKnownMedia(mediaId))) return new NextResponse(null, { status: 404 });

  try {
    const cached = await cachedThumb(mediaId);
    let url = cached && Date.now() - cached.fetchedAt.getTime() < FRESH_MS ? cached.url : null;
    let img = url ? await fetch(url, { cache: 'no-store' }) : null;
    if (!img?.ok) {
      url = await resolveThumb(mediaId);
      if (!url) return new NextResponse(null, { status: 404 });
      await saveThumb(mediaId, url);
      img = await fetch(url, { cache: 'no-store' });
      if (!img.ok) return new NextResponse(null, { status: 502 });
    }
    return new NextResponse(img.body, {
      headers: {
        'content-type': img.headers.get('content-type') ?? 'image/jpeg',
        'cache-control': 'private, max-age=86400',
      },
    });
  } catch (e) {
    console.error('[studio] thumb failed:', mediaId, e instanceof Error ? e.message : 'unknown');
    return new NextResponse(null, { status: 502 });
  }
}
