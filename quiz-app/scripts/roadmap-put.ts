// Заливка готовой карты (уже собранной, в формате RoadmapDraft) под нужный slug.
//
// Отличается от roadmap-save-json.ts тем, что здесь на входе не черновик модели,
// а карта целиком: со ссылками, датами и статусами. Нужно, когда карта собрана
// моделью, а потом правилась руками по замечаниям Саши.
//
// npx tsx scripts/roadmap-put.ts <файл.json> <slug> <telegramId> [--paid 130000] [--open]
//
// --open открывает карту в кабинете вместе с базовым набором строк. Сообщение
// человеку при этом НЕ уходит: это отдельное действие (approveAndSend).
import { config } from 'dotenv';
config({ path: '.env.local' });

import fs from 'node:fs';

async function main() {
  const [file, slug, tg] = process.argv.slice(2);
  const open = process.argv.includes('--open');
  if (!file || !slug || !tg) {
    console.error('npx tsx scripts/roadmap-put.ts <файл.json> <slug> <telegramId> [--open]');
    process.exit(1);
  }

  const { saveDraft, openForClient } = await import('../src/lib/roadmap/store');
  const { getActiveAccessByTelegram } = await import('../src/lib/access');
  const { prisma } = await import('../src/lib/prisma');

  const draft = JSON.parse(fs.readFileSync(file, 'utf8'));
  const telegramId = Number(tg);

  const access = await getActiveAccessByTelegram(telegramId);
  const uroven = access.find((r: { productSlug: string }) => r.productSlug.startsWith('uroven-'));
  if (!uroven) throw new Error(`у ${telegramId} нет активного доступа uroven-*`);

  const person = await prisma.user.findFirst({ where: { telegramId: BigInt(telegramId) } });

  const id = await saveDraft(draft, {
    slug,
    clientName: person?.firstName || person?.username || slug,
    telegramId,
    username: person?.username ?? null,
    startedAt: uroven.grantedAt ?? new Date(),
    accessUntil: uroven.expiresAt ?? new Date(),
  });

  // saveDraft прибивает тариф к t2 за 10 000: ставим реальный доступ и сумму.
  const paidIdx = process.argv.indexOf('--paid');
  const paid = paidIdx > -1 ? Number(process.argv[paidIdx + 1]) : 0;
  await prisma.roadmap.update({
    where: { id },
    data: { tier: uroven.productSlug, ...(paid > 0 ? { paidAmount: paid } : {}) },
  });
  console.log(`карта ${slug} записана (${id}), тариф ${uroven.productSlug}${paid > 0 ? `, оплачено ${paid}` : ''}`);

  if (open) {
    const shared = await openForClient(id);
    console.log(`карта открыта в кабинете, клиенту видно строк: ${shared}`);
  } else {
    console.log('карта закрыта от клиента');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
