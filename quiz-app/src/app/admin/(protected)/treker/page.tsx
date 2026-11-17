import { listTasks } from '@/lib/tracker/data';
import { getMap } from '@/lib/tracker/karta';
import TrekerClient from './TrekerClient';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams: Promise<{ t?: string }> };

export default async function TrekerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [tasks, map] = await Promise.all([listTasks(), getMap()]);
  return <TrekerClient initialTasks={tasks} initialOpen={sp.t ?? null} map={map} />;
}
