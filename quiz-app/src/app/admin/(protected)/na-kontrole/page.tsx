import { getWatchlist } from '@/lib/kontrol';
import KontrolClient from './KontrolClient';

export const dynamic = 'force-dynamic';

export default async function NaKontrolePage() {
  const report = await getWatchlist();
  return <KontrolClient report={report} />;
}
