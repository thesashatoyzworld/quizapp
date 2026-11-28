import { NextRequest, NextResponse } from 'next/server';
import {
  StudioError, addComment, attachPost, createItem, currentActor, deleteRule, guideHistory, listGuide, listLibrary, loadBoard,
  restoreGuideVersion, saveGuideSection, saveLibraryEntry, saveRule, setLibraryOpen, updateItem,
  donorLog, getTema, hideTema, mergeTema, podborTemy, renameTema, takeTema,
} from '@/lib/studio/store';
import { syncInstagram } from '@/lib/studio/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// «Студия» for Sasha (admin session) and Danya (studio_session cookie).
//
//   GET                                     → board
//   GET ?part=library                       → { open, entries } (Danya: redacted, empty while closed)
//   GET ?part=guide                         → { sections } «Как пишем карусели»
//   GET ?part=guide-history&slug=…          → { versions } newest first
//   POST { op: 'create', data }             — Sasha only
//   POST { op: 'update', id, data }         — field allowlist per person
//   POST { op: 'attach', id, url }          — link the post, stage → published
//   POST { op: 'comment', id, text }
//   POST { op: 'rule', data } | { op: 'rule-delete', id } — Sasha only
//   POST { op: 'sync' }                     — pull Instagram now, Sasha only
//   POST { op: 'library-save', data }       — create/edit a library entry, Sasha only
//   POST { op: 'library-open', open }       — let Danya see the library, Sasha only
//   POST { op: 'guide-save', slug, title?, body, note? } — both; Danya's edits notify Sasha
//   POST { op: 'guide-restore', versionId }  — rollback = the old version saved as the newest
//   GET ?part=donory                         → { syncedAt, themes, log } «Доноры», hidden included
//   POST { op: 'donor-take', id, zahod, karusel, exhibitId? } | { op: 'donor-hide', id, hidden, reason? }
//   POST { op: 'donor-rename', id, name, note? } | { op: 'donor-merge', id, into, note? } — both; Danya's notify Sasha

export async function GET(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const part = request.nextUrl.searchParams.get('part');
  if (part === 'library') return NextResponse.json(await listLibrary(actor));
  if (part === 'guide') return NextResponse.json({ sections: await listGuide() });
  if (part === 'donory') {
    const [pick, log] = await Promise.all([podborTemy({ limit: 200, withHidden: true, examples: 0 }), donorLog(60)]);
    return NextResponse.json({ ...pick, log });
  }
  if (part === 'donory-tema') return NextResponse.json(await getTema(request.nextUrl.searchParams.get('id') ?? '').catch(() => null));
  if (part === 'guide-history') return NextResponse.json({ versions: await guideHistory(request.nextUrl.searchParams.get('slug') ?? '') });
  return NextResponse.json(await loadBoard());
}

export async function POST(request: NextRequest) {
  const actor = await currentActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';

  try {
    switch (body.op) {
      case 'create':
        return NextResponse.json({ ok: true, id: await createItem(actor, body.data ?? {}) });
      case 'update':
        await updateItem(actor, id, body.data ?? {});
        return NextResponse.json({ ok: true });
      case 'attach':
        return NextResponse.json({ ok: true, shortcode: await attachPost(id, String(body.url ?? '')) });
      case 'comment':
        return NextResponse.json({ ok: true, id: await addComment(actor, id, body.text) });
      case 'rule':
        await saveRule(actor, body.data ?? {});
        return NextResponse.json({ ok: true });
      case 'rule-delete':
        await deleteRule(actor, id);
        return NextResponse.json({ ok: true });
      case 'library-save':
        return NextResponse.json({ ok: true, id: await saveLibraryEntry(actor, body.data ?? {}) });
      case 'library-open':
        await setLibraryOpen(actor, !!body.open);
        return NextResponse.json({ ok: true });
      case 'guide-save':
        return NextResponse.json(await saveGuideSection(actor, String(body.slug ?? ''), body));
      case 'guide-restore':
        return NextResponse.json(await restoreGuideVersion(actor, Number(body.versionId)));
      case 'donor-take':
        return NextResponse.json(await takeTema(actor, id, String(body.zahod ?? ''), String(body.karusel ?? ''), { exhibitId: body.exhibitId }));
      case 'donor-hide':
        return NextResponse.json(await hideTema(actor, id, !!body.hidden, body.reason));
      case 'donor-rename':
        return NextResponse.json(await renameTema(actor, id, String(body.name ?? ''), body.note));
      case 'donor-merge':
        return NextResponse.json(await mergeTema(actor, id, String(body.into ?? ''), body.note));
      case 'sync':
        if (actor !== 'sasha') return NextResponse.json({ error: 'только Саша' }, { status: 403 });
        return NextResponse.json({ ok: true, ...(await syncInstagram()) });
      default:
        return NextResponse.json({ error: 'Unknown op' }, { status: 400 });
    }
  } catch (e) {
    if (e instanceof StudioError) return NextResponse.json({ error: e.message }, { status: 400 });
    const message = e instanceof Error ? e.message : 'unknown';
    console.error('[studio] write failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
