import { listLeads, listLeadFacets, kindLabel } from '@/lib/zayavki';
import ZayavkiClient from './ZayavkiClient';

export const dynamic = 'force-dynamic';

export default async function ZayavkiPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; source?: string; status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filters = {
    kind: sp.kind || '',
    source: sp.source || '',
    status: sp.status || '',
    q: sp.q || '',
  };

  const [leads, facets] = await Promise.all([listLeads(filters), listLeadFacets()]);

  return (
    <ZayavkiClient
      leads={leads.map((l) => ({
        ...l,
        kindLabel: kindLabel(l.kind),
        createdAt: l.createdAt.toISOString(),
      }))}
      facets={{ kinds: facets.kinds, sources: facets.sources }}
      filters={filters}
    />
  );
}
