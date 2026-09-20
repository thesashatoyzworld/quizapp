import { listIdeas, mediaUrl } from '@/lib/ideas/list';
import IdeasClient from './IdeasClient';

export const dynamic = 'force-dynamic';

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; source?: string; status?: string; q?: string }>;
}) {
  const f = await searchParams;
  const ideas = await listIdeas(f);

  // Подписи считаются на сервере: секрет подписи в браузер не уезжает.
  const withMedia = ideas.map((i) => ({
    ...i,
    occurredAt: i.occurredAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    // Only the fields the sheet draws: dates on notes would cross the wire
    // for nothing.
    notes: i.notes.map((n) => ({
      id: n.id,
      kind: n.kind,
      text: n.text,
      chosen: n.chosen,
      done: n.done,
      position: n.position,
    })),
    refs: i.refs.map((r) => ({
      ...r,
      mediaUrl: r.fileId ? mediaUrl(r.fileId) : null,
      thumbUrl: r.thumbFileId ? mediaUrl(r.thumbFileId) : null,
    })),
  }));

  return <IdeasClient ideas={withMedia} filters={f} />;
}
