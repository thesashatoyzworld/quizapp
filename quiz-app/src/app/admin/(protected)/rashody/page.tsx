import { getCostsReport } from '@/lib/costs/report';
import RashodyClient from './RashodyClient';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function RashodyPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const report = await getCostsReport(sp.month);
  return <RashodyClient report={report} />;
}
