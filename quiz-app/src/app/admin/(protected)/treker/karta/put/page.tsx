import { Suspense } from 'react';
import { listTasks } from '@/lib/tracker/data';
import { getMap, getSources } from '@/lib/tracker/karta';
import PutClient from './PutClient';

export const dynamic = 'force-dynamic';

export default async function PutPage() {
  const [tasks, map, sources] = await Promise.all([listTasks(), getMap(), getSources()]);
  if (!map || !map.path.length) return <p style={{ color: 'var(--text-muted)' }}>Пути клиента пока нет.</p>;
  return (
    <Suspense>
      <PutClient map={map} tasks={tasks} sources={sources} />
    </Suspense>
  );
}
