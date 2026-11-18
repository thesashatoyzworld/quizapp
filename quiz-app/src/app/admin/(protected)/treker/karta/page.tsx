import { listTasks } from '@/lib/tracker/data';
import { getMap } from '@/lib/tracker/karta';
import KartaClient from './KartaClient';

export const dynamic = 'force-dynamic';

export default async function KartaPage() {
  const [tasks, map] = await Promise.all([listTasks(), getMap()]);
  if (!map) return <p style={{ color: 'var(--text-muted)' }}>Карты запуска пока нет.</p>;
  return <KartaClient map={map} tasks={tasks} />;
}
