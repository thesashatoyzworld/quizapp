import { listDeals } from '@/lib/deals';
import LinksClient from './LinksClient';

export const dynamic = 'force-dynamic';

export default async function PaymentLinksPage() {
  return <LinksClient initial={await listDeals()} />;
}
