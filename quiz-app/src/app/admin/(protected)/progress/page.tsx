import { getStudents } from '@/lib/progress';
import ProgressClient from './ProgressClient';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const students = await getStudents();
  return <ProgressClient students={students} />;
}
