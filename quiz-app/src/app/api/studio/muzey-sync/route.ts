// Museum of ideas → Studio. The server's museum run (gsd-brand
// scripts/muzey/sync-studio.py) posts the museum files here with Sasha's
// studio key; the server never gets database credentials. The answer lists
// points taken in the Studio that pokazano.json does not have yet.
//
//   POST { goryachee, smysly, eksponaty, pokazano }   Authorization: Bearer <Sasha's studio key>

import { actorForKey, keyFromRequest } from '@/lib/studio/keys';
import { StudioError, syncMuzey } from '@/lib/studio/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  if (actorForKey(keyFromRequest(request.url, request.headers.get('authorization'))) !== 'sasha') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return Response.json({ error: 'нужен JSON' }, { status: 400 });
  try {
    return Response.json({ ok: true, ...(await syncMuzey(body)) });
  } catch (e) {
    if (e instanceof StudioError) return Response.json({ error: e.message }, { status: 400 });
    console.error('[studio muzey-sync]', e instanceof Error ? e.message : e);
    return Response.json({ error: 'внутренняя ошибка' }, { status: 500 });
  }
}
