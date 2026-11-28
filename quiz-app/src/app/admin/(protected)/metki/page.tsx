import { getMetki, WINDOWS } from '@/lib/metki';
import MetkiClient from './MetkiClient';

export const dynamic = 'force-dynamic';

export default async function MetkiPage({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const { w: raw } = await searchParams;
  const w = WINDOWS.find((x) => String(x) === raw) ?? 7;
  const rows = await getMetki(w);
  return (
    <MetkiClient
      w={w}
      rows={rows.map((r) => ({ ...r, first_at: r.first_at.toISOString(), last_at: r.last_at.toISOString() }))}
    />
  );
}
