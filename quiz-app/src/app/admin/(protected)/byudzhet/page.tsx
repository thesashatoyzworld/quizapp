import { listExpenses } from '@/lib/budget/data';
import BudgetClient from './BudgetClient';

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
  return <BudgetClient initial={await listExpenses()} />;
}
