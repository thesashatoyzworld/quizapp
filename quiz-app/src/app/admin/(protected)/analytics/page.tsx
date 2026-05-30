import { getAnalytics, type Period } from '@/lib/analytics';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

const PERIODS: Period[] = ['today', '7d', '30d'];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period: Period = PERIODS.includes(sp.period as Period) ? (sp.period as Period) : '7d';

  const data = await getAnalytics(period);

  return <AnalyticsClient data={data} />;
}
