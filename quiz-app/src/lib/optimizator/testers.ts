// Optimizator testers without the course (TESTER_USERNAMES in config): by username from the
// Mini App initData when given, else from the bot's users table.
import { prisma } from '@/lib/prisma';
import { TESTER_USERNAMES } from './config';

export async function isOptimizatorTester(id: number, initData?: string | null): Promise<boolean> {
  if (!TESTER_USERNAMES.size) return false;
  let name = '';
  try {
    const u = JSON.parse(new URLSearchParams(initData || '').get('user') || '{}') as { id?: number; username?: string };
    if (u.id === id) name = u.username || '';
  } catch { /* no initData */ }
  if (!name) {
    const row = await prisma.user.findUnique({ where: { telegramId: BigInt(id) }, select: { username: true } }).catch(() => null);
    name = row?.username || '';
  }
  return TESTER_USERNAMES.has(name.toLowerCase());
}
