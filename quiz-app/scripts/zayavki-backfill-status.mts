// Разово проставить статусы заявок по тому, что уже лежит в базе.
//
//   npx tsx scripts/zayavki-backfill-status.mts          — только показать
//   npx tsx scripts/zayavki-backfill-status.mts --write  — записать
//
// Автоматика включилась после того, как переписки уже шли месяц, поэтому в
// разделе висело 132 «новых» у людей, с которыми разговор давно идёт. Этот
// прогон догоняет историю один раз; дальше статус двигается сам.
//
// Решения человека — созвон, клиент, отказ — не трогаются: правило одно и то
// же и здесь, и в живом коде.
import { config } from 'dotenv';
config({ path: '.env.local' });

const write = process.argv.includes('--write');

async function main() {
  const { prisma } = await import('../src/lib/prisma');
  const { factsForLead, refreshLeadStatus } = await import('../src/lib/zayavki/auto-status');
  const { decideStatus } = await import('../src/lib/zayavki/decide-status');
  const { isLeadStatus, STATUS_LABEL } = await import('../src/content/lead-status');

  const leads = await prisma.dwyLead.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, username: true, firstName: true, status: true },
  });

  const moves: string[] = [];
  const tally = new Map<string, number>();

  for (const lead of leads) {
    const current = isLeadStatus(lead.status) ? lead.status : 'new';
    const facts = await factsForLead(lead.id, { username: lead.username });
    const next = decideStatus(current, facts);
    if (!next) continue;

    const who = lead.username ? `@${lead.username}` : lead.firstName || 'без имени';
    moves.push(`#${lead.id} ${who}: ${STATUS_LABEL[current]} → ${STATUS_LABEL[next]}`);
    tally.set(next, (tally.get(next) || 0) + 1);

    // Пишем тем же путём, что и живой код, а не своим запросом: иначе прогон
    // разойдётся с правилом ровно в тот день, когда правило поправят.
    if (write) await refreshLeadStatus(lead.id);
  }

  for (const line of moves) console.log(line);
  console.log(
    `\nзаявок ${leads.length}, сдвинется ${moves.length}: ` +
      [...tally].map(([s, n]) => `${STATUS_LABEL[s as keyof typeof STATUS_LABEL]} ${n}`).join(' · '),
  );
  console.log(write ? 'записано' : 'ничего не записано, это прогон вхолостую (--write чтобы применить)');
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
