import { listExpenses } from '@/lib/budget/data';
import { listShots } from '@/lib/budget/shots';
import BudgetClient from './BudgetClient';

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
  const [expenses, shots] = await Promise.all([listExpenses(), listShots()]);
  return <BudgetClient initial={expenses} initialShots={shots} />;
}
