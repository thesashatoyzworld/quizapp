import { getCurrentClients } from '@/lib/clients';
import ClientsClient from './ClientsClient';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const report = await getCurrentClients();
  return <ClientsClient initial={report} />;
}
