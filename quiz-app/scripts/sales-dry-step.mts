// Что помощник предложил бы в этом чате — без отправки куда-либо.
//
// Запуск: npx tsx scripts/sales-dry-step.mts <chat_id>
//
// Нужен, чтобы проверять промпт и базу на живых переписках, не дёргая
// кнопку «другой» в телеграме и не засоряя чат подсказками.
import { config } from 'dotenv';
config({ path: '.env.local' });

const chatId = process.argv[2];
if (!chatId) {
  console.error('Usage: npx tsx scripts/sales-dry-step.mts <chat_id>');
  process.exit(1);
}

const { prisma } = await import('../src/lib/prisma');
const { suggestFromThread } = await import('../src/lib/sales/answer');
const { findLead, describeLead } = await import('../src/lib/sales/tg');

const rows = (
  await prisma.tgBusinessMsg.findMany({
    where: { chatId },
    orderBy: { createdAt: 'desc' },
    take: 40,
  })
).reverse();

if (!rows.length) {
  console.error('В этом чате переписки нет.');
  process.exit(1);
}

const last = rows[rows.length - 1];
const lead = await findLead('', last.username);

const rendered = rows
  .map((r) => {
    const when = r.createdAt.toISOString().slice(0, 16).replace('T', ' ');
    return `[${when}] ${r.side === 'client' ? 'ЧЕЛОВЕК' : 'МЫ'}: ${r.text}`;
  })
  .join('\n');

console.log(`${rows.length} сообщений, последнее от ${last.side === 'client' ? 'человека' : 'нас'}\n`);

// Сколько человек ждёт — от этого зависит, объяснит ли помощник паузу.
const waitingSeconds =
  last.side === 'client' ? Math.round((Date.now() - last.createdAt.getTime()) / 1000) : null;

// Направление ответа можно задать вторым аргументом.
const steer = process.argv[3] || null;

const step = await suggestFromThread({
  about: [
    last.username ? `ник: @${last.username}` : null,
    last.name ? `имя в телеграме: ${last.name}` : null,
    'канал: личка в телеграме, не инстаграм',
    describeLead(lead),
  ]
    .filter(Boolean)
    .join('\n'),
  rendered,
  waitingSeconds,
  steer,
});

console.log(`СТАДИЯ: ${step.stage}\n`);
console.log(step.message);
console.log(`\n— ${step.why}`);
if (step.callSasha) console.log(`\nнужен Саша: ${step.callSasha}`);

await prisma.$disconnect();
