import { currentMonth, getMonthReport } from '@/lib/revenue';
import RevenueClient from './RevenueClient';

export const dynamic = 'force-dynamic';

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const m = month && /^\d{4}-\d{2}$/.test(month) ? month : currentMonth();
  const report = await getMonthReport(m);
  return <RevenueClient initial={report} />;
}
