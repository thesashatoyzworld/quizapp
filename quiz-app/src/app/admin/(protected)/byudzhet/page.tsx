import { listExpenses } from '@/lib/budget/data';
import { latestBalances, listShots } from '@/lib/budget/shots';
import BudgetClient from './BudgetClient';

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
  const [expenses, shots, balances] = await Promise.all([listExpenses(), listShots(), latestBalances()]);
  return <BudgetClient initial={expenses} initialShots={shots} initialBalances={balances} />;
}
