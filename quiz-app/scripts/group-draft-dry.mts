// Сухой прогон черновиков на старых вопросах группы: ничего не пишет и не шлёт.
// npx tsx --env-file=.env.local scripts/group-draft-dry.mts "username:кусок текста" [...]
import { prisma } from '@/lib/prisma';
import { runDraft } from '@/lib/group-draft/draft';
import { batchKey } from '@/lib/group-draft/batch';

const CHAT = '-1002115856669';

for (const arg of process.argv.slice(2)) {
  const [username, ...rest] = arg.split(':');
  const piece = rest.join(':');
  const last = await prisma.tgGroupMsg.findFirst({
    where: { chatId: CHAT, username, text: { contains: piece } },
    orderBy: { createdAt: 'desc' },
  });
  if (!last?.userId) {
    console.log('нет', arg);
    continue;
  }
  const now = new Date(last.createdAt.getTime() + 150_000);
  const res = await runDraft(batchKey(CHAT, last.threadId, last.userId), now, { dry: true });
  const real = await prisma.tgGroupMsg.findMany({
    where: {
      chatId: CHAT,
      userId: process.env.ADMIN_CHAT_ID!,
      threadId: last.threadId,
      createdAt: { gt: last.createdAt, lt: new Date(last.createdAt.getTime() + 6 * 3600_000) },
    },
    orderBy: { createdAt: 'asc' },
    take: 3,
  });
  console.log(`\n=== @${username} :: ${last.text.slice(0, 200)}`);
  console.log('ЧЕРНОВИК:', 'draft' in res ? res.draft : res);
  console.log('ЗАМЕТКА:', 'note' in res ? res.note : '', '| reason:', 'reason' in res ? res.reason : '');
  console.log('САША НА САМОМ ДЕЛЕ:', real.map((r) => r.text).join(' || ').slice(0, 700));
}
await prisma.$disconnect();
