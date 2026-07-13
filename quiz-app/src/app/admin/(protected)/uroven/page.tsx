import { getUrovenLeads } from '@/lib/leads';
import UrovenLeadsClient from './UrovenLeadsClient';

export const dynamic = 'force-dynamic';

export default async function UrovenLeadsPage() {
  const leads = await getUrovenLeads();
  return <UrovenLeadsClient leads={leads} />;
}
