import { listTasks } from '@/lib/tracker/data';
import TrekerClient from './TrekerClient';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams: Promise<{ t?: string }> };

export default async function TrekerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tasks = await listTasks();
  return <TrekerClient initialTasks={tasks} initialOpen={sp.t ?? null} />;
}
