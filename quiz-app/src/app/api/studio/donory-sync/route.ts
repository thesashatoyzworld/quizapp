// Bank of donors → Studio. The bank's daily run (bank-donorov src/daily/muzey_donorov.py)
// posts its ranked themes and exhibits here with Sasha's studio key; the server never gets
// database credentials. The answer carries people's edits (names, «мимо», merges) and takes,
// which the bank writes into its temy.json.
//
//   POST { temy: [...rank() rows], eksponaty: {...} }   Authorization: Bearer <Sasha's studio key>

import { actorForKey, keyFromRequest } from '@/lib/studio/keys';
import { StudioError, syncDonory } from '@/lib/studio/store';

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
    return Response.json({ ok: true, ...(await syncDonory(body)) });
  } catch (e) {
    if (e instanceof StudioError) return Response.json({ error: e.message }, { status: 400 });
    console.error('[studio donory-sync]', e instanceof Error ? e.message : e);
    return Response.json({ error: 'внутренняя ошибка' }, { status: 500 });
  }
}
